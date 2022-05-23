import { Value } from "./values.ts";

    // public static deepCopy<T>(source: T): T {
    //     return Array.isArray(source)
    //         ? source.map((item) => this.deepCopy(item))
    //         : source instanceof Date
    //         ? new Date(source.getTime())
    //         : source && typeof source === "object"
    //         ? Object.getOwnPropertyNames(source).reduce((o, prop) => {
    //             Object.defineProperty(o, prop, Object.getOwnPropertyDescriptor(source, prop)!);
    //             o[prop] = this.deepCopy((source as { [key: string]: any })[prop]);
    //             return o;
    //         }, Object.create(Object.getPrototypeOf(source)))
    //         : source as T;
    // }


// function deepCopy<T>(source: Record<string, Value>): T {
//     Object.getOwnPropertyNames(source).reduce((o, prop) => {
//         Object.defineProperty(o, prop, Object.getOwnPropertyDescriptor(source, prop)!);
//         o[prop] = deepCopy(source[prop])
//     }, Object.create(Object.getPrototypeOf(source)))
//     return source && typeof source === "object"
//         ? Object.getOwnPropertyNames(source).reduce((o, prop) => {
//             Object.defineProperty(o, prop, Object.getOwnPropertyDescriptor(source, prop)!);
//             o[prop] = deepCopy((source as { [key: string]: any })[prop]);
//             return o;
//         }, Object.create(Object.getPrototypeOf(source)))
//         : source as T;
// }

export default class Context {
    name: string;
    parent?: Context;
    values: Record<string, Value>;

    constructor(name: string, parent?: Context) {
        this.name = name;
        this.parent = parent;
        this.values = {};
    }

    set(name: string, value: Value) {
        this.values[name] = value;
    }

    get(name: string): Value {
        if (name in this.values) return this.values[name];
        if(this.parent) return this.parent.get(name);
        throw Error;
    }

    copy(): Context {
        const newParent = this.parent?.copy()
        const newContext = new Context(this.name, newParent);
        Object.getOwnPropertyNames(this.values).forEach((prop) => {
            newContext.set(prop, this.get(prop).copy())
        })
        return newContext;
    }
}
