/**
 * DevExtreme (ui/grid_core/ui.grid_core.virtual_scrolling_core.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _renderer = require("../../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _window = require("../../core/utils/window");
var _events_engine = require("../../events/core/events_engine");
var _events_engine2 = _interopRequireDefault(_events_engine);
var _browser = require("../../core/utils/browser");
var _browser2 = _interopRequireDefault(_browser);
var _type = require("../../core/utils/type");
var _position = require("../../animation/position");
var _position2 = _interopRequireDefault(_position);
var _iterator = require("../../core/utils/iterator");
var _class = require("../../core/class");
var _class2 = _interopRequireDefault(_class);
var _deferred = require("../../core/utils/deferred");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var SCROLLING_MODE_INFINITE = "infinite",
    SCROLLING_MODE_VIRTUAL = "virtual";
var isVirtualMode = function(that) {
    return that.option("scrolling.mode") === SCROLLING_MODE_VIRTUAL || that._isVirtual
};
var isAppendMode = function(that) {
    return that.option("scrolling.mode") === SCROLLING_MODE_INFINITE && !that._isVirtual
};
exports.getPixelRatio = function(window) {
    return window.devicePixelRatio || 1
};
exports.getContentHeightLimit = function(browser) {
    if (browser.msie) {
        return 4e6
    } else {
        if (browser.mozilla) {
            return 8e6
        }
    }
    return 15e6 / exports.getPixelRatio((0, _window.getWindow)())
};
exports.subscribeToExternalScrollers = function($element, scrollChangedHandler, $targetElement) {
    var $scrollElement, scrollableArray = [],
        scrollToArray = [],
        disposeArray = [];
    $targetElement = $targetElement || $element;

    function getElementOffset(scrollable) {
        var $scrollableElement = scrollable.element ? scrollable.$element() : scrollable,
            scrollableOffset = _position2.default.offset($scrollableElement);
        if (!scrollableOffset) {
            return $element.offset().top
        }
        return scrollable.scrollTop() - (scrollableOffset.top - $element.offset().top)
    }

    function createWindowScrollHandler(scrollable) {
        return function() {
            var scrollTop = scrollable.scrollTop() - getElementOffset(scrollable);
            scrollTop = scrollTop > 0 ? scrollTop : 0;
            scrollChangedHandler(scrollTop)
        }
    }
    var widgetScrollStrategy = {
        on: function(scrollable, eventName, handler) {
            scrollable.on("scroll", handler)
        },
        off: function(scrollable, eventName, handler) {
            scrollable.off("scroll", handler)
        }
    };

    function subscribeToScrollEvents($scrollElement) {
        var isDocument = "#document" === $scrollElement.get(0).nodeName;
        var scrollable = $scrollElement.data("dxScrollable");
        var eventsStrategy = widgetScrollStrategy;
        if (!scrollable) {
            scrollable = isDocument && (0, _renderer2.default)((0, _window.getWindow)()) || "auto" === $scrollElement.css("overflowY") && $scrollElement;
            eventsStrategy = _events_engine2.default;
            if (!scrollable) {
                return
            }
        }
        var handler = createWindowScrollHandler(scrollable);
        eventsStrategy.on(scrollable, "scroll", handler);
        scrollToArray.push(function(pos) {
            var topOffset = getElementOffset(scrollable),
                scrollMethod = scrollable.scrollTo ? "scrollTo" : "scrollTop";
            if (pos - topOffset >= 0) {
                scrollable[scrollMethod](pos + topOffset)
            }
        });
        scrollableArray.push(scrollable);
        disposeArray.push(function() {
            eventsStrategy.off(scrollable, "scroll", handler)
        })
    }
    for ($scrollElement = $targetElement.parent(); $scrollElement.length; $scrollElement = $scrollElement.parent()) {
        subscribeToScrollEvents($scrollElement)
    }
    return {
        scrollTo: function(pos) {
            (0, _iterator.each)(scrollToArray, function(_, scrollTo) {
                scrollTo(pos)
            })
        },
        dispose: function() {
            (0, _iterator.each)(disposeArray, function(_, dispose) {
                dispose()
            })
        }
    }
};
exports.VirtualScrollController = _class2.default.inherit(function() {
    var getViewportPageCount = function(that) {
        var pageSize = that._dataSource.pageSize(),
            preventPreload = that.option("scrolling.preventPreload");
        if (preventPreload) {
            return 0
        }
        var realViewportSize = that._viewportSize;
        if (isVirtualMode(that) && false === that.option("legacyRendering") && that.option("scrolling.removeInvisiblePages")) {
            realViewportSize = 0;
            var viewportSize = that._viewportSize * that._viewportItemSize;
            var offset = that.getContentOffset();
            var position = that._position || 0;
            var virtualItemsCount = that.virtualItemsCount();
            var totalItemsCount = that._dataSource.totalItemsCount();
            for (var itemIndex = virtualItemsCount.begin; itemIndex < totalItemsCount; itemIndex++) {
                if (offset >= position + viewportSize) {
                    break
                }
                var itemSize = that._itemSizes[itemIndex] || that._viewportItemSize;
                offset += itemSize;
                if (offset >= position) {
                    realViewportSize++
                }
            }
        }
        return pageSize && realViewportSize > 0 ? Math.ceil(realViewportSize / pageSize) : 1
    };
    var getPreloadPageCount = function(that, previous) {
        var preloadEnabled = that.option("scrolling.preloadEnabled"),
            pageCount = getViewportPageCount(that);
        if (pageCount) {
            if (previous) {
                pageCount = preloadEnabled ? 1 : 0
            } else {
                if (preloadEnabled) {
                    pageCount++
                }
                if (isAppendMode(that)) {
                    pageCount--
                }
            }
        }
        return pageCount
    };
    var getPageIndexForLoad = function(that) {
        var needToLoadNextPage, needToLoadPrevPage, needToLoadPageBeforeLast, result = -1,
            beginPageIndex = getBeginPageIndex(that),
            dataSource = that._dataSource;
        if (beginPageIndex < 0) {
            result = that._pageIndex
        } else {
            if (!that._cache[that._pageIndex - beginPageIndex]) {
                if (that._loadingPageIndex !== that._pageIndex || that._isVirtual) {
                    result = that._pageIndex
                }
            } else {
                if (beginPageIndex >= 0 && that._viewportSize >= 0) {
                    if (beginPageIndex > 0) {
                        needToLoadPageBeforeLast = getEndPageIndex(that) + 1 === dataSource.pageCount() && that._cache.length < getPreloadPageCount(that) + 1;
                        needToLoadPrevPage = needToLoadPageBeforeLast || that._pageIndex === beginPageIndex && getPreloadPageCount(that, true);
                        if (needToLoadPrevPage) {
                            result = beginPageIndex - 1
                        }
                    }
                    if (result < 0) {
                        needToLoadNextPage = beginPageIndex + that._cache.length <= that._pageIndex + getPreloadPageCount(that);
                        if (needToLoadNextPage) {
                            result = beginPageIndex + that._cache.length
                        }
                    }
                }
            }
        }
        return result
    };
    var getBeginPageIndex = function(that) {
        return that._cache.length ? that._cache[0].pageIndex : -1
    };
    var getEndPageIndex = function(that) {
        return that._cache.length ? that._cache[that._cache.length - 1].pageIndex : -1
    };
    var fireChanged = function(that, changed, args) {
        that._isChangedFiring = true;
        changed(args);
        that._isChangedFiring = false
    };
    var processDelayChanged = function(that, changed, args) {
        if (that._isDelayChanged) {
            that._isDelayChanged = false;
            fireChanged(that, changed, args);
            return true
        }
    };
    var processChanged = function(that, changed, changeType, isDelayChanged, removeCacheItem) {
        var dataSource = that._dataSource,
            items = dataSource.items().slice(),
            change = (0, _type.isObject)(changeType) ? changeType : void 0,
            isPrepend = "prepend" === changeType,
            viewportItems = dataSource.viewportItems();
        if (changeType && (0, _type.isString)(changeType) && !that._isDelayChanged) {
            change = {
                changeType: changeType,
                items: items
            };
            if (removeCacheItem) {
                change.removeCount = removeCacheItem.itemsCount;
                if (change.removeCount && dataSource.correctCount) {
                    change.removeCount = dataSource.correctCount(viewportItems, change.removeCount, isPrepend)
                }
            }
        }
        var removeItemCount = removeCacheItem ? removeCacheItem.itemsLength : 0;
        if (removeItemCount && dataSource.correctCount) {
            removeItemCount = dataSource.correctCount(viewportItems, removeItemCount, isPrepend)
        }
        if ("append" === changeType) {
            viewportItems.push.apply(viewportItems, items);
            if (removeCacheItem) {
                viewportItems.splice(0, removeItemCount)
            }
        } else {
            if (isPrepend) {
                viewportItems.unshift.apply(viewportItems, items);
                if (removeCacheItem) {
                    viewportItems.splice(-removeItemCount)
                }
            } else {
                that._dataSource.viewportItems(items)
            }
        }
        dataSource.updateLoading();
        that._lastPageIndex = that.pageIndex();
        that._isDelayChanged = isDelayChanged;
        if (!isDelayChanged) {
            fireChanged(that, changed, change)
        }
    };
    var loadCore = function(that, pageIndex) {
        var dataSource = that._dataSource;
        if (pageIndex === that.pageIndex() || !dataSource.isLoading() && pageIndex < dataSource.pageCount() || !dataSource.hasKnownLastPage() && pageIndex === dataSource.pageCount()) {
            dataSource.pageIndex(pageIndex);
            that._loadingPageIndex = pageIndex;
            return (0, _deferred.when)(dataSource.load()).always(function() {
                that._loadingPageIndex = -1
            })
        }
    };
    return {
        ctor: function(component, dataSource, isVirtual) {
            var that = this;
            that._dataSource = dataSource;
            that.component = component;
            that._pageIndex = that._lastPageIndex = dataSource.pageIndex();
            that._viewportSize = 0;
            that._viewportItemSize = 20;
            that._viewportItemIndex = -1;
            that._itemSizes = {};
            that._sizeRatio = 1;
            that._items = [];
            that._cache = [];
            that._isVirtual = isVirtual;
            that._loadingPageIndex = -1
        },
        getItemSizes: function() {
            return this._itemSizes
        },
        option: function() {
            return this.component.option.apply(this.component, arguments)
        },
        virtualItemsCount: function() {
            var pageIndex, beginItemsCount, endItemsCount, that = this,
                itemsCount = 0;
            if (isVirtualMode(that)) {
                pageIndex = getBeginPageIndex(that);
                if (pageIndex < 0) {
                    pageIndex = that._dataSource.pageIndex()
                }
                beginItemsCount = pageIndex * that._dataSource.pageSize();
                itemsCount = that._cache.length * that._dataSource.pageSize();
                endItemsCount = Math.max(0, that._dataSource.totalItemsCount() - itemsCount - beginItemsCount);
                return {
                    begin: beginItemsCount,
                    end: endItemsCount
                }
            }
        },
        setViewportPosition: function(position) {
            var that = this,
                result = new _deferred.Deferred,
                scrollingTimeout = Math.min(that.option("scrolling.timeout") || 0, that._dataSource.changingDuration());
            if (scrollingTimeout < that.option("scrolling.renderingThreshold")) {
                scrollingTimeout = that.option("scrolling.minTimeout") || 0
            }
            clearTimeout(that._scrollTimeoutID);
            if (scrollingTimeout > 0) {
                that._scrollTimeoutID = setTimeout(function() {
                    that._setViewportPositionCore(position);
                    result.resolve()
                }, scrollingTimeout)
            } else {
                that._setViewportPositionCore(position);
                result.resolve()
            }
            return result.promise()
        },
        getViewportPosition: function() {
            return this._position || 0
        },
        getItemIndexByPosition: function() {
            var itemSize, that = this,
                position = that._position,
                defaultItemSize = that.getItemSize(),
                offset = 0,
                itemOffset = 0;
            var itemOffsetsWithSize = Object.keys(that._itemSizes).concat(-1);
            for (var i = 0; i < itemOffsetsWithSize.length && offset < position; i++) {
                var itemOffsetWithSize = parseInt(itemOffsetsWithSize[i]);
                var itemOffsetDiff = (position - offset) / defaultItemSize;
                if (itemOffsetWithSize < 0 || itemOffset + itemOffsetDiff < itemOffsetWithSize) {
                    itemOffset += itemOffsetDiff;
                    break
                } else {
                    itemOffsetDiff = itemOffsetWithSize - itemOffset;
                    offset += itemOffsetDiff * defaultItemSize;
                    itemOffset += itemOffsetDiff
                }
                itemSize = that._itemSizes[itemOffsetWithSize];
                offset += itemSize;
                itemOffset += offset < position ? 1 : (position - offset + itemSize) / itemSize
            }
            return Math.round(50 * itemOffset) / 50
        },
        _setViewportPositionCore: function(position) {
            this._position = position;
            var itemIndex = this.getItemIndexByPosition();
            return this.setViewportItemIndex(itemIndex)
        },
        setContentSize: function(size) {
            var that = this,
                sizes = Array.isArray(size) && size,
                virtualItemsCount = that.virtualItemsCount();
            if (sizes) {
                size = sizes.reduce(function(a, b) {
                    return a + b
                }, 0)
            }
            that._contentSize = size;
            if (virtualItemsCount) {
                if (sizes) {
                    sizes.forEach(function(size, index) {
                        that._itemSizes[virtualItemsCount.begin + index] = size
                    })
                }
                var virtualContentSize = (virtualItemsCount.begin + virtualItemsCount.end + that.itemsCount()) * that._viewportItemSize;
                var contentHeightLimit = exports.getContentHeightLimit(_browser2.default);
                if (virtualContentSize > contentHeightLimit) {
                    that._sizeRatio = contentHeightLimit / virtualContentSize
                } else {
                    that._sizeRatio = 1
                }
            }
        },
        getItemSize: function() {
            return this._viewportItemSize * this._sizeRatio
        },
        getItemOffset: function(itemIndex, isEnd) {
            var that = this,
                virtualItemsCount = that.virtualItemsCount(),
                itemCount = itemIndex;
            if (!virtualItemsCount) {
                return 0
            }
            var offset = 0,
                totalItemsCount = that._dataSource.totalItemsCount();
            Object.keys(that._itemSizes).forEach(function(currentItemIndex) {
                if (!itemCount) {
                    return
                }
                if (isEnd ? currentItemIndex >= totalItemsCount - itemIndex : currentItemIndex < itemIndex) {
                    offset += that._itemSizes[currentItemIndex];
                    itemCount--
                }
            });
            return Math.floor(offset + itemCount * that._viewportItemSize * that._sizeRatio)
        },
        getContentOffset: function(type) {
            var isEnd = "end" === type,
                virtualItemsCount = this.virtualItemsCount();
            if (!virtualItemsCount) {
                return 0
            }
            return this.getItemOffset(isEnd ? virtualItemsCount.end : virtualItemsCount.begin, isEnd)
        },
        getVirtualContentSize: function() {
            var that = this,
                virtualItemsCount = that.virtualItemsCount();
            return virtualItemsCount ? that.getContentOffset("begin") + that.getContentOffset("end") + that._contentSize : 0
        },
        getViewportItemIndex: function() {
            return this._viewportItemIndex
        },
        setViewportItemIndex: function(itemIndex) {
            var lastPageSize, maxPageIndex, newPageIndex, that = this,
                pageSize = that._dataSource.pageSize(),
                pageCount = that._dataSource.pageCount(),
                virtualMode = isVirtualMode(that),
                appendMode = isAppendMode(that),
                totalItemsCount = that._dataSource.totalItemsCount(),
                needLoad = that._viewportItemIndex < 0;
            that._viewportItemIndex = itemIndex;
            if (pageSize && (virtualMode || appendMode) && totalItemsCount >= 0) {
                if (that._viewportSize && itemIndex + that._viewportSize >= totalItemsCount && !that._isVirtual) {
                    if (that._dataSource.hasKnownLastPage()) {
                        newPageIndex = pageCount - 1;
                        lastPageSize = totalItemsCount % pageSize;
                        if (newPageIndex > 0 && lastPageSize > 0 && lastPageSize < pageSize / 2) {
                            newPageIndex--
                        }
                    } else {
                        newPageIndex = pageCount
                    }
                } else {
                    newPageIndex = Math.floor(itemIndex / pageSize);
                    maxPageIndex = pageCount - 1;
                    newPageIndex = Math.max(newPageIndex, 0);
                    newPageIndex = Math.min(newPageIndex, maxPageIndex)
                }
                if (that.pageIndex() !== newPageIndex || needLoad) {
                    that.pageIndex(newPageIndex)
                }
                return that.load()
            }
        },
        viewportItemSize: function(size) {
            if (void 0 !== size) {
                this._viewportItemSize = size
            }
            return this._viewportItemSize
        },
        viewportSize: function(size) {
            if (void 0 !== size) {
                this._viewportSize = size
            }
            return this._viewportSize
        },
        pageIndex: function(_pageIndex) {
            if (isVirtualMode(this) || isAppendMode(this)) {
                if (void 0 !== _pageIndex) {
                    this._pageIndex = _pageIndex
                }
                return this._pageIndex
            } else {
                return this._dataSource.pageIndex(_pageIndex)
            }
        },
        beginPageIndex: function beginPageIndex(defaultPageIndex) {
            var beginPageIndex = getBeginPageIndex(this);
            if (beginPageIndex < 0) {
                beginPageIndex = void 0 !== defaultPageIndex ? defaultPageIndex : this.pageIndex()
            }
            return beginPageIndex
        },
        endPageIndex: function endPageIndex() {
            var endPageIndex = getEndPageIndex(this);
            return endPageIndex > 0 ? endPageIndex : this._lastPageIndex
        },
        pageSize: function() {
            return this._dataSource.pageSize()
        },
        load: function() {
            var pageIndexForLoad, loadResult, result, that = this,
                dataSource = that._dataSource;
            if (isVirtualMode(that) || isAppendMode(that)) {
                pageIndexForLoad = getPageIndexForLoad(that);
                if (pageIndexForLoad >= 0) {
                    loadResult = loadCore(that, pageIndexForLoad);
                    if (loadResult) {
                        result = new _deferred.Deferred;
                        loadResult.done(function() {
                            var delayDeferred = that._delayDeferred;
                            if (delayDeferred) {
                                delayDeferred.done(result.resolve).fail(result.reject)
                            } else {
                                result.resolve()
                            }
                        }).fail(result.reject);
                        dataSource.updateLoading()
                    }
                }
            } else {
                result = dataSource.load()
            }
            if (!result && that._lastPageIndex !== that.pageIndex()) {
                that._dataSource.onChanged({
                    changeType: "pageIndex"
                })
            }
            return result || (new _deferred.Deferred).resolve()
        },
        loadIfNeed: function() {
            var that = this;
            if ((isVirtualMode(that) || isAppendMode(that)) && !that._dataSource.isLoading() && (!that._isChangedFiring || that._isVirtual)) {
                var position = that.getViewportPosition();
                if (position > 0) {
                    that._setViewportPositionCore(position)
                } else {
                    that.load()
                }
            }
        },
        handleDataChanged: function(callBase, e) {
            var beginPageIndex, changeType, removeInvisiblePages, cacheItem, that = this,
                dataSource = that._dataSource,
                lastCacheLength = that._cache.length;
            if (e && e.changes) {
                fireChanged(that, callBase, e)
            } else {
                if (isVirtualMode(that) || isAppendMode(that)) {
                    beginPageIndex = getBeginPageIndex(that);
                    if (beginPageIndex >= 0) {
                        if (isVirtualMode(that) && beginPageIndex + that._cache.length !== dataSource.pageIndex() && beginPageIndex - 1 !== dataSource.pageIndex()) {
                            lastCacheLength = 0;
                            that._cache = []
                        }
                        if (isAppendMode(that)) {
                            if (0 === dataSource.pageIndex()) {
                                that._cache = []
                            } else {
                                if (dataSource.pageIndex() < getEndPageIndex(that)) {
                                    fireChanged(that, callBase, {
                                        changeType: "append",
                                        items: []
                                    });
                                    return
                                }
                            }
                        }
                    }
                    cacheItem = {
                        pageIndex: dataSource.pageIndex(),
                        itemsLength: dataSource.items(true).length,
                        itemsCount: that.itemsCount(true)
                    };
                    if (!that.option("legacyRendering") && that.option("scrolling.removeInvisiblePages") && isVirtualMode(that)) {
                        removeInvisiblePages = that._cache.length > Math.max(getPreloadPageCount(this) + (that.option("scrolling.preloadEnabled") ? 1 : 0), 2)
                    } else {
                        processDelayChanged(that, callBase, {
                            isDelayed: true
                        })
                    }
                    var removeCacheItem;
                    if (beginPageIndex === dataSource.pageIndex() + 1) {
                        if (removeInvisiblePages) {
                            removeCacheItem = that._cache.pop()
                        }
                        changeType = "prepend";
                        that._cache.unshift(cacheItem)
                    } else {
                        if (removeInvisiblePages) {
                            removeCacheItem = that._cache.shift()
                        }
                        changeType = "append";
                        that._cache.push(cacheItem)
                    }
                    var isDelayChanged = isVirtualMode(that) && 0 === lastCacheLength;
                    processChanged(that, callBase, that._cache.length > 1 ? changeType : void 0, isDelayChanged, removeCacheItem);
                    that._delayDeferred = that.load().done(function() {
                        if (processDelayChanged(that, callBase)) {
                            that.load()
                        }
                    })
                } else {
                    processChanged(that, callBase, e)
                }
            }
        },
        itemsCount: function itemsCount(isBase) {
            var itemsCount = 0;
            if (!isBase && isVirtualMode(this)) {
                (0, _iterator.each)(this._cache, function() {
                    itemsCount += this.itemsCount
                })
            } else {
                itemsCount = this._dataSource.itemsCount()
            }
            return itemsCount
        },
        reset: function(isRefresh) {
            this._cache = [];
            if (!isRefresh) {
                this._itemSizes = {}
            }
        },
        subscribeToWindowScrollEvents: function($element) {
            var that = this;
            that._windowScroll = that._windowScroll || exports.subscribeToExternalScrollers($element, function(scrollTop) {
                if (that.viewportItemSize()) {
                    that.setViewportPosition(scrollTop)
                }
            })
        },
        dispose: function() {
            clearTimeout(this._scrollTimeoutID);
            this._windowScroll && this._windowScroll.dispose();
            this._windowScroll = null
        },
        scrollTo: function(pos) {
            this._windowScroll && this._windowScroll.scrollTo(pos)
        }
    }
}());
