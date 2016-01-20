"use strict";

var request = require("supertest");
var mongodb = require("mongodb");

var mongoUrl = "mongodb://mongodb:27017/myproject";

var app = require("../js/server/app.js");

describe("App backend server", function () {
    it("should serve the index page", function (done) {
        request(app)
            .get("/index.html")
            .expect(200, done);
    });

    describe("List", function () {
        describe("Saving", function () {
            var data = {
                _id: "my-test-id",
                tasks: [
                    {
                        title: "One",
                        done: false
                    },
                    {
                        title: "two",
                        done: true
                    }
                ]
            };

            beforeEach(function () {
                mongodb.MongoClient.connect(mongoUrl, function (err, db) {
                    var collection = db.collection("documents");

                    collection.drop();

                    db.close();
                });
            });

            it("should accept the request", function (done) {
                request(app)
                    .put("/list/my-test-id")
                    .set("Accept", "application/json")
                    .send(data)
                    .expect(200, done);
            });

            it("should save and reload the data", function (done) {
                request(app)
                    .put("/list/my-test-id")
                    .set("Accept", "application/json")
                    .send(data)
                    .end(function (err, res) {
                        request(app)
                            .get("/list/my-test-id")
                            .set("Accept", "application/json")
                            .expect(JSON.stringify(data))
                            .expect(200, done);
                    });
            });

            it("should accept update requests (upserts)", function (done) {
                request(app)
                    .put("/list/my-test-id")
                    .set("Accept", "application/json")
                    .send(data)
                    .expect(200, function () {
                        // Request again
                        request(app)
                            .put("/list/my-test-id")
                            .set("Accept", "application/json")
                            .send(data)
                            .expect(200, done);
                    });


            });
        });
    });
});
