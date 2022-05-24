import { UnexpectedTokenError } from "../src/errors.ts";
import { TokenType } from "../src/tokens.ts";
import { assertParseError, assertParseResult } from "./testHelpers.ts";


Deno.test("Parser", async (t) => {
    await t.step("Simple parse", () => {
        assertParseResult("1 + 2", [[1], TokenType.PLUS, [2]])
    });

    await t.step("Newlines", () => {
        assertParseResult("last", [""])
        assertParseResult("$", [""])
        assertParseResult("1\n", [1])
        assertParseResult("1;", [1])
    })

    await t.step("Local Scope", () => {
        assertParseResult("{\n\n2;\n\n}", [{anonymous: [[2]]}])
    })

    await t.step("Order of Operations", async (t) => {

        await t.step("Brackets", () => {
            assertParseResult("1 + 2 - 4 * 3", [
                [[1], TokenType.PLUS, [2]],
                TokenType.MINUS,
                [[4], TokenType.MULTIPLY, [3]],
            ])

            assertParseResult("1 + (2 - 4) * 3", [
                [1],
                TokenType.PLUS,
                [
                    [[2], TokenType.MINUS, [4]],
                    TokenType.MULTIPLY,
                    [3],
                ],
            ],)
        });

        await t.step("Indicies", () => {

            assertParseResult("1 + 2 ** 3", [
                [1],
                TokenType.PLUS,
                [
                    [2],
                    TokenType.POW,
                    [3],
                ],
            ])

            assertParseResult("2 ** 3 * 3", [
                [[2], TokenType.POW, [3]],
                TokenType.MULTIPLY,
                [3],
            ])
        });

        await t.step("Mult, Divide, Modulo", () => {

            assertParseResult("1 + 2 % 3", [
                [1],
                TokenType.PLUS,
                [
                    [2],
                    TokenType.MODULUS,
                    [3],
                ],
            ])

            assertParseResult("2 % 3 + 3", [
                [[2], TokenType.MODULUS, [3]],
                TokenType.PLUS,
                [3],
            ])

            assertParseResult("1 + 2 // 3", [
                [1],
                TokenType.PLUS,
                [
                    [2],
                    TokenType.FLOORDIVIDE,
                    [3],
                ],
            ])

            assertParseResult("2 // 3 + 3", [
                [[2], TokenType.FLOORDIVIDE, [3]],
                TokenType.PLUS,
                [3],
            ])

            assertParseResult("1 + 2 * 3", [
                [1],
                TokenType.PLUS,
                [
                    [2],
                    TokenType.MULTIPLY,
                    [3],
                ],
            ])

            assertParseResult("2 * 3 + 3", [
                [[2], TokenType.MULTIPLY, [3]],
                TokenType.PLUS,
                [3],
            ])

            assertParseResult("1 + 2 / 3", [
                [1],
                TokenType.PLUS,
                [
                    [2],
                    TokenType.DIVIDE,
                    [3],
                ],
            ])

            assertParseResult("2 / 3 + 3", [
                [[2], TokenType.DIVIDE, [3]],
                TokenType.PLUS,
                [3],
            ])
        });


    });

    await t.step("Unary Operator", async (t) => {
        await t.step("Single minus", () => {
            assertParseResult("-2", [TokenType.MINUS, [2]])
        });

        await t.step("Multiple minus", () => {
            assertParseResult("---2", [TokenType.MINUS,[TokenType.MINUS, [TokenType.MINUS, [2]]]])
        });

        await t.step("Single not", () => {
            assertParseResult("!2", [TokenType.NOT, [2]])
        });

        await t.step("Multiple not", () => {
            assertParseResult("!!!2", [TokenType.NOT,[TokenType.NOT, [TokenType.NOT, [2]]]])
        });
    });

    await t.step("Variables", async (t) => {
        await t.step("Successful assignment", () => {
            assertParseResult("let x = 4", ["x", [4]])
        });

        await t.step("Successful retrieval", () => {
            assertParseResult("x", ["x"])
        });
    });

    await t.step("Unexpected Tokens", async (t) => {
        await t.step("No close bracket", () => {
            assertParseError("(1", UnexpectedTokenError, "")
        });

        await t.step("No expr in bracket", () => {
            assertParseError("()", UnexpectedTokenError, "")
        });

        await t.step("Minus with no factor", () => {
            assertParseError("-+", UnexpectedTokenError, "+")
        });

        await t.step("Let but no identifier", () => {
            assertParseError("let 4", UnexpectedTokenError)
        });

        await t.step("Let but no equals", () => {
            assertParseError("let x 4", UnexpectedTokenError)
        });

        await t.step("At end of file", () => {
            assertParseError("1 2", UnexpectedTokenError, "2")
        });
    });
});

