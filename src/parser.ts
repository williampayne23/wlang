import Lexer from "./lexer.ts";
import { BinOpNode, Node, NumberNode, UnOpNode } from "./nodes.ts";
import { Token, TokenType } from "./tokens.ts";
import { UnexpectedTokenError, WLANGError } from "./errors.ts";

type ParseResult = {
    result?: Node;
    error?: WLANGError;
}
export default class Parser {
    tokens: Token[];
    currentToken: Token;
    tokenIndex: number;

    constructor(lexer: Lexer) {
        this.tokens = [...lexer.tokens];
        this.tokenIndex = 0;
        this.currentToken = this.tokens[0];
    }

    advance() {
        this.tokenIndex++;
        if (this.tokenIndex < this.tokens.length) {
            this.currentToken = this.tokens[this.tokenIndex];
        }
    }

    expr(): Node {
        return this.binOp(this.term.bind(this), [TokenType.PLUS, TokenType.MINUS], this.term.bind(this));
    }

    term(): Node {
        return this.binOp(this.factor.bind(this), [TokenType.MULTIPLY, TokenType.DIVIDE], this.factor.bind(this));
    }

    binOp(leftTerm: () => Node, allowedOperators: TokenType[], rightTerm: () => Node): Node {
        let left = leftTerm()

        while (this.currentToken.isType(allowedOperators)) {
            const opToken = this.currentToken;
            this.advance();
            const right = rightTerm();
            left = new BinOpNode(left, opToken, right);
        }
        return left;
    }

    factor(): Node {
        const token = this.currentToken;

        if (this.expectTokenAndPass(TokenType.NUMBER)) {
            return new NumberNode(token);
        }

        if (this.expectTokenAndPass(TokenType.OPENPAR)) {
            const expr = this.expr();

            if (this.expectTokenAndPass(TokenType.CLOSEPAR)) {
                return expr;
            }
            throw new UnexpectedTokenError(this.currentToken, token.end, this.currentToken.end,  [TokenType.CLOSEPAR]);
        }

        if(this.expectTokenAndPass(TokenType.MINUS)) {
            const node = this.factor()
            return new UnOpNode(token, node)
        }

        throw new UnexpectedTokenError(token, token.start.copy(), this.currentToken.end.copy(), [TokenType.NUMBER, TokenType.OPENPAR, TokenType.MINUS]);
    }

    expectTokenAndPass(...allowedTypes: TokenType[]): boolean {
        if (this.currentToken.isType(allowedTypes)) {
            this.advance();
            return true;
        }
        return false;
    }

    generateAST(): Node {
        const res = this.expr();

        if (this.expectTokenAndPass(TokenType.EOF)) {
            return res;
        }
        throw UnexpectedTokenError.createFromSingleToken(this.currentToken, [TokenType.EOF])
    }

    static parseLexer(lexer: Lexer): ParseResult {
        try {
            const parser = new Parser(lexer);
            const node = parser.generateAST()
            return {result: node}
        } catch (e) {
            return {error: e}
        }
    }
}
