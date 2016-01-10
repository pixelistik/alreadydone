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

var List = {
    init: function (id) {
        this.id = ko.observable();
        this.id(id || randomId());
        this.tasks = ko.observableArray([]);
        this.addingTitle = ko.observable();

        return this;
    },
    saveToStorage: function (storage) {
        storage.setItem(this.id(), ko.toJSON(this));
    },
    loadFromStorage: function (storage) {
        var data = JSON.parse(storage.getItem(this.id()));
        this.id(data.id);
        this.tasks(data.tasks);
    },
    addTask: function () {
        var task = Object.create(Task);
        task.title(this.addingTitle());
        this.tasks.push(task);
    }
};

module.exports = List;
