import Interpreter from "./interpreter.ts";
import Lexer from "./lexer.ts";
import Parser from "./parser.ts"

while (true) {
  const line = prompt(">");
  //Lexer
  if (line) {
    //Lexer
    const lexer = Lexer.parseLine("<stdin>", line);
    if (lexer.error) {
      console.error(lexer.error + "")
      continue
    }
    //Parser
    const parseRes = Parser.parseLexer(lexer)
    if(parseRes.result == undefined || parseRes.error){
      console.error(parseRes.error + "")
      continue
    }
    const interpreter = Interpreter.visit(parseRes.result)
    if(interpreter.error || !interpreter.result){
      console.error(interpreter.error + "")
      continue
    }
    console.log(`${interpreter.result}`)


    //Interpreter

  }
}
