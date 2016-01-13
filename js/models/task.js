"use strict";

var ko = require("knockout");

var Task = function Task(initValue, parent) {
    switch (typeof initValue) {
    case "string":
        this.title = ko.observable(initValue);
        this.done = ko.observable(false);
        break;
    case "object":
        this.title = ko.observable(initValue.title);
        this.done = ko.observable(initValue.done);
        break;
    default:
        this.title = ko.observable("");
        this.done = ko.observable(false);
    }

    this._parent = parent;

    this.remove = function () {
        this._parent.remove(this);
    };

    this.toggleDone = function () {
        this.done(!this.done());
    };

    var changeHandler = function (value) {
        if (this._parent && typeof this._parent.notifySubscribers === "function") {
            this._parent.notifySubscribers(value, "child changed");
        }
    }.bind(this);

    this.title.subscribe(changeHandler);
    this.done.subscribe(changeHandler);
};

module.exports = Task;
