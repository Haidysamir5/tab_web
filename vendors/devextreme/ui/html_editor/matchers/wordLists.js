/**
 * DevExtreme (ui/html_editor/matchers/wordLists.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});

function getListType(matches) {
    var prefix = matches[1];
    return prefix.match(/\S+\./) ? "ordered" : "bullet"
}

function getIndent(node) {
    var style = node.getAttribute("style").replace(/\n+/g, "");
    var level = style.match(/level(\d+)/);
    return level ? level[1] - 1 : 0
}

function removeNewLineChar(operations) {
    var newLineOperation = operations[operations.length - 1];
    newLineOperation.insert = newLineOperation.insert.trim()
}
var getMatcher = function(quill) {
    var Delta = quill.import("delta");
    return function(node, delta) {
        var ops = delta.ops.slice();
        var insertOperation = ops[0];
        insertOperation.insert = insertOperation.insert.replace(/^\s+/, "");
        var listDecoratorMatches = insertOperation.insert.match(/^(\S+)\s+/);
        if (!listDecoratorMatches) {
            return delta
        }
        insertOperation.insert = insertOperation.insert.substring(listDecoratorMatches[0].length, insertOperation.insert.length);
        var indent = getIndent(node);
        removeNewLineChar(ops);
        ops.push({
            insert: "\n",
            attributes: {
                list: getListType(listDecoratorMatches),
                indent: indent
            }
        });
        return new Delta(ops)
    }
};
exports.default = getMatcher;
