import { assertEquals } from "https://deno.land/std@0.140.0/testing/asserts.ts";
import { BooleanValue, NullValue, NumberValue } from "../../src/values.ts";

Deno.test("Values", async t => {
    await t.step("Null", () => {
        const value = new NullValue()
        assertEquals(value.isNull(), true)
        assertEquals(new NumberValue(1).isNull(), false)
        assertEquals(value.toString(), "NULL")
    })
    await t.step("Number string Repr", () => {
        const value = new NumberValue(-1)
        assertEquals(value?.toString(), "-1");
    });

    await t.step("Boolean string Repr", () => {
        const value = new BooleanValue(false)
        assertEquals(value?.toString(), "false");
    });
});
