"use strict";

var ko = require("knockout");
var zepto = require("npm-zepto");
var Sortable = require("sortablejs");

ko.bindingHandlers.enterkey = require("./bindings/enterkey.js");

var localForage = require("localforage");
var List = require("./models/list.js");

var list;

var options = {
    apiUrl: window.location.toString().match(/.+\//)[0],
    apiClient: zepto
};

if(location.hash === "") {
    list = new List(options);
    location.hash = list.id();
} else {
    options.id = window.location.hash.replace("#", ""),
    list = new List(options);
}

list.storage(localForage);

list.loadFromStorage(function (err) {
    list.saveToServer().then(list.loadFromServer);
});

window.setInterval(list.loadFromServer, 1000);

ko.applyBindings(list);

var sortable = Sortable.create(
    document.querySelector(".js-sortable"),
    {
        onStart: function (evt) {
            list.loadingFromServerSuspended = true;
            console.log("Suspended: " + list.loadingFromServerSuspended);
        },
        onEnd: function (evt) {
            var draggedTask = list.sortedTasks()[evt.oldIndex];

            var newpreviousTask = list.sortedTasks()[evt.newIndex];
            var newNextTask = list.sortedTasks()[evt.newIndex];

            var newOrderIndex = newNextTask.orderIndex() - 0.1;

            console.log(draggedTask.orderIndex());
            draggedTask.orderIndex(newOrderIndex);
            console.log(draggedTask.orderIndex());

            list.loadingFromServerSuspended = false;
            console.log("Suspended: " + list.loadingFromServerSuspended);
            console.log(list.tasks());
        }
    }
);
