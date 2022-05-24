import { assert } from "https://deno.land/std@0.140.0/testing/asserts.ts";
import Interpreter from "../src/interpreter.ts";
import NumberValue from "../src/values/numberValue.ts";
import { assertEqualValues } from "./testHelpers.ts";

Deno.test("Interpreter", () => {
    const i = new Interpreter()
    const four = i.executeCode("", "2 + 2")
    assertEqualValues(four, new NumberValue(4))


    const nullValue = i.executeCode("", "2 / 0")
    assert(nullValue.isNull())
})