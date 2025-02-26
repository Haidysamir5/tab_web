/**
 * DevExtreme (ui/file_manager/ui.file_manager.dialog.folder_chooser.js)
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
var _get = function get(object, property, receiver) {
    if (null === object) {
        object = Function.prototype
    }
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (void 0 === desc) {
        var parent = Object.getPrototypeOf(object);
        if (null === parent) {
            return
        } else {
            return get(parent, property, receiver)
        }
    } else {
        if ("value" in desc) {
            return desc.value
        } else {
            var getter = desc.get;
            if (void 0 === getter) {
                return
            }
            return getter.call(receiver)
        }
    }
};
var _renderer = require("../../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _extend = require("../../core/utils/extend");
var _uiFile_managerDialog = require("./ui.file_manager.dialog.js");
var _uiFile_managerDialog2 = _interopRequireDefault(_uiFile_managerDialog);
var _uiFile_manager = require("./ui.file_manager.files_tree_view");
var _uiFile_manager2 = _interopRequireDefault(_uiFile_manager);

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
var FILE_MANAGER_DIALOG_FOLDER_CHOOSER = "dx-filemanager-dialog-folder-chooser";
var FILE_MANAGER_DIALOG_FOLDER_CHOOSER_POPUP = "dx-filemanager-dialog-folder-chooser-popup";
var FileManagerFolderChooserDialog = function(_FileManagerDialogBas) {
    _inherits(FileManagerFolderChooserDialog, _FileManagerDialogBas);

    function FileManagerFolderChooserDialog() {
        _classCallCheck(this, FileManagerFolderChooserDialog);
        return _possibleConstructorReturn(this, (FileManagerFolderChooserDialog.__proto__ || Object.getPrototypeOf(FileManagerFolderChooserDialog)).apply(this, arguments))
    }
    _createClass(FileManagerFolderChooserDialog, [{
        key: "show",
        value: function() {
            if (this._filesTreeView) {
                this._filesTreeView.refreshData()
            }
            _get(FileManagerFolderChooserDialog.prototype.__proto__ || Object.getPrototypeOf(FileManagerFolderChooserDialog.prototype), "show", this).call(this)
        }
    }, {
        key: "_getDialogOptions",
        value: function() {
            return (0, _extend.extend)(_get(FileManagerFolderChooserDialog.prototype.__proto__ || Object.getPrototypeOf(FileManagerFolderChooserDialog.prototype), "_getDialogOptions", this).call(this), {
                title: "Select Destination Folder",
                buttonText: "Select",
                contentCssClass: FILE_MANAGER_DIALOG_FOLDER_CHOOSER,
                popupCssClass: FILE_MANAGER_DIALOG_FOLDER_CHOOSER_POPUP
            })
        }
    }, {
        key: "_createContentTemplate",
        value: function(element) {
            _get(FileManagerFolderChooserDialog.prototype.__proto__ || Object.getPrototypeOf(FileManagerFolderChooserDialog.prototype), "_createContentTemplate", this).call(this, element);
            this._filesTreeView = this._createComponent((0, _renderer2.default)("<div>"), _uiFile_manager2.default, {
                getItems: this.option("getItems")
            });
            this._$contentElement.append(this._filesTreeView.$element())
        }
    }, {
        key: "_getDialogResult",
        value: function() {
            return {
                folder: this._filesTreeView.getCurrentFolder()
            }
        }
    }, {
        key: "_getDefaultOptions",
        value: function() {
            return (0, _extend.extend)(_get(FileManagerFolderChooserDialog.prototype.__proto__ || Object.getPrototypeOf(FileManagerFolderChooserDialog.prototype), "_getDefaultOptions", this).call(this), {
                getItems: null
            })
        }
    }]);
    return FileManagerFolderChooserDialog
}(_uiFile_managerDialog2.default);
module.exports = FileManagerFolderChooserDialog;
