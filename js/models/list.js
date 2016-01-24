"use strict";

var ko = require("knockout");
var Task = require("./task.js");
var generateId = require("uuid").v4;

var List = function List(options) {
    options = options || {};

    this.id = this._id = ko.observable(options.id || generateId());
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
        var taskPromises = [];

        this.tasks().forEach(function (task) {
            taskPromises.push(task.saveToServer());
        });

        return Promise.all(taskPromises);
    };

    this.loadFromServer = function () {
        if(this.apiClient) {
            this.apiClient.ajax({
                type: "GET",
                url: this.apiUrl + "list/" + this.id() + "/tasks",
                contentType: "application/json",
                success: function (data) {
                    listSubscription.isDisposed = true;
                    tasksSubscription.isDisposed = true;

                    this.tasks(ko.utils.arrayMap(data, function (taskData) {
                        return new Task(taskData, this.tasks);
                    }.bind(this)));

                    listSubscription.isDisposed = false;
                    tasksSubscription.isDisposed = false;
                }.bind(this)
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
        // this.saveToServer();
    }.bind(this);

    var listSubscription = this.tasks.subscribe(changeHandler);
    var tasksSubscription = this.tasks.subscribe(changeHandler, null, "child changed");
};

module.exports = List;
