export abstract class Value {
    isNull() {
        return false;
    }

    abstract toString(): string;

    abstract copy(): Value;
}

export class NullValue extends Value {
    toString(): string {
        return "";
    }
    isNull() {
        return true;
    }
    copy() {
        return new NullValue();
    }
}

export abstract class OperatableValue extends Value {
    // deno-lint-ignore no-explicit-any
    value: any;

    abstract multiply(value: OperatableValue): OperatableValue;
    abstract divide(value: OperatableValue): OperatableValue;
    abstract plus(value: OperatableValue): OperatableValue;
    abstract minus(value: OperatableValue): OperatableValue;
    abstract floorDivide(value: OperatableValue): OperatableValue;
    abstract modulus(value: OperatableValue): OperatableValue;
    abstract pow(value: OperatableValue): OperatableValue;

    toString() {
        return `${this.value}`;
    }
}

export class NumberValue extends OperatableValue {
    value: number;

    constructor(value: number) {
        super();
        this.value = value;
    }

    copy(): NumberValue {
        return new NumberValue(this.value);
    }

    multiply(value: OperatableValue): OperatableValue {
        return new NumberValue(this.value * value.value);
    }
    divide(value: OperatableValue): OperatableValue {
        if (value.value == 0) {
            throw new Error();
        }
        return new NumberValue(this.value / value.value);
    }
    minus(value: OperatableValue): OperatableValue {
        return new NumberValue(this.value - value.value);
    }
    plus(value: OperatableValue): OperatableValue {
        return new NumberValue(this.value + value.value);
    }

    modulus(value: OperatableValue): OperatableValue {
        return new NumberValue(this.value % value.value);
    }
    floorDivide(value: OperatableValue): OperatableValue {
        const out = this.divide(value);
        out.value = Math.floor(out.value);
        return out;
    }
    pow(value: OperatableValue): OperatableValue {
        return new NumberValue(this.value ** value.value);
    }
}
