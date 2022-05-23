import Position from "./position.ts";
















export enum TokenType {
PLUS,
MINUS,
DIVIDE,
MULTIPLY,
FLOORDIVIDE,
MODULUS,
POW,
NUMBER,
OPENPAR,
CLOSEPAR,
KEYWORD,
IDENTIFIER,
EQ,
EOF,
NEWLINE,
TEMINAL,
NOT
}

export enum Keywords {
    let,
    last
}

export class Token {
    type: TokenType;
    value?: (number | string);
    start: Position;
    end: Position;

    constructor(type: TokenType, start: Position, end: Position, value?: (number | string)) {
        this.type = type;
        this.value = value;
        this.start = start;
        this.end = end
    }

    isType(types: TokenType[]) {
        return types.includes(this.type);
    }

    toString(): string {
        let res = `<${TokenType[this.type]}`;
        res += this.value ? `: ${this.value}>` : `>`;
        return res;
    }
}
