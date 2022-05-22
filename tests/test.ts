import { assertEquals, AssertionError, assertIsError, assertThrows } from "https://deno.land/std@0.140.0/testing/asserts.ts";
import { IllegalCharacterError, UnexpectedTokenError } from "../src/errors.ts";
import Lexer from "../src/lexer.ts";
import { BinOpNode, Node, NumberNode, UnOpNode } from "../src/nodes.ts";
import Parser from "../src/parser.ts";
import Position from "../src/position.ts";
import { Token, TokenType } from "../src/tokens.ts";

function makeTokensUtility(...arr: [TokenType, any?][]) {
    return arr.map((args: [TokenType, any?]) => new Token(...args));
}

function assertTypeOf(object: any, type: any) {
    if (object.constructor != type) {
        throw new AssertionError(`Expected object of type ${object.constructor.name} to have type: ${type.name}`);
    }
}

function assertMatchingTokens(tokenArray: Token[], expTokenArray: Token[]) {
    for (let i = 0; i < expTokenArray.length; i++) {
        if (i >= tokenArray.length) {
            throw new AssertionError(`Expected ${expTokenArray[i]}, Reached end of token array`);
        }
        if (!tokenArray[i].isType([expTokenArray[i].type]) || tokenArray[i].value != expTokenArray[i].value) {
            throw new AssertionError(`Expected ${expTokenArray[i]}, Found ${tokenArray[i]}`);
        }
    }
    if (tokenArray.length > expTokenArray.length) {
        throw new AssertionError(`Expected no more tokens, Found: ${tokenArray[expTokenArray.length]}`);
    }
}

type binOpSpec = [nodeSpec, TokenType, nodeSpec];
type numberNodeSpec = [number];
type unOpSpec = [TokenType, nodeSpec];
type nodeSpec = (binOpSpec | numberNodeSpec | unOpSpec);

function makeASTUtility(spec: nodeSpec): Node {
    if (spec.length == 3) {
        spec = spec as binOpSpec;
        return new BinOpNode(makeASTUtility(spec[0]), new Token(spec[1]), makeASTUtility(spec[2]));
    }
    if (spec.length == 2) {
        spec = spec as unOpSpec;
        return new UnOpNode(new Token(spec[0]), makeASTUtility(spec[1]));
    }
    return new NumberNode(new Token(TokenType.NUMBER, spec[0]));
}

function assertMatchingAST(node: Node, expNode: Node) {
    if (!node.isEqualTo(expNode)) {
        throw new AssertionError(`Expected ${expNode} found ${node}`);
    }
}

Deno.test("Utility slasses", async (t) => {
  await t.step("String return methods", () => {
    const pos = new Position(0, 0, 0, "", "")
    const token = new Token(TokenType.MINUS)
    token.setPosition(pos, pos)
    assertEquals(new UnexpectedTokenError(token, [TokenType.PLUS]).toString(), 
    `Error: Unexpected token error: Expected: PLUS received <MINUS> at col 0`)

    const expectedTree = makeASTUtility([[1], TokenType.PLUS, [TokenType.MINUS, [2]]]);
    assertEquals(expectedTree.toString(), "(<NUMBER: 1> <PLUS> (<MINUS> <NUMBER: 2>))")
  })

  await t.step("Non matching nodes aren't equal", () => {
    assertThrows(() => assertMatchingAST(makeASTUtility([[1], TokenType.PLUS, [2]]), makeASTUtility([TokenType.MINUS, [2]])))
    assertThrows(() => assertMatchingAST(makeASTUtility([TokenType.MINUS, [2]]), makeASTUtility([[1], TokenType.PLUS, [2]])))
  })
})

Deno.test("Lexer", async (t) => {
    await t.step("To string", () => {
      const lex = Lexer.parseLine("<stdin>", "1").toString()
      assertEquals(lex, "<NUMBER: 1>,<EOF>")
    })

    await t.step("Simple arithmatic", () => {
        const expectedResult = makeTokensUtility(
            [TokenType.OPENPAR],
            [TokenType.NUMBER, 1],
            [TokenType.PLUS],
            [TokenType.NUMBER, 2],
            [TokenType.MINUS],
            [TokenType.NUMBER, 3],
            [TokenType.MULTIPLY],
            [TokenType.NUMBER, 4],
            [TokenType.DIVIDE],
            [TokenType.NUMBER, 5],
            [TokenType.CLOSEPAR],
            [TokenType.EOF],
        );
        const tokens = Lexer.parseLine("<stdin>", "(1+2-3*4 / 5 )").tokens;
        assertMatchingTokens(tokens, expectedResult);
    });

    await t.step("Illegal character error", () => {
        const lex = Lexer.parseLine("<stdin>", ".");
        assertTypeOf(lex.error, IllegalCharacterError);
    });

    await t.step("Illegal character error (too many decimals)", () => {
        const lex = Lexer.parseLine("<stdin>", "1.222.");
        assertTypeOf(lex.error, IllegalCharacterError);
    });

    await t.step("Identifiers", () => {
        const expectedResult = makeTokensUtility(
            [TokenType.IDENTIFIER, "seven"],
            [TokenType.EOF],
        );
        const tokens = Lexer.parseLine("<stdin>", "seven").tokens;
        assertMatchingTokens(
            tokens,
            expectedResult,
        );
    });

    await t.step("Keywords", () => {
        const expectedResult = makeTokensUtility(
            [TokenType.KEYWORD, "LET"],
            [TokenType.EOF],
        );
        const tokens = Lexer.parseLine("<stdin>", "LET").tokens;
        assertMatchingTokens(
            tokens,
            expectedResult,
        );
    });

    await t.step("Line counting", () => {
        const lexer = Lexer.parseLine("<stdin>", "\n\n\n");
        assertEquals(lexer.pos.line, 3);
    });
});

Deno.test("Parser", async (t) => {
    await t.step("Simple parse", () => {
        const lexer = Lexer.parseLine("<stdin>", "1 + 2");
        const parseResult = Parser.parseLexer(lexer);
        const tree = parseResult.result;
        if (tree == undefined) return;
        const expectedTree = makeASTUtility([[1], TokenType.PLUS, [2]]);
        assertMatchingAST(tree, expectedTree);
    });

    await t.step("Unexpected Token", async (t) => {
        await t.step("End of file", () => {
            const lexer = Lexer.parseLine("<stdin>", "1 2");
            const parseResult = Parser.parseLexer(lexer);
            const error = parseResult.error;
            assertTypeOf(error, UnexpectedTokenError);
            assertEquals(error?.posStart?.nextChar, "2");
        });
        await t.step("No close bracket", () => {
            const lexer = Lexer.parseLine("<stdin>", "(1");
            const parseResult = Parser.parseLexer(lexer);
            const error = parseResult.error;
            assertTypeOf(error, UnexpectedTokenError);
            assertEquals(error?.posEnd?.nextChar, "");
        });
        await t.step("No expr in bracket", () => {
            const lexer = Lexer.parseLine("<stdin>", "(");
            const parseResult = Parser.parseLexer(lexer);
            const error = parseResult.error;
            assertTypeOf(error, UnexpectedTokenError);
            assertEquals(error?.posEnd?.nextChar, "");
        });
        await t.step("In BinOp", () => {
            const lexer = Lexer.parseLine("<stdin>", "1 * (2");
            const parseResult = Parser.parseLexer(lexer);
            const error = parseResult.error;
            assertTypeOf(error, UnexpectedTokenError);
            assertEquals(error?.posEnd?.nextChar, "");
        });
    });
    
    await t.step("Brackets", async (t) => {
        await t.step("No brackets order of operations", () => {
            const lexer = Lexer.parseLine("<stdin>", "1 + 2 - 4 * 3");
            const parseResult = Parser.parseLexer(lexer);
            const tree = parseResult.result;
            if (tree == undefined) return;
            const expectedTree = makeASTUtility(
                [
                    [[1], TokenType.PLUS, [2]],
                    TokenType.MINUS,
                    [[4], TokenType.MULTIPLY, [3]],
                ],
            );
            assertMatchingAST(tree, expectedTree);
        });

        await t.step("No brackets order of operations", () => {
            const lexer = Lexer.parseLine("<stdin>", "1 + (2 - 4) * 3");
            const parseResult = Parser.parseLexer(lexer);
            const tree = parseResult.result;
            if (tree == undefined) return;
            const expectedTree = makeASTUtility(
                [
                    [1],
                    TokenType.PLUS,
                    [
                        [[2], TokenType.MINUS, [4]],
                        TokenType.MULTIPLY,
                        [3],
                    ],
                ],
            );
            assertMatchingAST(tree, expectedTree);
        });
    });

    await t.step("Unary Operator", async (t) => {
      await t.step("Single minus", () => {
        const lexer = Lexer.parseLine("<stdin>", "-2");
        const parseResult = Parser.parseLexer(lexer);
        const tree = parseResult.result;
        if (tree == undefined) return;
        const expectedTree = makeASTUtility([TokenType.MINUS, [2]]);
        assertMatchingAST(tree, expectedTree);
      })

      await t.step("Multiple minus", () => {
        const lexer = Lexer.parseLine("<stdin>", "---2");
        const parseResult = Parser.parseLexer(lexer);
        const tree = parseResult.result;
        if (tree == undefined) return;
        const expectedTree = makeASTUtility([
          TokenType.MINUS, 
          [TokenType.MINUS, 
            [TokenType.MINUS, [2]]
          ]
        ]);
        assertMatchingAST(tree, expectedTree);
      })

      await t.step("Minus with no factor", () => {
          const lexer = Lexer.parseLine("<stdin>", "-+");
          const parseResult = Parser.parseLexer(lexer);
          const error = parseResult.error;
          assertTypeOf(error, UnexpectedTokenError);
          assertEquals(error?.posStart?.nextChar, "-");
      })
    })
});
