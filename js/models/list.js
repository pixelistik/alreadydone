"use strict";

var ko = require("knockout");
var Task = require("./task.js");
var generateId = require("uuid").v4;

var List = function List(options) {
    options = options || {};

    this.id = ko.observable(options.id || generateId());
    this.tasks = ko.observableArray([]);
    this.storage = ko.observable();
    this.apiUrl = options.apiUrl || null;
    this.apiClient = options.apiClient || null;

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

    this.loadFromStorage = function (doneCallback) {
        this.storage().getItem(this.id(), function (err, json) {
            var data = JSON.parse(json);
            this.tasks(ko.utils.arrayMap(data.tasks, function (taskData) {
                return new Task(taskData, this.tasks);
            }.bind(this)));

            if (doneCallback && typeof doneCallback === "function") {
                doneCallback();
            }
        }.bind(this));

    };

    this.saveToServer = function () {
        var json = ko.toJSON(this, filterHiddenPropertiesFromJson);

        if(this.apiClient) {
            this.apiClient.ajax({
                type: "PUT",
                url: this.apiUrl + "list/" + this.id(),
                data: json
            });
        }
    };

    this.addingTitle = ko.observable();
    this.addTask = function () {
        if (this.addingTitle().trim() !== "") {
            this.tasks.push(new Task(this.addingTitle().trim(), this.tasks));
            this.addingTitle("");
            this.saveToStorage();
        }
    };

    var changeHandler = function () {
        this.saveToStorage();
        this.saveToServer();
    }.bind(this);

    this.tasks.subscribe(changeHandler);
    this.tasks.subscribe(changeHandler, null, "child changed");
};

module.exports = List;
