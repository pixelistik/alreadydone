"use strict";

var ko = require("knockout");

var Task = function Task(title) {
    this.title = ko.observable(title);
    this.done = ko.observable(false);
    this.toggleDone = function () {
        this.done(!this.done());
    };
};

module.exports = Task;
