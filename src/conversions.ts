import {Type} from "./types2";
import functors=require("./functors")

export abstract class ConversionRule{

    abstract canConvert(t:Type, to:Type):boolean;
    abstract rule(from:Type,to:Type):functors.Func1;
}
export abstract class SimpleConversionRule extends ConversionRule{

    constructor(public readonly from:Type,public readonly to:Type){
        super();
    }

    canConvert(from:Type, to:Type):boolean{
        return to==this.to&&from.isSubTypeOf(this.from);
    }
}

export  class ReferenceRule extends SimpleConversionRule{

    constructor(public readonly from:Type,public readonly to:Type,public readonly chain:string){
        super(from,to);
    }
    rule(from:Type,to:Type):functors.Func1{
        return functors.dereference(this.chain)
    }
}

export class RuleRegistry{

    hasRule(from:Type,to:Type):boolean{
        if (from==to){
            return true;
        }
        return false;
    }

    rule(from:Type,to:Type):functors.Func1{
        return null;
    }
}

export const registry=new RuleRegistry();