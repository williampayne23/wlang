import { assertEquals } from "https://deno.land/std@0.140.0/testing/asserts.ts";
import Context from "../src/context.ts";
import { DivideByZeroError, InvalidOperatorError, NoNodeError, UndefinedVariableError } from "../src/errors.ts";
import Interpreter from "../src/interpreter.ts";
import Lexer from "../src/lexer.ts";
import Parser from "../src/parser.ts";
import { NullValue, NumberValue } from "../src/values.ts";
import { assertTypeOf } from "./testHelpers.ts";



function interpretLine(line: string, context?: Context) {
    const tokens = Lexer.tokensFromLine("", line);
    const nodes = Parser.parseTokens(tokens);
    return Interpreter.visitNodes(nodes, context);
}

Deno.test("Interpreter", async (t) => {
    await t.step("Arithmatic", async (t) => {
        await t.step("Addition", () => {
            const [value, _] = interpretLine("1 + 1");
            assertEquals(value, new NumberValue(2));
        });

        await t.step("Subtraction", () => {
            const [value, _] = interpretLine("1 - 1");
            assertEquals(value, new NumberValue(0));
        });

        await t.step("Multiplication", () => {
            const [value, ] = interpretLine("4 * 4");
            assertEquals(value, new NumberValue(16));
        });

        await t.step("Division", () => {
            const [value, ] = interpretLine("4 / 2");
            assertEquals(value, new NumberValue(2));
        });

        await t.step("Negative numbers", () => {
            const [value, ] = interpretLine("-1");
            assertEquals(value, new NumberValue(-1));
        });

        await t.step("Power", () => {
            const [value, ] = interpretLine("2**3");
            assertEquals(value, new NumberValue(8));
        });

        await t.step("Floor Divide", () => {
            const [value, ] = interpretLine("3 // 2");
            assertEquals(value, new NumberValue(1));
        });

        await t.step("Modulus", () => {
            const [value, ] = interpretLine("9 % 2");
            assertEquals(value, new NumberValue(1));
        });
    });

    await t.step("Variables", () => {
        const [, context] = interpretLine("let x = 4")
        assertEquals(context.get("x"), new NumberValue(4))
        const [value, ] = interpretLine("x", context)
        assertEquals(value, new NumberValue(4))
    })

    await t.step("New lines", () => {
        const [, context1] = interpretLine("let x = 4")
        assertEquals(context1.get(""), new NumberValue(4))
        const [, context2] = interpretLine("let x = 4;")
        assertEquals(context2.get(""), new NullValue())
        try {
            interpretLine("1 + !!", context2)
        }catch (e){
            assertTypeOf(e, InvalidOperatorError)
        }
        try {
            interpretLine("!! + 1", context2)
        }catch (e){
            assertTypeOf(e, InvalidOperatorError)
        }
        try {
            interpretLine("-!!", context2)
        }catch (e){
            assertTypeOf(e, InvalidOperatorError)
        }

        const [result, ] = interpretLine("let x = 4; x + 1")
        assertEquals(result, new NumberValue(5))
    })

    await t.step("Runtime Errors", async (t) => {
        await t.step("Divide by zero", () => {
            try{
                interpretLine("4 / 0");
            }catch (e) {
                assertTypeOf(e, DivideByZeroError);
            }

            try{
                interpretLine("4 // 0");
            }catch (e) {
                assertTypeOf(e, DivideByZeroError);
            }
        });

        await t.step("No node provided", () => {
            try {
                Interpreter.visitNodes([]);
            } catch (e){
                assertTypeOf(e, NoNodeError);
            }
        });

        await t.step("Undefined variable", () => {
            try {
                interpretLine("x")
            }catch (e) {
                assertTypeOf(e, UndefinedVariableError)
            }
        })
    });
});