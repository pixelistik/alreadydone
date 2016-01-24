"use strict";

var express = require("express");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");

var mongoUrl = "mongodb://mongodb:27017/myproject";

var app = express();

app.use(bodyParser.json());

app.put("/list/:id", function (request, response) {
    mongodb.MongoClient.connect(mongoUrl, function (err, db) {
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

app.get("/list/:id/tasks", function (request, response) {
    mongodb.MongoClient.connect(mongoUrl, function (err, db) {
        var collection = db.collection("documents");

        collection.find({listId: request.params.id}).toArray(function (err, items) {
            if(!err) {
                response.send(items.sort(function (item1, item2) {
                    return item1._id.localeCompare(item2._id);
                }));
            }

        });

    });
});

app.get("/task/:id", function (request, response) {
    mongodb.MongoClient.connect(mongoUrl, function (err, db) {
        var collection = db.collection("documents");

        collection.findOne({_id: request.params.id}, {}, function (err, task) {
            if(err) {
                response.status(500).send(err);
                return;
            }

            if (task) {
                response.send(task);
            } else {
                response.sendStatus(404);
            }
        });
    });
});

app.put("/task/:id", function (request, response) {
    if (
        !request.body._id ||
        !request.body.listId ||
        !request.body.modified
    ) {
        response.status(400).send("Properties _id, modified, and listId are mandatory.");
        return;
    }

    mongodb.MongoClient.connect(mongoUrl, function (err, db) {
        var collection = db.collection("documents");

        collection.findOne({_id: request.body._id}, {}, function (err, task) {
            if (task && task.modified > request.body.modified) {
                response.status(409).send("Data on server is newer.");
            } else {
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
            }
        });
    });
});


app.use(express.static("."));

module.exports = app;
