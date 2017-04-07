export type Func1=(x:any)=>any;
export type Func2=(x:any,y:any)=>any;

export function property(name:string):Func1{
    return function (x){return x?x[name]:undefined}
}
export function combine(f1:Func1,f2:Func1):Func1{
    return function(x){
        return f2(f1(x));
    }
}

export const identity:Func1=(x:any)=>x;

export function constFunc(val:any):Func1{
    return function(){return val}
}

export function dereference(path:string):Func1{
    var result=identity;
    path.split(".").forEach(x=>{
        result=combine(result,property(x));
    });
    return result;
}
export function all2(f:Func2[]):Func2{
    return function(x,y){
        return f.map(v=>v(x,y));
    }
}


export function all(f:Func1[]):Func1{
    return function(x){
        return f.map(y=>y(x));
    }
}
export function storeTo(name:string,f:Func1):Func2{
    return function(x,y){
        y[name]=f(x);
    }
}

declare var console;

