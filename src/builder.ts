import rtb=require("raml-type-bindings")

export interface Types{
    [name:string]:rtb.Type
}

export class ResourcePrototype{

    constructor( private primary: rtb.Type){}

    readonly potentiallyRelated: rtb.Operation[]=[];

}
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

// usage example:


export class ModuleBuilder{

    map: Map<rtb.Type,ResourcePrototype>=new Map();

    append(t:rtb.Type){
        if (t.type=="operation"||t.type=="view"){
            var op:rtb.Operation=<any>t;
            var options:rtb.Type[]=[];
            op.parameters.forEach(x=>{
                if (x.location=="body"){
                    var m=x.type;
                    var rs=rtb.service.resolvedType(x);
                    var supers=rtb.service.superTypes(x);
                    if (supers.length==1){
                        if (supers[0].id){
                            options.push(supers[0]);
                        }
                    }
                }
                var ref:string=<any>(<rtb.metakeys.Reference>x).reference;
                if (ref){
                    var tp=ref.indexOf('.');
                    var tn=ref.substring(0,tp);
                    var cnd=rtb.service.resolvedType(tn);
                    if(!cnd){
                       throw new Error();
                    }
                    options.push(cnd);
                }
            })
            options=options.filter(onlyUnique)
            //now we need to filter secondary references
            if (options.length==0){
                //console.log(op.id)
            }
            if (options.length>1){
                console.log(op.id+":"+options.map(x=>x.id).join(","))

            }
        }
    }
    private appendOp(c:rtb.Type,op:rtb.Operation){
        if (this.map.has(c)){
            this.map.get(c).potentiallyRelated.push(op);
        }
        else{
            var proto=new ResourcePrototype(c);
            proto.potentiallyRelated.push(op);
        }
    }
}

export function buildModule(m:Types){
    var bld=new ModuleBuilder();
    rtb.reinit(m);
    Object.keys(m).forEach(x=>{
        var item=m[x];
        bld.append(item);
    })
}