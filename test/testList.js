"use strict";

var assert = require("chai").assert;
var List = require("../js/models/list.js");

describe("List", function () {
    it("should exist", function () {
        assert.isDefined(List);
    });

    it("should instantiate", function () {
        var list = new List();

        assert.isDefined(list);
    });

    describe("Creation", function () {
        it("should get a new random ID when created", function () {
            var list1 = new List();
            var list2 = new List();

            assert.lengthOf(list1.id(), 12);
            assert.lengthOf(list2.id(), 12);
            assert.notEqual(list1.id(), list2.id());
        });

        it("should use a provided ID", function () {
            var list = new List("myProvidedId");

            assert.equal(list.id(), "myProvidedId");
        });
    });

    describe("Tasks", function () {
        it("should start with no tasks", function () {
            var list = new List();

            assert.lengthOf(list.tasks(), 0);
        });

        it("should be possible to add a task", function () {
            var list = new List();

            list.addingTitle("Title of a test task");
            list.addTask();

            assert.equal(list.tasks()[0].title(), "Title of a test task");
        });
    });

    describe("Local persistence", function () {
        it("should save to and restore from storage", function () {
            var mockStorage = {
                values: {},
                getItem: function (key) {
                    return this.values[key];
                },
                setItem: function (key, value) {
                    this.values[key] = value;
                }
            };

            var list = new List("myListId");
            list.tasks.push({ title: "some item"});

            list.storage(mockStorage);
            list.saveToStorage();

            var restoredList = new List("myListId");
            restoredList.storage(mockStorage);
            restoredList.loadFromStorage();

            assert.equal(list.id(), restoredList.id());
            assert.deepEqual(list.tasks(), restoredList.tasks());
        });
    });
});
