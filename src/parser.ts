import { Token, TokenType } from "./tokens.ts";
import { UnexpectedTokenError } from "./errors.ts";
import BinOpNode from "./nodes/binOpNode.ts";
import Node from "./nodes/node.ts";
import NumberNode from "./nodes/numberNode.ts";
import ScopeNode from "./nodes/scopeNode.ts";
import UnOpNode from "./nodes/unOpNode.ts";
import VarAsignmentNode from "./nodes/varAssignNode.ts";
import VarRetrievalNode from "./nodes/varRetrievalNode.ts";

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

    globalScope(): Node{
        const scope =  this.scope("global", TokenType.EOF);
        scope.openScope()
        return scope;
    }

    localScope(name: string): ScopeNode{
        return this.scope(name, TokenType.CLOSEBRACE)
    }

    scope(name:string, terminator: TokenType): ScopeNode {
        const nodes: Node[] = [];

        //Allows for empty scopes
        while(this.expectTokenAndPass(TokenType.NEWLINE)){
            continue
        }
        const token = this.currentToken;
        if(this.expectTokenAndPass(terminator)){
            return new ScopeNode(name, [new VarRetrievalNode(new Token(TokenType.IDENTIFIER, token.start, token.end, "null"))])
        }


        while (true) {
            while(this.expectTokenAndPass(TokenType.NEWLINE)){
                continue
            }

            const expr = this.expr();
            
            if (this.expectTokenAndPass(TokenType.TEMINAL)) {
                expr.dontReturnValue();
                nodes.push(expr)
            }else if (this.expectTokenAndPass(TokenType.NEWLINE)){
                nodes.push(expr);
            }else if (this.expectTokenAndPass(terminator)){
                nodes.push(expr)
            }else{
                throw UnexpectedTokenError.createFromSingleToken(this.currentToken, [
                    TokenType.NEWLINE,
                    TokenType.TEMINAL,
                    terminator,
                ]);
            }

            while(this.expectTokenAndPass(TokenType.NEWLINE)){
                continue
            }

            if (this.expectTokenAndPass(terminator)) {
                return new ScopeNode(name, nodes);
            }
        }
    }

    expr(): Node {
        if (this.expectKeywordAndPass("let")) {
            const token = this.currentToken;
            if (!this.expectTokenAndPass(TokenType.IDENTIFIER)) {
                throw UnexpectedTokenError.createFromSingleToken(token, [TokenType.IDENTIFIER]);
            }
            if (!this.expectTokenAndPass(TokenType.EQ)) {
                throw UnexpectedTokenError.createFromSingleToken(this.currentToken, [TokenType.EQ]);
            }

            return new VarAsignmentNode(token, this.expr());
        }

        if (this.expectTokenAndPass(TokenType.OPENBRACE)){
            return this.localScope("anonymous")
        }
        return this.binOp(this.compexpr.bind(this), [
            TokenType.AND,
            TokenType.OR,
            TokenType.XOR,
            TokenType.BITLEFT,
            TokenType.BITRIGHT,
            TokenType.BITRIGHTZERO,
        ], this.compexpr.bind(this));
    }

    compexpr(): Node {
        const token = this.currentToken;
        if (this.expectTokenAndPass(TokenType.NOT)) {
            return new UnOpNode(token, this.compexpr());
        }
        return this.binOp(this.arithexpr.bind(this), [
            TokenType.LT,
            TokenType.GT,
            TokenType.GTE,
            TokenType.LTE,
            TokenType.EE,
            TokenType.NEE,
        ], this.arithexpr.bind(this));
    }

    arithexpr(): Node {
        return this.binOp(this.term.bind(this), [TokenType.PLUS, TokenType.MINUS], this.term.bind(this));
    }

    term(): Node {
        return this.binOp(this.power.bind(this), [
            TokenType.MULTIPLY,
            TokenType.DIVIDE,
            TokenType.FLOORDIVIDE,
            TokenType.MODULUS,
        ], this.power.bind(this));
    }

    power(): Node {
        return this.binOp(this.factor.bind(this), [TokenType.POW], this.factor.bind(this));
    }

    binOp(leftTerm: () => Node, allowedOperators: TokenType[], rightTerm: () => Node): Node {
        let left = leftTerm();

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

        if (this.expectKeywordAndPass("last")) {
            return new VarRetrievalNode(
                new Token(TokenType.IDENTIFIER, this.currentToken.start, this.currentToken.end, ""),
            );
        }

        if (this.expectTokenAndPass(TokenType.NUMBER)) {
            return new NumberNode(token);
        }

        if (this.expectTokenAndPass(TokenType.IDENTIFIER)) {
            return new VarRetrievalNode(token);
        }

        if (this.expectTokenAndPass(TokenType.OPENPAR)) {
            const expr = this.expr();

            if (this.expectTokenAndPass(TokenType.CLOSEPAR)) {
                return expr;
            }
            throw new UnexpectedTokenError(this.currentToken, token.end, this.currentToken.end, [TokenType.CLOSEPAR]);
        }

        if (this.expectTokenAndPass(TokenType.MINUS)) {
            const node = this.factor();
            return new UnOpNode(token, node);
        }

        throw new UnexpectedTokenError(token, token.start.copy(), this.currentToken.end.copy(), [
            TokenType.NUMBER,
            TokenType.OPENPAR,
            TokenType.MINUS,
        ]);
    }

    expectTokenAndPass(...allowedTypes: TokenType[]): boolean {
        if (this.currentToken.isType(allowedTypes)) {
            this.advance();
            return true;
        }
        return false;
    }

    expectKeywordAndPass(keyword: string): boolean {
        if (this.currentToken.isType([TokenType.KEYWORD]) && this.currentToken.value == keyword) {
            this.advance();
            return true;
        }
        return false;
    }

    generateAST(): Node {
        const token = this.currentToken;        
        if(this.expectTokenAndPass(TokenType.EOF)){
            return new ScopeNode("global", [new VarRetrievalNode(new Token(TokenType.IDENTIFIER, token.start, token.end, "null"))])
        }
        const response = this.globalScope()
        return response;
    }

    static parseTokens(tokens: Token[]): Node {
        const parser = new Parser(tokens);
        const node = parser.generateAST();
        return node;
    }
}
