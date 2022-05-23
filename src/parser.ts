import { BinOpNode, Node, NumberNode, UnOpNode, VarAsignmentNode, VarRetrievalNode } from "./nodes.ts";
import { Token, TokenType } from "./tokens.ts";
import { UnexpectedTokenError } from "./errors.ts";

export default class Parser {
    tokens: Token[];
    currentToken: Token;
    tokenIndex: number;

    constructor(tokens: Token[]) {
        this.tokens = [...tokens];
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
        if(this.expectKeywordAndPass("let")){
            const token = this.currentToken
            if(!this.expectTokenAndPass(TokenType.IDENTIFIER)){
                throw UnexpectedTokenError.createFromSingleToken(token, [TokenType.IDENTIFIER])
            }
            if(!this.expectTokenAndPass(TokenType.EQ)){
                throw UnexpectedTokenError.createFromSingleToken(this.currentToken, [TokenType.EQ])
            }

            return new VarAsignmentNode(token, this.expr())
            
        }
        return this.binOp(this.term.bind(this), [TokenType.PLUS, TokenType.MINUS], this.term.bind(this));
    }

    term(): Node {
        return this.binOp(this.power.bind(this), [TokenType.MULTIPLY, TokenType.DIVIDE, TokenType.FLOORDIVIDE, TokenType.MODULUS], this.power.bind(this));
    }

    power(): Node {
        return this.binOp(this.factor.bind(this), [TokenType.POW], this.factor.bind(this))
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

        if(this.expectKeywordAndPass("last")){
            return new VarRetrievalNode(new Token(TokenType.IDENTIFIER, this.currentToken.start, this.currentToken.end, ""))
        }

        if (this.expectTokenAndPass(TokenType.NUMBER)) {
            return new NumberNode(token);
        }
        
        if(this.expectTokenAndPass(TokenType.IDENTIFIER)){
            return new VarRetrievalNode(token)
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

    expectKeywordAndPass(keyword: string): boolean {
        if (this.currentToken.isType([TokenType.KEYWORD]) && this.currentToken.value == keyword){
            this.advance()
            return true
        }
        return false
    }

    line(): Node{
        const expr = this.expr()
        if(this.expectTokenAndPass(TokenType.NEWLINE)){
            return expr
        }
        if(this.expectTokenAndPass(TokenType.TEMINAL)){
            expr.dontReturnValue()
            return expr
        }
        if(this.currentToken.isType([TokenType.EOF])){ //We don't pass here so it'll be EOF in the root method
            return expr
        }
        throw UnexpectedTokenError.createFromSingleToken(this.currentToken, [TokenType.NEWLINE, TokenType.TEMINAL, TokenType.EOF])
    }

    generateAST(): Node[] {
        const response = []
        while(!this.currentToken.isType([TokenType.EOF])){
            const line = this.line()
            response.push(line)
        }
        return response;
    }

    static parseTokens(tokens: Token[]): Node[] {
        const parser = new Parser(tokens);
        const nodes = parser.generateAST()
        return nodes
    }
}
