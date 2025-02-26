/**
 * DevExtreme (ui/diagram/diagram_importer.js)
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
exports.getDiagram = void 0;
var _ui = require("../widget/ui.errors");
var _ui2 = _interopRequireDefault(_ui);
var _window = require("../../core/utils/window");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var diagram = void 0;

function getDiagram() {
    if (!diagram) {
        diagram = requestDiagram()
    }
    return diagram
}

function requestDiagram() {
    var window = (0, _window.getWindow)();
    var diagram = window && window.DevExpress && window.DevExpress.diagram || require("devexpress-diagram");
    if (!diagram) {
        throw _ui2.default.Error("E1041", "devexpress-diagram")
    }
    return diagram
}
exports.getDiagram = getDiagram;
