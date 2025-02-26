/**
 * DevExtreme (ui/form/ui.form.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var $ = require("../../core/renderer"),
    eventsEngine = require("../../events/core/events_engine"),
    registerComponent = require("../../core/component_registrator"),
    Guid = require("../../core/guid"),
    utils = require("../../core/utils/common"),
    typeUtils = require("../../core/utils/type"),
    dataUtils = require("../../core/element_data"),
    each = require("../../core/utils/iterator").each,
    inArray = require("../../core/utils/array").inArray,
    extend = require("../../core/utils/extend").extend,
    stringUtils = require("../../core/utils/string"),
    errors = require("../widget/ui.errors"),
    browser = require("../../core/utils/browser"),
    domUtils = require("../../core/utils/dom"),
    messageLocalization = require("../../localization/message"),
    Widget = require("../widget/ui.widget"),
    windowUtils = require("../../core/utils/window"),
    ValidationEngine = require("../validation_engine"),
    LayoutManager = require("./ui.form.layout_manager"),
    FormItemsRunTimeInfo = require("./ui.form.items_runtime_info").default,
    TabPanel = require("../tab_panel"),
    Scrollable = require("../scroll_view/ui.scrollable"),
    Deferred = require("../../core/utils/deferred").Deferred,
    themes = require("../themes");
require("../validation_summary");
require("../validation_group");
var FORM_CLASS = "dx-form",
    FIELD_ITEM_CLASS = "dx-field-item",
    FIELD_ITEM_LABEL_TEXT_CLASS = "dx-field-item-label-text",
    FORM_GROUP_CLASS = "dx-form-group",
    FORM_GROUP_CONTENT_CLASS = "dx-form-group-content",
    FORM_GROUP_WITH_CAPTION_CLASS = "dx-form-group-with-caption",
    FORM_GROUP_CAPTION_CLASS = "dx-form-group-caption",
    HIDDEN_LABEL_CLASS = "dx-layout-manager-hidden-label",
    FIELD_ITEM_LABEL_CLASS = "dx-field-item-label",
    FIELD_ITEM_LABEL_CONTENT_CLASS = "dx-field-item-label-content",
    FIELD_ITEM_TAB_CLASS = "dx-field-item-tab",
    FORM_FIELD_ITEM_COL_CLASS = "dx-col-",
    GROUP_COL_COUNT_CLASS = "dx-group-colcount-",
    FIELD_ITEM_CONTENT_CLASS = "dx-field-item-content",
    FORM_VALIDATION_SUMMARY = "dx-form-validation-summary",
    WIDGET_CLASS = "dx-widget",
    FOCUSED_STATE_CLASS = "dx-state-focused";
var Form = Widget.inherit({
    _init: function() {
        this.callBase();
        this._cachedColCountOptions = [];
        this._itemsRunTimeInfo = new FormItemsRunTimeInfo;
        this._groupsColCount = [];
        this._attachSyncSubscriptions()
    },
    _initOptions: function(options) {
        if (!("screenByWidth" in options)) {
            options.screenByWidth = windowUtils.defaultScreenFactorFunc
        }
        this.callBase(options)
    },
    _getDefaultOptions: function() {
        return extend(this.callBase(), {
            formID: "dx-" + new Guid,
            formData: {},
            colCount: 1,
            screenByWidth: null,
            colCountByScreen: void 0,
            labelLocation: "left",
            readOnly: false,
            onFieldDataChanged: null,
            customizeItem: null,
            onEditorEnterKey: null,
            minColWidth: 200,
            alignItemLabels: true,
            alignItemLabelsInAllGroups: true,
            showColonAfterLabel: true,
            showRequiredMark: true,
            showOptionalMark: false,
            requiredMark: "*",
            optionalMark: messageLocalization.format("dxForm-optionalMark"),
            requiredMessage: messageLocalization.getFormatter("dxForm-requiredMessage"),
            showValidationSummary: false,
            items: void 0,
            scrollingEnabled: false,
            validationGroup: void 0,
            stylingMode: void 0
        })
    },
    _defaultOptionsRules: function() {
        return this.callBase().concat([{
            device: function() {
                return themes.isMaterial()
            },
            options: {
                showColonAfterLabel: false,
                labelLocation: "top"
            }
        }])
    },
    _setOptionsByReference: function() {
        this.callBase();
        extend(this._optionsByReference, {
            formData: true,
            validationGroup: true
        })
    },
    _getColCount: function($element) {
        var $cols, index = 0,
            isColsExist = true;
        while (isColsExist) {
            $cols = $element.find("." + FORM_FIELD_ITEM_COL_CLASS + index);
            if (!$cols.length) {
                isColsExist = false
            } else {
                index++
            }
        }
        return index
    },
    _createHiddenElement: function(rootLayoutManager) {
        this._$hiddenElement = $("<div>").addClass(WIDGET_CLASS).addClass(HIDDEN_LABEL_CLASS).appendTo("body");
        var $hiddenLabel = rootLayoutManager._renderLabel({
            text: " ",
            location: this.option("labelLocation")
        }).appendTo(this._$hiddenElement);
        this._hiddenLabelText = $hiddenLabel.find("." + FIELD_ITEM_LABEL_TEXT_CLASS)[0]
    },
    _removeHiddenElement: function() {
        this._$hiddenElement.remove();
        this._hiddenLabelText = null
    },
    _getLabelWidthByText: function(text) {
        this._hiddenLabelText.innerHTML = text;
        return this._hiddenLabelText.offsetWidth
    },
    _getLabelsSelectorByCol: function(index, options) {
        options = options || {};
        var fieldItemClass = options.inOneColumn ? FIELD_ITEM_CLASS : FORM_FIELD_ITEM_COL_CLASS + index,
            cssExcludeTabbedSelector = options.excludeTabbed ? ":not(." + FIELD_ITEM_TAB_CLASS + ")" : "",
            childLabelContentSelector = "> ." + FIELD_ITEM_LABEL_CLASS + " > ." + FIELD_ITEM_LABEL_CONTENT_CLASS;
        return "." + fieldItemClass + cssExcludeTabbedSelector + childLabelContentSelector
    },
    _getLabelText: function(labelText) {
        var child, i, length = labelText.children.length,
            result = "";
        for (i = 0; i < length; i++) {
            child = labelText.children[i];
            result += !stringUtils.isEmpty(child.innerText) ? child.innerText : child.innerHTML
        }
        return result
    },
    _applyLabelsWidthByCol: function($container, index, options) {
        var labelWidth, i, $labelTexts = $container.find(this._getLabelsSelectorByCol(index, options)),
            $labelTextsLength = $labelTexts.length,
            maxWidth = 0;
        for (i = 0; i < $labelTextsLength; i++) {
            labelWidth = this._getLabelWidthByText(this._getLabelText($labelTexts[i]));
            if (labelWidth > maxWidth) {
                maxWidth = labelWidth
            }
        }
        for (i = 0; i < $labelTextsLength; i++) {
            $labelTexts[i].style.width = maxWidth + "px"
        }
    },
    _applyLabelsWidth: function($container, excludeTabbed, inOneColumn, colCount) {
        colCount = inOneColumn ? 1 : colCount || this._getColCount($container);
        var i, applyLabelsOptions = {
            excludeTabbed: excludeTabbed,
            inOneColumn: inOneColumn
        };
        for (i = 0; i < colCount; i++) {
            this._applyLabelsWidthByCol($container, i, applyLabelsOptions)
        }
    },
    _getGroupElementsInColumn: function($container, columnIndex, colCount) {
        var cssColCountSelector = typeUtils.isDefined(colCount) ? "." + GROUP_COL_COUNT_CLASS + colCount : "",
            groupSelector = "." + FORM_FIELD_ITEM_COL_CLASS + columnIndex + " > ." + FIELD_ITEM_CONTENT_CLASS + " > ." + FORM_GROUP_CLASS + cssColCountSelector;
        return $container.find(groupSelector)
    },
    _applyLabelsWidthWithGroups: function($container, colCount, excludeTabbed) {
        var alignItemLabelsInAllGroups = this.option("alignItemLabelsInAllGroups");
        if (alignItemLabelsInAllGroups) {
            this._applyLabelsWidthWithNestedGroups($container, colCount, excludeTabbed)
        } else {
            var i, $groups = this.$element().find("." + FORM_GROUP_CLASS);
            for (i = 0; i < $groups.length; i++) {
                this._applyLabelsWidth($groups.eq(i), excludeTabbed)
            }
        }
    },
    _applyLabelsWidthWithNestedGroups: function($container, colCount, excludeTabbed) {
        var colIndex, groupsColIndex, groupColIndex, $groupsByCol, applyLabelsOptions = {
            excludeTabbed: excludeTabbed
        };
        for (colIndex = 0; colIndex < colCount; colIndex++) {
            $groupsByCol = this._getGroupElementsInColumn($container, colIndex);
            this._applyLabelsWidthByCol($groupsByCol, 0, applyLabelsOptions);
            for (groupsColIndex = 0; groupsColIndex < this._groupsColCount.length; groupsColIndex++) {
                $groupsByCol = this._getGroupElementsInColumn($container, colIndex, this._groupsColCount[groupsColIndex]);
                var groupColCount = this._getColCount($groupsByCol);
                for (groupColIndex = 1; groupColIndex < groupColCount; groupColIndex++) {
                    this._applyLabelsWidthByCol($groupsByCol, groupColIndex, applyLabelsOptions)
                }
            }
        }
    },
    _alignLabelsInColumn: function(options) {
        if (!windowUtils.hasWindow()) {
            return
        }
        this._createHiddenElement(options.layoutManager);
        if (options.inOneColumn) {
            this._applyLabelsWidth(options.$container, options.excludeTabbed, true)
        } else {
            if (this._checkGrouping(options.items)) {
                this._applyLabelsWidthWithGroups(options.$container, options.layoutManager._getColCount(), options.excludeTabbed)
            } else {
                this._applyLabelsWidth(options.$container, options.excludeTabbed, false, options.layoutManager._getColCount())
            }
        }
        this._removeHiddenElement()
    },
    _prepareFormData: function() {
        if (!typeUtils.isDefined(this.option("formData"))) {
            this.option("formData", {})
        }
    },
    _initMarkup: function() {
        this._clearCachedInstances();
        this._prepareFormData();
        this.$element().addClass(FORM_CLASS);
        this.callBase();
        this.setAria("role", "form", this.$element());
        if (this.option("scrollingEnabled")) {
            this._renderScrollable()
        }
        this._renderLayout();
        this._renderValidationSummary();
        this._lastMarkupScreenFactor = this._targetScreenFactor || this._getCurrentScreenFactor()
    },
    _getCurrentScreenFactor: function() {
        return windowUtils.hasWindow() ? windowUtils.getCurrentScreenFactor(this.option("screenByWidth")) : "lg"
    },
    _clearCachedInstances: function() {
        this._itemsRunTimeInfo.clear();
        this._cachedLayoutManagers = []
    },
    _alignLabels: function(layoutManager, inOneColumn) {
        this._alignLabelsInColumn({
            $container: this.$element(),
            layoutManager: layoutManager,
            excludeTabbed: true,
            items: this.option("items"),
            inOneColumn: inOneColumn
        })
    },
    _clean: function() {
        this.callBase();
        this._groupsColCount = [];
        this._cachedColCountOptions = [];
        this._lastMarkupScreenFactor = void 0
    },
    _renderScrollable: function() {
        var useNativeScrolling = this.option("useNativeScrolling");
        this._scrollable = new Scrollable(this.$element(), {
            useNative: !!useNativeScrolling,
            useSimulatedScrollbar: !useNativeScrolling,
            useKeyboard: false,
            direction: "both",
            bounceEnabled: false
        })
    },
    _getContent: function() {
        return this.option("scrollingEnabled") ? this._scrollable.$content() : this.$element()
    },
    _renderValidationSummary: function() {
        var $validationSummary = this.$element().find("." + FORM_VALIDATION_SUMMARY);
        if ($validationSummary.length > 0) {
            $validationSummary.remove()
        }
        if (this.option("showValidationSummary")) {
            $("<div>").addClass(FORM_VALIDATION_SUMMARY).dxValidationSummary({
                validationGroup: this._getValidationGroup()
            }).appendTo(this._getContent())
        }
    },
    _prepareItems: function(items, parentIsTabbedItem) {
        if (items) {
            var result = [];
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var guid = this._itemsRunTimeInfo.add(item);
                if (typeUtils.isObject(item)) {
                    var itemCopy = extend({}, item);
                    itemCopy.guid = guid;
                    this._tryPrepareGroupItem(itemCopy);
                    this._tryPrepareTabbedItem(itemCopy);
                    this._tryPrepareItemTemplate(itemCopy);
                    if (parentIsTabbedItem) {
                        itemCopy.cssItemClass = FIELD_ITEM_TAB_CLASS
                    }
                    if (itemCopy.items) {
                        itemCopy.items = this._prepareItems(itemCopy.items, parentIsTabbedItem)
                    }
                    result.push(itemCopy)
                } else {
                    result.push(item)
                }
            }
            return result
        }
    },
    _tryPrepareGroupItem: function(item) {
        if ("group" === item.itemType) {
            item.alignItemLabels = utils.ensureDefined(item.alignItemLabels, true);
            if (item.template) {
                item.groupContentTemplate = this._getTemplate(item.template)
            }
            item.template = this._itemGroupTemplate.bind(this, item)
        }
    },
    _tryPrepareTabbedItem: function(item) {
        if ("tabbed" === item.itemType) {
            item.template = this._itemTabbedTemplate.bind(this, item);
            item.tabs = this._prepareItems(item.tabs, true)
        }
    },
    _tryPrepareItemTemplate: function(item) {
        if (item.template) {
            item.template = this._getTemplate(item.template)
        }
    },
    _checkGrouping: function(items) {
        if (items) {
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if ("group" === item.itemType) {
                    return true
                }
            }
        }
    },
    _renderLayout: function() {
        var that = this,
            items = that.option("items"),
            $content = that._getContent();
        items = that._prepareItems(items);
        that._rootLayoutManager = that._renderLayoutManager(items, $content, {
            colCount: that.option("colCount"),
            alignItemLabels: that.option("alignItemLabels"),
            screenByWidth: this.option("screenByWidth"),
            colCountByScreen: this.option("colCountByScreen"),
            onLayoutChanged: function(inOneColumn) {
                that._alignLabels.bind(that)(that._rootLayoutManager, inOneColumn)
            },
            onContentReady: function(e) {
                that._alignLabels(e.component, e.component.isSingleColumnMode())
            }
        })
    },
    _itemTabbedTemplate: function(item, e, $container) {
        var that = this,
            $tabPanel = $("<div>").appendTo($container),
            tabPanelOptions = extend({}, item.tabPanelOptions, {
                dataSource: item.tabs,
                onItemRendered: function(args) {
                    domUtils.triggerShownEvent(args.itemElement)
                },
                itemTemplate: function(itemData, e, container) {
                    var layoutManager, $container = $(container),
                        alignItemLabels = utils.ensureDefined(itemData.alignItemLabels, true);
                    layoutManager = that._renderLayoutManager(itemData.items, $container, {
                        colCount: itemData.colCount,
                        alignItemLabels: alignItemLabels,
                        screenByWidth: this.option("screenByWidth"),
                        colCountByScreen: itemData.colCountByScreen,
                        cssItemClass: itemData.cssItemClass,
                        onLayoutChanged: function(inOneColumn) {
                            that._alignLabelsInColumn.bind(that)({
                                $container: $container,
                                layoutManager: layoutManager,
                                items: itemData.items,
                                inOneColumn: inOneColumn
                            })
                        }
                    });
                    if (alignItemLabels) {
                        that._alignLabelsInColumn.bind(that)({
                            $container: $container,
                            layoutManager: layoutManager,
                            items: itemData.items,
                            inOneColumn: layoutManager.isSingleColumnMode()
                        })
                    }
                }
            });
        that._createComponent($tabPanel, TabPanel, tabPanelOptions)
    },
    _itemGroupTemplate: function(item, e, $container) {
        var $groupContent, colCount, layoutManager, $group = $("<div>").toggleClass(FORM_GROUP_WITH_CAPTION_CLASS, typeUtils.isDefined(item.caption) && item.caption.length).addClass(FORM_GROUP_CLASS).appendTo($container);
        if (item.caption) {
            $("<span>").addClass(FORM_GROUP_CAPTION_CLASS).text(item.caption).appendTo($group)
        }
        $groupContent = $("<div>").addClass(FORM_GROUP_CONTENT_CLASS).appendTo($group);
        if (item.groupContentTemplate) {
            var data = {
                formData: this.option("formData"),
                component: this
            };
            item.groupContentTemplate.render({
                model: data,
                container: domUtils.getPublicElement($groupContent)
            })
        } else {
            layoutManager = this._renderLayoutManager(item.items, $groupContent, {
                colCount: item.colCount,
                colCountByScreen: item.colCountByScreen,
                alignItemLabels: item.alignItemLabels,
                cssItemClass: item.cssItemClass
            });
            colCount = layoutManager._getColCount();
            if (inArray(colCount, this._groupsColCount) === -1) {
                this._groupsColCount.push(colCount)
            }
            $group.addClass(GROUP_COL_COUNT_CLASS + colCount)
        }
    },
    _renderLayoutManager: function(items, $rootElement, options) {
        var instance, $element = $("<div>"),
            that = this,
            config = that._getLayoutManagerConfig(items, options),
            baseColCountByScreen = {
                lg: options.colCount,
                md: options.colCount,
                sm: options.colCount,
                xs: 1
            };
        that._cachedColCountOptions.push({
            colCountByScreen: extend(baseColCountByScreen, options.colCountByScreen)
        });
        $element.appendTo($rootElement);
        instance = that._createComponent($element, "dxLayoutManager", config);
        instance.on("autoColCountChanged", function() {
            that._refresh()
        });
        that._cachedLayoutManagers.push(instance);
        return instance
    },
    _getValidationGroup: function() {
        return this.option("validationGroup") || this
    },
    _getLayoutManagerConfig: function(items, options) {
        var that = this,
            baseConfig = {
                form: that,
                validationGroup: that._getValidationGroup(),
                showRequiredMark: that.option("showRequiredMark"),
                showOptionalMark: that.option("showOptionalMark"),
                requiredMark: that.option("requiredMark"),
                optionalMark: that.option("optionalMark"),
                requiredMessage: that.option("requiredMessage"),
                screenByWidth: that.option("screenByWidth"),
                layoutData: that.option("formData"),
                labelLocation: that.option("labelLocation"),
                customizeItem: that.option("customizeItem"),
                minColWidth: that.option("minColWidth"),
                showColonAfterLabel: that.option("showColonAfterLabel"),
                onEditorEnterKey: that.option("onEditorEnterKey"),
                onFieldDataChanged: function(args) {
                    if (!that._isDataUpdating) {
                        that._triggerOnFieldDataChanged(args)
                    }
                },
                validationBoundary: that.option("scrollingEnabled") ? that.$element() : void 0
            };
        return extend(baseConfig, {
            items: items,
            onContentReady: function(args) {
                that._itemsRunTimeInfo.addItemsOrExtendFrom(args.component._itemsRunTimeInfo);
                options.onContentReady && options.onContentReady(args)
            },
            colCount: options.colCount,
            alignItemLabels: options.alignItemLabels,
            cssItemClass: options.cssItemClass,
            colCountByScreen: options.colCountByScreen,
            onLayoutChanged: options.onLayoutChanged,
            width: options.width
        })
    },
    _createComponent: function($element, type, config) {
        var that = this;
        config = config || {};
        that._extendConfig(config, {
            readOnly: that.option("readOnly")
        });
        return that.callBase($element, type, config)
    },
    _attachSyncSubscriptions: function() {
        var that = this;
        that.on("optionChanged", function(args) {
            var optionFullName = args.fullName;
            if ("formData" === optionFullName) {
                if (!typeUtils.isDefined(args.value)) {
                    that._options.formData = args.value = {}
                }
                that._triggerOnFieldDataChangedByDataSet(args.value)
            }
            if (that._cachedLayoutManagers.length) {
                each(that._cachedLayoutManagers, function(index, layoutManager) {
                    if ("formData" === optionFullName) {
                        that._isDataUpdating = true;
                        layoutManager.option("layoutData", args.value);
                        that._isDataUpdating = false
                    }
                    if ("readOnly" === args.name || "disabled" === args.name) {
                        layoutManager.option(optionFullName, args.value)
                    }
                })
            }
        })
    },
    _optionChanged: function(args) {
        var rootNameOfComplexOption = this._getRootLevelOfExpectedComplexOption(args.fullName, ["formData", "items"]);
        if (rootNameOfComplexOption) {
            this._customHandlerOfComplexOption(args, rootNameOfComplexOption);
            return
        }
        switch (args.name) {
            case "formData":
                if (!this.option("items")) {
                    this._invalidate()
                } else {
                    if (typeUtils.isEmptyObject(args.value)) {
                        this._resetValues()
                    }
                }
                break;
            case "items":
            case "colCount":
            case "onFieldDataChanged":
            case "onEditorEnterKey":
            case "labelLocation":
            case "alignItemLabels":
            case "showColonAfterLabel":
            case "customizeItem":
            case "alignItemLabelsInAllGroups":
            case "showRequiredMark":
            case "showOptionalMark":
            case "requiredMark":
            case "optionalMark":
            case "requiredMessage":
            case "scrollingEnabled":
            case "formID":
            case "colCountByScreen":
            case "screenByWidth":
            case "stylingMode":
                this._invalidate();
                break;
            case "showValidationSummary":
                this._renderValidationSummary();
                break;
            case "minColWidth":
                if ("auto" === this.option("colCount")) {
                    this._invalidate()
                }
                break;
            case "readOnly":
                break;
            case "width":
                this.callBase(args);
                this._rootLayoutManager.option(args.name, args.value);
                this._alignLabels(this._rootLayoutManager, this._rootLayoutManager.isSingleColumnMode());
                break;
            case "visible":
                this.callBase(args);
                if (args.value) {
                    domUtils.triggerShownEvent(this.$element())
                }
                break;
            default:
                this.callBase(args)
        }
    },
    _getRootLevelOfExpectedComplexOption: function(fullOptionName, expectedRootNames) {
        var result, splitFullName = fullOptionName.split(".");
        if (splitFullName.length > 1) {
            var i, rootOptionName = splitFullName[0];
            for (i = 0; i < expectedRootNames.length; i++) {
                if (rootOptionName.search(expectedRootNames[i]) !== -1) {
                    result = expectedRootNames[i]
                }
            }
        }
        return result
    },
    _customHandlerOfComplexOption: function(args, rootOptionName) {
        var nameParts = args.fullName.split(".");
        switch (rootOptionName) {
            case "items":
                var itemPath = this._getItemPath(nameParts),
                    item = this.option(itemPath),
                    instance = this._itemsRunTimeInfo.findWidgetInstanceByItem(item),
                    $itemContainer = this._itemsRunTimeInfo.findItemContainerByItem(item),
                    fullName = args.fullName;
                if (instance) {
                    if (fullName.search("buttonOptions") !== -1) {
                        instance.option(item.buttonOptions);
                        break
                    } else {
                        if (instance && fullName.search("editorOptions") !== -1) {
                            instance.option(item.editorOptions);
                            break
                        } else {
                            if (fullName.search("validationRules") !== -1) {
                                var validator = dataUtils.data(instance.$element()[0], "dxValidator");
                                if (validator) {
                                    var filterRequired = function(item) {
                                        return "required" === item.type
                                    };
                                    var oldContainsRequired = (validator.option("validationRules") || []).some(filterRequired);
                                    var newContainsRequired = (item.validationRules || []).some(filterRequired);
                                    if (!oldContainsRequired && !newContainsRequired || oldContainsRequired && newContainsRequired) {
                                        validator.option("validationRules", item.validationRules);
                                        break
                                    }
                                }
                            } else {
                                if ($itemContainer && "cssClass" === fullName.substring(fullName.length - 8, fullName.length)) {
                                    $itemContainer.removeClass(args.previousValue).addClass(args.value);
                                    break
                                }
                            }
                        }
                    }
                }
                if (item) {
                    var items, name = args.fullName.replace(itemPath + ".", "");
                    this._changeItemOption(item, name, args.value);
                    items = this._generateItemsFromData(this.option("items"));
                    this.option("items", items)
                }
                break;
            case "formData":
                var dataField = nameParts.slice(1).join("."),
                    editor = this.getEditor(dataField);
                if (editor) {
                    editor.option("value", args.value)
                } else {
                    this._triggerOnFieldDataChanged({
                        dataField: dataField,
                        value: args.value
                    })
                }
        }
    },
    _getItemPath: function(nameParts) {
        var i, itemPath = nameParts[0];
        for (i = 1; i < nameParts.length; i++) {
            if (nameParts[i].search("items|tabs") !== -1) {
                itemPath += "." + nameParts[i]
            } else {
                break
            }
        }
        return itemPath
    },
    _triggerOnFieldDataChanged: function(args) {
        this._createActionByOption("onFieldDataChanged")(args)
    },
    _triggerOnFieldDataChangedByDataSet: function(data) {
        var that = this;
        if (data && typeUtils.isObject(data)) {
            each(data, function(dataField, value) {
                that._triggerOnFieldDataChanged({
                    dataField: dataField,
                    value: value
                })
            })
        }
    },
    _updateFieldValue: function(dataField, value) {
        if (typeUtils.isDefined(this.option("formData"))) {
            var editor = this.getEditor(dataField);
            this.option("formData." + dataField, value);
            if (editor) {
                var editorValue = editor.option("value");
                if (editorValue !== value) {
                    editor.option("value", value)
                }
            }
        }
    },
    _generateItemsFromData: function(items) {
        var formData = this.option("formData"),
            result = [];
        if (!items && typeUtils.isDefined(formData)) {
            each(formData, function(dataField) {
                result.push({
                    dataField: dataField
                })
            })
        }
        if (items) {
            each(items, function(index, item) {
                if (typeUtils.isObject(item)) {
                    result.push(item)
                } else {
                    result.push({
                        dataField: item
                    })
                }
            })
        }
        return result
    },
    _getItemByField: function(field, items) {
        var resultItem, that = this,
            fieldParts = typeUtils.isObject(field) ? field : that._getFieldParts(field),
            fieldName = fieldParts.fieldName,
            fieldPath = fieldParts.fieldPath;
        if (items.length) {
            each(items, function(index, item) {
                var itemType = item.itemType;
                if (fieldPath.length) {
                    var path = fieldPath.slice();
                    item = that._getItemByFieldPath(path, fieldName, item)
                } else {
                    if ("group" === itemType && !(item.caption || item.name) || "tabbed" === itemType) {
                        var subItemsField = that._getSubItemField(itemType);
                        item.items = that._generateItemsFromData(item.items);
                        item = that._getItemByField({
                            fieldName: fieldName,
                            fieldPath: fieldPath
                        }, item[subItemsField])
                    }
                }
                if (that._isExpectedItem(item, fieldName)) {
                    resultItem = item;
                    return false
                }
            })
        }
        return resultItem
    },
    _getFieldParts: function(field) {
        var fieldSeparator = ".",
            fieldName = field,
            separatorIndex = fieldName.indexOf(fieldSeparator),
            resultPath = [];
        while (separatorIndex !== -1) {
            resultPath.push(fieldName.substr(0, separatorIndex));
            fieldName = fieldName.substr(separatorIndex + 1);
            separatorIndex = fieldName.indexOf(fieldSeparator)
        }
        return {
            fieldName: fieldName,
            fieldPath: resultPath.reverse()
        }
    },
    _getItemByFieldPath: function(path, fieldName, item) {
        var result, that = this,
            itemType = item.itemType,
            subItemsField = that._getSubItemField(itemType),
            isItemWithSubItems = "group" === itemType || "tabbed" === itemType || item.title;
        do {
            if (isItemWithSubItems) {
                var pathNode, name = item.name || item.caption || item.title,
                    isGroupWithName = typeUtils.isDefined(name),
                    nameWithoutSpaces = that._getTextWithoutSpaces(name);
                item[subItemsField] = that._generateItemsFromData(item[subItemsField]);
                if (isGroupWithName) {
                    pathNode = path.pop()
                }
                if (!path.length) {
                    result = that._getItemByField(fieldName, item[subItemsField]);
                    if (result) {
                        break
                    }
                }
                if (!isGroupWithName || isGroupWithName && nameWithoutSpaces === pathNode) {
                    if (path.length) {
                        result = that._searchItemInEverySubItem(path, fieldName, item[subItemsField])
                    }
                }
            } else {
                break
            }
        } while (path.length && !typeUtils.isDefined(result));
        return result
    },
    _getSubItemField: function(itemType) {
        return "tabbed" === itemType ? "tabs" : "items"
    },
    _searchItemInEverySubItem: function(path, fieldName, items) {
        var result, that = this;
        each(items, function(index, groupItem) {
            result = that._getItemByFieldPath(path.slice(), fieldName, groupItem);
            if (result) {
                return false
            }
        });
        if (!result) {
            result = false
        }
        return result
    },
    _getTextWithoutSpaces: function(text) {
        return text ? text.replace(/\s/g, "") : void 0
    },
    _isExpectedItem: function(item, fieldName) {
        return item && (item.dataField === fieldName || item.name === fieldName || this._getTextWithoutSpaces(item.title) === fieldName || "group" === item.itemType && this._getTextWithoutSpaces(item.caption) === fieldName)
    },
    _changeItemOption: function(item, option, value) {
        if (typeUtils.isObject(item)) {
            item[option] = value
        }
    },
    _dimensionChanged: function() {
        var currentScreenFactor = this._getCurrentScreenFactor();
        if (this._lastMarkupScreenFactor !== currentScreenFactor) {
            if (this._isColCountChanged(this._lastMarkupScreenFactor, currentScreenFactor)) {
                this._targetScreenFactor = currentScreenFactor;
                this._refresh();
                this._targetScreenFactor = void 0
            }
            this._lastMarkupScreenFactor = currentScreenFactor
        }
    },
    _isColCountChanged: function(oldScreenSize, newScreenSize) {
        var isChanged = false;
        each(this._cachedColCountOptions, function(index, item) {
            if (item.colCountByScreen[oldScreenSize] !== item.colCountByScreen[newScreenSize]) {
                isChanged = true;
                return false
            }
        });
        return isChanged
    },
    _refresh: function() {
        var editorSelector = "." + FOCUSED_STATE_CLASS + " input, ." + FOCUSED_STATE_CLASS + " textarea";
        eventsEngine.trigger(this.$element().find(editorSelector), "change");
        this.callBase()
    },
    _resetValues: function() {
        var validationGroup = this._getValidationGroup(),
            validationGroupConfig = ValidationEngine.getGroupConfig(validationGroup);
        validationGroupConfig && validationGroupConfig.reset();
        this._itemsRunTimeInfo.each(function(_, itemRunTimeInfo) {
            if (typeUtils.isDefined(itemRunTimeInfo.widgetInstance) && typeUtils.isDefined(itemRunTimeInfo.item) && "button" !== itemRunTimeInfo.item.itemType) {
                itemRunTimeInfo.widgetInstance.reset();
                itemRunTimeInfo.widgetInstance.option("isValid", true)
            }
        })
    },
    _updateData: function(data, value, isComplexData) {
        var that = this,
            _data = isComplexData ? value : data;
        if (typeUtils.isObject(_data)) {
            each(_data, function(dataField, fieldValue) {
                that._updateData(isComplexData ? data + "." + dataField : dataField, fieldValue, typeUtils.isObject(fieldValue))
            })
        } else {
            if (typeUtils.isString(data)) {
                that._updateFieldValue(data, value)
            }
        }
    },
    registerKeyHandler: function(key, handler) {
        this.callBase(key, handler);
        this._itemsRunTimeInfo.each(function(_, itemRunTimeInfo) {
            if (typeUtils.isDefined(itemRunTimeInfo.widgetInstance)) {
                itemRunTimeInfo.widgetInstance.registerKeyHandler(key, handler)
            }
        })
    },
    _focusTarget: function() {
        return this.$element().find("." + FIELD_ITEM_CONTENT_CLASS + " [tabindex]").first()
    },
    _visibilityChanged: function(visible) {
        if (visible && browser.msie) {
            this._refresh()
        }
    },
    resetValues: function() {
        this._resetValues()
    },
    updateData: function(data, value) {
        this._updateData(data, value)
    },
    getEditor: function(dataField) {
        return this._itemsRunTimeInfo.findWidgetInstanceByDataField(dataField) || this._itemsRunTimeInfo.findWidgetInstanceByName(dataField)
    },
    getButton: function(name) {
        return this._itemsRunTimeInfo.findWidgetInstanceByName(name)
    },
    updateDimensions: function() {
        var that = this,
            deferred = new Deferred;
        if (that._scrollable) {
            that._scrollable.update().done(function() {
                deferred.resolveWith(that)
            })
        } else {
            deferred.resolveWith(that)
        }
        return deferred.promise()
    },
    itemOption: function(id, option, value) {
        var that = this,
            argsCount = arguments.length,
            items = that._generateItemsFromData(that.option("items")),
            item = that._getItemByField(id, items);
        switch (argsCount) {
            case 1:
                return item;
            case 3:
                that._changeItemOption(item, option, value);
                break;
            default:
                if (typeUtils.isObject(option)) {
                    each(option, function(optionName, optionValue) {
                        that._changeItemOption(item, optionName, optionValue)
                    })
                }
        }
        this.option("items", items)
    },
    validate: function() {
        try {
            return ValidationEngine.validateGroup(this._getValidationGroup())
        } catch (e) {
            errors.log("E1036", e.message)
        }
    },
    getItemID: function(name) {
        return "dx_" + this.option("formID") + "_" + (name || new Guid)
    },
    getTargetScreenFactor: function() {
        return this._targetScreenFactor
    }
});
registerComponent("dxForm", Form);
module.exports = Form;
