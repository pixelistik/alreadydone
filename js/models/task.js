"use strict";

var ko = require("knockout");

var Task = {
    init: function (title) {
        this.title(title);
    },
    title: ko.observable(),
    done: ko.observable(false),
    toggleDone: function () {
        this.done(!this.done());
    }
};

module.exports = Task;
