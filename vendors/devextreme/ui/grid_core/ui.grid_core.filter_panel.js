/**
 * DevExtreme (ui/grid_core/ui.grid_core.filter_panel.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _renderer = require("../../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _type = require("../../core/utils/type");
var _uiGrid_core = require("./ui.grid_core.modules");
var _uiGrid_core2 = _interopRequireDefault(_uiGrid_core);
var _uiGrid_core3 = require("./ui.grid_core.utils");
var _uiGrid_core4 = _interopRequireDefault(_uiGrid_core3);
var _events_engine = require("../../events/core/events_engine");
var _events_engine2 = _interopRequireDefault(_events_engine);
var _message = require("../../localization/message");
var _message2 = _interopRequireDefault(_message);
var _check_box = require("../check_box");
var _check_box2 = _interopRequireDefault(_check_box);
var _utils = require("../filter_builder/utils");
var _utils2 = _interopRequireDefault(_utils);
var _deferred = require("../../core/utils/deferred");
var _inflector = require("../../core/utils/inflector");
var _inflector2 = _interopRequireDefault(_inflector);
var _uiGrid_core5 = require("./ui.grid_core.accessibility");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var FILTER_PANEL_CLASS = "filter-panel",
    FILTER_PANEL_TEXT_CLASS = FILTER_PANEL_CLASS + "-text",
    FILTER_PANEL_CHECKBOX_CLASS = FILTER_PANEL_CLASS + "-checkbox",
    FILTER_PANEL_CLEAR_FILTER_CLASS = FILTER_PANEL_CLASS + "-clear-filter",
    FILTER_PANEL_LEFT_CONTAINER = FILTER_PANEL_CLASS + "-left";
var FILTER_PANEL_TARGET = "filterPanel";
var FilterPanelView = _uiGrid_core2.default.View.inherit({
    isVisible: function() {
        return this.option("filterPanel.visible") && this.getController("data").dataSource()
    },
    init: function() {
        var _this = this;
        this.getController("data").dataSourceChanged.add(function() {
            return _this.render()
        })
    },
    _renderCore: function() {
        var $leftContainer, that = this,
            $element = that.element();
        $element.empty().addClass(that.addWidgetPrefix(FILTER_PANEL_CLASS));
        $leftContainer = (0, _renderer2.default)("<div>").addClass(that.addWidgetPrefix(FILTER_PANEL_LEFT_CONTAINER)).appendTo($element);
        if (that.option("filterValue") || that._filterValueBuffer) {
            $leftContainer.append(that._getCheckElement()).append(that._getFilterElement()).append(that._getTextElement());
            $element.append(that._getRemoveButtonElement())
        } else {
            $leftContainer.append(that._getFilterElement()).append(that._getTextElement())
        }
    },
    _getCheckElement: function() {
        var that = this,
            $element = (0, _renderer2.default)("<div>").addClass(this.addWidgetPrefix(FILTER_PANEL_CHECKBOX_CLASS));
        that._createComponent($element, _check_box2.default, {
            value: that.option("filterPanel.filterEnabled"),
            onValueChanged: function(e) {
                that.option("filterPanel.filterEnabled", e.value)
            }
        });
        $element.attr("title", this.option("filterPanel.texts.filterEnabledHint"));
        return $element
    },
    _getFilterElement: function() {
        var that = this,
            $element = (0, _renderer2.default)("<div>").addClass("dx-icon-filter");
        _events_engine2.default.on($element, "click", function() {
            return that._showFilterBuilder()
        });
        (0, _uiGrid_core5.registerKeyboardAction)("filterPanel", that, $element, void 0, function() {
            return that._showFilterBuilder()
        });
        that._addTabIndexToElement($element);
        return $element
    },
    _getTextElement: function() {
        var filterText, that = this,
            $textElement = (0, _renderer2.default)("<div>").addClass(that.addWidgetPrefix(FILTER_PANEL_TEXT_CLASS)),
            filterValue = that.option("filterValue");
        if (filterValue) {
            (0, _deferred.when)(that.getFilterText(filterValue, that.getController("filterSync").getCustomFilterOperations())).done(function(filterText) {
                var customizeText = that.option("filterPanel.customizeText");
                if (customizeText) {
                    var customText = customizeText({
                        component: that.component,
                        filterValue: filterValue,
                        text: filterText
                    });
                    if ("string" === typeof customText) {
                        filterText = customText
                    }
                }
                $textElement.text(filterText)
            })
        } else {
            filterText = that.option("filterPanel.texts.createFilter");
            $textElement.text(filterText)
        }
        _events_engine2.default.on($textElement, "click", function() {
            return that._showFilterBuilder()
        });
        (0, _uiGrid_core5.registerKeyboardAction)("filterPanel", that, $textElement, void 0, function() {
            return that._showFilterBuilder()
        });
        that._addTabIndexToElement($textElement);
        return $textElement
    },
    _showFilterBuilder: function() {
        this.option("filterBuilderPopup.visible", true)
    },
    _getRemoveButtonElement: function() {
        var that = this,
            clearFilterValue = function() {
                return that.option("filterValue", null)
            },
            $element = (0, _renderer2.default)("<div>").addClass(that.addWidgetPrefix(FILTER_PANEL_CLEAR_FILTER_CLASS)).text(that.option("filterPanel.texts.clearFilter"));
        _events_engine2.default.on($element, "click", clearFilterValue);
        (0, _uiGrid_core5.registerKeyboardAction)("filterPanel", this, $element, void 0, clearFilterValue);
        that._addTabIndexToElement($element);
        return $element
    },
    _addTabIndexToElement: function($element) {
        if (!this.option("useLegacyKeyboardNavigation")) {
            var tabindex = this.option("tabindex") || 0;
            $element.attr("tabindex", tabindex)
        }
    },
    optionChanged: function(args) {
        switch (args.name) {
            case "filterValue":
                this._invalidate();
                this.option("filterPanel.filterEnabled", true);
                args.handled = true;
                break;
            case "filterPanel":
                this._invalidate();
                args.handled = true;
                break;
            default:
                this.callBase(args)
        }
    },
    _getConditionText: function(fieldText, operationText, valueText) {
        var result = "[" + fieldText + "] " + operationText;
        if ((0, _type.isDefined)(valueText)) {
            result += valueText
        }
        return result
    },
    _getValueMaskedText: function(value) {
        return Array.isArray(value) ? "('" + value.join("', '") + "')" : " '" + value + "'"
    },
    _getValueText: function(field, customOperation, value) {
        var _this2 = this;
        var deferred = new _deferred.Deferred,
            hasCustomOperation = customOperation && customOperation.customizeText;
        if ((0, _type.isDefined)(value) || hasCustomOperation) {
            if (!hasCustomOperation && field.lookup) {
                _utils2.default.getCurrentLookupValueText(field, value, function(data) {
                    deferred.resolve(_this2._getValueMaskedText(data))
                })
            } else {
                var displayValue = Array.isArray(value) ? value : _uiGrid_core4.default.getDisplayValue(field, value);
                (0, _deferred.when)(_utils2.default.getCurrentValueText(field, displayValue, customOperation, FILTER_PANEL_TARGET)).done(function(data) {
                    deferred.resolve(_this2._getValueMaskedText(data))
                })
            }
        } else {
            deferred.resolve("")
        }
        return deferred.promise()
    },
    getConditionText: function(filterValue, options) {
        var operationText, that = this,
            operation = filterValue[1],
            deferred = new _deferred.Deferred,
            customOperation = _utils2.default.getCustomOperation(options.customOperations, operation),
            field = _utils2.default.getField(filterValue[0], options.columns),
            fieldText = field.caption || "",
            value = filterValue[2];
        if (customOperation) {
            operationText = customOperation.caption || _inflector2.default.captionize(customOperation.name)
        } else {
            if (null === value) {
                operationText = _utils2.default.getCaptionByOperation("=" === operation ? "isblank" : "isnotblank", options.filterOperationDescriptions)
            } else {
                operationText = _utils2.default.getCaptionByOperation(operation, options.filterOperationDescriptions)
            }
        }
        this._getValueText(field, customOperation, value).done(function(valueText) {
            deferred.resolve(that._getConditionText(fieldText, operationText, valueText))
        });
        return deferred
    },
    getGroupText: function(filterValue, options, isInnerGroup) {
        var that = this,
            result = new _deferred.Deferred,
            textParts = [],
            groupValue = _utils2.default.getGroupValue(filterValue);
        filterValue.forEach(function(item) {
            if (_utils2.default.isCondition(item)) {
                textParts.push(that.getConditionText(item, options))
            } else {
                if (_utils2.default.isGroup(item)) {
                    textParts.push(that.getGroupText(item, options, true))
                }
            }
        });
        _deferred.when.apply(this, textParts).done(function() {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key]
            }
            var text = void 0;
            if ("!" === groupValue[0]) {
                var groupText = options.groupOperationDescriptions["not" + groupValue.substring(1, 2).toUpperCase() + groupValue.substring(2)].split(" ");
                text = groupText[0] + " " + args[0]
            } else {
                text = args.join(" " + options.groupOperationDescriptions[groupValue] + " ")
            }
            if (isInnerGroup) {
                text = "(" + text + ")"
            }
            result.resolve(text)
        });
        return result
    },
    getFilterText: function(filterValue, customOperations) {
        var that = this,
            options = {
                customOperations: customOperations,
                columns: that.getController("columns").getFilteringColumns(),
                filterOperationDescriptions: that.option("filterBuilder.filterOperationDescriptions"),
                groupOperationDescriptions: that.option("filterBuilder.groupOperationDescriptions")
            };
        return _utils2.default.isCondition(filterValue) ? that.getConditionText(filterValue, options) : that.getGroupText(filterValue, options)
    }
});
module.exports = {
    defaultOptions: function() {
        return {
            filterPanel: {
                visible: false,
                filterEnabled: true,
                texts: {
                    createFilter: _message2.default.format("dxDataGrid-filterPanelCreateFilter"),
                    clearFilter: _message2.default.format("dxDataGrid-filterPanelClearFilter"),
                    filterEnabledHint: _message2.default.format("dxDataGrid-filterPanelFilterEnabledHint")
                }
            }
        }
    },
    views: {
        filterPanelView: FilterPanelView
    },
    extenders: {
        controllers: {
            data: {
                optionChanged: function(args) {
                    switch (args.name) {
                        case "filterPanel":
                            this._applyFilter();
                            args.handled = true;
                            break;
                        default:
                            this.callBase(args)
                    }
                }
            }
        }
    }
};
