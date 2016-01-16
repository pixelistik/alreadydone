"use strict";

var app = require("./js/server/app.js");

var port = Number(process.env.PORT || 5000);
var server = app.listen(port);
