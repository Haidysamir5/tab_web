/**
 * DevExtreme (viz/tree_map/common.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _patchFontOptions = require("../core/utils").patchFontOptions;
exports.buildRectAppearance = function(option) {
    var border = option.border || {};
    return {
        fill: option.color,
        opacity: option.opacity,
        stroke: border.color,
        "stroke-width": border.width,
        "stroke-opacity": border.opacity,
        hatching: option.hatching
    }
};
exports.buildTextAppearance = function(options, filter) {
    return {
        attr: options["stroke-width"] ? {
            stroke: options.stroke,
            "stroke-width": options["stroke-width"],
            "stroke-opacity": options["stroke-opacity"],
            filter: filter
        } : {},
        css: _patchFontOptions(options.font)
    }
};
