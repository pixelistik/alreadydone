"use strict";

var ko = require("knockout");
var Task = require("./task.js");

var randomId = function randomId() {
    var length = 12;
    var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var id = "";

    var rnd;

    for (var i = 0; i < length; i++) {
        rnd = Math.random() * chars.length | 0;
        id += chars[rnd];
    }

    return id;
};

var List = function List() {
    return {
        id: ko.observable(randomId()),
        tasks: ko.observableArray([]),
        saveToStorage: function (storage) {
            storage.setItem(this.id(), ko.toJSON(this));
        },
        loadFromStorage: function (storage) {
            var data = JSON.parse(storage.getItem(this.id()));
            this.id(data.id);
            this.tasks(data.tasks);
        },
        addingTitle: ko.observable(),
        addTask: function () {
            this.tasks.push(Task(this.addingTitle()));
        }
    };
};

module.exports = List;
