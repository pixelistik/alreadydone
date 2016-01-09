"use strict";

var ko = require("knockout");

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

var List = function List() {
    return {
        id: ko.observable(randomId()),
        items: ko.observableArray([])
    };
};

module.exports = List;
