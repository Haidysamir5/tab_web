/**
 * DevExtreme (ui/shared/ui.editor_factory_mixin.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var $ = require("../../core/renderer"),
    noop = require("../../core/utils/common").noop,
    eventsEngine = require("../../events/core/events_engine"),
    typeUtils = require("../../core/utils/type"),
    isWrapped = require("../../core/utils/variable_wrapper").isWrapped,
    compileGetter = require("../../core/utils/data").compileGetter,
    browser = require("../../core/utils/browser"),
    extend = require("../../core/utils/extend").extend,
    devices = require("../../core/devices"),
    getPublicElement = require("../../core/utils/dom").getPublicElement,
    normalizeDataSourceOptions = require("../../data/data_source/data_source").normalizeDataSourceOptions,
    normalizeKeyName = require("../../events/utils").normalizeKeyName;
require("../text_box");
require("../number_box");
require("../check_box");
require("../select_box");
require("../date_box");
var CHECKBOX_SIZE_CLASS = "checkbox-size",
    CELL_FOCUS_DISABLED_CLASS = "dx-cell-focus-disabled",
    EDITOR_INLINE_BLOCK = "dx-editor-inline-block";
var EditorFactoryMixin = function() {
    var getResultConfig = function(config, options) {
        return extend(config, {
            readOnly: options.readOnly,
            placeholder: options.placeholder,
            inputAttr: {
                id: options.id
            },
            tabIndex: options.tabIndex
        }, options.editorOptions)
    };
    var checkEnterBug = function() {
        return browser.msie || browser.mozilla || devices.real().ios
    };
    var getTextEditorConfig = function(options) {
        var data = {},
            isEnterBug = checkEnterBug(),
            sharedData = options.sharedData || data;
        return getResultConfig({
            placeholder: options.placeholder,
            width: options.width,
            value: options.value,
            onValueChanged: function(e) {
                var needDelayedUpdate = "filterRow" === options.parentType || "searchPanel" === options.parentType,
                    isInputOrKeyUpEvent = e.event && ("input" === e.event.type || "keyup" === e.event.type),
                    updateValue = function(e, notFireEvent) {
                        options && options.setValue(e.value, notFireEvent)
                    };
                clearTimeout(data.valueChangeTimeout);
                if (isInputOrKeyUpEvent && needDelayedUpdate) {
                    sharedData.valueChangeTimeout = data.valueChangeTimeout = setTimeout(function() {
                        updateValue(e, data.valueChangeTimeout !== sharedData.valueChangeTimeout)
                    }, typeUtils.isDefined(options.updateValueTimeout) ? options.updateValueTimeout : 0)
                } else {
                    updateValue(e)
                }
            },
            onKeyDown: function(e) {
                if (isEnterBug && "enter" === normalizeKeyName(e.event)) {
                    eventsEngine.trigger($(e.component._input()), "change")
                }
            },
            valueChangeEvent: "change" + ("filterRow" === options.parentType ? " keyup input" : "")
        }, options)
    };
    var prepareDateBox = function(options) {
        options.editorName = "dxDateBox";
        options.editorOptions = getResultConfig({
            value: options.value,
            onValueChanged: function(args) {
                options.setValue(args.value)
            },
            onKeyDown: function(e) {
                if (checkEnterBug() && "enter" === normalizeKeyName(e.event)) {
                    e.component.blur();
                    e.component.focus()
                }
            },
            displayFormat: options.format,
            type: options.dataType,
            formatWidthCalculator: null,
            dateSerializationFormat: null,
            width: "filterBuilder" === options.parentType ? void 0 : "auto"
        }, options)
    };
    var prepareTextBox = function(options) {
        var config = getTextEditorConfig(options),
            isSearching = "searchPanel" === options.parentType,
            toString = function(value) {
                return typeUtils.isDefined(value) ? value.toString() : ""
            };
        if (options.editorType && "dxTextBox" !== options.editorType) {
            config.value = options.value
        } else {
            config.value = toString(options.value)
        }
        config.valueChangeEvent += isSearching ? " keyup input search" : "";
        config.mode = config.mode || (isSearching ? "search" : "text");
        options.editorName = "dxTextBox";
        options.editorOptions = config
    };
    var prepareNumberBox = function(options) {
        var config = getTextEditorConfig(options);
        config.value = typeUtils.isDefined(options.value) ? options.value : null;
        options.editorName = "dxNumberBox";
        options.editorOptions = config
    };
    var prepareBooleanEditor = function(options) {
        if ("filterRow" === options.parentType || "filterBuilder" === options.parentType) {
            prepareSelectBox(extend(options, {
                lookup: {
                    displayExpr: function(data) {
                        if (true === data) {
                            return options.trueText || "true"
                        } else {
                            if (false === data) {
                                return options.falseText || "false"
                            }
                        }
                    },
                    dataSource: [true, false]
                }
            }))
        } else {
            prepareCheckBox(options)
        }
    };
    var prepareSelectBox = function(options) {
        var displayGetter, dataSource, postProcess, lookup = options.lookup,
            isFilterRow = "filterRow" === options.parentType;
        if (lookup) {
            displayGetter = compileGetter(lookup.displayExpr);
            dataSource = lookup.dataSource;
            if (typeUtils.isFunction(dataSource) && !isWrapped(dataSource)) {
                dataSource = dataSource(options.row || {})
            }
            if (typeUtils.isObject(dataSource) || Array.isArray(dataSource)) {
                dataSource = normalizeDataSourceOptions(dataSource);
                if (isFilterRow) {
                    postProcess = dataSource.postProcess;
                    dataSource.postProcess = function(items) {
                        if (0 === this.pageIndex()) {
                            items = items.slice(0);
                            items.unshift(null)
                        }
                        if (postProcess) {
                            return postProcess.call(this, items)
                        }
                        return items
                    }
                }
            }
            var allowClearing = Boolean(lookup.allowClearing && !isFilterRow);
            options.editorName = "dxSelectBox";
            options.editorOptions = getResultConfig({
                searchEnabled: true,
                value: options.value,
                valueExpr: options.lookup.valueExpr,
                searchExpr: options.lookup.searchExpr || options.lookup.displayExpr,
                allowClearing: allowClearing,
                showClearButton: allowClearing,
                displayExpr: function(data) {
                    if (null === data) {
                        return options.showAllText
                    }
                    return displayGetter(data)
                },
                dataSource: dataSource,
                onValueChanged: function(e) {
                    var params = [e.value];
                    !isFilterRow && params.push(e.component.option("text"));
                    options.setValue.apply(this, params)
                }
            }, options)
        }
    };
    var prepareCheckBox = function(options) {
        options.editorName = "dxCheckBox";
        options.editorOptions = getResultConfig({
            value: typeUtils.isDefined(options.value) ? options.value : void 0,
            hoverStateEnabled: !options.readOnly,
            focusStateEnabled: !options.readOnly,
            activeStateEnabled: false,
            onValueChanged: function(e) {
                options.setValue && options.setValue(e.value, e)
            }
        }, options)
    };
    var createEditorCore = function(that, options) {
        var $editorElement = $(options.editorElement);
        if (options.editorName && options.editorOptions && $editorElement[options.editorName]) {
            if ("dxCheckBox" === options.editorName) {
                if (!options.isOnForm) {
                    $editorElement.addClass(that.addWidgetPrefix(CHECKBOX_SIZE_CLASS));
                    $editorElement.parent().addClass(EDITOR_INLINE_BLOCK)
                }
                if (options.command || options.editorOptions.readOnly) {
                    $editorElement.parent().addClass(CELL_FOCUS_DISABLED_CLASS)
                }
            }
            that._createComponent($editorElement, options.editorName, options.editorOptions);
            if ("dxTextBox" === options.editorName) {
                $editorElement.dxTextBox("instance").registerKeyHandler("enter", noop)
            }
            if ("dxTextArea" === options.editorName) {
                $editorElement.dxTextArea("instance").registerKeyHandler("enter", function(event) {
                    if ("enter" === normalizeKeyName(event) && !event.ctrlKey && !event.shiftKey) {
                        event.stopPropagation()
                    }
                })
            }
        }
    };
    return {
        createEditor: function($container, options) {
            var editorName = void 0;
            options.cancel = false;
            options.editorElement = getPublicElement($container);
            if (!typeUtils.isDefined(options.tabIndex)) {
                options.tabIndex = this.option("tabIndex")
            }
            if (options.lookup) {
                prepareSelectBox(options)
            } else {
                switch (options.dataType) {
                    case "date":
                    case "datetime":
                        prepareDateBox(options);
                        break;
                    case "boolean":
                        prepareBooleanEditor(options);
                        break;
                    case "number":
                        prepareNumberBox(options);
                        break;
                    default:
                        prepareTextBox(options)
                }
            }
            editorName = options.editorName;
            this.executeAction("onEditorPreparing", options);
            if (options.cancel) {
                return
            } else {
                if ("dataRow" === options.parentType && options.editorType && editorName === options.editorName) {
                    options.editorName = options.editorType
                }
            }
            createEditorCore(this, options);
            this.executeAction("onEditorPrepared", options)
        }
    }
}();
module.exports = EditorFactoryMixin;
