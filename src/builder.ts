import rtb=require("raml-type-bindings")
import r2ts=require("raml2ts")
export interface Types {
    [name: string]: rtb.Type
}

export class ResourcePrototype {

    constructor(public readonly primary: rtb.Type) {
    }

    readonly potentiallyRelated: rtb.Operation[] = [];

}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

// usage example:

export interface ITypedResource {
    primary: rtb.Type,
    methods: rtb.Operation[];
}

export interface IModule {
    globals: rtb.Operation[]

    resources: ITypedResource[];
}


export class ModuleBuilder {

    map: Map<rtb.Type,ResourcePrototype> = new Map();

    globals: rtb.Operation[] = [];

    canComputeFrom(t1: rtb.Type, t2: rtb.Type): boolean {
        var props = rtb.service.properties(t2);
        var canCompute = false;
        props.forEach(x => {
            if (this.isSameType(x, t1)) {
                var nm = t1.id + ":" + t2.id
                canCompute = true;
            }

        })
        return canCompute;
    }

    isSameType(c: rtb.Property, t: rtb.Type) {
        if (!c.type.id) {
            if (rtb.service.isSubtypeOf(c.type, t)) {
                return true;
            }
            var v=c.type;
            if (!v.id){
                v=rtb.service.superTypes(v)[0]
            }
            if (this.canComputeFrom(t,v)){
                return true;
            }
        }
    }

    private select(op: rtb.Operation, types: rtb.Type[]): rtb.Type {
        var rt: rtb.Type = null;
        var found = true;
        while (found) {
            found = false;
            types.forEach(t1 => {
                types.forEach(t2 => {
                    if (t1 != t2 && !found) {
                        if (this.canComputeFrom(t1, t2)) {
                            types = types.filter(x => x != t1);
                            found = true;
                        }
                    }
                })
            })
        }
        return types[0];

    }

    append(t: rtb.Type) {
        if (t.type == "operation" || t.type == "view") {
            var op: rtb.Operation = <any>t;
            var options: rtb.Type[] = [];
            if (t.displayName=="Create Comment"){
                console.log("Here")
            }
            op.parameters.forEach(x => {
                if (x.location == "body") {
                    var m = x.type;
                    var rs = rtb.service.resolvedType(x);
                    var supers = rtb.service.superTypes(x);
                    if (supers.length == 1) {
                        if (supers[0].id) {
                            options.push(supers[0]);
                        }
                    }
                }
                var ref: string = <any>(<rtb.metakeys.Reference>x).reference;
                if (ref) {
                    var tp = ref.indexOf('.');
                    var tn = ref.substring(0, tp);
                    var cnd = rtb.service.resolvedType(tn);
                    if (!cnd) {
                        throw new Error();
                    }
                    options.push(cnd);
                }
            })
            options = options.filter(onlyUnique)
            if (Object.keys(op).indexOf("list")!=-1&&options.length==0){
                options=[rtb.service.resolvedType((<any>op).itemType)];
            }
            //now we need to filter secondary references
            if (options.length == 0) {
                //console.log(op.id)
            }
            if (options.length >= 1) {
                var res = this.select(op, options);
                this.appendOp(res, op);
            }
            else {
                this.globals.push(op);
            }
        }
    }

    private appendOp(c: rtb.Type, op: rtb.Operation) {
        if (this.map.has(c)) {
            this.map.get(c).potentiallyRelated.push(op);
        }
        else {
            var proto = new ResourcePrototype(c);
            proto.potentiallyRelated.push(op);
            this.map.set(c,proto);
        }
    }

    module(): IModule {
        return {
            globals: this.globals, resources: Array.from(this.map.values()).map(x => {
                return {primary: x.primary, methods: x.potentiallyRelated}
            })
        }
    }
}

export function build(v: any) {
    var result = r2ts.process(v);
    return buildModule(result.types);
}

export function buildModule(m: Types) {
    var bld = new ModuleBuilder();
    rtb.reinit(m);
    Object.keys(m).forEach(x => {
        var item = m[x];
        bld.append(item);
    })
    return bld.module();
}