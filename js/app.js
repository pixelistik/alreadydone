"use strict";

var ko = require("knockout");
var List = require("./models/list.js");

var list = List();

ko.applyBindings(list);
