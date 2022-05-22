import { DivideByZeroError, InvalidOperationError, WLANGError } from "./errors.ts";
import { Token, TokenType } from "./tokens.ts";
import { NumberValue, Value } from "./values.ts";

export interface Node {
    token: Token;
    isEqualTo: (node: Node) => boolean;
    visit(): Value;
}

export class NumberNode implements Node {
    token: Token;

    constructor(token: Token) {
        this.token = token;
    }

    visit(): Value {
        return new NumberValue(parseFloat(this.token.value as string))
    }
    
    isEqualTo(node: Node): boolean {
        return this.token.value == node.token.value;
    }
    
    toString() {
        return `${this.token}`;
    }
}

export class BinOpNode implements Node {
    token: Token;
    leftNode: Node;
    rightNode: Node;

    constructor(leftNode: Node, operatorToken: Token, rightNode: Node) {
        this.leftNode = leftNode;
        this.rightNode = rightNode;
        this.token = operatorToken;
    }    
    
    visit(): Value {
        if(this.token.isType([TokenType.MULTIPLY])){
            return this.leftNode.visit().multiply(this.rightNode.visit())
        }
        if(this.token.isType([TokenType.DIVIDE])){
            try{
                return this.leftNode.visit().divide(this.rightNode.visit())
            }catch (e) {
                throw new DivideByZeroError(this.token)
            }
        }
        if(this.token.isType([TokenType.MINUS])){
            return this.leftNode.visit().minus(this.rightNode.visit())
        }
        if(this.token.isType([TokenType.PLUS])){
            return this.leftNode.visit().plus(this.rightNode.visit())
        }
        throw new InvalidOperationError(this.token, [TokenType.MINUS, TokenType.PLUS, TokenType.DIVIDE, TokenType.MULTIPLY])
    }

    isEqualTo(node: Node): boolean {
        if (node instanceof BinOpNode) {
            return  this.leftNode.isEqualTo(node.leftNode) && 
                    this.rightNode.isEqualTo(node.rightNode) &&
                    this.token.type == node.token.type;
        }
        return false;
    }

    toString() {
        return `(${this.leftNode} ${this.token} ${this.rightNode})`;
    }
}

export class UnOpNode implements Node {
    token: Token;
    node: Node;

    constructor(operator: Token, node: Node) {
        this.token = operator;
        this.node = node;
    }

    visit(): Value {
        if(this.token.isType([TokenType.MINUS])){
            return this.node.visit().multiply(new NumberValue(-1))
        }
        throw new InvalidOperationError(this.token, [TokenType.MINUS])
    }

    isEqualTo(node: Node): boolean {
        if (node instanceof UnOpNode) {
            return  this.node.isEqualTo(node.node) && 
                    this.token.type == node.token.type;
        }
        return false;
    }

    toString() {
        return `(${this.token} ${this.node})`;
    }
}
