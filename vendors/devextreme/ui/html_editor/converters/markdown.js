/**
 * DevExtreme (ui/html_editor/converters/markdown.js)
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
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) {
                descriptor.writable = true
            }
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps) {
            defineProperties(Constructor.prototype, protoProps)
        }
        if (staticProps) {
            defineProperties(Constructor, staticProps)
        }
        return Constructor
    }
}();
var _turndown = require("turndown");
var _turndown2 = _interopRequireDefault(_turndown);
var _showdown = require("showdown");
var _showdown2 = _interopRequireDefault(_showdown);
var _window = require("../../../core/utils/window");
var _ui = require("../../widget/ui.errors");
var _ui2 = _interopRequireDefault(_ui);
var _converterController = require("../converterController");
var _converterController2 = _interopRequireDefault(_converterController);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function")
    }
}
var MarkdownConverter = function() {
    function MarkdownConverter() {
        _classCallCheck(this, MarkdownConverter);
        var window = (0, _window.getWindow)();
        var turndown = window && window.TurndownService || _turndown2.default;
        var showdown = window && window.showdown || _showdown2.default;
        if (!turndown) {
            throw _ui2.default.Error("E1041", "Turndown")
        }
        if (!showdown) {
            throw _ui2.default.Error("E1041", "Showdown")
        }
        this._html2Markdown = new turndown;
        this._markdown2Html = new showdown.Converter({
            simpleLineBreaks: true,
            strikethrough: true
        })
    }
    _createClass(MarkdownConverter, [{
        key: "toMarkdown",
        value: function(htmlMarkup) {
            return this._html2Markdown.turndown(htmlMarkup)
        }
    }, {
        key: "toHtml",
        value: function(markdownMarkup) {
            var markup = this._markdown2Html.makeHtml(markdownMarkup);
            if (markup) {
                markup = markup.replace(new RegExp("\\r?\\n", "g"), "")
            }
            return markup
        }
    }]);
    return MarkdownConverter
}();
_converterController2.default.addConverter("markdown", MarkdownConverter);
exports.default = MarkdownConverter;
