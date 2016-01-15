"use strict";

var assert = require("chai").assert;
var List = require("../js/models/list.js");
var Task = require("../js/models/task.js");

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

            assert.lengthOf(list1.id(), 36);
            assert.lengthOf(list2.id(), 36);
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

        it("should be possible to remove a task", function () {
            var list = new List();

            var task = new Task("One", list.tasks);

            list.tasks.push(task);
            assert.equal(list.tasks()[0].title(), "One");

            task.remove();

            assert.lengthOf(list.tasks(), 0);
        });
    });

    describe("Local persistence", function () {
        it("should save to and restore from storage", function (done) {
            var mockStorage = {
                values: {},
                getItem: function (key, callback) {
                    callback(null,this.values[key]);
                },
                setItem: function (key, value, callback) {
                    this.values[key] = value;
                    if (callback) {
                        callback();
                    }
                }
            };

            var list = new List("myListId");

            list.tasks.push(new Task("some item"));

            list.storage(mockStorage);
            list.saveToStorage();

            var restoredList = new List("myListId");
            restoredList.storage(mockStorage);
            restoredList.loadFromStorage(function () {
                done();
            });

            assert.equal(list.id(), restoredList.id());
            assert.equal(list.tasks().length, restoredList.tasks().length);

            assert.equal(
                list.tasks()[0].title(),
                restoredList.tasks()[0].title()
            );
        });
    });
});
