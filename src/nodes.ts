import Context from "./context.ts";
import { DivideByZeroError, InvalidOperationError, InvalidOperatorError, UndefinedVariableError } from "./errors.ts";
import Position from "./position.ts";
import { Token, TokenType } from "./tokens.ts";
import { NullValue, NumberValue, OperatableValue, Value } from "./values.ts";

export abstract class Node {
    leftPos: Position;
    rightPos: Position;
    return = true;

    constructor(leftPos: Position, rightPos: Position){
        this.rightPos = rightPos;
        this.leftPos = leftPos;
    }

    dontReturnValue(){
        this.return = false
    }

    evaluate(context: Context): Value {
        const value = this.visit(context)
        const out = this.return? value : new NullValue()
        context.set("", out)
        return this.return?  value : new NullValue()
    }

    abstract isEqualTo(node: Node): boolean;
    abstract visit(context:Context): Value;
}

export class NumberNode extends Node {
    value: NumberValue

    constructor(token: Token) {
        super(token.start, token.end)
        this.value = new NumberValue(parseFloat(token.value as string));
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

export class BinOpNode extends Node {
    token: Token;
    leftNode: Node;
    rightNode: Node;

    constructor(leftNode: Node, operatorToken: Token, rightNode: Node) {
        super(leftNode.leftPos, rightNode.rightPos)
        this.leftNode = leftNode;
        this.rightNode = rightNode;
        this.token = operatorToken;
    }

    visit(context: Context): Value {
        const leftVal = this.leftNode.visit(context) as OperatableValue
        const rightVal = this.rightNode.visit(context) as OperatableValue

        if(!(leftVal instanceof OperatableValue)){
            throw new InvalidOperatorError(this.token, leftVal);
        }

        if(!(rightVal instanceof OperatableValue)){
            throw new InvalidOperatorError(this.token, rightVal);
        }

        if(this.token.isType([TokenType.POW])){
            return leftVal.pow(rightVal)
        }
        if (this.token.isType([TokenType.MULTIPLY])) {
            return leftVal.multiply(rightVal);
        }
        if (this.token.isType([TokenType.DIVIDE])) {
            try {
                return leftVal.divide(rightVal);
            } catch {
                throw new DivideByZeroError(this.token.start, this.rightPos);
            }
        }
        if (this.token.isType([TokenType.FLOORDIVIDE])) {
            try {
                return leftVal.floorDivide(rightVal);
            } catch {
                throw new DivideByZeroError(this.token.start, this.rightPos);
            }
        }
        if (this.token.isType([TokenType.MINUS])) {
            return leftVal.minus(rightVal);
        }
        if (this.token.isType([TokenType.PLUS])) {
            return leftVal.plus(rightVal);
        }
        if (this.token.isType([TokenType.MODULUS])) {
            return leftVal.modulus(rightVal);    
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

export class UnOpNode extends Node {
    token: Token;
    node: Node;

    constructor(operator: Token, node: Node) {
        super(operator.start, node.rightPos)
        this.token = operator;
        this.node = node;
        this.leftPos = operator.start;
        this.rightPos = node.rightPos;
    }

    visit(context: Context): Value {
        const value = this.node.visit(context) as OperatableValue
        if(!(value instanceof OperatableValue)){
            throw new InvalidOperatorError(this.token, value)
        }

        if (this.token.isType([TokenType.MINUS])) {
            return value.multiply(new NumberValue(-1));
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

export class VarAsignmentNode extends Node {
    identifier: string;
    assignNode: Node;

    constructor(identifierToken: Token, node: Node) {
        super(identifierToken.start, node.rightPos)
        this.identifier = identifierToken.value as string;
        this.assignNode = node;
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

export class VarRetrievalNode extends Node{
identifier: string;

constructor(identifierToken: Token) {
    super(identifierToken.start, identifierToken.end)
    this.identifier = identifierToken.value as string;
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
