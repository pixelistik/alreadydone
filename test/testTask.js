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

    describe("Change notification", function () {
        it("should optionally accept a parent reference", function () {
            var tasks = [];

            tasks.push(new Task("A task with a reference", tasks));
        });

        it("should call the subscribed handler on the parent", function () {
            var tasks = [];

            tasks.notifySubscribers = sinon.spy();

            tasks.push(new Task("A task with a reference", tasks));

            tasks[0].title("New title");

            assert.isTrue(tasks.notifySubscribers.withArgs("New title", "child changed").calledOnce);
        });
    });
});
