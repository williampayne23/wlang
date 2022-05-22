import { AssertionError } from "https://deno.land/std@0.140.0/testing/asserts.ts";
import { BinOpNode, Node, NumberNode, UnOpNode, VarAsignmentNode, VarRetrievalNode } from "../src/nodes.ts";
import Position from "../src/position.ts";
import { Token, TokenType } from "../src/tokens.ts";

// deno-lint-ignore no-explicit-any
export function assertTypeOf(object: any, type: any) {
    if (object.constructor != type) {
        throw new AssertionError(`Expected object of type ${object.constructor.name} to have type: ${type.name}`);
    }
}

export function assertMatchingAST(node: Node, expNode: Node) {
    if (!node.isEqualTo(expNode)) {
        throw new AssertionError(`Expected ${expNode} found ${node}`);
    }
}

export function assertMatchingTokens(tokenArray: Token[], expTokenArray: Token[]) {
    for (let i = 0; i < expTokenArray.length; i++) {
        if (i >= tokenArray.length) {
            throw new AssertionError(`Expected ${expTokenArray[i]}, Reached end of token array`);
        }
        if (!tokenArray[i].isType([expTokenArray[i].type]) || tokenArray[i].value != expTokenArray[i].value) {
            throw new AssertionError(`Expected ${expTokenArray[i]}, Found ${tokenArray[i]}`);
        }
    }
    if (tokenArray.length > expTokenArray.length) {
        throw new AssertionError(`Expected no more tokens, Found: ${tokenArray[expTokenArray.length]}`);
    }
}


type binOpSpec = [nodeSpec, TokenType, nodeSpec];
type singleNodeSpec = [number | string];
type unOpSpec = [TokenType | string, nodeSpec];
type nodeSpec = (binOpSpec | singleNodeSpec | unOpSpec);

export function makeASTUtility(spec: nodeSpec): Node {
    const dummyPos = new Position(0, 0, 0, "", "");
    if (spec.length == 3) {
        spec = spec as binOpSpec;
        return new BinOpNode(makeASTUtility(spec[0]), new Token(spec[1], dummyPos, dummyPos), makeASTUtility(spec[2]));
    }
    if (spec.length == 2) {
        spec = spec as unOpSpec;
        if (typeof spec[0] == 'string'){
            return new VarAsignmentNode(new Token(TokenType.IDENTIFIER, dummyPos, dummyPos, spec[0]), makeASTUtility(spec[1]))
        }
        return new UnOpNode(new Token(spec[0], dummyPos, dummyPos), makeASTUtility(spec[1]));
    }
    if(typeof spec[0] == "string"){
        return new VarRetrievalNode(new Token(TokenType.IDENTIFIER, dummyPos, dummyPos, spec[0]))
    }
    return new NumberNode(new Token(TokenType.NUMBER, dummyPos, dummyPos, spec[0]));
}

// deno-lint-ignore no-explicit-any
export function makeTokensUtility(...arr: [TokenType, any?][]) {
    const dummyPos = new Position(0, 0, 0, "", "");
    // deno-lint-ignore no-explicit-any
    return arr.map((args: [TokenType, any?]) => new Token(args[0], dummyPos, dummyPos, args[1]));
}