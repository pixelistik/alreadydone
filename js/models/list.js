"use strict";

var ko = require("knockout");
var Task = require("./task.js");
var generateId = require("uuid").v4;
var _ = require("lodash");

var List = function List(options) {
    options = options || {};

    this.id = this._id = ko.observable(options.id || generateId());
    this.tasks = ko.observableArray([]);
    this.storage = ko.observable();
    this.apiUrl = options.apiUrl || null;
    this.apiClient = options.apiClient || null;
    this.loadingFromServerSuspended = false;

    this.nonDeletedTasks = ko.computed(function () {
        return this.tasks().filter(function (task) {
            return !task.deleted();
        });
    }.bind(this));

    this.sortedTasks = ko.computed(function () {
        return _.sortBy(
            this.nonDeletedTasks(),
            function (task) {
                return task.orderIndex();
            });
    }.bind(this));

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
                return new Task(taskData, this);
            }.bind(this)));

            if (typeof doneCallback === "function") {
                doneCallback(null, this);
            }
        }.bind(this));

    };

    this.saveToServer = function () {
        var taskPromises = [];

        this.tasks().forEach(function (task) {
            taskPromises.push(task.saveToServerOrReloadAndRetry());
        });

        return Promise.all(taskPromises);
    };

    this.loadFromServer = function () {
        if(this.loadingFromServerSuspended) {
            return;
        }

        if(this.apiClient) {
            this.apiClient.ajax({
                type: "GET",
                url: this.apiUrl + "list/" + this.id() + "/tasks",
                contentType: "application/json",
                success: function (data) {
                    /*
                     * Check again, loading may have been suspended since the
                     * request has been made.
                     */
                    if(this.loadingFromServerSuspended) {
                        return;
                    }

                    listSubscription.isDisposed = true;
                    tasksSubscription.isDisposed = true;

                    this.tasks(ko.utils.arrayMap(data, function (taskData) {
                        return new Task(taskData, this);
                    }.bind(this)));

                    listSubscription.isDisposed = false;
                    tasksSubscription.isDisposed = false;
                }.bind(this)
            });
        }
    }.bind(this);

    this.addingTitle = ko.observable("");
    this.addTask = function () {
        if (this.addingTitle().trim() !== "") {
            var task = new Task(this.addingTitle().trim(), this);
            this.tasks.push(task);
            this.addingTitle("");

            this.saveToStorage();
            task.saveToServerOrReloadAndRetry();
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
