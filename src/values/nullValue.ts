import Value from "./value.ts";

export default class NullValue extends Value {
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