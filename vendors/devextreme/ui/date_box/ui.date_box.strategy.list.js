/**
 * DevExtreme (ui/date_box/ui.date_box.strategy.list.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var $ = require("../../core/renderer"),
    window = require("../../core/utils/window").getWindow(),
    List = require("../list"),
    DateBoxStrategy = require("./ui.date_box.strategy"),
    noop = require("../../core/utils/common").noop,
    isDate = require("../../core/utils/type").isDate,
    extend = require("../../core/utils/extend").extend,
    dateUtils = require("./ui.date_utils"),
    dateLocalization = require("../../localization/date");
var BOUNDARY_VALUES = {
    min: new Date(0, 0, 0, 0, 0),
    max: new Date(0, 0, 0, 23, 59)
};
var ListStrategy = DateBoxStrategy.inherit({
    NAME: "List",
    supportedKeys: function() {
        return {
            tab: function() {
                if (this.option("opened")) {
                    this.close()
                }
            },
            space: noop,
            home: noop,
            end: noop
        }
    },
    getDefaultOptions: function() {
        return extend(this.callBase(), {
            applyValueMode: "instantly"
        })
    },
    getDisplayFormat: function(displayFormat) {
        return displayFormat || "shorttime"
    },
    popupConfig: function(_popupConfig) {
        return extend(_popupConfig, {
            width: this._getPopupWidth()
        })
    },
    useCurrentDateByDefault: function() {
        return true
    },
    _getPopupWidth: function() {
        return this.dateBox.$element().outerWidth()
    },
    popupShowingHandler: function() {
        this._dimensionChanged()
    },
    _renderWidget: function() {
        this.callBase();
        this._refreshItems()
    },
    _getWidgetName: function() {
        return List
    },
    _getWidgetOptions: function() {
        var keyboardProcessor = this.dateBox._keyboardProcessor;
        return {
            _keyboardProcessor: keyboardProcessor ? keyboardProcessor.attachChildProcessor() : null,
            itemTemplate: this._timeListItemTemplate.bind(this),
            onItemClick: this._listItemClickHandler.bind(this),
            tabIndex: -1,
            onFocusedItemChanged: this._refreshActiveDescendant.bind(this),
            selectionMode: "single"
        }
    },
    _refreshActiveDescendant: function(e) {
        this.dateBox.setAria("activedescendant", "");
        this.dateBox.setAria("activedescendant", e.actionValue)
    },
    _refreshItems: function() {
        this._widgetItems = this._getTimeListItems();
        this._widget.option("items", this._widgetItems)
    },
    renderOpenedState: function() {
        if (!this._widget) {
            return
        }
        this._widget.option("focusedElement", null);
        this._setSelectedItemsByValue();
        if (this._widget.option("templatesRenderAsynchronously")) {
            this._asyncScrollTimeout = setTimeout(this._scrollToSelectedItem.bind(this))
        } else {
            this._scrollToSelectedItem()
        }
    },
    dispose: function() {
        this.callBase();
        clearTimeout(this._asyncScrollTimeout)
    },
    _updateValue: function() {
        if (!this._widget) {
            return
        }
        this._refreshItems();
        this._setSelectedItemsByValue();
        this._scrollToSelectedItem()
    },
    _setSelectedItemsByValue: function() {
        var value = this.dateBoxValue();
        var dateIndex = this._getDateIndex(value);
        if (dateIndex === -1) {
            this._widget.option("selectedItems", [])
        } else {
            this._widget.option("selectedIndex", dateIndex)
        }
    },
    _scrollToSelectedItem: function() {
        this._widget.scrollToItem(this._widget.option("selectedIndex"))
    },
    _getDateIndex: function(date) {
        var result = -1;
        for (var i = 0, n = this._widgetItems.length; i < n; i++) {
            if (this._areDatesEqual(date, this._widgetItems[i])) {
                result = i;
                break
            }
        }
        return result
    },
    _areDatesEqual: function(first, second) {
        return isDate(first) && isDate(second) && first.getHours() === second.getHours() && first.getMinutes() === second.getMinutes()
    },
    _getTimeListItems: function() {
        var min = this.dateBox.dateOption("min") || this._getBoundaryDate("min"),
            max = this.dateBox.dateOption("max") || this._getBoundaryDate("max"),
            value = this.dateBox.dateOption("value") || null,
            delta = max - min,
            minutes = min.getMinutes() % this.dateBox.option("interval");
        if (delta < 0) {
            return []
        }
        if (delta > dateUtils.ONE_DAY) {
            delta = dateUtils.ONE_DAY
        }
        if (value - min < dateUtils.ONE_DAY) {
            return this._getRangeItems(min, new Date(min), delta)
        }
        min = this._getBoundaryDate("min");
        min.setMinutes(minutes);
        if (value && Math.abs(value - max) < dateUtils.ONE_DAY) {
            delta = (60 * max.getHours() + Math.abs(max.getMinutes() - minutes)) * dateUtils.ONE_MINUTE
        }
        return this._getRangeItems(min, new Date(min), delta)
    },
    _getRangeItems: function(startValue, currentValue, rangeDuration) {
        var rangeItems = [];
        var interval = this.dateBox.option("interval");
        while (currentValue - startValue < rangeDuration) {
            rangeItems.push(new Date(currentValue));
            currentValue.setMinutes(currentValue.getMinutes() + interval)
        }
        return rangeItems
    },
    _getBoundaryDate: function(boundary) {
        var boundaryValue = BOUNDARY_VALUES[boundary],
            currentValue = new Date(this.dateBox.dateOption("value"));
        return new Date(currentValue.getFullYear(), currentValue.getMonth(), currentValue.getDate(), boundaryValue.getHours(), boundaryValue.getMinutes())
    },
    _timeListItemTemplate: function(itemData) {
        var displayFormat = this.dateBox.option("displayFormat");
        return dateLocalization.format(itemData, this.getDisplayFormat(displayFormat))
    },
    _listItemClickHandler: function(e) {
        this.dateBox.option("opened", false);
        var date = this.dateBox.option("value");
        var itemData = e.itemData;
        var hours = itemData.getHours();
        var minutes = itemData.getMinutes();
        var seconds = itemData.getSeconds();
        var year = itemData.getFullYear();
        var month = itemData.getMonth();
        var day = itemData.getDate();
        if (date) {
            date = new Date(date);
            date.setHours(hours);
            date.setMinutes(minutes);
            date.setSeconds(seconds);
            date.setFullYear(year);
            date.setMonth(month);
            date.setDate(day)
        } else {
            date = new Date(year, month, day, hours, minutes, 0, 0)
        }
        this.dateBoxValue(date)
    },
    attachKeyboardEvents: function(keyboardProcessor) {
        var child = keyboardProcessor.attachChildProcessor();
        if (this._widget) {
            this._widget.option("_keyboardProcessor", child)
        }
    },
    _dimensionChanged: function() {
        this._getPopup() && this._updatePopupDimensions()
    },
    _updatePopupDimensions: function() {
        this._updatePopupWidth();
        this._updatePopupHeight()
    },
    _updatePopupWidth: function() {
        this.dateBox._setPopupOption("width", this._getPopupWidth())
    },
    _updatePopupHeight: function() {
        this.dateBox._setPopupOption("height", "auto");
        var popupHeight = this._widget.$element().outerHeight();
        var maxHeight = .45 * $(window).height();
        this.dateBox._setPopupOption("height", Math.min(popupHeight, maxHeight));
        this.dateBox._timeList && this.dateBox._timeList.updateDimensions()
    }
});
module.exports = ListStrategy;
