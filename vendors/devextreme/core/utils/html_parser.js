/**
 * DevExtreme (core/utils/html_parser.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var merge = require("./array").merge,
    domAdapter = require("../dom_adapter");
var isTagName = /<([a-z][^\/\0>\x20\t\r\n\f]+)/i;
var tagWrappers = {
    "default": {
        tagsCount: 0,
        startTags: "",
        endTags: ""
    },
    thead: {
        tagsCount: 1,
        startTags: "<table>",
        endTags: "</table>"
    },
    td: {
        tagsCount: 3,
        startTags: "<table><tbody><tr>",
        endTags: "</tr></tbody></table>"
    },
    col: {
        tagsCount: 2,
        startTags: "<table><colgroup>",
        endTags: "</colgroup></table>"
    },
    tr: {
        tagsCount: 2,
        startTags: "<table><tbody>",
        endTags: "</tbody></table>"
    }
};
tagWrappers.tbody = tagWrappers.colgroup = tagWrappers.caption = tagWrappers.tfoot = tagWrappers.thead;
tagWrappers.th = tagWrappers.td;
var parseHTML = function(html) {
    if ("string" !== typeof html) {
        return null
    }
    var fragment = domAdapter.createDocumentFragment();
    var container = fragment.appendChild(domAdapter.createElement("div"));
    var tags = isTagName.exec(html);
    var firstRootTag = tags && tags[1].toLowerCase();
    var tagWrapper = tagWrappers[firstRootTag] || tagWrappers.default;
    container.innerHTML = tagWrapper.startTags + html + tagWrapper.endTags;
    for (var i = 0; i < tagWrapper.tagsCount; i++) {
        container = container.lastChild
    }
    return merge([], container.childNodes)
};
var isTablePart = function(html) {
    var tags = isTagName.exec(html);
    return tags && tags[1] in tagWrappers
};
exports.parseHTML = parseHTML;
exports.isTablePart = isTablePart;
