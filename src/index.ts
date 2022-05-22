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
    if(parseRes.error){
      console.error(parseRes.error)
      continue
    }
    console.log(parseRes.result?.toString())


    //Interpreter

  }
}
