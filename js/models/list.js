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

    var filterHiddenPropertiesFromJson = function (key, value) {
        if (key[0] === "_") {
            return undefined;
        } else {
            return value;
        }
    };

    this.saveToStorage = function () {
        var json = ko.toJSON(this, filterHiddenPropertiesFromJson);
        if (this.storage()) {
            this.storage().setItem(this.id(), json);
        }
    };

    this.loadFromStorage = function () {
        this.storage().getItem(this.id(), function (err, json) {
            var data = JSON.parse(json);
            this.tasks(ko.utils.arrayMap(data.tasks, function (taskData) {
                return new Task(taskData, this.tasks);
            }.bind(this)));
        }.bind(this));

    };

    this.addingTitle = ko.observable();
    this.addTask = function () {
        this.tasks.push(new Task(this.addingTitle(), this.tasks));
        this.saveToStorage();
    };

    var changeHandler = function () {
        this.saveToStorage();
    }.bind(this);

    this.tasks.subscribe(changeHandler);
    this.tasks.subscribe(changeHandler, null, "child changed");
};

module.exports = List;
