export enum TokenType {
  PLUS,
  MINUS,
  DIVIDE,
  MULTIPLY,
  NUMBER,
  OPENPAR,
  CLOSEPAR,
  KEYWORD,
  IDENTIFIER,
  ERROR,
}

export enum Keywords {
    LET
}

export class Token {
  type: TokenType;
  value?: any;
  start: number;
  end: number;

  constructor(type: TokenType, value?: any) {
    this.type = type;
    if (value) {
      this.value = value;
    }
    this.start = this.end = 0;
  }

  setPosition(start: number, end: number) {
    this.start = start;
    this.end = end;
  }

  toString(): string {
    let res = `<${TokenType[this.type]}`;
    res += this.value ? `: ${this.value}>` : `>`;
    return res;
  }
}

export class Lexer {
  line: string;
  pos: number;
  nextCharacter: string;
  errorToken?: Token;
  tokens: Token[] = [];

  constructor(line: string) {
    this.line = line;
    this.pos = 0;
    this.nextCharacter = line.charAt(this.pos);
  }

  advance() {
    this.pos++;
    this.nextCharacter = this.line.charAt(this.pos);
  }

  success(token: Token) {
    if (this.tokens.length == 0) {
      token.setPosition(0, this.pos);
    } else {
      token.setPosition(this.tokens[this.tokens.length - 1].end, this.pos);
    }
    this.tokens.push(token);
  }

  failure(token: Token) {
    if (this.tokens.length == 0) {
      token.setPosition(0, this.pos);
    } else {
      token.setPosition(this.tokens[this.tokens.length - 1].end, this.pos);
    }
    this.errorToken = token;
  }

  parseNumber(): Token {
    let number = "";
    let decimalCount = 0;
    while (
      "0123456789.".includes(this.nextCharacter) && this.nextCharacter != ""
    ) {
      if (this.nextCharacter == ".") {
        decimalCount++;
        if (decimalCount > 1) {
          break;
        }
      }
      number += this.nextCharacter;
      this.advance();
    }
    return new Token(TokenType.NUMBER, parseFloat(number));
  }

  parseIdentifierOrKeyword(): Token{
      let name = ""
      while(/[a-zA-Z_]/.test(this.nextCharacter)){
          name += this.nextCharacter
          this.advance()
      } 
      if(name in Keywords)
        return new Token(TokenType.KEYWORD, name)
    return new Token(TokenType.IDENTIFIER, name)
  }

  toString() {
    return this.tokens.map((token) => token.toString()).join(",");
  }

  static parseLine(line: string): Lexer {
    const lexer = new Lexer(line);
    while (lexer.nextCharacter !== "") {
      if (lexer.nextCharacter == "+") {
        lexer.success(new Token(TokenType.PLUS));
        lexer.advance();
      } else if (lexer.nextCharacter == "-") {
        lexer.success(new Token(TokenType.MINUS));
        lexer.advance();
      } else if (lexer.nextCharacter == "/") {
        lexer.success(new Token(TokenType.DIVIDE));
        lexer.advance();
      } else if (lexer.nextCharacter == "*") {
        lexer.success(new Token(TokenType.MULTIPLY));
        lexer.advance();
      } else if (lexer.nextCharacter == "(") {
        lexer.success(new Token(TokenType.OPENPAR));
        lexer.advance();
      } else if (lexer.nextCharacter == ")") {
        lexer.success(new Token(TokenType.CLOSEPAR));
        lexer.advance();
      } else if ("1234567890".includes(lexer.nextCharacter)) {
        lexer.success(lexer.parseNumber());
      } else if (/[a-zA-Z]/.test(lexer.nextCharacter)) {
        lexer.success(lexer.parseIdentifierOrKeyword())
      }else if (" \t\n".includes(lexer.nextCharacter)) {
        lexer.advance();
      } else {
        lexer.failure(new Token(TokenType.ERROR, "Unexpected character '" + lexer.nextCharacter + "'"));
        break;
      }
    }
    return lexer;
  }
}
