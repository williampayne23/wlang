import Context from "../context.ts";
import { UndefinedVariableError } from "../errors.ts";
import { Token } from "../tokens.ts";
import Value from "../values/value.ts";
import Node from "./node.ts";

export default class VarRetrievalNode extends Node {
    identifier: string;

    constructor(identifierToken: Token) {
        super(identifierToken.start, identifierToken.end);
        this.identifier = identifierToken.value as string;
    }

    isEqualTo(node: Node): boolean {
        if (node instanceof VarRetrievalNode) {
            return node.identifier == this.identifier;
        }
        return false;
    }

    visit(context: Context): Value {
        try {
            return context.get(this.identifier);
        } catch {
            throw new UndefinedVariableError(this.identifier, context, this.leftPos, this.rightPos);
        }
    }

    toString() {
        return `(${this.identifier})`;
    }
}