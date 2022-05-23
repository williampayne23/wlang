import Context from "./context.ts";
import { DivideByZeroError, InvalidOperationError, UndefinedVariableError } from "./errors.ts";
import Position from "./position.ts";
import { Token, TokenType } from "./tokens.ts";
import { NumberValue, Value } from "./values.ts";

export interface Node {
    leftPos: Position;
    rightPos: Position;

    isEqualTo: (node: Node) => boolean;
    visit(context:Context): Value;
}

export class NumberNode implements Node {
    value: Value

    leftPos: Position;
    rightPos: Position;

    constructor(token: Token) {
        this.value = new NumberValue(parseFloat(token.value as string));
        this.leftPos = token.start;
        this.rightPos = token.end;
    }

    visit(): Value {
        return this.value;
    }

    isEqualTo(node: Node): boolean {
        if(node instanceof NumberNode){
            return this.value.value == node.value.value;
        }
        return false
    }

    toString() {
        return `<NUMBER: ${this.value}>`;
    }
}

export class BinOpNode implements Node {
    token: Token;
    leftNode: Node;
    rightNode: Node;
    leftPos: Position;
    rightPos: Position;

    constructor(leftNode: Node, operatorToken: Token, rightNode: Node) {
        this.leftNode = leftNode;
        this.rightNode = rightNode;
        this.token = operatorToken;
        this.leftPos = leftNode.leftPos;
        this.rightPos = rightNode.rightPos;
    }

    visit(context: Context): Value {
        if(this.token.isType([TokenType.POW])){
            return this.leftNode.visit(context).pow(this.rightNode.visit(context))
        }
        if (this.token.isType([TokenType.MULTIPLY])) {
            return this.leftNode.visit(context).multiply(this.rightNode.visit(context));
        }
        if (this.token.isType([TokenType.DIVIDE])) {
            try {
                return this.leftNode.visit(context).divide(this.rightNode.visit(context));
            } catch {
                throw new DivideByZeroError(this.token.start, this.rightPos);
            }
        }
        if (this.token.isType([TokenType.FLOORDIVIDE])) {
            try {
                return this.leftNode.visit(context).floorDivide(this.rightNode.visit(context));
            } catch {
                throw new DivideByZeroError(this.token.start, this.rightPos);
            }
        }
        if (this.token.isType([TokenType.MINUS])) {
            return this.leftNode.visit(context).minus(this.rightNode.visit(context));
        }
        if (this.token.isType([TokenType.PLUS])) {
            return this.leftNode.visit(context).plus(this.rightNode.visit(context));
        }
        if (this.token.isType([TokenType.MODULUS])) {
            return this.leftNode.visit(context).modulus(this.rightNode.visit(context));    
        }

        throw new InvalidOperationError(this.token, [
            TokenType.MINUS,
            TokenType.PLUS,
            TokenType.DIVIDE,
            TokenType.MULTIPLY,
            TokenType.FLOORDIVIDE,
            TokenType.MODULUS,
            TokenType.POW
        ]);
    }

    isEqualTo(node: Node): boolean {
        if (node instanceof BinOpNode) {
            return this.leftNode.isEqualTo(node.leftNode) &&
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
    leftPos: Position;
    rightPos: Position;

    constructor(operator: Token, node: Node) {
        this.token = operator;
        this.node = node;
        this.leftPos = operator.start;
        this.rightPos = node.rightPos;
    }

    visit(context: Context): Value {
        if (this.token.isType([TokenType.MINUS])) {
            return this.node.visit(context).multiply(new NumberValue(-1));
        }
        throw new InvalidOperationError(this.token, [TokenType.MINUS]);
    }

    isEqualTo(node: Node): boolean {
        if (node instanceof UnOpNode) {
            return this.node.isEqualTo(node.node) &&
                this.token.type == node.token.type;
        }
        return false;
    }

    toString() {
        return `(${this.token} ${this.node})`;
    }
}

export class VarAsignmentNode implements Node {
    identifier: string;
    leftPos: Position;
    rightPos: Position;
    assignNode: Node;

    constructor(identifierToken: Token, node: Node) {
        this.identifier = identifierToken.value as string;
        this.assignNode = node;
        this.leftPos = identifierToken.start;
        this.rightPos = this.assignNode.rightPos;
    }

    visit(context: Context): Value {
        const value = this.assignNode.visit(context)
        context.set(this.identifier, value)
        return value
    }

    isEqualTo(node: Node): boolean {
        if (node instanceof VarAsignmentNode) {
            return (this.identifier == node.identifier && this.assignNode.isEqualTo(node.assignNode));
        }
        return false;
    }
}

export class VarRetrievalNode implements Node{
identifier: string;
leftPos: Position;
rightPos: Position;

constructor(identifierToken: Token) {
    this.identifier = identifierToken.value as string;
    this.leftPos = identifierToken.start;
    this.rightPos = identifierToken.end;
}

isEqualTo(node: Node): boolean {
    if(node instanceof VarRetrievalNode){
        return node.identifier == this.identifier
    }
    return false
}

visit(context: Context): Value {
    try{
        return context.get(this.identifier)
    } catch {
        throw new UndefinedVariableError(this.identifier, context, this.leftPos, this.rightPos)
    }
}

}
