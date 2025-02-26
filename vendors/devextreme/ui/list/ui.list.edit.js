/**
 * DevExtreme (ui/list/ui.list.edit.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _renderer = require("../../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _utils = require("../../events/utils");
var _extend = require("../../core/utils/extend");
var _uiListEditStrategy = require("./ui.list.edit.strategy.grouped");
var _uiListEditStrategy2 = _interopRequireDefault(_uiListEditStrategy);
var _message = require("../../localization/message");
var _uiListEdit = require("./ui.list.edit.provider");
var _uiListEdit2 = _interopRequireDefault(_uiListEdit);
var _uiList = require("./ui.list.base");
var _uiList2 = _interopRequireDefault(_uiList);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var LIST_ITEM_SELECTED_CLASS = "dx-list-item-selected";
var LIST_ITEM_RESPONSE_WAIT_CLASS = "dx-list-item-response-wait";
var ListEdit = _uiList2.default.inherit({
    _supportedKeys: function() {
        var that = this;
        var parent = this.callBase();
        var deleteFocusedItem = function(e) {
            if (that.option("allowItemDeleting")) {
                e.preventDefault();
                that.deleteItem(that.option("focusedElement"))
            }
        };
        var moveFocusedItemUp = function(e) {
            var focusedItemIndex = that._editStrategy.getNormalizedIndex(that.option("focusedElement"));
            if (e.shiftKey && that.option("allowItemReordering")) {
                e.preventDefault();
                var $prevItem = that._editStrategy.getItemElement(focusedItemIndex - 1);
                that.reorderItem(that.option("focusedElement"), $prevItem);
                that.scrollToItem(that.option("focusedElement"))
            } else {
                if (0 === focusedItemIndex && this._editProvider.handleKeyboardEvents(focusedItemIndex, false)) {
                    return
                } else {
                    this._editProvider.handleKeyboardEvents(focusedItemIndex, true)
                }
                parent.upArrow(e)
            }
        };
        var moveFocusedItemDown = function(e) {
            var focusedItemIndex = that._editStrategy.getNormalizedIndex(that.option("focusedElement"));
            var isLastIndexFocused = focusedItemIndex === this._getLastItemIndex();
            if (isLastIndexFocused && this._isDataSourceLoading()) {
                return
            }
            if (e.shiftKey && that.option("allowItemReordering")) {
                e.preventDefault();
                var $nextItem = that._editStrategy.getItemElement(focusedItemIndex + 1);
                that.reorderItem(that.option("focusedElement"), $nextItem);
                that.scrollToItem(that.option("focusedElement"))
            } else {
                if (isLastIndexFocused && this._editProvider.handleKeyboardEvents(focusedItemIndex, false)) {
                    return
                } else {
                    this._editProvider.handleKeyboardEvents(focusedItemIndex, true)
                }
                parent.downArrow(e)
            }
        };
        var enter = function(e) {
            if (!this._editProvider.handleEnterPressing()) {
                parent.enter.apply(this, arguments)
            }
        };
        var space = function(e) {
            if (!this._editProvider.handleEnterPressing()) {
                parent.space.apply(this, arguments)
            }
        };
        return (0, _extend.extend)({}, parent, {
            del: deleteFocusedItem,
            upArrow: moveFocusedItemUp,
            downArrow: moveFocusedItemDown,
            enter: enter,
            space: space
        })
    },
    _updateSelection: function() {
        this._editProvider.afterItemsRendered();
        this.callBase()
    },
    _getLastItemIndex: function() {
        return this._itemElements().length - 1
    },
    _refreshItemElements: function() {
        this.callBase();
        var excludedSelectors = this._editProvider.getExcludedItemSelectors();
        if (excludedSelectors.length) {
            this._itemElementsCache = this._itemElementsCache.not(excludedSelectors)
        }
    },
    _getDefaultOptions: function() {
        return (0, _extend.extend)(this.callBase(), {
            showSelectionControls: false,
            selectionMode: "none",
            selectAllMode: "page",
            onSelectAllValueChanged: null,
            selectAllText: (0, _message.format)("dxList-selectAll"),
            menuItems: [],
            menuMode: "context",
            allowItemDeleting: false,
            itemDeleteMode: "static",
            allowItemReordering: false
        })
    },
    _defaultOptionsRules: function() {
        return this.callBase().concat([{
            device: function(_device) {
                return "ios" === _device.platform
            },
            options: {
                menuMode: "slide",
                itemDeleteMode: "slideItem"
            }
        }, {
            device: {
                platform: "android"
            },
            options: {
                itemDeleteMode: "swipe"
            }
        }, {
            device: {
                platform: "win"
            },
            options: {
                itemDeleteMode: "context"
            }
        }])
    },
    _init: function() {
        this.callBase();
        this._initEditProvider()
    },
    _initDataSource: function() {
        this.callBase();
        if (!this._isPageSelectAll()) {
            this._dataSource && this._dataSource.requireTotalCount(true)
        }
    },
    _isPageSelectAll: function() {
        return "page" === this.option("selectAllMode")
    },
    _initEditProvider: function() {
        this._editProvider = new _uiListEdit2.default(this)
    },
    _disposeEditProvider: function() {
        if (this._editProvider) {
            this._editProvider.dispose()
        }
    },
    _refreshEditProvider: function() {
        this._disposeEditProvider();
        this._initEditProvider()
    },
    _initEditStrategy: function() {
        if (this.option("grouped")) {
            this._editStrategy = new _uiListEditStrategy2.default(this)
        } else {
            this.callBase()
        }
    },
    _initMarkup: function() {
        this._refreshEditProvider();
        this.callBase()
    },
    _renderItems: function() {
        this.callBase.apply(this, arguments);
        this._editProvider.afterItemsRendered()
    },
    _selectedItemClass: function() {
        return LIST_ITEM_SELECTED_CLASS
    },
    _itemResponseWaitClass: function() {
        return LIST_ITEM_RESPONSE_WAIT_CLASS
    },
    _itemClickHandler: function(e) {
        var $itemElement = (0, _renderer2.default)(e.currentTarget);
        if ($itemElement.is(".dx-state-disabled, .dx-state-disabled *")) {
            return
        }
        var handledByEditProvider = this._editProvider.handleClick($itemElement, e);
        if (handledByEditProvider) {
            return
        }
        this.callBase.apply(this, arguments)
    },
    _shouldFireContextMenuEvent: function() {
        return this.callBase.apply(this, arguments) || this._editProvider.contextMenuHandlerExists()
    },
    _itemHoldHandler: function(e) {
        var $itemElement = (0, _renderer2.default)(e.currentTarget);
        if ($itemElement.is(".dx-state-disabled, .dx-state-disabled *")) {
            return
        }
        var handledByEditProvider = (0, _utils.isTouchEvent)(e) && this._editProvider.handleContextMenu($itemElement, e);
        if (handledByEditProvider) {
            e.handledByEditProvider = true;
            return
        }
        this.callBase.apply(this, arguments)
    },
    _itemContextMenuHandler: function(e) {
        var $itemElement = (0, _renderer2.default)(e.currentTarget);
        if ($itemElement.is(".dx-state-disabled, .dx-state-disabled *")) {
            return
        }
        var handledByEditProvider = !e.handledByEditProvider && this._editProvider.handleContextMenu($itemElement, e);
        if (handledByEditProvider) {
            e.preventDefault();
            return
        }
        this.callBase.apply(this, arguments)
    },
    _postprocessRenderItem: function(args) {
        this.callBase.apply(this, arguments);
        this._editProvider.modifyItemElement(args)
    },
    _clean: function() {
        this._disposeEditProvider();
        this.callBase()
    },
    focusListItem: function(index) {
        var $item = this._editStrategy.getItemElement(index);
        this.option("focusedElement", $item);
        this.focus();
        this.scrollToItem(this.option("focusedElement"))
    },
    _optionChanged: function(args) {
        switch (args.name) {
            case "selectAllMode":
                this._initDataSource();
                this._dataSource.pageIndex(0);
                this._dataSource.load();
                break;
            case "grouped":
                this._clearSelectedItems();
                delete this._renderingGroupIndex;
                this._initEditStrategy();
                this.callBase(args);
                break;
            case "showSelectionControls":
            case "menuItems":
            case "menuMode":
            case "allowItemDeleting":
            case "itemDeleteMode":
            case "allowItemReordering":
            case "selectAllText":
                this._invalidate();
                break;
            case "onSelectAllValueChanged":
                break;
            default:
                this.callBase(args)
        }
    },
    selectAll: function() {
        return this._selection.selectAll(this._isPageSelectAll())
    },
    unselectAll: function() {
        return this._selection.deselectAll(this._isPageSelectAll())
    },
    isSelectAll: function() {
        return this._selection.getSelectAllState(this._isPageSelectAll())
    },
    getFlatIndexByItemElement: function(itemElement) {
        return this._itemElements().index(itemElement)
    },
    getItemElementByFlatIndex: function(flatIndex) {
        var $itemElements = this._itemElements();
        if (flatIndex < 0 || flatIndex >= $itemElements.length) {
            return (0, _renderer2.default)()
        }
        return $itemElements.eq(flatIndex)
    },
    getItemByIndex: function(index) {
        return this._editStrategy.getItemDataByIndex(index)
    }
});
module.exports = ListEdit;
