var ko = require("knockout");

var Task = function Task(title) {
    return {
        title: ko.observable(title),
        done: ko.observable(false),
        toggleDone: function () {
            this.done(!this.done());
        }
    };
};

module.exports = Task;
