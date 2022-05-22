import Position from "./position.ts";

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
    EOF
  }
  
  export enum Keywords {
    LET,
  }
  
  export class Token {
    type: TokenType;
    value?: (number | string);
    start?: Position;
    end?: Position;
  
    constructor(type: TokenType, value?: (number | string)) {
      this.type = type;
      this.value = value;
    }
  
    setPosition(start: Position, end: Position) {
      this.start = start;
      this.end = end;
    }

    isType(types: TokenType[]){
      return types.includes(this.type)
    }
  
    toString(): string {
      let res = `<${TokenType[this.type]}`;
      res += this.value ? `: ${this.value}>` : `>`;
      return res;
    }
  }