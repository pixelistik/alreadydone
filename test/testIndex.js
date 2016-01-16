"use strict";

var request = require("supertest");

var app = require("../js/server/app.js");

describe("App backend server", function () {
    it("should serve the index page", function (done) {
        request(app)
            .get("/index.html")
            .expect(200, done);
    });
});
