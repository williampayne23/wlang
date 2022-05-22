export abstract class Value {
    value: any

    abstract multiply(value: Value): Value;
    abstract divide(value: Value): Value;
    abstract minus(value: Value): Value;
    abstract plus(value: Value): Value;
}

export class NumberValue extends Value {
    value: number;

    constructor(value: number) {
        super();
        this.value = value;
    }

    multiply(value: Value): Value {
        return new NumberValue(this.value * value.value);
    }
    divide(value: Value): Value {
        if(value.value == 0){
            throw new Error();
        }
        return new NumberValue(this.value / value.value);
    }
    minus(value: Value): Value {
        return new NumberValue(this.value - value.value);
    }
    plus(value: Value): Value {
        return new NumberValue(this.value + value.value);
    }
}
