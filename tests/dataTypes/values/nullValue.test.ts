import { assertEquals } from "https://deno.land/std@0.140.0/testing/asserts.ts";
import NullValue from "../../../src/values/nullValue.ts";
import NumberValue from "../../../src/values/numberValue.ts";
import { assertEqualValues } from "../../testHelpers.ts";

Deno.test("Values", async t => {
    await t.step("Null", () => {
        const value = new NullValue()
        assertEquals(value.isNull(), true)
        assertEquals(new NumberValue(1).isNull(), false)
        assertEqualValues(new NullValue(), new NullValue())
        assertEquals(value.toString(), "NULL")
    })
});