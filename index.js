"use strict";

var express = require("express");

var port = Number(process.env.PORT || 5000);

var app = express();
var server = app.listen(port);

app.use(express.static("."));
