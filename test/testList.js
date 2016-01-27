"use strict";

var assert = require("chai").assert;
var sinon = require("sinon");

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
            var list = new List({id: "myProvidedId"});

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

            var task = new Task("One", list);

            list.tasks.push(task);
            assert.equal(list.tasks()[0].title(), "One");

            task.remove();

            assert.lengthOf(list.tasks(), 0);
        });
    });

    describe("Local persistence", function () {
        var mockStorage;

        beforeEach(function () {
            mockStorage = {
                values: {},
                getItem: function (key, callback) {
                    callback(null,this.values[key] || null);
                },
                setItem: function (key, value, callback) {
                    this.values[key] = value;
                    if (callback) {
                        callback();
                    }
                }
            };
        });

        it("should save to and restore from storage", function (done) {
            var list = new List({id: "myListId"});

            list.tasks.push(new Task("some item", list));

            list.storage(mockStorage);
            list.saveToStorage();

            var restoredList = new List({id: "myListId"});
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

        it("should report an error when no data is found", function (done) {
            var list = new List();

            list.storage(mockStorage);

            list.loadFromStorage(function (err) {
                assert.deepEqual(err, new Error("No local task data found"));
                done();
            });
        });
    });

    describe("Remote persistence", function () {
        var list;
        var zeptoStub;

        beforeEach(function () {
            zeptoStub = {
                ajax: sinon.stub()
            };

            list = new List({
                id: "my-test-id",
                apiUrl: "https://example.com/",
                apiClient: zeptoStub
            });

        });

        describe("Saving", function () {
            it("should save each individual task", function () {
                var task = new Task("some", list);
                list.tasks.push(task);

                sinon.stub(task, "saveToServer");

                return list.saveToServer().then(function () {
                    assert.equal(1, task.saveToServer.callCount);
                });
            });
        });

        describe("Loading", function () {
            it("should make a GET request to the correct endpoint", function () {
                var response = [
                    {title: "one", done: false},
                    {title: "two", done: true}
                ];

                zeptoStub.ajax.yieldsTo("success", response);

                list = new List({
                    id: "my-test-id",
                    apiUrl: "https://example.com/",
                    apiClient: zeptoStub
                });

                list.loadFromServer();

                // We are interested in the first argument of the first call
                var arg = zeptoStub.ajax.args[0][0];

                sinon.assert.callCount(zeptoStub.ajax, 1);
                assert.equal(arg.url, "https://example.com/list/my-test-id/tasks");
                assert.equal(arg.type, "GET");
                assert.equal(list.tasks()[0].title(), "one");
            });
        });
    });
});
