import { assertEquals } from "https://deno.land/std@0.140.0/testing/asserts.ts";
import { UnexpectedTokenError } from "../src/errors.ts";
import Lexer from "../src/lexer.ts";
import Parser from "../src/parser.ts";
import { TokenType } from "../src/tokens.ts";
import { assertMatchingAST, assertTypeOf, makeASTUtility } from "./testHelpers.ts";

Deno.test("Parser", async (t) => {
    await t.step("Simple parse", () => {
        const lexer = Lexer.parseLine("<stdin>", "1 + 2");
        const parseResult = Parser.parseLexer(lexer);
        const tree = parseResult.result;
        if (tree == undefined) return;
        const expectedTree = makeASTUtility([[1], TokenType.PLUS, [2]]);
        assertMatchingAST(tree, expectedTree);
    });

    await t.step("Unexpected Token on end of file", () => {
        const lexer = Lexer.parseLine("<stdin>", "1 2");
        const parseResult = Parser.parseLexer(lexer);
        const error = parseResult.error;
        assertTypeOf(error, UnexpectedTokenError);
        assertEquals(error?.posStart?.nextChar, "2");
    });

    await t.step("Brackets", async (t) => {
        await t.step("No brackets order of operations", () => {
            const lexer = Lexer.parseLine("<stdin>", "1 + 2 - 4 * 3");
            const parseResult = Parser.parseLexer(lexer);
            const tree = parseResult.result;
            if (tree == undefined) return;
            const expectedTree = makeASTUtility(
                [
                    [[1], TokenType.PLUS, [2]],
                    TokenType.MINUS,
                    [[4], TokenType.MULTIPLY, [3]],
                ],
            );
            assertMatchingAST(tree, expectedTree);
        });

        await t.step("Brackets change order of operations", () => {
            const lexer = Lexer.parseLine("<stdin>", "1 + (2 - 4) * 3");
            const parseResult = Parser.parseLexer(lexer);
            const tree = parseResult.result;
            if (tree == undefined) return;
            const expectedTree = makeASTUtility(
                [
                    [1],
                    TokenType.PLUS,
                    [
                        [[2], TokenType.MINUS, [4]],
                        TokenType.MULTIPLY,
                        [3],
                    ],
                ],
            );
            assertMatchingAST(tree, expectedTree);
        });

        await t.step("No close bracket", () => {
            const lexer = Lexer.parseLine("<stdin>", "(1");
            const parseResult = Parser.parseLexer(lexer);
            const error = parseResult.error;
            assertTypeOf(error, UnexpectedTokenError);
            assertEquals(error?.posEnd?.nextChar, "");
        });

        await t.step("No expr in bracket", () => {
            const lexer = Lexer.parseLine("<stdin>", "(");
            const parseResult = Parser.parseLexer(lexer);
            const error = parseResult.error;
            assertTypeOf(error, UnexpectedTokenError);
            assertEquals(error?.posEnd?.nextChar, "");
        });
    });

    await t.step("Unary Operator", async (t) => {
        await t.step("Single minus", () => {
            const lexer = Lexer.parseLine("<stdin>", "-2");
            const parseResult = Parser.parseLexer(lexer);
            const tree = parseResult.result;
            if (tree == undefined) return;
            const expectedTree = makeASTUtility([TokenType.MINUS, [2]]);
            assertMatchingAST(tree, expectedTree);
        });

        await t.step("Multiple minus", () => {
            const lexer = Lexer.parseLine("<stdin>", "---2");
            const parseResult = Parser.parseLexer(lexer);
            const tree = parseResult.result;
            if (tree == undefined) return;
            const expectedTree = makeASTUtility([
                TokenType.MINUS,
                [TokenType.MINUS, [TokenType.MINUS, [2]]],
            ]);
            assertMatchingAST(tree, expectedTree);
        });

        await t.step("Minus with no factor", () => {
            const lexer = Lexer.parseLine("<stdin>", "-+");
            const parseResult = Parser.parseLexer(lexer);
            const error = parseResult.error;
            assertTypeOf(error, UnexpectedTokenError);
            assertEquals(error?.posStart?.nextChar, "+");
        });
    });

    await t.step("Assignment", async (t) => {
        await t.step("Successful assignment", () => {
            const lexer = Lexer.parseLine("<stdin>", "let x = 4");
            const parseResult = Parser.parseLexer(lexer);
            if (parseResult.result == undefined) return;
            assertMatchingAST(parseResult.result, makeASTUtility(["x", [4]]));
        });

        await t.step("Let but no identifier", () => {
            const lexer = Lexer.parseLine("<stdin>", "let 4");
            const parseResult = Parser.parseLexer(lexer);
            assertTypeOf(parseResult.error, UnexpectedTokenError)
        });

        await t.step("Let but no equals", () => {
            const lexer = Lexer.parseLine("<stdin>", "let x 4");
            const parseResult = Parser.parseLexer(lexer);
            assertTypeOf(parseResult.error, UnexpectedTokenError)
        });
    });

    await t.step("Retrieval", async (t) => {
        await t.step("Successful retrieval", () => {
            const lexer = Lexer.parseLine("<stdin>", "x");
            const parseResult = Parser.parseLexer(lexer);
            if (parseResult.result == undefined) return;
            assertMatchingAST(parseResult.result, makeASTUtility(["x"]));
        });
    });
});
