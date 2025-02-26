/**
 * DevExtreme (ui/range_slider.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var $ = require("../core/renderer"),
    eventsEngine = require("../events/core/events_engine"),
    Slider = require("./slider"),
    SliderHandle = require("./slider/ui.slider_handle"),
    registerComponent = require("../core/component_registrator"),
    extend = require("../core/utils/extend").extend,
    applyServerDecimalSeparator = require("../core/utils/common").applyServerDecimalSeparator,
    eventUtils = require("../events/utils"),
    messageLocalization = require("../localization/message");
var RANGE_SLIDER_CLASS = "dx-rangeslider",
    RANGE_SLIDER_START_HANDLE_CLASS = RANGE_SLIDER_CLASS + "-start-handle",
    RANGE_SLIDER_END_HANDLE_CLASS = RANGE_SLIDER_CLASS + "-end-handle";
var RangeSlider = Slider.inherit({
    _supportedKeys: function() {
        var isRTL = this.option("rtlEnabled");
        var that = this,
            _changeHandle = function(e, capturedHandle) {
                if (that.option("start") === that.option("end")) {
                    that._capturedHandle = capturedHandle;
                    e.target = that._capturedHandle;
                    eventsEngine.trigger(that._capturedHandle, "focus")
                }
            },
            _setHandleValue = function(e, step, sign) {
                var isStart = $(e.target).hasClass(RANGE_SLIDER_START_HANDLE_CLASS),
                    valueOption = isStart ? "start" : "end",
                    val = that.option(valueOption);
                step = that._valueStep(step);
                val += sign * (isRTL ? -step : step);
                that.option(valueOption, val)
            },
            moveHandleRight = function(e, step) {
                _changeHandle(e, isRTL ? that._$handleStart : that._$handleEnd);
                _setHandleValue(e, step, 1)
            },
            moveHandleLeft = function(e, step) {
                _changeHandle(e, isRTL ? that._$handleEnd : that._$handleStart);
                _setHandleValue(e, step, -1)
            };
        return extend(this.callBase(), {
            leftArrow: function(e) {
                e.preventDefault();
                e.stopPropagation();
                moveHandleLeft(e, this.option("step"))
            },
            rightArrow: function(e) {
                e.preventDefault();
                e.stopPropagation();
                moveHandleRight(e, this.option("step"))
            },
            pageUp: function(e) {
                e.preventDefault();
                e.stopPropagation();
                moveHandleRight(e, this.option("step") * this.option("keyStep"))
            },
            pageDown: function(e) {
                e.preventDefault();
                e.stopPropagation();
                moveHandleLeft(e, this.option("step") * this.option("keyStep"))
            },
            home: function(e) {
                e.preventDefault();
                e.stopPropagation();
                var isStart = $(e.target).hasClass(RANGE_SLIDER_START_HANDLE_CLASS),
                    valueOption = isStart ? "start" : "end",
                    startOption = isStart ? "min" : "start",
                    val = this.option(startOption);
                this.option(valueOption, val)
            },
            end: function(e) {
                e.preventDefault();
                e.stopPropagation();
                var isStart = $(e.target).hasClass(RANGE_SLIDER_START_HANDLE_CLASS),
                    valueOption = isStart ? "start" : "end",
                    endOption = isStart ? "end" : "max",
                    val = this.option(endOption);
                this.option(valueOption, val)
            }
        })
    },
    _getDefaultOptions: function() {
        return extend(this.callBase(), {
            start: 40,
            end: 60,
            value: [40, 60],
            startName: "",
            endName: ""
        })
    },
    _renderSubmitElement: function() {
        var $element = this.$element();
        this._$submitStartElement = $("<input>").attr("type", "hidden").attr("name", this.option("startName")).appendTo($element);
        this._$submitEndElement = $("<input>").attr("type", "hidden").attr("name", this.option("endName")).appendTo($element)
    },
    _initOptions: function(options) {
        this.callBase(options);
        var initialValue = this.initialOption("value"),
            value = this.option("value");
        if (value[0] === initialValue[0] && value[1] === initialValue[1]) {
            this.option("value", [this.option("start"), this.option("end")])
        } else {
            this.option({
                start: value[0],
                end: value[1]
            })
        }
    },
    _initMarkup: function() {
        this.$element().addClass(RANGE_SLIDER_CLASS);
        this.callBase()
    },
    _renderContentImpl: function() {
        this._callHandlerMethod("repaint");
        this.callBase()
    },
    _renderHandle: function() {
        this._$handleStart = this._renderHandleImpl(this.option("start"), this._$handleStart).addClass(RANGE_SLIDER_START_HANDLE_CLASS);
        this._$handleEnd = this._renderHandleImpl(this.option("end"), this._$handleEnd).addClass(RANGE_SLIDER_END_HANDLE_CLASS);
        this._updateHandleAriaLabels()
    },
    _startHandler: function(args) {
        var e = args.event,
            $range = this._$range,
            rangeWidth = $range.width(),
            eventOffsetX = eventUtils.eventData(e).x - this._$bar.offset().left,
            startHandleX = $range.position().left,
            endHandleX = $range.position().left + rangeWidth,
            rtlEnabled = this.option("rtlEnabled"),
            startHandleIsClosest = (rtlEnabled ? -1 : 1) * ((startHandleX + endHandleX) / 2 - eventOffsetX) > 0;
        this._capturedHandle = startHandleIsClosest ? this._$handleStart : this._$handleEnd;
        this.callBase(args)
    },
    _updateHandleAriaLabels: function() {
        this.setAria("label", messageLocalization.getFormatter("dxRangeSlider-ariaFrom")(this.option("dxRangeSlider-ariaFrom")), this._$handleStart);
        this.setAria("label", messageLocalization.getFormatter("dxRangeSlider-ariaTill")(this.option("dxRangeSlider-ariaTill")), this._$handleEnd)
    },
    _activeHandle: function() {
        return this._capturedHandle
    },
    _updateHandlePosition: function(e) {
        var rtlEnabled = this.option("rtlEnabled"),
            offsetDirection = rtlEnabled ? -1 : 1,
            max = this.option("max"),
            min = this.option("min");
        var newRatio = this._startOffset + offsetDirection * e.event.offset / this._swipePixelRatio();
        newRatio = newRatio.toPrecision(12);
        var newValue = newRatio * (max - min) + min;
        this._updateSelectedRangePosition(newRatio, newRatio);
        SliderHandle.getInstance(this._activeHandle()).fitTooltipPosition;
        this._changeValueOnSwipe(newRatio);
        var $nextHandle, startValue = this.option("start"),
            endValue = this.option("end");
        if (startValue === endValue) {
            if (newValue < startValue) {
                $nextHandle = this._$handleStart
            } else {
                $nextHandle = this._$handleEnd
            }
            eventsEngine.trigger($nextHandle, "focus");
            if ($nextHandle && $nextHandle !== this._capturedHandle) {
                this._updateSelectedRangePosition((startValue - min) / (max - min), (endValue - min) / (max - min));
                this._toggleActiveState(this._activeHandle(), false);
                this._toggleActiveState($nextHandle, true);
                this._capturedHandle = $nextHandle
            }
            this._updateSelectedRangePosition(newRatio, newRatio);
            this._changeValueOnSwipe(newRatio)
        }
    },
    _updateSelectedRangePosition: function(leftRatio, rightRatio) {
        var rtlEnabled = this.option("rtlEnabled"),
            moveRight = this._capturedHandle === this._$handleStart && rtlEnabled || this._capturedHandle === this._$handleEnd && !rtlEnabled;
        var prop = moveRight ? "right" : "left";
        if (rtlEnabled ^ moveRight) {
            this._$range.css(prop, 100 - 100 * rightRatio + "%")
        } else {
            this._$range.css(prop, 100 * leftRatio + "%")
        }
    },
    _setValueOnSwipe: function(value) {
        var option = this._capturedHandle === this._$handleStart ? "start" : "end",
            start = this.option("start"),
            end = this.option("end"),
            max = this.option("max"),
            min = this.option("min");
        start = Math.min(Math.max(start, min), max);
        end = Math.min(Math.max(end, min), max);
        if ("start" === option) {
            start = value > end ? end : value
        } else {
            end = value < start ? start : value
        }
        this.option("value", [start, end])
    },
    _renderValue: function() {
        var valStart = this.option("start"),
            valEnd = this.option("end"),
            min = this.option("min"),
            max = this.option("max"),
            rtlEnabled = this.option("rtlEnabled");
        valStart = Math.max(min, Math.min(valStart, max));
        valEnd = Math.max(valStart, Math.min(valEnd, max));
        this.option("start", valStart);
        this.option("end", valEnd);
        this._$submitStartElement.val(applyServerDecimalSeparator(valStart));
        this._$submitEndElement.val(applyServerDecimalSeparator(valEnd));
        var ratio1 = max === min ? 0 : (valStart - min) / (max - min),
            ratio2 = max === min ? 0 : (valEnd - min) / (max - min);
        var startOffset = parseFloat((100 * ratio1).toPrecision(12)) + "%",
            endOffset = parseFloat((100 * (1 - ratio2)).toPrecision(12)) + "%";
        !this._needPreventAnimation && this._setRangeStyles({
            right: rtlEnabled ? startOffset : endOffset,
            left: rtlEnabled ? endOffset : startOffset
        });
        SliderHandle.getInstance(this._$handleStart).option("value", valStart);
        SliderHandle.getInstance(this._$handleEnd).option("value", valEnd)
    },
    _callHandlerMethod: function(name, args) {
        SliderHandle.getInstance(this._$handleStart)[name](args);
        SliderHandle.getInstance(this._$handleEnd)[name](args)
    },
    _setValueOption: function() {
        var start = this.option("start"),
            end = this.option("end");
        this.option("value", [start, end])
    },
    _optionChanged: function(args) {
        switch (args.name) {
            case "value":
                this.option({
                    start: args.value[0],
                    end: args.value[1]
                });
                break;
            case "start":
            case "end":
                this._setValueOption();
                this._renderValue();
                var start = this.option("start"),
                    end = this.option("end");
                this._createActionByOption("onValueChanged", {
                    excludeValidators: ["disabled", "readOnly"]
                })({
                    start: start,
                    end: end,
                    value: [start, end],
                    event: this._valueChangeEventInstance
                });
                this._saveValueChangeEvent(void 0);
                break;
            case "startName":
                this._$submitStartElement.attr("name", args.value);
                break;
            case "endName":
                this._$submitEndElement.attr("name", args.value);
                break;
            case "name":
                break;
            default:
                this.callBase(args)
        }
    }
});
registerComponent("dxRangeSlider", RangeSlider);
module.exports = RangeSlider;
module.exports.default = module.exports;
