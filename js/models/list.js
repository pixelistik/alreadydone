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

var List = function List(id) {
    this.id = ko.observable(id || randomId());
    this.tasks = ko.observableArray([]);
    this.storage = ko.observable();
    this.saveToStorage = function () {
        var json = ko.toJSON(this);
        if (this.storage()) {
            this.storage().setItem(this.id(), json);
        }
    };
    this.loadFromStorage = function () {
        var json = this.storage().getItem(this.id());
        var data = JSON.parse(json);
        this.tasks(data.tasks);
    };
    this.addingTitle = ko.observable();
    this.addTask = function () {
        this.tasks.push(new Task(this.addingTitle()));
        this.saveToStorage();
    };
};

module.exports = List;
