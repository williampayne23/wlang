import { assertEquals } from "https://deno.land/std@0.140.0/testing/asserts.ts";
import Context from "../src/context.ts";
import { DivideByZeroError, NoNodeError, UndefinedVariableError } from "../src/errors.ts";
import Interpreter from "../src/interpreter.ts";
import Lexer from "../src/lexer.ts";
import Parser from "../src/parser.ts";
import { NumberValue } from "../src/values.ts";
import { assertTypeOf } from "./testHelpers.ts";



function interpretLine(line: string, context?: Context) {
    const lexer = Lexer.parseLine("", line);
    const parser = Parser.parseLexer(lexer);
    return Interpreter.visit(parser.result, context);
}

Deno.test("Interpreter", async (t) => {
    await t.step("Arithmatic", async (t) => {
        await t.step("Addition", () => {
            const value = interpretLine("1 + 1").result;
            assertEquals(value, new NumberValue(2));
        });

        await t.step("Subtraction", () => {
            const value = interpretLine("1 - 1").result;
            assertEquals(value, new NumberValue(0));
        });

        await t.step("Multiplication", () => {
            const value = interpretLine("4 * 4").result;
            assertEquals(value, new NumberValue(16));
        });

        await t.step("Division", () => {
            const value = interpretLine("4 / 2").result;
            assertEquals(value, new NumberValue(2));
        });

        await t.step("Negative numbers", () => {
            const value = interpretLine("-1").result;
            assertEquals(value, new NumberValue(-1));
        });
    });

    await t.step("Variables", () => {
        const context = new Context("<testing>")
        interpretLine("let x = 4", context)
        const result = interpretLine("x", context)
        assertEquals(result.result, new NumberValue(4))
    })

    await t.step("Runtime Errors", async (t) => {
        await t.step("Divide by zero", () => {
            const result = interpretLine("4 / 0");
            assertTypeOf(result.error, DivideByZeroError);
        });

        await t.step("No node provided", () => {
            const result = Interpreter.visit();
            assertTypeOf(result.error, NoNodeError);
        });

        await t.step("Undefined variable", () => {
            const result = interpretLine("x")
            assertTypeOf(result.error, UndefinedVariableError)
        })
    });
});