import { assertEquals, assertThrows } from "https://deno.land/std@0.140.0/testing/asserts.ts";
import { InvalidOperationError } from "../../src/errors.ts";
import Interpreter from "../../src/interpreter.ts";
import { TokenType } from "../../src/tokens.ts";
import { assertMatchingAST, assertTypeOf, makeASTUtility } from "../testHelpers.ts";

Deno.test("Nodes", async (t) => {
    await t.step("Invalid Operation Error", () => {
        let result = Interpreter.visit(makeASTUtility([TokenType.DIVIDE, [2]]));
        assertTypeOf(result.error, InvalidOperationError);

        result = Interpreter.visit(makeASTUtility([[2], TokenType.IDENTIFIER, [2]]));
        assertTypeOf(result.error, InvalidOperationError);
    });

    await t.step("Non matching nodes aren't equal", () => {
        assertThrows(() =>
            assertMatchingAST(makeASTUtility([[1], TokenType.PLUS, [2]]), makeASTUtility([TokenType.MINUS, [2]]))
        );
        assertThrows(() =>
            assertMatchingAST(makeASTUtility([TokenType.MINUS, [2]]), makeASTUtility([[1], TokenType.PLUS, [2]]))
        );

        assertThrows(() => assertMatchingAST(makeASTUtility([2]), makeASTUtility([[1], TokenType.PLUS, [2]])));
        assertThrows(() => assertMatchingAST(makeASTUtility(["d", [2]]), makeASTUtility([[1], TokenType.PLUS, [2]])));
        assertThrows(() => assertMatchingAST(makeASTUtility(["d"]), makeASTUtility([[1], TokenType.PLUS, [2]])));
    });

    await t.step("String repr", () => {
        const expectedTree = makeASTUtility([[1], TokenType.PLUS, [TokenType.MINUS, [2]]]);
        assertEquals(expectedTree.toString(), "(<NUMBER: 1> <PLUS> (<MINUS> <NUMBER: 2>))");
    });
});
