/**
 * DevExtreme (ui/date_box/ui.date_box.strategy.calendar.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var Calendar = require("../calendar"),
    DateBoxStrategy = require("./ui.date_box.strategy"),
    dateUtils = require("../../core/utils/date"),
    commonUtils = require("../../core/utils/common"),
    isFunction = require("../../core/utils/type").isFunction,
    extend = require("../../core/utils/extend").extend,
    messageLocalization = require("../../localization/message");
var CalendarStrategy = DateBoxStrategy.inherit({
    NAME: "Calendar",
    supportedKeys: function() {
        return {
            rightArrow: function() {
                if (this.option("opened")) {
                    return true
                }
            },
            leftArrow: function() {
                if (this.option("opened")) {
                    return true
                }
            },
            enter: function(e) {
                if (this.dateBox.option("opened")) {
                    e.preventDefault();
                    if (this._widget.option("zoomLevel") === this._widget.option("maxZoomLevel")) {
                        var contouredDate = this._widget._view.option("contouredDate");
                        contouredDate && this.dateBoxValue(contouredDate, e);
                        this.dateBox.close();
                        this.dateBox._valueChangeEventHandler(e)
                    } else {
                        return true
                    }
                } else {
                    this.dateBox._valueChangeEventHandler(e)
                }
            }.bind(this)
        }
    },
    getDisplayFormat: function(displayFormat) {
        return displayFormat || "shortdate"
    },
    _getWidgetName: function() {
        return Calendar
    },
    _getWidgetOptions: function() {
        var disabledDates = this.dateBox.option("disabledDates");
        return extend(this.dateBox.option("calendarOptions"), {
            value: this.dateBoxValue() || null,
            dateSerializationFormat: null,
            _keyboardProcessor: this._widgetKeyboardProcessor,
            min: this.dateBox.dateOption("min"),
            max: this.dateBox.dateOption("max"),
            onValueChanged: this._valueChangedHandler.bind(this),
            onCellClick: this._cellClickHandler.bind(this),
            tabIndex: null,
            disabledDates: isFunction(disabledDates) ? this._injectComponent(disabledDates.bind(this.dateBox)) : disabledDates,
            onContouredChanged: this._refreshActiveDescendant.bind(this),
            hasFocus: function() {
                return true
            }
        })
    },
    _injectComponent: function(func) {
        var that = this;
        return function(params) {
            extend(params, {
                component: that.dateBox
            });
            return func(params)
        }
    },
    _refreshActiveDescendant: function(e) {
        this.dateBox.setAria("activedescendant", e.actionValue)
    },
    popupConfig: function(_popupConfig) {
        var toolbarItems = _popupConfig.toolbarItems,
            buttonsLocation = this.dateBox.option("buttonsLocation");
        var position = [];
        if ("default" !== buttonsLocation) {
            position = commonUtils.splitPair(buttonsLocation)
        } else {
            position = ["bottom", "center"]
        }
        if ("useButtons" === this.dateBox.option("applyValueMode")) {
            toolbarItems.unshift({
                widget: "dxButton",
                toolbar: position[0],
                location: "after" === position[1] ? "before" : position[1],
                options: {
                    onClick: function() {
                        this._widget._toTodayView()
                    }.bind(this),
                    text: messageLocalization.format("dxCalendar-todayButtonText"),
                    type: "today"
                }
            })
        }
        return extend(true, _popupConfig, {
            toolbarItems: toolbarItems,
            position: {
                collision: "flipfit flip"
            }
        })
    },
    _valueChangedHandler: function(e) {
        var dateBox = this.dateBox,
            value = e.value,
            prevValue = e.previousValue;
        if (dateUtils.sameDate(value, prevValue)) {
            return
        }
        if ("instantly" === dateBox.option("applyValueMode")) {
            this.dateBoxValue(this.getValue(), e.event)
        }
    },
    _updateValue: function() {
        if (!this._widget) {
            return
        }
        this._widget.option("value", this.dateBoxValue())
    },
    textChangedHandler: function() {
        if (this.dateBox.option("opened") && this._widget) {
            this._updateValue(true)
        }
    },
    _cellClickHandler: function(e) {
        var dateBox = this.dateBox;
        if ("instantly" === dateBox.option("applyValueMode")) {
            dateBox.option("opened", false);
            this.dateBoxValue(this.getValue(), e.event)
        }
    }
});
module.exports = CalendarStrategy;
