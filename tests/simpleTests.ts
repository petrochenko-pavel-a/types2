"use strict";
var chai = require("chai");
var assert = chai.assert;
import  mocha=require("mocha")
import  r2ts=require("raml2ts")
import f=require("../src/functors")
import bld=require("../src/builder")
import path=require("path")
describe("Basic ops", function () {
    it("functors", function () {
        var rs:any={};
        var source={ name:"A"};
        f.storeTo('id',f.property("name"))(source,rs);
        assert(rs.id=="A");
    });
    it("functors1", function () {
        var rs:any={};
        var source={ name:"A",len:4};
        f.all2([
        f.storeTo('id',f.property("name")),
        f.storeTo('len',f.property("len"))])(source,rs);
        assert(rs.id=="A");
        assert(rs.len==4);
    });
})

describe("Simple graph", function () {
    it("functors", function () {
        var rs:any={};
        var source={ name:"A"};
        f.storeTo('id',f.property("name"))(source,rs);
        assert(rs.id=="A");
    });
    it("functors1", function () {
        var rs:any={};
        var source={ name:"A",len:4};
        f.all2([
            f.storeTo('id',f.property("name")),
            f.storeTo('len',f.property("len"))])(source,rs);
        assert(rs.id=="A");
        assert(rs.len==4);
    });
})

describe("Parsing", function () {
    it("functors", function (done) {
        r2ts.parseToJSON(path.resolve(__dirname,"../../tests/api.raml"),x=>{
            bld.buildModule(x.types);
            done();
        })
    });

})