"use strict";

var express = require("express");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");

var mongoUrl = "mongodb://mongodb:27017/myproject";

var app = express();

app.use(bodyParser.json());

app.put("/list/:id", function (request, response) {
    mongodb.MongoClient.connect(mongoUrl, function(err, db) {
        var collection = db.collection("documents");

        collection.updateOne(
            {_id: request.body._id},
            request.body,
            {upsert:true},
            function (err, result) {
                db.close();
                if(!err) {
                    response.sendStatus(200);
                } else {
                    response.status(500).send(err);
                }
            }
        );
    });
});

app.get("/list/:id", function (request, response) {
    mongodb.MongoClient.connect(mongoUrl, function(err, db) {
        var collection = db.collection("documents");

        collection.findOne({_id: request.params.id}, function (err, items) {
            if(!err) {
                response.send(items);
            }

        });

    });
});

app.use(express.static("."));

module.exports = app;
