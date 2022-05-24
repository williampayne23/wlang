import Context from "./context.ts";
import { UnexpectedEndOfFile } from "./errors.ts";
import Lexer from "./lexer.ts";
import Node from "./nodes/node.ts";
import Parser from "./parser.ts";
import BooleanValue from "./values/booleanValue.ts";
import NullValue from "./values/nullValue.ts";
import NumberValue from "./values/numberValue.ts";
import Value from "./values/value.ts";
export default class Interpreter {

    context: Context;

    constructor(context?: Context){
        this.context = context ?? Interpreter.newGlobalContext()
    }

    visitNode(node: Node) : Value{
        const result = node.evaluate(this.context)
        return result
    }

    static newGlobalContext(): Context{
        const globalContext = new Context("global")
        globalContext.set("true", new BooleanValue(true))
        globalContext.set("false", new BooleanValue(false))
        globalContext.set("null", new NullValue())
        globalContext.set("pi", new NumberValue(Math.PI))
        globalContext.set("tau", new NumberValue(Math.PI/2))
        return globalContext
    }

    executeCode(source: string, code: string, repl?: boolean) : Value {
        repl = repl ?? false
        try {
            //Lexer
            const tokens = Lexer.tokensFromLine(source, code);
            //Parser
            const parseRes = Parser.parseTokens(tokens);
            //Interpreter
            const result = this.visitNode(parseRes);
            if(!result.isNull()) console.log(`${result}`);
            return result
        } catch (e) {
            if(e instanceof UnexpectedEndOfFile && repl){
                const extendLine = prompt(" ") ?? ""
                return this.executeCode(source, code + "\n" + extendLine, repl)
            }
            console.log(`${e}`);
            return new NullValue()
        }
    }
}