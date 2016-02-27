"use strict";

var assert = require("chai").assert;
var sinon = require("sinon");
var Task = require("../js/models/task.js");

describe("Task", function () {
    it("should exist", function () {
        assert.isDefined(Task);
    });

    it("should instantiate", function () {
        var task = new Task();

        assert.isDefined(task);
    });

    describe("Creation", function () {
        it("should get a new random ID when created without any title", function () {
            var task1 = new Task();
            var task2 = new Task();

            assert.lengthOf(task1.id(), 36);
            assert.lengthOf(task2.id(), 36);
            assert.notEqual(task1.id(), task2.id());
        });

        it("should get a new random ID when created with given title", function () {
            var task = new Task("Some given title");
            assert.lengthOf(task.id(), 36);
        });

        it("should get a new random ID when created with given title and state", function () {
            var task = new Task({title: "Some given title", done: true});
            assert.lengthOf(task.id(), 36);
        });

        it("should use a provided ID", function () {
            var task = new Task({id: "myProvidedId"});

            assert.equal(task.id(), "myProvidedId");
        });

        it("should use a provided soft delete state", function () {
            var taskData = {
                title: "A deleted task",
                deleted: true
            };

            var result = new Task(taskData);

            assert.equal(result.deleted(), true);
        });

        it("should get an order index", function () {
            var task1 = new Task();
            var task2 = new Task();

            assert.notEqual(task1.orderIndex(), task2.orderIndex());
        });
    });

    describe("Title", function () {
        it("should be settable initially", function () {
            var task = new Task("My test task title");
            assert.equal(task.title(), "My test task title");
        });

        it("should be settable", function () {
            var task = new Task();
            task.title("The title is set.");
            assert.equal(task.title(), "The title is set.");
        });
    });

    describe("Done state", function () {
        it("should be undone initially", function () {
            var task = new Task();
            assert.isFalse(task.done());
        });

        it("should be settable", function () {
            var task = new Task();

            task.done(true);
            assert.isTrue(task.done());

            task.done(false);
            assert.isFalse(task.done());
        });
    });

    describe("Soft delete", function () {
        it("should not be deleted initially", function () {
            var task = new Task();

            assert.isFalse(task.deleted());
        });
    });

    describe("Change notification", function () {
        it("should optionally accept a parent reference", function () {
            var list = {};

            var task = new Task("A task with a reference", list);
        });

        it("should call the subscribed handler on the parent", function () {
            var list = {
                tasks: []
            };

            list.tasks.notifySubscribers = sinon.spy();

            var task = new Task("A task with a reference", list);

            task.title("New title");

            assert.isTrue(list.tasks.notifySubscribers.withArgs("New title", "child changed").calledOnce);
        });
    });

    describe("Modification timestamp", function () {
        it("should set a timestamp on creation", function () {
            var now = Date.now();
            var task = new Task();

            assert.equal(now, task.modified);
        });
        it("should set a timestamp on change", function () {
            var task = new Task();

            task.modified = 99;

            var now = Date.now();
            task.done(true);

            assert.equal(now, task.modified);
        });
    });

    describe("Handle data: Update by merge", function () {
        var task;
        beforeEach(function () {
            task = new Task({
                id: "123",
                title: "Task one",
                done: false,
                modified: 1000
            });
        });

        it("should use the merged data, when this is newer than the current", function () {
            var taskData = {
                id: "123",
                title: "Task one, newer",
                done: true,
                modified: 2000
            };

            task.handleDataUpdate(taskData);

            assert.equal(task.title(), "Task one, newer");
            assert.equal(task.done(), true);
            assert.equal(task.modified, 2000);
        });

        it("should keep the current data, if this is newer than the merged", function () {
            var taskData = {
                id: "123",
                title: "Task one, older",
                done: true,
                modified: 500
            };

            task.handleDataUpdate(taskData);

            assert.equal(task.title(), "Task one");
            assert.equal(task.done(), false);
            assert.equal(task.modified, 1000);
        });

        it("should throw an exception when IDs don't match", function () {
            var taskData = {
                id: "nonmatching"
            };

            assert.throw(function () {
                task.handleDataUpdate(taskData);
            });
        });
    });

    describe("Remote persistence", function () {
        var task;
        var zeptoStub;
        var parentListStub;

        beforeEach(function () {
            zeptoStub = {
                ajax: sinon.stub()
            };

            parentListStub = {
                apiUrl: "https://example.com/",
                apiClient: zeptoStub,
                tasks: []
            };

            task = new Task({
                id: "one",
                title: "One task",
                done: false,
                modified: 100
            }, parentListStub);
        });

        it("should PUT to the correct endpoint", function () {
            task.saveToServer();

            // We are interested in the first argument of the first call
            var arg = zeptoStub.ajax.args[0][0];

            assert(zeptoStub.ajax.calledOnce);
            assert.equal(arg.url, "https://example.com/task/one");
            assert.equal(arg.type, "PUT");
            assert.equal(JSON.parse(arg.data).id, "one");
            assert.equal(JSON.parse(arg.data)._id, "one");
            assert.deepEqual(JSON.parse(arg.data).modified, 100);
        });

        it("should GET and use newer data", function () {
            var response = {
                id: "one",
                _id: "one",
                title: "one (new)",
                done: true,
                deleted: true,
                modified: 200
            };

            zeptoStub.ajax.yieldsTo("success", response);

            return task.loadFromServer().then(function () {
                var arg = zeptoStub.ajax.args[0][0];
                assert.equal(arg.url, "https://example.com/task/one");
                assert.equal(task.title(), "one (new)");
                assert.equal(task.done(), true);
                assert.equal(task.deleted(), true);
                assert.equal(task.modified, 200);
            });
        });

        it("should reload if saving failed because of old data", function () {
            zeptoStub.ajax.yieldsTo("error", null, 409);

            sinon.spy(task, "saveToServer");
            sinon.spy(task, "loadFromServer");

            return task.saveToServerOrReloadAndRetry().catch(function () {
                // Save - Load - Save:
                assert.equal(task.saveToServer.callCount, 2);
                assert.equal(task.loadFromServer.callCount, 1);
            });
        });
    });
});
