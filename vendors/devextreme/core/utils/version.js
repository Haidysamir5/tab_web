/**
 * DevExtreme (core/utils/version.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
exports.compare = function(x, y, maxLevel) {
    function normalizeArg(value) {
        if ("string" === typeof value) {
            return value.split(".")
        }
        if ("number" === typeof value) {
            return [value]
        }
        return value
    }
    x = normalizeArg(x);
    y = normalizeArg(y);
    var length = Math.max(x.length, y.length);
    if (isFinite(maxLevel)) {
        length = Math.min(length, maxLevel)
    }
    for (var i = 0; i < length; i++) {
        var xItem = parseInt(x[i] || 0, 10),
            yItem = parseInt(y[i] || 0, 10);
        if (xItem < yItem) {
            return -1
        }
        if (xItem > yItem) {
            return 1
        }
    }
    return 0
};
