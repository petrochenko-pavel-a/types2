import functors=require("./functors")
import {all2, Func1, storeTo} from "./functors";

import {registry} from "./conversions";
import {Type} from "./types2";

export class Parameter{
    constructor(public readonly name:string,public readonly type:Type,public readonly required=false){}
}

export class FunctionModel{

    readonly parameters:Parameter[]=[]

    safeMethod: boolean

    resultType: Type

    constructor(public readonly name:string,public readonly async:boolean=false){}

    with(name:string,t:Type){
        this.parameters.push(new Parameter(name,t));
    }

    invoker: Func1;

    caller():Func1{
        return this.invoker;
    }
}

export class MethodModel extends FunctionModel{

    constructor(public readonly name:string,public readonly async: boolean,public readonly owner: Type){
        super(name,async);
        this.with("self",owner);
    }
}

export class DerivedMethod extends MethodModel{

    constructor(public readonly original:FunctionModel, public readonly owner: Type){
        super(original.name,original.async,owner);
        this.safeMethod=original.safeMethod
        original.parameters.forEach(x=>{
            if (!registry.hasRule(owner,x.type)){
                this.parameters.push(x);
            }
        })
    }

    caller():functors.Func1{
        var mappings:functors.Func2[]=[];
        this.original.parameters.forEach(x=>{
            if (registry.hasRule(this.owner,x.type)){
               mappings.push(storeTo(x.name,registry.rule(this.owner,x.type)));
            }
            else{
                mappings.push(storeTo(x.name,functors.property(x.name)))
            }
        })
        var argPreparer=all2(mappings);
        var orig=this.original.caller();
        return function (data:any) {
            let converted={};
            argPreparer(data,converted);
            return orig(converted);
        };
    }
}

export function shouldBeMethodOf(t:Type, m:FunctionModel):boolean{
    var result=false;
    m.parameters.forEach(x=>{
        if (registry.hasRule(t,x.type)){
            result=true;
        }
    })
    return result;
}