"use strict";

var ko = require("knockout");
var generateId = require("uuid").v4;

var Task = function Task(initValue, parent) {
    switch (typeof initValue) {
    case "string":
        this.title = ko.observable(initValue);
        this.done = ko.observable(false);
        this.id = ko.observable(generateId());
        break;
    case "object":
        this.title = ko.observable(initValue.title);
        this.done = ko.observable(initValue.done);
        this.id = ko.observable(initValue.id || generateId());
        this.modified = initValue.modified;
        break;
    default:
        this.title = ko.observable("");
        this.done = ko.observable(false);
        this.id = ko.observable(generateId());
    }

    if (!this.modified) {
        this.modified = Date.now();
    }

    this.__parent = parent;

    this.remove = function () {
        this.__parent.remove(this);
    };

    this.updateMerge = function (mergeTask) {
        if(this.id() !== mergeTask.id()) {
            throw new Error(
                "Trying to updateMerge Task " +
                this.id() +
                " with Task " +
                mergeTask.id()
            );
        }

        if (this.modified < mergeTask.modified) {
            this.title(mergeTask.title());
            this.done(mergeTask.done());
            this.modified = mergeTask.modified;
        }
    };

    var changeHandler = function (value) {
        if (this.__parent && typeof this.__parent.notifySubscribers === "function") {
            this.__parent.notifySubscribers(value, "child changed");
        }

        this.modified = Date.now();
    }.bind(this);

    this.title.subscribe(changeHandler);
    this.done.subscribe(changeHandler);
};

module.exports = Task;
