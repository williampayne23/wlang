import { Lexer } from "./lexer.ts";

while (true) {
  const line = prompt(">");
  //Lexer
  if (line) {
    const lexer = Lexer.parseLine(line);
    if (lexer.errorToken) {
      console.error(lexer.errorToken + "");
      continue
    } else {
      console.log(lexer.toString());
    }
  }
  //Parser
  

  //Interpreter
}
