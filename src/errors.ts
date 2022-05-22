import Position from "./position.ts";
import { Token, TokenType } from "./tokens.ts";

export class WLANGError {
    details: string;
    posStart?: Position;
    posEnd?: Position;

    constructor(details: string, startChar?: Position, endChar?: Position) {
        this.details = details;
        this.posStart = startChar;
        this.posEnd = endChar;
    }

    toString() {
        return `Error: ${this.details} at col ${this.posStart?.col}`;
    }
}

export class IllegalCharacterError extends WLANGError {
    constructor(posStart: Position, posEnd: Position) {
        super("Illegal character " + posStart.nextChar, posStart, posEnd);
    }
}

export class UnexpectedTokenError extends WLANGError {
    constructor(token: Token, expectedTokens: TokenType[]) {
        const text = `Unexpected token. Expected: ${expectedTokens.map(e => TokenType[e]).join(",")} received ${token}`;
        super(text, token.start, token.end);
    }
}

export class InvalidOperationError extends WLANGError {
    constructor(token: Token, expectedTokens: TokenType[]){
        const text = `Invalid operation. Expected: ${expectedTokens.map(e => TokenType[e]).join(",")} received ${token}`
        super(text, token.start, token.end)
    }
}

export class DivideByZeroError extends WLANGError {
    constructor(token:Token){
        super("Divide by zero error", token.start, token.end)
    }
}
