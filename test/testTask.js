"use strict";

var assert = require("chai").assert;
var Task = require("../js/models/task.js");

describe("Task", function () {
    it("should exist", function () {
        assert.isDefined(Task);
    });

    it("should instantiate", function () {
        var task = new Task();

        assert.isDefined(task);
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

        it("should be toggle-able", function () {
            var task = new Task();

            task.toggleDone();
            assert.isTrue(task.done());

            task.toggleDone();
            assert.isFalse(task.done());
        });
    });
});
