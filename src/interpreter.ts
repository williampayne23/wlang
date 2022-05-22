import { NoNodeError, WLANGError } from "./errors.ts";
import { Node } from "./nodes.ts";
import { Value } from "./values.ts";

type result = {
    result?: Value,
    error?: WLANGError
}

export default class Interpreter {
    static visit(node?: Node) : result{
        if(node == undefined){
            return {error: new NoNodeError()}
        }
        try {
            return {result: node.visit()}
        } catch (e) {
            return {error: e}
        }
    }
}