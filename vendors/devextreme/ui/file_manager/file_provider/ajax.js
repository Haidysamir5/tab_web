/**
 * DevExtreme (ui/file_manager/file_provider/ajax.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) {
                descriptor.writable = true
            }
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps) {
            defineProperties(Constructor.prototype, protoProps)
        }
        if (staticProps) {
            defineProperties(Constructor, staticProps)
        }
        return Constructor
    }
}();
var _ajax = require("../../../core/utils/ajax");
var _ajax2 = _interopRequireDefault(_ajax);
var _common = require("../../../core/utils/common");
var _deferred = require("../../../core/utils/deferred");
var _extend = require("../../../core/utils/extend");
var _file_provider = require("./file_provider");
var _array = require("./array");
var _array2 = _interopRequireDefault(_array);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function")
    }
}

function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called")
    }
    return call && ("object" === typeof call || "function" === typeof call) ? call : self
}

function _inherits(subClass, superClass) {
    if ("function" !== typeof superClass && null !== superClass) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass) {
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
    }
}
var AjaxFileProvider = function(_FileProvider) {
    _inherits(AjaxFileProvider, _FileProvider);

    function AjaxFileProvider(options) {
        _classCallCheck(this, AjaxFileProvider);
        options = (0, _common.ensureDefined)(options, {});
        var _this = _possibleConstructorReturn(this, (AjaxFileProvider.__proto__ || Object.getPrototypeOf(AjaxFileProvider)).call(this, options));
        _this._options = options;
        _this._provider = null;
        return _this
    }
    _createClass(AjaxFileProvider, [{
        key: "getItems",
        value: function(path, itemType) {
            var _this2 = this;
            return this._doActionAfterDataAcquired(function() {
                return _this2._provider.getItems(path, itemType)
            })
        }
    }, {
        key: "renameItem",
        value: function(item, name) {
            var _this3 = this;
            return this._doActionAfterDataAcquired(function() {
                return _this3._provider.renameItem(item, name)
            })
        }
    }, {
        key: "createFolder",
        value: function(parentFolder, name) {
            var _this4 = this;
            return this._doActionAfterDataAcquired(function() {
                return _this4._provider.createFolder(parentFolder, name)
            })
        }
    }, {
        key: "deleteItems",
        value: function(items) {
            var _this5 = this;
            return this._doActionAfterDataAcquired(function() {
                return _this5._provider.deleteItems(items)
            })
        }
    }, {
        key: "moveItems",
        value: function(items, destinationFolder) {
            var _this6 = this;
            return this._doActionAfterDataAcquired(function() {
                return _this6._provider.moveItems(items, destinationFolder)
            })
        }
    }, {
        key: "copyItems",
        value: function(items, destinationFolder) {
            var _this7 = this;
            return this._doActionAfterDataAcquired(function() {
                return _this7._provider.copyItems(items, destinationFolder)
            })
        }
    }, {
        key: "initiateFileUpload",
        value: function(uploadInfo) {
            var _this8 = this;
            return this._doActionAfterDataAcquired(function() {
                return _this8._provider.initiateFileUpload(uploadInfo)
            })
        }
    }, {
        key: "uploadFileChunk",
        value: function(uploadInfo, chunk) {
            var _this9 = this;
            return this._doActionAfterDataAcquired(function() {
                return _this9._provider.uploadFileChunk(uploadInfo, chunk)
            })
        }
    }, {
        key: "finalizeFileUpload",
        value: function(uploadInfo) {
            var _this10 = this;
            return this._doActionAfterDataAcquired(function() {
                return _this10._provider.finalizeFileUpload(uploadInfo)
            })
        }
    }, {
        key: "abortFileUpload",
        value: function(uploadInfo) {
            var _this11 = this;
            return this._doActionAfterDataAcquired(function() {
                return _this11._provider.abortFileUpload(uploadInfo)
            })
        }
    }, {
        key: "_doActionAfterDataAcquired",
        value: function(action) {
            return this._ensureDataAcquired().then(action.bind(this))
        }
    }, {
        key: "_ensureDataAcquired",
        value: function() {
            var _this12 = this;
            if (this._provider) {
                return (new _deferred.Deferred).resolve().promise()
            }
            return this._getData().done(function(data) {
                var arrayOptions = (0, _extend.extend)(_this12._options, {
                    data: data
                });
                _this12._provider = new _array2.default(arrayOptions)
            })
        }
    }, {
        key: "_getData",
        value: function() {
            return _ajax2.default.sendRequest({
                url: this._options.url,
                dataType: "json",
                cache: false
            })
        }
    }]);
    return AjaxFileProvider
}(_file_provider.FileProvider);
module.exports = AjaxFileProvider;
