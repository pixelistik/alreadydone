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
        break;
    default:
        this.title = ko.observable("");
        this.done = ko.observable(false);
        this.id = ko.observable(generateId());
    }

    this._parent = parent;

    this.remove = function () {
        this._parent.remove(this);
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
