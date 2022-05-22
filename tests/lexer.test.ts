import { assertEquals } from "https://deno.land/std@0.140.0/testing/asserts.ts";
import { IllegalCharacterError } from "../src/errors.ts";
import Lexer from "../src/lexer.ts";
import { TokenType } from "../src/tokens.ts";
import { assertMatchingTokens, assertTypeOf, makeTokensUtility } from "./testHelpers.ts";

Deno.test("Lexer", async (t) => {

    await t.step("Simple arithmatic", () => {
        const expectedResult = makeTokensUtility(
            [TokenType.OPENPAR],
            [TokenType.NUMBER, 1],
            [TokenType.PLUS],
            [TokenType.NUMBER, 2],
            [TokenType.MINUS],
            [TokenType.NUMBER, 3],
            [TokenType.MULTIPLY],
            [TokenType.NUMBER, 4],
            [TokenType.DIVIDE],
            [TokenType.NUMBER, 5],
            [TokenType.CLOSEPAR],
            [TokenType.EOF],
        );
        const tokens = Lexer.parseLine("<stdin>", "(1+2-3*4 / 5 )").tokens;
        assertMatchingTokens(tokens, expectedResult);
    });

    await t.step("Illegal character error", () => {
        const lex = Lexer.parseLine("<stdin>", ".");
        assertTypeOf(lex.error, IllegalCharacterError);
    });

    await t.step("Illegal character error (too many decimals)", () => {
        const lex = Lexer.parseLine("<stdin>", "1.222.");
        assertTypeOf(lex.error, IllegalCharacterError);
    });

    await t.step("Identifiers", () => {
        const expectedResult = makeTokensUtility(
            [TokenType.IDENTIFIER, "seven"],
            [TokenType.EOF],
        );
        const tokens = Lexer.parseLine("<stdin>", "seven").tokens;
        assertMatchingTokens(
            tokens,
            expectedResult,
        );
    });

    await t.step("Keywords", () => {
        const expectedResult = makeTokensUtility(
            [TokenType.KEYWORD, "let"],
            [TokenType.EOF],
        );
        const tokens = Lexer.parseLine("<stdin>", "let").tokens;
        assertMatchingTokens(
            tokens,
            expectedResult,
        );
    });


    await t.step("String Repr", () => {
        const lex = Lexer.parseLine("<stdin>", "1").toString();
        assertEquals(lex, "<NUMBER: 1>,<EOF>");
    });
});