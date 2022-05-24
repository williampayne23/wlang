import Interpreter from "./interpreter.ts";
import { parse } from "https://deno.land/std@0.140.0/flags/mod.ts";

main();

async function main() {
    const interpreter = new Interpreter();

    const args = parse(Deno.args);

    if (args["_"].length != 0) {
        for(const i in args["_"]){
          const file = args["_"][i]
          const text = await Deno.readTextFile(file as string);
            interpreter.executeCode(file as string, text);
        }
    }

    while (args["r"] || args["repl"] || args["_"].length == 0) {
        const line = prompt(">");
        if (line) {
            interpreter.executeCode("<stdin>", line, true);
        }
    }
}
