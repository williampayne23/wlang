import Context from "./context.ts";
import { NoNodeError } from "./errors.ts";
import { Node } from "./nodes.ts";
import { Value } from "./values.ts";
export default class Interpreter {
    static visitNode(node?: Node, globalContext?: Context) : [Value, Context]{
        if(node == undefined){
            throw new NoNodeError()
        }
        const context = globalContext? globalContext.copy() : new Context("<anon>")
        return [node.visit(context), context]
    }
}