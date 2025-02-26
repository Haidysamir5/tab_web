/**
 * DevExtreme (ui/tree_list/ui.tree_list.base.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _component_registrator = require("../../core/component_registrator");
var _component_registrator2 = _interopRequireDefault(_component_registrator);
var _common = require("../../core/utils/common");
var _common2 = _interopRequireDefault(_common);
var _type = require("../../core/utils/type");
var _type2 = _interopRequireDefault(_type);
var _iterator = require("../../core/utils/iterator");
var _extend = require("../../core/utils/extend");
var _ui = require("../widget/ui.widget");
var _ui2 = _interopRequireDefault(_ui);
var _uiTree_list = require("./ui.tree_list.core");
var _uiTree_list2 = _interopRequireDefault(_uiTree_list);
var _themes = require("../themes");
var _themes2 = _interopRequireDefault(_themes);
require("./ui.tree_list.column_headers");
require("./ui.tree_list.columns_controller");
require("./ui.tree_list.data_controller");
require("./ui.tree_list.sorting");
require("./ui.tree_list.rows");
require("./ui.tree_list.context_menu");
require("./ui.tree_list.error_handling");
require("./ui.tree_list.grid_view");
require("./ui.tree_list.header_panel");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var callModuleItemsMethod = _uiTree_list2.default.callModuleItemsMethod;
var DATAGRID_ROW_SELECTOR = ".dx-row",
    TREELIST_CLASS = "dx-treelist";
_uiTree_list2.default.registerModulesOrder(["stateStoring", "columns", "selection", "editorFactory", "columnChooser", "editing", "grouping", "masterDetail", "validating", "adaptivity", "data", "virtualScrolling", "columnHeaders", "filterRow", "headerPanel", "headerFilter", "sorting", "search", "rows", "pager", "columnsResizingReordering", "contextMenu", "keyboardNavigation", "errorHandling", "summary", "columnFixing", "export", "gridView"]);
var TreeList = _ui2.default.inherit({
    _activeStateUnit: DATAGRID_ROW_SELECTOR,
    _getDefaultOptions: function() {
        var that = this,
            result = that.callBase();
        (0, _iterator.each)(_uiTree_list2.default.modules, function() {
            if (_type2.default.isFunction(this.defaultOptions)) {
                (0, _extend.extend)(true, result, this.defaultOptions())
            }
        });
        return result
    },
    _defaultOptionsRules: function() {
        return this.callBase().concat([{
            device: function() {
                return _themes2.default.isMaterial()
            },
            options: {
                showRowLines: true,
                showColumnLines: false,
                headerFilter: {
                    height: 315
                },
                editing: {
                    useIcons: true
                }
            }
        }])
    },
    _init: function() {
        var that = this;
        that.callBase();
        _uiTree_list2.default.processModules(that, _uiTree_list2.default);
        callModuleItemsMethod(that, "init")
    },
    _clean: _common2.default.noop,
    _optionChanged: function(args) {
        var that = this;
        callModuleItemsMethod(that, "optionChanged", [args]);
        if (!args.handled) {
            that.callBase(args)
        }
    },
    _dimensionChanged: function() {
        this.updateDimensions(true)
    },
    _visibilityChanged: function(visible) {
        if (visible) {
            this.updateDimensions()
        }
    },
    _initMarkup: function() {
        this.callBase.apply(this, arguments);
        this.$element().addClass(TREELIST_CLASS);
        this.getView("gridView").render(this.$element())
    },
    _renderContentImpl: function() {
        this.getView("gridView").update()
    },
    _renderContent: function() {
        var that = this;
        _common2.default.deferRender(function() {
            that._renderContentImpl()
        })
    },
    _dispose: function() {
        var that = this;
        that.callBase();
        callModuleItemsMethod(that, "dispose")
    },
    isReady: function() {
        return this.getController("data").isReady()
    },
    beginUpdate: function() {
        var that = this;
        that.callBase();
        callModuleItemsMethod(that, "beginUpdate")
    },
    endUpdate: function() {
        var that = this;
        callModuleItemsMethod(that, "endUpdate");
        that.callBase()
    },
    getController: function(name) {
        return this._controllers[name]
    },
    getView: function(name) {
        return this._views[name]
    },
    focus: function(element) {
        this.callBase();
        if (_type2.default.isDefined(element)) {
            this.getController("keyboardNavigation").focus(element)
        }
    }
});
TreeList.registerModule = _uiTree_list2.default.registerModule.bind(_uiTree_list2.default);
(0, _component_registrator2.default)("dxTreeList", TreeList);
module.exports = TreeList;
