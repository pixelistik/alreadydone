"use strict";

var assert = require("chai").assert;
var List = require("../js/models/list.js");

describe("List", function () {
    it("should exist", function () {
        assert.isDefined(List);
    });

    it("should instantiate", function () {
        var list = List();

        assert.isDefined(list);
    });

    describe("Creation", function () {
        it("should get a new random ID when created", function () {
            var list1 = List();
            var list2 = List();

            assert.lengthOf(list1.id(), 12);
            assert.lengthOf(list2.id(), 12);
            assert.notEqual(list1.id(), list2.id());
        });
    });

    describe("Items", function () {
        it("should start with no items", function () {
            var list = List();

            assert.lengthOf(list.items(), 0);
        });
    });

    describe("Local persistence", function () {

    });
});
