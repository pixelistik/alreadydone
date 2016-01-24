"use strict";

var assert = require("chai").assert;
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

    var tasksFixture = [
        {
            _id: "1",
            id: "1",
            listId: "test-list",
            title: "one",
            done: false,
            modified: 100
        },
        {
            _id: "2",
            id: "2",
            listId: "test-list",
            title: "two",
            done: true,
            modified: 200
        },
        {
            _id: "3",
            id: "3",
            listId: "different-test-list",
            title: "three",
            done: true,
            modified: 210
        }
    ];

    beforeEach(function (done) {
        mongodb.MongoClient.connect(mongoUrl, function (err, db) {
            var collection = db.collection("documents");

            collection.drop(function (err, reply) {
                collection.insert(tasksFixture, null, function (err, result) {
                    db.close();
                    done();
                });
            });
        });
    });

    describe("Lists", function () {
        describe("GET the tasks for a list", function () {
            it("should return tasks for the first list", function (done) {
                var expectedTasks = [
                    {
                        _id: "3",
                        id: "3",
                        listId: "different-test-list",
                        title: "three",
                        done: true,
                        modified: 210
                    }
                ];

                request(app)
                   .get("/list/different-test-list/tasks")
                   .set("Accept", "application/json")
                   .expect(JSON.stringify(expectedTasks))
                   .expect(200, done);
            });

            it("should return all tasks for the second list", function (done) {
                var expectedTasks = [
                    {
                        _id: "1",
                        id: "1",
                        listId: "test-list",
                        title: "one",
                        done: false,
                        modified: 100
                    },
                    {
                        _id: "2",
                        id: "2",
                        listId: "test-list",
                        title: "two",
                        done: true,
                        modified: 200
                    }
                ];

                request(app)
                   .get("/list/test-list/tasks")
                   .set("Accept", "application/json")
                   .expect(JSON.stringify(expectedTasks))
                   .expect(200, done);
            });
        });

        describe("Tasks", function () {
            describe("GET a task", function () {
                it("should GET the first task", function (done) {
                    request(app)
                       .get("/task/1")
                       .set("Accept", "application/json")
                       .expect(JSON.stringify(tasksFixture[0]))
                       .expect(200, done);
                });

                it("should GET the third task", function (done) {
                    request(app)
                       .get("/task/3")
                       .set("Accept", "application/json")
                       .expect(JSON.stringify(tasksFixture[2]))
                       .expect(200, done);
                });

                it("should 404 on an unknown task", function (done) {
                    request(app)
                       .get("/task/some-unknown-task")
                       .set("Accept", "application/json")
                       .expect(404, done);
                });
            });

            describe("PUT a task", function () {
                it("should accept a new task", function (done) {
                    request(app)
                       .put("/task/a-new-task")
                       .set("Accept", "application/json")
                       .send({
                           _id: "a-new-task",
                           id: "a-new-task",
                           listId: "some-list",
                           title: "some new task",
                           done: false,
                           modified: 100
                       })
                       .expect(200)
                       .end(function (err, res) {
                           if (err) {
                               return done(err);
                           }

                           mongodb.MongoClient.connect(mongoUrl, function (err, db) {
                               var collection = db.collection("documents");

                               collection.findOne({_id: "a-new-task"}, {}, function (err, document) {
                                   assert.equal(document.title, "some new task");
                                   done();
                               });
                           });
                       });
                });

                it("should accept an updated task with younger modification", function (done) {
                    request(app)
                       .put("/task/a-new-task")
                       .set("Accept", "application/json")
                       .send({
                           _id: "1",
                           id: "1",
                           listId: "test-list",
                           title: "one (newer)",
                           done: true,
                           modified: 500
                       })
                       .expect(200)
                       .end(function (err, res) {
                           if (err) {
                               return done(err);
                           }

                           mongodb.MongoClient.connect(mongoUrl, function (err, db) {
                               var collection = db.collection("documents");

                               collection.findOne({_id: "1"}, {}, function (err, document) {
                                   assert.equal(document.title, "one (newer)");
                                   done();
                               });
                           });
                       });
                });

                it("should refuse an updated task with older modification", function (done) {
                    request(app)
                       .put("/task/a-new-task")
                       .set("Accept", "application/json")
                       .send({
                           _id: "1",
                           id: "1",
                           listId: "test-list",
                           title: "one (older)",
                           done: true,
                           modified: 10
                       })
                       .expect(409)
                       .end(function (err, res) {
                           if (err) {
                               return done(err);
                           }

                           mongodb.MongoClient.connect(mongoUrl, function (err, db) {
                               var collection = db.collection("documents");

                               collection.findOne({_id: "1"}, {}, function (err, document) {
                                   assert.equal(document.title, "one");
                                   done();
                               });
                           });
                       });
                });

                it("should refuse a task with missing ID", function (done) {
                    request(app)
                       .put("/task/1")
                       .set("Accept", "application/json")
                       .send({
                           listId: "test-list",
                           title: "missing ID",
                           done: false,
                           modified: 10
                       })
                       .expect(400)
                       .end(function (err, res) {
                           if (err) {
                               return done(err);
                           }

                           mongodb.MongoClient.connect(mongoUrl, function (err, db) {
                               var collection = db.collection("documents");

                               collection.findOne({title: "missing ID"}, {}, function (err, document) {
                                   assert.equal(document, null);
                                   done();
                               });
                           });
                       });
                });

                it("should refuse a task with missing list ID", function (done) {
                    request(app)
                       .put("/task/1")
                       .set("Accept", "application/json")
                       .send({
                           _id: "1",
                           id: "1",
                           title: "missing list ID",
                           done: false,
                           modified: 1000
                       })
                       .expect(400)
                       .end(function (err, res) {
                           if (err) {
                               return done(err);
                           }

                           mongodb.MongoClient.connect(mongoUrl, function (err, db) {
                               var collection = db.collection("documents");

                               collection.findOne({_id: "1"}, {}, function (err, document) {
                                   assert.equal(document.title, "one");
                                   done();
                               });
                           });
                       });
                });

                it("should refuse a task without modified timestamp", function (done) {
                    request(app)
                       .put("/task/1")
                       .set("Accept", "application/json")
                       .send({
                           _id: "1",
                           id: "1",
                           listId: "test-list",
                           title: "missing modified",
                           done: false
                       })
                       .expect(400)
                       .end(function (err, res) {
                           if (err) {
                               return done(err);
                           }

                           mongodb.MongoClient.connect(mongoUrl, function (err, db) {
                               var collection = db.collection("documents");

                               collection.findOne({_id: "1"}, {}, function (err, document) {
                                   assert.equal(document.title, "one");
                                   done();
                               });
                           });
                       });
                });
            });
        });
    });
});
