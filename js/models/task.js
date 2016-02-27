"use strict";

var ko = require("knockout");
var generateId = require("uuid").v4;

var Task = function Task(initValue, parent) {
    switch (typeof initValue) {
    case "string":
        this.title = ko.observable(initValue);
        this.done = ko.observable(false);
        this.deleted = ko.observable(false);
        this.orderIndex = ko.observable(Date.now() + Math.random());
        this.id = ko.observable(generateId());
        break;
    case "object":
        this.title = ko.observable(initValue.title);
        this.done = ko.observable(initValue.done);
        this.deleted = ko.observable(initValue.deleted || false);
        this.id = ko.observable(initValue.id || generateId());
        this.orderIndex = ko.observable(initValue.orderIndex || Date.now() + Math.random());
        this.modified = initValue.modified;
        break;
    default:
        this.title = ko.observable("");
        this.done = ko.observable(false);
        this.deleted = ko.observable(false);
        this.orderIndex = ko.observable(Date.now() + Math.random());
        this.id = ko.observable(generateId());
    }

    var filterHiddenPropertiesFromJson = function (key, value) {
        if (key.startsWith("__")) {
            return undefined;
        } else {
            return value;
        }
    };

    this._id = this.id;

    if (!this.modified) {
        this.modified = Date.now();
    }

    this.__parent = parent;

    if (this.__parent) {
        this.listId = this.__parent.id;
    }

    this.remove = function () {
        this.__parent.tasks.remove(this);
    };

    this.softDelete = function () {
        this.deleted(true);
    };

    this.loadFromServer = function () {
        return new Promise(function (resolve, reject) {
            this.__parent.apiClient.ajax({
                type: "GET",
                url: this.__parent.apiUrl + "task/" + this.id(),
                contentType: "application/json",
                success: function (response) {
                    this.title(response.title);
                    this.done(response.done);
                    this.deleted(response.deleted);
                    this.orderIndex(response.orderIndex);
                    this.modified = response.modified;
                    resolve();
                }.bind(this),
                error: reject
            });
        }.bind(this));
    };

    this.saveToServer = function () {
        var json = ko.toJSON(this, filterHiddenPropertiesFromJson);

        return new Promise(function (resolve, reject) {
            this.__parent.apiClient.ajax({
                type: "PUT",
                url: this.__parent.apiUrl + "task/" + this.id(),
                contentType: "application/json",
                data: json,
                success: resolve,
                error: reject
            });
        }.bind(this));
    };

    this.saveToServerOrReloadAndRetry = function () {
        return new Promise(function (resolve, reject) {
            this.saveToServer()
                .then(function () {
                    resolve();
                })
                .catch(function (err) {
                    this.loadFromServer()
                        .then(this.saveToServer())
                        .then(function () {
                            resolve();
                        })
                        .catch(function () {
                            reject();
                        });
                }.bind(this));
        }.bind(this));
    };

    this.handleDataUpdate = function (taskData) {
        if(this.id() !== taskData.id) {
            throw new Error(
                "Trying to updateMerge Task " +
                this.id() +
                " with Task " +
                taskData.id
            );
        }

        if (this.modified < taskData.modified) {
            this.title(taskData.title);
            this.done(taskData.done);
            this.orderIndex(taskData.orderIndex);
            this.modified = taskData.modified;
        }
    };

    var changeHandler = function (value) {
        if (this.__parent && typeof this.__parent.tasks.notifySubscribers === "function") {
            this.__parent.tasks.notifySubscribers(value, "child changed");
        }

        this.modified = Date.now();
        // this.saveToServer();
        this.saveToServerOrReloadAndRetry();
    }.bind(this);

    this.title.subscribe(changeHandler);
    this.done.subscribe(changeHandler);
    this.deleted.subscribe(changeHandler);
    this.orderIndex.subscribe(changeHandler);
};

module.exports = Task;
