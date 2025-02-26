/**
 * DevExtreme (core/utils/ready_callbacks.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var domAdapter = require("../dom_adapter");
var injector = require("./dependency_injector");
var windowUtils = require("./window");
var callOnce = require("./call_once");
var callbacks = [];
var isReady = function() {
    return "complete" === domAdapter.getReadyState() || "loading" !== domAdapter.getReadyState() && !domAdapter.getDocumentElement().doScroll
};
var subscribeReady = callOnce(function() {
    var removeListener = domAdapter.listen(domAdapter.getDocument(), "DOMContentLoaded", function() {
        readyCallbacks.fire();
        removeListener()
    })
});
var readyCallbacks = {
    add: function(callback) {
        var hasWindow = windowUtils.hasWindow();
        if (hasWindow && isReady()) {
            callback()
        } else {
            callbacks.push(callback);
            hasWindow && subscribeReady()
        }
    },
    fire: function() {
        callbacks.forEach(function(callback) {
            return callback()
        });
        callbacks = []
    }
};
module.exports = injector(readyCallbacks);
