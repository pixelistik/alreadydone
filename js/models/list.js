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
        if (key.startsWith("__")) {
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
            if (err) {
                throw new Error(err);
            }

            var data = JSON.parse(json);

            if (!data) {
                if (typeof doneCallback === "function") {
                    doneCallback(new Error("No local task data found"), null);
                }
                return;
            }

            this.tasks(ko.utils.arrayMap(data.tasks, function (taskData) {
                return new Task(taskData, this.tasks);
            }.bind(this)));

            if (typeof doneCallback === "function") {
                doneCallback(null, this);
            }
        }.bind(this));

    };

    this.saveToServer = function () {
        var json = ko.toJSON(this, filterHiddenPropertiesFromJson);

        if(this.apiClient) {
            this.apiClient.ajax({
                type: "PUT",
                url: this.apiUrl + "list/" + this.id(),
                contentType: "application/json",
                data: json
            });
        }
    };

    this.addingTitle = ko.observable("");
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
