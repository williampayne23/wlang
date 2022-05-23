import Context from "./context.ts";
import Interpreter from "./interpreter.ts";
import Lexer from "./lexer.ts";
import Parser from "./parser.ts"

let globalContext = new Context("Global")

while (true) {
  const line = prompt(">");
  if (line) {
    try{
    //Lexer
    const tokens = Lexer.tokensFromLine("<stdin>", line);
    //Parser
    const parseRes = Parser.parseTokens(tokens)
    //Interpreter
    const [value, context]  = Interpreter.visitNode(parseRes, globalContext)
    globalContext = context;

    console.log(`${value}`)
    }catch (e){
      console.log(`${e}`)
    }
  }
}
