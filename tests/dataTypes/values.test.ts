import { assertEquals } from "https://deno.land/std@0.140.0/testing/asserts.ts";
import { NullValue, NumberValue } from "../../src/values.ts";

Deno.test("Values", async t => {
    await t.step("Null", () => {
        const value = new NullValue()
        assertEquals(value.isNull(), true)
        assertEquals(new NumberValue(1).isNull(), false)
        assertEquals(value.toString(), "NULL")
    })
    await t.step("String Repr", () => {
        const value = new NumberValue(-1)
        assertEquals(value?.toString(), "-1");
    });
});
