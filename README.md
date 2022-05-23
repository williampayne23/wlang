# WLANG
A programming language intepreter written in typescript using Deno

## Install:

```
git clone https://github.com/williampayne23/wlang
cd wlang
```

## Usage

Start the REPL (Read, Evaluate, Print loop) using `yarn start`. 

TODO; Allow people to execute files

## Syntax

### Simple arithmatic: 

`1 + 1` (= `2`)

`1 - 1` (= `0`)

`1 * 1` (= `1`)

`1 / 1` (= `1`)

You can use parentheses to change order of operations.

### Variable assignment:

Declare a variable with:

`let x = 20` (= `20`)

Variable declarations return the value the variable was assigned to.

Use a variable:

`x + 3` (= `23`)

## Grammar

    expression  
            : term ((PLUS | MINUS) term)*
            : IDENT:let EQ expression

    term        
            : factor ((MULT | DIV) factor)*

    factor      
            : NUMBER
            : IDENTIFIER
            : (MINUS) factor
            : (LEFTPAREN) expr (RIGHTPAREN)




