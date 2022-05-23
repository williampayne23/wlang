import { assertEquals } from "https://deno.land/std@0.140.0/testing/asserts.ts";
import { UnexpectedTokenError } from "../src/errors.ts";
import Lexer from "../src/lexer.ts";
import Parser from "../src/parser.ts";
import { TokenType } from "../src/tokens.ts";
import { assertMatchingAST, assertTypeOf, makeASTUtility } from "./testHelpers.ts";

Deno.test("Parser", async (t) => {
    await t.step("Simple parse", () => {
        const tokens = Lexer.tokensFromLine("<stdin>", "1 + 2");
        const tree = Parser.parseTokens(tokens);
        const expectedTree = makeASTUtility([[1], TokenType.PLUS, [2]]);
        assertMatchingAST(tree, expectedTree);
    });

    await t.step("Unexpected Token on end of file", () => {
        try{
            const tokens = Lexer.tokensFromLine("<stdin>", "1 2");
            Parser.parseTokens(tokens);
        }catch (e){
            assertTypeOf(e, UnexpectedTokenError);
            assertEquals(e?.posStart?.nextChar, "2");
        }
    });

    await t.step("Brackets", async (t) => {
        await t.step("No brackets order of operations", () => {
            const tokens = Lexer.tokensFromLine("<stdin>", "1 + 2 - 4 * 3");
            const tree = Parser.parseTokens(tokens);
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
            const tokens = Lexer.tokensFromLine("<stdin>", "1 + (2 - 4) * 3");
            const tree = Parser.parseTokens(tokens);
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
            try{
                const tokens = Lexer.tokensFromLine("<stdin>", "(1");
                Parser.parseTokens(tokens);
            }catch (e){
                assertTypeOf(e, UnexpectedTokenError);
                assertEquals(e?.posEnd?.nextChar, "");
            }
        });

        await t.step("No expr in bracket", () => {
            try{
                const tokens = Lexer.tokensFromLine("<stdin>", "()");
                Parser.parseTokens(tokens);
            }catch (e){
                assertTypeOf(e, UnexpectedTokenError);
                assertEquals(e?.posEnd?.nextChar, "");
            }
        });
    });

    await t.step("Unary Operator", async (t) => {
        await t.step("Single minus", () => {
            const tokens = Lexer.tokensFromLine("<stdin>", "-2");
            const tree = Parser.parseTokens(tokens);
            const expectedTree = makeASTUtility([TokenType.MINUS, [2]]);
            assertMatchingAST(tree, expectedTree);
        });

        await t.step("Multiple minus", () => {
            const tokens = Lexer.tokensFromLine("<stdin>", "---2");
            const tree = Parser.parseTokens(tokens);
            const expectedTree = makeASTUtility([
                TokenType.MINUS,
                [TokenType.MINUS, [TokenType.MINUS, [2]]],
            ]);
            assertMatchingAST(tree, expectedTree);
        });

        await t.step("Minus with no factor", () => {
            try{
                const tokens = Lexer.tokensFromLine("<stdin>", "-+");
                Parser.parseTokens(tokens);
            }catch (e){
                assertTypeOf(e, UnexpectedTokenError);
                assertEquals(e?.posStart?.nextChar, "+");
            }
        });
    });

    await t.step("Assignment", async (t) => {
        await t.step("Successful assignment", () => {
            const tokens = Lexer.tokensFromLine("<stdin>", "let x = 4");
            const node = Parser.parseTokens(tokens);
            assertMatchingAST(node, makeASTUtility(["x", [4]]));
        });

        await t.step("Let but no identifier", () => {
            try{
                const tokens = Lexer.tokensFromLine("<stdin>", "let 4");
                Parser.parseTokens(tokens);
            }catch (e){
                assertTypeOf(e, UnexpectedTokenError)
            }
        });

        await t.step("Let but no equals", () => {
            try{
                const tokens = Lexer.tokensFromLine("<stdin>", "let x 4");
                Parser.parseTokens(tokens);
            }catch (e){
                assertTypeOf(e, UnexpectedTokenError)
            }
        });
    });

    await t.step("Retrieval", async (t) => {
        await t.step("Successful retrieval", () => {
            const tokens = Lexer.tokensFromLine("<stdin>", "x");
            const node = Parser.parseTokens(tokens);
            assertMatchingAST(node, makeASTUtility(["x"]));
        });
    });
});
