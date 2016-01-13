"use strict";

var enterkey = {
    init: function (element, valueAccessor, allBindings, viewModel) {
        var callback = valueAccessor();
        element.addEventListener("keypress", function (e) {
            if(e.keyCode === 13) {
                callback.call(viewModel);
                return false;
            }
            return true;
        });
    }
};

module.exports = enterkey;
