/**
 * DevExtreme (viz/chart_components/scroll_bar.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _events_engine = require("../../events/core/events_engine");
var _events_engine2 = _interopRequireDefault(_events_engine);
var _utils = require("../../events/utils");
var _utils2 = _interopRequireDefault(_utils);
var _extend = require("../../core/utils/extend");
var _translator2d = require("../translators/translator2d");
var _translator2d2 = _interopRequireDefault(_translator2d);
var _type = require("../../core/utils/type");
var _common = require("../../core/utils/common");
var _drag = require("../../events/drag");
var _drag2 = _interopRequireDefault(_drag);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var _min = Math.min;
var _max = Math.max;
var MIN_SCROLL_BAR_SIZE = 2;
var ScrollBar = function(renderer, group) {
    this._translator = new _translator2d2.default.Translator2D({}, {}, {});
    this._scroll = renderer.rect().append(group);
    this._addEvents()
};

function _getXCoord(canvas, pos, offset, width) {
    var x = 0;
    if ("right" === pos) {
        x = canvas.width - canvas.right + offset
    } else {
        if ("left" === pos) {
            x = canvas.left - offset - width
        }
    }
    return x
}

function _getYCoord(canvas, pos, offset, width) {
    var y = 0;
    if ("top" === pos) {
        y = canvas.top - offset
    } else {
        if ("bottom" === pos) {
            y = canvas.height - canvas.bottom + width + offset
        }
    }
    return y
}
ScrollBar.prototype = {
    _addEvents: function() {
        var _this = this;
        var scrollElement = this._scroll.element;
        _events_engine2.default.on(scrollElement, _drag2.default.start, function(e) {
            _utils2.default.fireEvent({
                type: "dxc-scroll-start",
                originalEvent: e,
                target: scrollElement
            })
        });
        _events_engine2.default.on(scrollElement, _drag2.default.move, function(e) {
            var dX = -e.offset.x * _this._scale;
            var dY = -e.offset.y * _this._scale;
            var lx = _this._offset - (_this._layoutOptions.vertical ? dY : dX) / _this._scale;
            _this._applyPosition(lx, lx + _this._translator.canvasLength / _this._scale);
            _utils2.default.fireEvent({
                type: "dxc-scroll-move",
                originalEvent: e,
                target: scrollElement,
                offset: {
                    x: dX,
                    y: dY
                }
            })
        });
        _events_engine2.default.on(scrollElement, _drag2.default.end, function(e) {
            _utils2.default.fireEvent({
                type: "dxc-scroll-end",
                originalEvent: e,
                target: scrollElement,
                offset: {
                    x: -e.offset.x * _this._scale,
                    y: -e.offset.y * _this._scale
                }
            })
        })
    },
    update: function(options) {
        var that = this,
            position = options.position,
            isVertical = options.rotated,
            defaultPosition = isVertical ? "right" : "top",
            secondaryPosition = isVertical ? "left" : "bottom";
        if (position !== defaultPosition && position !== secondaryPosition) {
            position = defaultPosition
        }
        that._scroll.attr({
            rotate: !options.rotated ? -90 : 0,
            rotateX: 0,
            rotateY: 0,
            fill: options.color,
            width: options.width,
            opacity: options.opacity
        });
        that._layoutOptions = {
            width: options.width,
            offset: options.offset,
            vertical: isVertical,
            position: position
        };
        return that
    },
    init: function(range, stick) {
        var that = this;
        var isDiscrete = "discrete" === range.axisType;
        that._translateWithOffset = isDiscrete && !stick && 1 || 0;
        that._translator.update((0, _extend.extend)({}, range, {
            minVisible: null,
            maxVisible: null,
            visibleCategories: null
        }, isDiscrete && {
            min: null,
            max: null
        } || {}), that._canvas, {
            isHorizontal: !that._layoutOptions.vertical,
            stick: stick
        });
        return that
    },
    getOptions: function() {
        return this._layoutOptions
    },
    setPane: function(panes) {
        var pane, position = this._layoutOptions.position;
        if ("left" === position || "top" === position) {
            pane = panes[0]
        } else {
            pane = panes[panes.length - 1]
        }
        this.pane = pane.name;
        return this
    },
    updateSize: function(canvas) {
        this._canvas = (0, _extend.extend)({}, canvas);
        var options = this._layoutOptions,
            pos = options.position,
            offset = options.offset,
            width = options.width;
        this._scroll.attr({
            translateX: _getXCoord(canvas, pos, offset, width),
            translateY: _getYCoord(canvas, pos, offset, width)
        })
    },
    getMultipleAxesSpacing: function() {
        return 0
    },
    estimateMargins: function() {
        return this.getMargins()
    },
    getMargins: function() {
        var options = this._layoutOptions,
            margins = {
                left: 0,
                top: 0,
                right: 0,
                bottom: 0
            };
        margins[options.position] = options.width + options.offset;
        return margins
    },
    draw: _common.noop,
    shift: _common.noop,
    hideTitle: _common.noop,
    hideOuterElements: _common.noop,
    prepareAnimation: _common.noop,
    setPosition: function(min, max) {
        var that = this,
            translator = that._translator,
            minPoint = (0, _type.isDefined)(min) ? translator.translate(min, -that._translateWithOffset) : translator.translate("canvas_position_start"),
            maxPoint = (0, _type.isDefined)(max) ? translator.translate(max, that._translateWithOffset) : translator.translate("canvas_position_end");
        that._offset = _min(minPoint, maxPoint);
        that._scale = translator.getScale(min, max);
        that._applyPosition(_min(minPoint, maxPoint), _max(minPoint, maxPoint))
    },
    dispose: function() {
        this._scroll.dispose();
        this._scroll = this._translator = null
    },
    _applyPosition: function(x1, x2) {
        var height, that = this,
            visibleArea = that._translator.getCanvasVisibleArea();
        x1 = _max(x1, visibleArea.min);
        x1 = _min(x1, visibleArea.max);
        x2 = _min(x2, visibleArea.max);
        x2 = _max(x2, visibleArea.min);
        height = Math.abs(x2 - x1);
        that._scroll.attr({
            y: x1,
            height: height < MIN_SCROLL_BAR_SIZE ? MIN_SCROLL_BAR_SIZE : height
        })
    }
};
exports.ScrollBar = ScrollBar;
