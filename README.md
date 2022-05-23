# WLANG
A programming language intepreter written in typescript using Deno

## Install:

```
git clone https://github.com/williampayne23/wlang
cd wlang
```

## Usage

Start the REPL (Read, Evaluate, Print loop) using `yarn start`. 

Execute files with `yarn start FILENAME_1 FILENAME_2 FILENAME_3`

If you want to enter the REPL after executing the file you can with `yarn start FILENAMES --repl` or `yarn start FILENAMES -r`


## Syntax

### Simple arithmatic: 

`1 + 1` (= `2`)

`1 - 1` (= `0`)

`1 * 1` (= `1`)

`1 / 1` (= `1`)

`2 ** 3` (= `8`)

`3 % 2` (= `1`) (Modulo operator)

`3 // 2` (= `1`) (Floor division operator)

You can use parentheses to change order of operations.

### Variable assignment:

Declare a variable with:

`let x = 20` (= `20`)

Variable declarations return the value the variable was assigned to.

Use a variable:

`x + 3` (= `23`)

### Semicolon:

Executing a line of WLANG will return a value unless you use a semicolon

`let x = 20` (= `20`)
`let x = 20;`(= undefined)

When you execute a file or a line of REPL the last returned value is printed.

You can access the last return value with the `last` keyword or the `!!` operator.

E.g:

```
12 + 2
last
```

Will return 14.

## Grammar

        line    
                : expression SEMICOLON? ( NEWLINE | EOF)

        expression  
                : term ((PLUS | MINUS ) term)*
                : KEYWORD:let IDENTIFIER EQ expression

        term        
                : power ((MULT | DIV | FLOORDIV | MODULO) power)*
            
        power       
                : factor (POW) factor

        factor      
                : NUMBER
                : IDENTIFIER
                : KEYWORD:last | !!
                : (MINUS) factor
                : (LEFTPAREN) expr (RIGHTPAREN)




