import { assertEquals } from "https://deno.land/std@0.140.0/testing/asserts.ts";
import { Lexer } from "./lexer.ts";

Deno.test("Lexer", async (t) => {
  await t.step("Simple arithmatic", () => {
    assertEquals(
      Lexer.parseLine("(1 + 2 - 3 * 4 / 5 )").toString(),
      "<OPENPAR>,<NUMBER: 1>,<PLUS>,<NUMBER: 2>,<MINUS>,<NUMBER: 3>,<MULTIPLY>,<NUMBER: 4>,<DIVIDE>,<NUMBER: 5>,<CLOSEPAR>",
    );
  });

  await t.step("Illegal character error", () => {
    assertEquals(
      Lexer.parseLine(".").errorToken?.toString(),
      "<ERROR: Unexpected character '.'>",
    );
  });

  await t.step("Identifiers", () => {
    assertEquals(
      Lexer.parseLine("seven").toString(),
      "<IDENTIFIER: seven>",
    );
  });

  await t.step("Keywords", () => {
    assertEquals(
      Lexer.parseLine("LET").toString(),
      "<KEYWORD: LET>",
    );
  });
});
