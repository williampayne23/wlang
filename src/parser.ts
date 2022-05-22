import Lexer from "./lexer.ts";
import { BinOpNode, Node, NumberNode, UnOpNode } from "./nodes.ts";
import { Token, TokenType } from "./tokens.ts";
import { UnexpectedTokenError, WLANGError } from "./errors.ts";

class ParseResult {
    result?: Node;
    error?: WLANGError;

    constructor() {
    }

    register(res: ParseResult): Node | undefined {
        if (res.error) {
            this.failure(res.error);
            return undefined;
        }
        return res.result;
    }

    success(node: Node): ParseResult {
        this.result = node;
        return this;
    }

    failure(error?: WLANGError): ParseResult {
        this.error = error;
        return this;
    }
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

    expr(): ParseResult {
        return this.binOp(this.term.bind(this), [TokenType.PLUS, TokenType.MINUS], this.term.bind(this));
    }

    term(): ParseResult {
        return this.binOp(this.factor.bind(this), [TokenType.MULTIPLY, TokenType.DIVIDE], this.factor.bind(this));
    }

    binOp(leftTerm: () => ParseResult, allowedOperators: TokenType[], rightTerm: () => ParseResult): ParseResult {
        const res = new ParseResult();
        let left = res.register(leftTerm());
        if (left == undefined || res.error) return res;

        while (this.currentToken.isType(allowedOperators)) {
            const opToken = this.currentToken;
            this.advance();
            const right = res.register(rightTerm());
            if (right == undefined || res.error) return res;
            left = new BinOpNode(left, opToken, right);
        }
        return res.success(left);
    }

    factor(): ParseResult {
        const res = new ParseResult();
        const token = this.currentToken;

        if (this.expectTokenAndPass(TokenType.NUMBER)) {
            return res.success(new NumberNode(token));
        }

        if (this.expectTokenAndPass(TokenType.OPENPAR)) {
            const expr = res.register(this.expr());
            if (expr == undefined || res.error) return res;

            if (this.expectTokenAndPass(TokenType.CLOSEPAR)) {
                return res.success(expr);
            }
            return res.failure(new UnexpectedTokenError(token, [TokenType.CLOSEPAR]));
        }

        if(this.expectTokenAndPass(TokenType.MINUS)) {
            const node = res.register(this.factor())
            if(node == undefined || res.error) return res
            return res.success(new UnOpNode(token, node))
        }

        return res.failure(new UnexpectedTokenError(token, [TokenType.NUMBER, TokenType.OPENPAR, TokenType.MINUS]));
    }

    expectTokenAndPass(...allowedTypes: TokenType[]): boolean {
        if (this.currentToken.isType(allowedTypes)) {
            this.advance();
            return true;
        }
        return false;
    }

    static parseLexer(lexer: Lexer): ParseResult {
        const parser = new Parser(lexer);
        const res = parser.expr();
        if (res.error) return res;

        if (parser.currentToken.isType([TokenType.EOF])) {
            parser.advance();
            return res;
        }
        return res.failure(new UnexpectedTokenError(parser.currentToken, [TokenType.EOF]));
    }
}
