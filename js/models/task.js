"use strict";

var ko = require("knockout");

var Task = function Task(initValue) {
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

    this.toggleDone = function () {
        this.done(!this.done());
    };
};

module.exports = Task;
