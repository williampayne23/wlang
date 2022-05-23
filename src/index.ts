import Context from "./context.ts";
import Interpreter from "./interpreter.ts";
import Lexer from "./lexer.ts";
import Parser from "./parser.ts";

import { parse } from "https://deno.land/std@0.140.0/flags/mod.ts";
import { BooleanValue, NullValue, NumberValue } from "./values.ts";

main();

async function main() {
    let globalContext = new Context("Global");

    globalContext.set("true", new BooleanValue(true))
    globalContext.set("false", new BooleanValue(false))
    globalContext.set("null", new NullValue())
    globalContext.set("pi", new NumberValue(Math.PI))
    globalContext.set("tau", new NumberValue(Math.PI/2))


    const args = parse(Deno.args);

    if (args["_"].length != 0) {
        for(const i in args["_"]){
          const file = args["_"][i]
          const text = await Deno.readTextFile(file as string);
          const [result, context] = executeCode(file as string, text, globalContext);
          globalContext = context;
          if(!result.isNull()) console.log(`${result}`);
        }
    }

    while (args["r"] || args["repl"] || args["_"].length == 0) {
        const line = prompt(">");
        if (line) {
            try {
                const [result, context] = executeCode("<stdin>", line, globalContext);
                globalContext = context;
                if(!result.isNull()) console.log(`${result}`);
            } catch (e) {
                console.log(`${e}`);
            }
        }
    }

    function executeCode(source: string, code: string, context?: Context) {
        //Lexer
        const tokens = Lexer.tokensFromLine(source, code);
        //Parser
        const parseRes = Parser.parseTokens(tokens);
        //Interpreter
        return Interpreter.visitNodes(parseRes, context);
    }
}
