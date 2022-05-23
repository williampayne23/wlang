import { Value } from "./values.ts";

export default class Context {
    name: string
    parent?: Context
    values: Record<string, Value>

    constructor(name: string, parent?: Context){
        this.name = name
        this.parent = parent,
        this.values = {}
    }

    set(name: string, value: Value){
        this.values[name] = value
    }

    get(name:string){
        if(name in this.values) return this.values[name]
        throw Error
    }

    copy(): Context{
        const newContext = new Context(this.name, this.parent?.copy())
        newContext.values = structuredClone(this.values)
        return newContext
    }

}