"use strict";

var ko = require("knockout");
var zepto = require("npm-zepto");

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
