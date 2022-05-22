import { Token } from "./tokens.ts";

export interface Node {
    token: Token;
    isEqualTo: (node: Node) => boolean;
}

export class NumberNode implements Node {
    token: Token;

    constructor(token: Token) {
        this.token = token;
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
