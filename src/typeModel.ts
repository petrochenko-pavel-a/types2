import ops=require("./operations2")
import {Func1, Func2, storeTo, property, identity, all2, constFunc} from "./functors";
import {Type} from "./types2";

/**
 *
 */
export interface MemberModel{

    name(): string;

    type():Type;

    parameters():ops.Parameter[]

    value(base:any,options?:any):Promise<any>
}

export class SimpleMember{

    constructor(private _name:string,private t:Type){

    }

    name(){
        return this._name;
    }

    parameters(){
        return [];
    }

    value(base:any,options?:any){
        return Promise.resolve(base[this._name]);
    }
}


export class PropertyModel implements MemberModel{

    constructor(private m:ops.FunctionModel){}

    name(){
        return this.m.name;
    }

    type(){
        return null;
    }

    parameters(){
        return this.m.parameters.filter(x=>!this.isSystem(x));
    }

    isSystem(p:ops.Parameter){
        return p.name=="self";
    }

    _func:Func1

    parameterize(v:any,options:any){

    }

    value(base:any,options?:any){
        if (!this._func) {
            this._func=this.m.caller();
        }
        var rs:any={};
        rs.self=base;
        this.parameterize(rs,options);
        return Promise.resolve(this._func(rs));
    }
}
export class PagedProperty extends PropertyModel{


    constructor(m:ops.FunctionModel,private paging:PagingModel){
        super(m);
    }

    parameterize(v:any,options:any){
        if (options.pageNum){
            this.paging.pageFunc(options.limit)(v,options.pageNum);
        }
    }

    isSystem(p:ops.Parameter){
        return super.isSystem(p)||this.paging.consumes(p);
    }

    page(self: any,num:number){
        return this.value(self,{ pageNum:num});
    }

    pageCount(self:any):Promise<number>{
        return null;
    }
}


export interface PagingModel {
    consumes(p:ops.Parameter):boolean
    pageFunc(limit?:number):Func2
}

export class PageNumberPaging implements PagingModel{

    constructor(public readonly pageNum:string,public readonly limit?: string){}

    consumes(p:ops.Parameter):boolean{
        return p.name==this.pageNum||p.name==this.limit;
    }


    pageFunc(limit?:number){
        if (limit){
            return all2([storeTo(this.pageNum,identity),storeTo(this.limit,constFunc(limit))]);
        }
        return storeTo(this.pageNum,identity);
    }
}

export class TypeModel{

    _members:MemberModel[]

    members():MemberModel[]{
        return null;
    }

    member(name:string){
        return this._members.find(x=>x.name()==name);
    }
}

export class InstanceModel{

    _type: TypeModel
    _value: Map<MemberModel,any>
}

export class PagedCollection{

    constructor(private base,private property:PagedProperty){
    }
}