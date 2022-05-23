import { assertEquals } from "https://deno.land/std@0.140.0/testing/asserts.ts";
import Context from "../../src/context.ts";
import { NumberValue } from "../../src/values.ts";

Deno.test("Context", async (t) => {
    await t.step("Copy copies parent", () => {
        const parent = new Context("parent")
        parent.set("x", new NumberValue(10))
        const child = new Context("child", parent)
        child.set("y", new NumberValue(8))
        const copy = child.copy()

        assertEquals(copy.get("x").value, parent.get("x").value)
        assertEquals(copy.get("y").value, child.get("y").value)

    })
})