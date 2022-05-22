import { IllegalCharacterError } from "./errors.ts";
import Position from "./position.ts";
import { Keywords, Token, TokenType } from "./tokens.ts";

type TokenArgs = [TokenType, (string | number | undefined)]
export default class Lexer {
  lastPos: Position
  pos: Position
  error?: IllegalCharacterError;
  tokens: Token[] = [];

  constructor(file: string, text: string) {
    this.pos = new Position(0, 0, 1, file, text)
    this.lastPos = this.pos.copy()
  }

  advance() {
    this.pos.advance()
  }

  success(type: TokenType, value?: string|number) {
    const token = new Token(type, this.lastPos.copy(), this.pos.copy(), value)
    this.tokens.push(token);
    this.lastPos = this.pos.copy()
    return token
  }

  failure() {
    this.error = new IllegalCharacterError(this.lastPos.copy(), this.pos.copy());
    this.lastPos = this.pos.copy()
    return this.error
  }

  parseNumber(): TokenArgs {
    let number = "";
    let decimalCount = 0;
    while (
      "0123456789.".includes(this.pos.nextChar) && this.pos.nextChar != ""
    ) {
      if (this.pos.nextChar == ".") {
        decimalCount++;
        if (decimalCount > 1) {
          break;
        }
      }
      number += this.pos.nextChar;
      this.advance();
    }
    return [TokenType.NUMBER, parseFloat(number)];
  }

  parseIdentifierOrKeyword(): TokenArgs {
    let name = "";
    while (/[a-zA-Z_]/.test(this.pos.nextChar)) {
      name += this.pos.nextChar;
      this.advance();
    }
    if (name in Keywords) {
      return [TokenType.KEYWORD, name];
    }
    return [TokenType.IDENTIFIER, name];
  }

  toString() {
    return this.tokens.map((token) => token.toString()).join(",");
  }

  static parseLine(file: string, line: string): Lexer {
    const lexer = new Lexer(file, line);
    while (lexer.pos.nextChar !== "") {
      if (lexer.pos.nextChar == "+") {
        lexer.advance();
        lexer.success(TokenType.PLUS);
      } else if (lexer.pos.nextChar == "-") {
        lexer.advance();
        lexer.success(TokenType.MINUS);
      } else if (lexer.pos.nextChar == "/") {
        lexer.advance();
        lexer.success(TokenType.DIVIDE);
      } else if (lexer.pos.nextChar == "*") {
        lexer.advance();
        lexer.success(TokenType.MULTIPLY);
      } else if (lexer.pos.nextChar == "(") {
        lexer.advance();
        lexer.success(TokenType.OPENPAR);
      } else if (lexer.pos.nextChar == ")") {
        lexer.advance();
        lexer.success(TokenType.CLOSEPAR);
      } else if ("1234567890".includes(lexer.pos.nextChar)) {
        lexer.success(...lexer.parseNumber());
      } else if (/[a-zA-Z]/.test(lexer.pos.nextChar)) {
        lexer.success(...lexer.parseIdentifierOrKeyword());
      } else if (" \t\n".includes(lexer.pos.nextChar)) {
        lexer.advance();
        lexer.lastPos = lexer.pos.copy()
        continue;
      } else {
        lexer.failure();
        break;
      }
    }
    lexer.success(TokenType.EOF)
    return lexer;
  }
}
