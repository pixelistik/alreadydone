"use strict";

var express = require("express");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");

var mongoUrl = "mongodb://mongodb:27017/myproject";

var app = express();

app.use(bodyParser.json());

app.put("/list/:id", function (request, response) {
    console.log(request.body);
    console.log("PUT for " + request.params.id);

    mongodb.MongoClient.connect(mongoUrl, function(err, db) {
        var collection = db.collection("documents");

        collection.insertOne(
            request.body
        , function(err, result) {
            console.log(err);
            console.log("Inserted document  into the document collection");
            db.close();
            response.sendStatus(200);
        });

    });
});

app.use(express.static("."));

module.exports = app;
