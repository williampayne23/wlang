import { assertEquals } from "https://deno.land/std@0.140.0/testing/asserts.ts";
import { NumberValue } from "../../src/values.ts";

Deno.test("Values", async t => {
    await t.step("String Repr", () => {
        const value = new NumberValue(-1)
        assertEquals(value?.toString(), "-1");
    });
});
