import Context from "./context.ts";
import { NoNodeError } from "./errors.ts";
import { Node } from "./nodes.ts";
import { Value } from "./values.ts";
export default class Interpreter {
    static visitNodes(nodes: Node[], globalContext?: Context) : [Value, Context]{
        if(nodes.length <= 0){
            throw new NoNodeError()
        }
        const context = globalContext? globalContext.copy() : new Context("<anon>")

        let result: Value
        result = nodes[0].evaluate(context)

        for(let i = 1; i<nodes.length; i++){
            result = nodes[i].evaluate(context)
        }

        return [result, context]
    }
}