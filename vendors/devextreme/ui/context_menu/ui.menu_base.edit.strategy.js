/**
 * DevExtreme (ui/context_menu/ui.menu_base.edit.strategy.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _typeof = "function" === typeof Symbol && "symbol" === typeof Symbol.iterator ? function(obj) {
    return typeof obj
} : function(obj) {
    return obj && "function" === typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj
};
var $ = require("../../core/renderer"),
    map = require("../../core/utils/iterator").map,
    PlainEditStrategy = require("../collection/ui.collection_widget.edit.strategy.plain");
var MenuBaseEditStrategy = PlainEditStrategy.inherit({
    _getPlainItems: function() {
        return map(this._collectionWidget.option("items"), function getMenuItems(item) {
            return item.items ? [item].concat(map(item.items, getMenuItems)) : item
        })
    },
    _stringifyItem: function(item) {
        var that = this;
        return JSON.stringify(item, function(key, value) {
            if ("template" === key) {
                return that._getTemplateString(value)
            }
            return value
        })
    },
    _getTemplateString: function(template) {
        var result;
        if ("object" === ("undefined" === typeof template ? "undefined" : _typeof(template))) {
            result = $(template).text()
        } else {
            result = template.toString()
        }
        return result
    }
});
module.exports = MenuBaseEditStrategy;
