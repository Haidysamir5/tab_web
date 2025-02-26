/**
 * DevExtreme (data/custom_store.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var $ = require("../core/renderer"),
    dataUtils = require("./utils"),
    arrayUtils = require("./array_utils"),
    isFunction = require("../core/utils/type").isFunction,
    config = require("../core/config"),
    errors = require("./errors").errors,
    Store = require("./abstract_store"),
    arrayQuery = require("./array_query"),
    queryByOptions = require("./store_helper").queryByOptions,
    deferredUtils = require("../core/utils/deferred"),
    Deferred = deferredUtils.Deferred,
    when = deferredUtils.when,
    fromPromise = deferredUtils.fromPromise;
var TOTAL_COUNT = "totalCount",
    LOAD = "load",
    BY_KEY = "byKey",
    INSERT = "insert",
    UPDATE = "update",
    REMOVE = "remove";

function isPromise(obj) {
    return obj && isFunction(obj.then)
}

function trivialPromise(value) {
    return (new Deferred).resolve(value).promise()
}

function ensureRequiredFuncOption(name, obj) {
    if (!isFunction(obj)) {
        throw errors.Error("E4011", name)
    }
}

function throwInvalidUserFuncResult(name) {
    throw errors.Error("E4012", name)
}

function createUserFuncFailureHandler(pendingDeferred) {
    function errorMessageFromXhr(promiseArguments) {
        var xhr = promiseArguments[0],
            textStatus = promiseArguments[1];
        if (!xhr || !xhr.getResponseHeader) {
            return null
        }
        return dataUtils.errorMessageFromXhr(xhr, textStatus)
    }
    return function(arg) {
        var error;
        if (arg instanceof Error) {
            error = arg
        } else {
            error = new Error(errorMessageFromXhr(arguments) || arg && String(arg) || "Unknown error")
        }
        if (error.message !== dataUtils.XHR_ERROR_UNLOAD) {
            pendingDeferred.reject(error)
        }
    }
}

function invokeUserLoad(store, options) {
    var userResult, userFunc = store._loadFunc;
    ensureRequiredFuncOption(LOAD, userFunc);
    userResult = userFunc.apply(store, [options]);
    if (Array.isArray(userResult)) {
        userResult = trivialPromise(userResult)
    } else {
        if (null === userResult || void 0 === userResult) {
            userResult = trivialPromise([])
        } else {
            if (!isPromise(userResult)) {
                throwInvalidUserFuncResult(LOAD)
            }
        }
    }
    return fromPromise(userResult)
}

function invokeUserTotalCountFunc(store, options) {
    var userResult, userFunc = store._totalCountFunc;
    if (!isFunction(userFunc)) {
        throw errors.Error("E4021")
    }
    userResult = userFunc.apply(store, [options]);
    if (!isPromise(userResult)) {
        userResult = Number(userResult);
        if (!isFinite(userResult)) {
            throwInvalidUserFuncResult(TOTAL_COUNT)
        }
        userResult = trivialPromise(userResult)
    }
    return fromPromise(userResult)
}

function invokeUserByKeyFunc(store, key, extraOptions) {
    var userResult, userFunc = store._byKeyFunc;
    ensureRequiredFuncOption(BY_KEY, userFunc);
    userResult = userFunc.apply(store, [key, extraOptions]);
    if (!isPromise(userResult)) {
        userResult = trivialPromise(userResult)
    }
    return fromPromise(userResult)
}

function runRawLoad(pendingDeferred, store, userFuncOptions, continuation) {
    if (store.__rawData) {
        continuation(store.__rawData)
    } else {
        var loadPromise = store.__rawDataPromise || invokeUserLoad(store, userFuncOptions);
        if (store._cacheRawData) {
            store.__rawDataPromise = loadPromise
        }
        loadPromise.always(function() {
            delete store.__rawDataPromise
        }).done(function(rawData) {
            if (store._cacheRawData) {
                store.__rawData = rawData
            }
            continuation(rawData)
        }).fail(createUserFuncFailureHandler(pendingDeferred))
    }
}

function runRawLoadWithQuery(pendingDeferred, store, options, countOnly) {
    options = options || {};
    var userFuncOptions = {};
    if ("userData" in options) {
        userFuncOptions.userData = options.userData
    }
    runRawLoad(pendingDeferred, store, userFuncOptions, function(rawData) {
        var itemsQuery, totalCountQuery, rawDataQuery = arrayQuery(rawData, {
                errorHandler: store._errorHandler
            }),
            waitList = [];
        var items, totalCount;
        if (!countOnly) {
            itemsQuery = queryByOptions(rawDataQuery, options);
            if (itemsQuery === rawDataQuery) {
                items = rawData.slice(0)
            } else {
                waitList.push(itemsQuery.enumerate().done(function(asyncResult) {
                    items = asyncResult
                }))
            }
        }
        if (options.requireTotalCount || countOnly) {
            totalCountQuery = queryByOptions(rawDataQuery, options, true);
            if (totalCountQuery === rawDataQuery) {
                totalCount = rawData.length
            } else {
                waitList.push(totalCountQuery.count().done(function(asyncResult) {
                    totalCount = asyncResult
                }))
            }
        }
        when.apply($, waitList).done(function() {
            if (countOnly) {
                pendingDeferred.resolve(totalCount)
            } else {
                if (options.requireTotalCount) {
                    pendingDeferred.resolve(items, {
                        totalCount: totalCount
                    })
                } else {
                    pendingDeferred.resolve(items)
                }
            }
        }).fail(function(x) {
            pendingDeferred.reject(x)
        })
    })
}

function runRawLoadWithKey(pendingDeferred, store, key) {
    runRawLoad(pendingDeferred, store, {}, function(rawData) {
        var item, keyExpr = store.key();
        for (var i = 0, len = rawData.length; i < len; i++) {
            item = rawData[i];
            if (dataUtils.keysEqual(keyExpr, store.keyOf(rawData[i]), key)) {
                pendingDeferred.resolve(item);
                return
            }
        }
        pendingDeferred.reject(errors.Error("E4009"))
    })
}
var CustomStore = Store.inherit({
    ctor: function(options) {
        options = options || {};
        this.callBase(options);
        this._useDefaultSearch = !!options.useDefaultSearch || "raw" === options.loadMode;
        this._loadMode = options.loadMode;
        this._cacheRawData = false !== options.cacheRawData;
        this._loadFunc = options[LOAD];
        this._totalCountFunc = options[TOTAL_COUNT];
        this._byKeyFunc = options[BY_KEY];
        this._insertFunc = options[INSERT];
        this._updateFunc = options[UPDATE];
        this._removeFunc = options[REMOVE]
    },
    createQuery: function() {
        throw errors.Error("E4010")
    },
    clearRawDataCache: function() {
        delete this.__rawData
    },
    _totalCountImpl: function(options) {
        var d = new Deferred;
        if ("raw" === this._loadMode && !this._totalCountFunc) {
            runRawLoadWithQuery(d, this, options, true)
        } else {
            invokeUserTotalCountFunc(this, options).done(function(count) {
                d.resolve(Number(count))
            }).fail(createUserFuncFailureHandler(d));
            d = this._addFailHandlers(d)
        }
        return d.promise()
    },
    _pushImpl: function(changes) {
        if (this.__rawData) {
            arrayUtils.applyBatch(this, this.__rawData, changes)
        }
    },
    _loadImpl: function(options) {
        var d = new Deferred;
        if ("raw" === this._loadMode) {
            runRawLoadWithQuery(d, this, options, false)
        } else {
            invokeUserLoad(this, options).done(function(data, extra) {
                d.resolve(data, extra)
            }).fail(createUserFuncFailureHandler(d));
            d = this._addFailHandlers(d)
        }
        return d.promise()
    },
    _byKeyImpl: function(key, extraOptions) {
        var d = new Deferred;
        if (this._byKeyViaLoad()) {
            this._requireKey();
            runRawLoadWithKey(d, this, key)
        } else {
            invokeUserByKeyFunc(this, key, extraOptions).done(function(obj) {
                d.resolve(obj)
            }).fail(createUserFuncFailureHandler(d))
        }
        return d.promise()
    },
    _byKeyViaLoad: function() {
        return "raw" === this._loadMode && !this._byKeyFunc
    },
    _insertImpl: function(values) {
        var userResult, that = this,
            userFunc = that._insertFunc,
            d = new Deferred;
        ensureRequiredFuncOption(INSERT, userFunc);
        userResult = userFunc.apply(that, [values]);
        if (!isPromise(userResult)) {
            userResult = trivialPromise(userResult)
        }
        fromPromise(userResult).done(function(serverResponse) {
            if (config().useLegacyStoreResult) {
                d.resolve(values, serverResponse)
            } else {
                d.resolve(serverResponse || values, that.keyOf(serverResponse))
            }
        }).fail(createUserFuncFailureHandler(d));
        return d.promise()
    },
    _updateImpl: function(key, values) {
        var userResult, userFunc = this._updateFunc,
            d = new Deferred;
        ensureRequiredFuncOption(UPDATE, userFunc);
        userResult = userFunc.apply(this, [key, values]);
        if (!isPromise(userResult)) {
            userResult = trivialPromise(userResult)
        }
        fromPromise(userResult).done(function(serverResponse) {
            if (config().useLegacyStoreResult) {
                d.resolve(key, values)
            } else {
                d.resolve(serverResponse || values, key)
            }
        }).fail(createUserFuncFailureHandler(d));
        return d.promise()
    },
    _removeImpl: function(key) {
        var userResult, userFunc = this._removeFunc,
            d = new Deferred;
        ensureRequiredFuncOption(REMOVE, userFunc);
        userResult = userFunc.apply(this, [key]);
        if (!isPromise(userResult)) {
            userResult = trivialPromise()
        }
        fromPromise(userResult).done(function() {
            d.resolve(key)
        }).fail(createUserFuncFailureHandler(d));
        return d.promise()
    }
});
module.exports = CustomStore;
module.exports.default = module.exports;
