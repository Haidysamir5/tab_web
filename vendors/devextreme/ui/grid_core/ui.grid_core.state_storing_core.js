/**
 * DevExtreme (ui/grid_core/ui.grid_core.state_storing_core.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _events_engine = require("../../events/core/events_engine");
var _events_engine2 = _interopRequireDefault(_events_engine);
var _window = require("../../core/utils/window");
var _uiGrid_core = require("./ui.grid_core.modules");
var _uiGrid_core2 = _interopRequireDefault(_uiGrid_core);
var _ui = require("../widget/ui.errors");
var _ui2 = _interopRequireDefault(_ui);
var _browser = require("../../core/utils/browser");
var _browser2 = _interopRequireDefault(_browser);
var _storage = require("../../core/utils/storage");
var _extend = require("../../core/utils/extend");
var _iterator = require("../../core/utils/iterator");
var _type = require("../../core/utils/type");
var _deferred = require("../../core/utils/deferred");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/;
var parseDates = function parseDates(state) {
    if (!state) {
        return
    }(0, _iterator.each)(state, function(key, value) {
        var date;
        if ((0, _type.isPlainObject)(value) || Array.isArray(value)) {
            parseDates(value)
        } else {
            if ("string" === typeof value) {
                date = DATE_REGEX.exec(value);
                if (date) {
                    state[key] = new Date(Date.UTC(+date[1], +date[2] - 1, +date[3], +date[4], +date[5], +date[6]))
                }
            }
        }
    })
};
exports.StateStoringController = _uiGrid_core2.default.ViewController.inherit(function() {
    var getStorage = function(options) {
        var storage = "sessionStorage" === options.type ? (0, _storage.sessionStorage)() : (0, _window.getWindow)().localStorage;
        if (!storage) {
            if ("file:" === (0, _window.getWindow)().location.protocol && _browser2.default.msie) {
                throw new Error("E1038")
            } else {
                throw new Error("E1007")
            }
        }
        return storage
    };
    var getUniqueStorageKey = function(options) {
        return (0, _type.isDefined)(options.storageKey) ? options.storageKey : "storage"
    };
    return {
        _loadState: function() {
            var options = this.option("stateStoring");
            if ("custom" === options.type) {
                return options.customLoad && options.customLoad()
            }
            try {
                return JSON.parse(getStorage(options).getItem(getUniqueStorageKey(options)))
            } catch (e) {
                _ui2.default.log(e.message)
            }
        },
        _saveState: function(state) {
            var options = this.option("stateStoring");
            if ("custom" === options.type) {
                options.customSave && options.customSave(state);
                return
            }
            try {
                getStorage(options).setItem(getUniqueStorageKey(options), JSON.stringify(state))
            } catch (e) {}
        },
        publicMethods: function() {
            return ["state"]
        },
        isEnabled: function() {
            return this.option("stateStoring.enabled")
        },
        init: function() {
            var that = this;
            that._state = {};
            that._isLoaded = false;
            that._isLoading = false;
            that._windowUnloadHandler = function() {
                if (void 0 !== that._savingTimeoutID) {
                    that._saveState(that.state())
                }
            };
            _events_engine2.default.on((0, _window.getWindow)(), "unload", that._windowUnloadHandler);
            return that
        },
        isLoaded: function() {
            return this._isLoaded
        },
        isLoading: function() {
            return this._isLoading
        },
        load: function() {
            var loadResult, that = this;
            that._isLoading = true;
            loadResult = (0, _deferred.fromPromise)(that._loadState());
            loadResult.done(function(state) {
                that._isLoaded = true;
                that._isLoading = false;
                that.state(state)
            });
            return loadResult
        },
        state: function(_state) {
            var that = this;
            if (!arguments.length) {
                return (0, _extend.extend)(true, {}, that._state)
            } else {
                that._state = (0, _extend.extend)({}, _state);
                parseDates(that._state)
            }
        },
        save: function() {
            var that = this;
            clearTimeout(that._savingTimeoutID);
            that._savingTimeoutID = setTimeout(function() {
                that._saveState(that.state());
                that._savingTimeoutID = void 0
            }, that.option("stateStoring.savingTimeout"))
        },
        optionChanged: function(args) {
            var that = this;
            switch (args.name) {
                case "stateStoring":
                    if (that.isEnabled() && !that.isLoading()) {
                        that.load()
                    }
                    args.handled = true;
                    break;
                default:
                    that.callBase(args)
            }
        },
        dispose: function() {
            clearTimeout(this._savingTimeoutID);
            _events_engine2.default.off((0, _window.getWindow)(), "unload", this._windowUnloadHandler)
        }
    }
}());
