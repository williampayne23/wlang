import { IllegalCharacterError } from "./errors.ts";
import Position from "./position.ts";
import { Keywords, Token, TokenType } from "./tokens.ts";

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

  success(token: Token) {
    token.setPosition(this.lastPos.copy(), this.pos);
    this.tokens.push(token);
    this.lastPos = this.pos.copy()
    return token
  }

  failure() {
    this.error = new IllegalCharacterError(this.lastPos.copy(), this.pos.copy());
    this.lastPos = this.pos.copy()
    return this.error
  }

  parseNumber(): Token {
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
    return new Token(TokenType.NUMBER, parseFloat(number));
  }

  parseIdentifierOrKeyword(): Token {
    let name = "";
    while (/[a-zA-Z_]/.test(this.pos.nextChar)) {
      name += this.pos.nextChar;
      this.advance();
    }
    if (name in Keywords) {
      return new Token(TokenType.KEYWORD, name);
    }
    return new Token(TokenType.IDENTIFIER, name);
  }

  toString() {
    return this.tokens.map((token) => token.toString()).join(",");
  }

  static parseLine(file: string, line: string): Lexer {
    const lexer = new Lexer(file, line);
    while (lexer.pos.nextChar !== "") {
      if (lexer.pos.nextChar == "+") {
        lexer.success(new Token(TokenType.PLUS));
        lexer.advance();
      } else if (lexer.pos.nextChar == "-") {
        lexer.success(new Token(TokenType.MINUS));
        lexer.advance();
      } else if (lexer.pos.nextChar == "/") {
        lexer.success(new Token(TokenType.DIVIDE));
        lexer.advance();
      } else if (lexer.pos.nextChar == "*") {
        lexer.success(new Token(TokenType.MULTIPLY));
        lexer.advance();
      } else if (lexer.pos.nextChar == "(") {
        lexer.success(new Token(TokenType.OPENPAR));
        lexer.advance();
      } else if (lexer.pos.nextChar == ")") {
        lexer.success(new Token(TokenType.CLOSEPAR));
        lexer.advance();
      } else if ("1234567890".includes(lexer.pos.nextChar)) {
        lexer.success(lexer.parseNumber());
      } else if (/[a-zA-Z]/.test(lexer.pos.nextChar)) {
        lexer.success(lexer.parseIdentifierOrKeyword());
      } else if (" \t\n".includes(lexer.pos.nextChar)) {
        lexer.advance();
        lexer.lastPos = lexer.pos.copy()
        continue;
      } else {
        lexer.failure();
        break;
      }
    }
    lexer.success(new Token(TokenType.EOF))
    return lexer;
  }
}
