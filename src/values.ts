import { DivideByZeroError, InvalidOperatorError } from "./errors.ts";
import { Token, TokenType } from "./tokens.ts";
export abstract class Value {
    // deno-lint-ignore no-explicit-any
    value: any;
    allowedBinOperations: Partial<Record<TokenType, (a:Value, b:Value, token:Token) => Value>> = {}
    allowedUnOperations: Partial<Record<TokenType, (a:Value, token:Token) => Value>> = {}
    declareIsAllowed(token: Token) {
        if (!(token.type in this.allowedBinOperations)) {
            throw new InvalidOperatorError(token, this);
        }
    }

    performBinOperation(b: Value, token: Token): Value{
        const operation = this.allowedBinOperations[token.type]
        if(operation == null){
            throw new InvalidOperatorError(token, this);
        }
        b?.declareIsAllowed(token)
        return operation(this, b, token)
    }

    performUnOperation(token: Token): Value{
        const operation = this.allowedUnOperations[token.type]
        if(operation == null){
            throw new InvalidOperatorError(token, this);
        }
        return operation(this, token)
    }

    isNull() {
        return false;
    }

    toString(): string {
        return `${this.value}`;
    }

    abstract copy(): Value;
}

export class NullValue extends Value {
    toString(): string {
        return "NULL";
    }
    isNull() {
        return true;
    }
    copy() {
        return new NullValue();
    }
}

export class NumberValue extends Value {

    value: number;

    constructor(value: number) {
        super();
        this.value = value;
    }

    copy(): NumberValue {
        return new NumberValue(this.value);
    }

    allowedBinOperations = {
        [TokenType.MULTIPLY](a:Value, b: Value): Value {
            return new NumberValue(a.value * b.value);
        },
        [TokenType.DIVIDE](a:Value, b: Value, token: Token): Value {
            if (b.value == 0) {
                throw new DivideByZeroError(token.start, token.end)
            }
            return new NumberValue(a.value / b.value);
        },
        [TokenType.MINUS](a:Value, b: Value): Value {
            return new NumberValue(a.value - b.value);
        },
        [TokenType.PLUS](a:Value, b: Value): Value {
            return new NumberValue(a.value + b.value);
        },
        [TokenType.MODULUS](a:Value, b: Value): Value {
            return new NumberValue(a.value % b.value);
        },
        [TokenType.FLOORDIVIDE](a:Value, b: Value, token:Token): Value {
            token.type = TokenType.DIVIDE
            const out = a.performBinOperation(b, token)
            out.value = Math.floor(out.value);
            return out;
        },
        [TokenType.POW](a:Value, b: Value): Value {
            return new NumberValue(a.value ** b.value);
        },
        [TokenType.GT](a: Value, b:Value): Value {
            return new BooleanValue(a.value > b.value)
        },
        [TokenType.LT](a: Value, b:Value): Value {
            return new BooleanValue(a.value < b.value)
        },
        [TokenType.GTE](a: Value, b:Value): Value {
            return new BooleanValue(a.value >= b.value)
        },
        [TokenType.LTE](a: Value, b:Value): Value {
            return new BooleanValue(a.value <= b.value)
        },
        [TokenType.EE](a: Value, b:Value): Value {
            return new BooleanValue(a.value == b.value)
        },
        [TokenType.NEE](a: Value, b:Value): Value {
            return new BooleanValue(a.value != b.value)
        },
        [TokenType.AND](a: Value, b: Value): Value{
            return new NumberValue(a.value & b.value)
        },
        [TokenType.OR](a: Value, b: Value): Value{
            return new NumberValue(a.value | b.value)
        },
        [TokenType.XOR](a: Value, b: Value): Value{
            return new NumberValue(a.value ^ b.value)
        },
        [TokenType.BITLEFT](a: Value, b: Value): Value{
            return new NumberValue(a.value << b.value)
        },
        [TokenType.BITRIGHT](a: Value, b: Value): Value{
            return new NumberValue(a.value >> b.value)
        },
        [TokenType.BITRIGHTZERO](a: Value, b: Value): Value{
            return new NumberValue(a.value >>> b.value)
        }
    }

    allowedUnOperations = {
        [TokenType.MINUS](a: Value): Value {
            return new NumberValue(a.value * -1)
        },
        [TokenType.NOT](a: Value): Value{
            return new NumberValue(~a.value)
        }
    }

}

export class BooleanValue extends Value {
    value: boolean

    constructor(value: boolean){
        super()
        this.value = value
    }

    allowedBinOperations = {
        [TokenType.AND](a: Value, b: Value): Value{
            return new BooleanValue(a.value && b.value)
        },
        [TokenType.OR](a: Value, b: Value): Value{
            return new BooleanValue(a.value || b.value)
        },
        [TokenType.XOR](a: Value, b: Value): Value{
            return new BooleanValue((a.value ^ b.value) == 1)
        }
    }

    allowedUnOperations = {
        [TokenType.NOT](a: Value): Value{
            return new BooleanValue(!a.value)
        }
    }

    toString(){
        return `${this.value}`
    }

    copy(): Value {
        return new BooleanValue(this.value)
    }

}
