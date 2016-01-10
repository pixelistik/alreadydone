"use strict";

var assert = require("chai").assert;
var List = require("../js/models/list.js");

describe("List", function () {
    it("should exist", function () {
        assert.isDefined(List);
    });

    it("should instantiate", function () {
        var list = Object.create(List).init();

        assert.isDefined(list);
    });

    describe("Creation", function () {
        it("should get a new random ID when created", function () {
            var list1 = Object.create(List).init();

            var list2 = Object.create(List).init();

            assert.lengthOf(list1.id(), 12);
            assert.lengthOf(list2.id(), 12);
            assert.notEqual(list1.id(), list2.id());
        });

        it("should use a provided ID", function () {
            var list = Object.create(List).init("myProvidedId");

            assert.equal(list.id(), "myProvidedId");
        });
    });

    describe("Tasks", function () {
        it("should start with no tasks", function () {
            var list = Object.create(List).init();

            assert.lengthOf(list.tasks(), 0);
        });

        it("should be possible to add a task", function () {
            var list = Object.create(List).init();

            list.addingTitle("Title of a test task");
            list.addTask();

            assert.equal(list.tasks()[0].title(), "Title of a test task");
        });
    });

    describe("Local persistence", function () {
        it("should save to and restore from storage", function () {
            var mockStorage = {
                getItem: function () {
                    return this.value;
                },
                setItem: function (key, value) {
                    this.value = value;
                }
            };

            var list = Object.create(List).init();

            list.tasks.push({ title: "some item"});

            list.saveToStorage(mockStorage);

            var restoredList = Object.create(List).init();

            restoredList.loadFromStorage(mockStorage);

            assert.equal(list.id(), restoredList.id());
            assert.deepEqual(list.tasks(), restoredList.tasks());
        });
    });
});
