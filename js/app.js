"use strict";

var ko = require("knockout");
var List = require("./models/list.js");

var list;

if(location.hash === "") {
    list = new List();
    location.hash = list.id();
} else {
    list = new List(window.location.hash.replace("#", ""));
}

list.storage(window.localStorage);

try {
    list.loadFromStorage(window.localStorage);
} catch(e) {
    console.info("No data in storage.")
}

ko.applyBindings(list);
