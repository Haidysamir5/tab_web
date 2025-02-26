/**
 * DevExtreme (ui/html_editor/modules/toolbar.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
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
var _quill_importer = require("../quill_importer");
var _renderer = require("../../../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _toolbar = require("../../toolbar");
var _toolbar2 = _interopRequireDefault(_toolbar);
require("../../select_box");
require("../../color_box/color_view");
var _widget_collector = require("./widget_collector");
var _widget_collector2 = _interopRequireDefault(_widget_collector);
var _iterator = require("../../../core/utils/iterator");
var _type = require("../../../core/utils/type");
var _extend = require("../../../core/utils/extend");
var _message = require("../../../localization/message");
var _inflector = require("../../../core/utils/inflector");
var _events_engine = require("../../../events/core/events_engine");
var _events_engine2 = _interopRequireDefault(_events_engine);
var _utils = require("../../../events/utils");

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
var BaseModule = (0, _quill_importer.getQuill)().import("core/module");
var TOOLBAR_WRAPPER_CLASS = "dx-htmleditor-toolbar-wrapper";
var TOOLBAR_CLASS = "dx-htmleditor-toolbar";
var TOOLBAR_FORMAT_WIDGET_CLASS = "dx-htmleditor-toolbar-format";
var TOOLBAR_SEPARATOR_CLASS = "dx-htmleditor-toolbar-separator";
var TOOLBAR_MENU_SEPARATOR_CLASS = "dx-htmleditor-toolbar-menu-separator";
var ACTIVE_FORMAT_CLASS = "dx-format-active";
var BOX_ITEM_CONTENT_CLASS = "dx-box-item-content";
var ICON_CLASS = "dx-icon";
var SELECTION_CHANGE_EVENT = "selection-change";
var DIALOG_COLOR_CAPTION = "dxHtmlEditor-dialogColorCaption";
var DIALOG_BACKGROUND_CAPTION = "dxHtmlEditor-dialogBackgroundCaption";
var DIALOG_LINK_CAPTION = "dxHtmlEditor-dialogLinkCaption";
var DIALOG_LINK_FIELD_URL = "dxHtmlEditor-dialogLinkUrlField";
var DIALOG_LINK_FIELD_TEXT = "dxHtmlEditor-dialogLinkTextField";
var DIALOG_LINK_FIELD_TARGET = "dxHtmlEditor-dialogLinkTargetField";
var DIALOG_LINK_FIELD_TARGET_CLASS = "dx-formdialog-field-target";
var DIALOG_IMAGE_CAPTION = "dxHtmlEditor-dialogImageCaption";
var DIALOG_IMAGE_FIELD_URL = "dxHtmlEditor-dialogImageUrlField";
var DIALOG_IMAGE_FIELD_ALT = "dxHtmlEditor-dialogImageAltField";
var DIALOG_IMAGE_FIELD_WIDTH = "dxHtmlEditor-dialogImageWidthField";
var DIALOG_IMAGE_FIELD_HEIGHT = "dxHtmlEditor-dialogImageHeightField";
var USER_ACTION = "user";
var SILENT_ACTION = "silent";
var HEADING_TEXT = (0, _message.format)("dxHtmlEditor-heading");
var NORMAL_TEXT = (0, _message.format)("dxHtmlEditor-normalText");
var ToolbarModule = function(_BaseModule) {
    _inherits(ToolbarModule, _BaseModule);

    function ToolbarModule(quill, options) {
        _classCallCheck(this, ToolbarModule);
        var _this = _possibleConstructorReturn(this, (ToolbarModule.__proto__ || Object.getPrototypeOf(ToolbarModule)).call(this, quill, options));
        _this._editorInstance = options.editorInstance;
        _this._toolbarWidgets = new _widget_collector2.default;
        _this._formatHandlers = _this._getFormatHandlers();
        if ((0, _type.isDefined)(options.items)) {
            _this._addCallbacks();
            _this._renderToolbar();
            _this.quill.on("editor-change", function(eventName) {
                var isSelectionChanged = eventName === SELECTION_CHANGE_EVENT;
                _this._updateToolbar(isSelectionChanged)
            })
        }
        return _this
    }
    _createClass(ToolbarModule, [{
        key: "_addCallbacks",
        value: function() {
            this._editorInstance.addCleanCallback(this.clean.bind(this));
            this._editorInstance.addContentInitializedCallback(this.updateHistoryWidgets.bind(this))
        }
    }, {
        key: "_updateToolbar",
        value: function(isSelectionChanged) {
            this.updateFormatWidgets(isSelectionChanged);
            this.updateHistoryWidgets()
        }
    }, {
        key: "_getDefaultClickHandler",
        value: function(formatName) {
            var _this2 = this;
            return function(e) {
                var formats = _this2.quill.getFormat();
                var value = formats[formatName];
                var newValue = !((0, _type.isBoolean)(value) ? value : (0, _type.isDefined)(value));
                _this2.quill.format(formatName, newValue, USER_ACTION);
                _this2._updateFormatWidget(formatName, newValue, formats)
            }
        }
    }, {
        key: "_updateFormatWidget",
        value: function(formatName, isApplied, formats) {
            var widget = this._toolbarWidgets.getByName(formatName);
            if (!widget) {
                return
            }
            if (isApplied) {
                this._markActiveFormatWidget(formatName, widget, formats)
            } else {
                this._resetFormatWidget(formatName, widget);
                if (Object.prototype.hasOwnProperty.call(formatName)) {
                    delete formats[formatName]
                }
            }
            this._toggleClearFormatting(isApplied || !(0, _type.isEmptyObject)(formats))
        }
    }, {
        key: "_getFormatHandlers",
        value: function() {
            var _this3 = this;
            return {
                clear: function(e) {
                    var range = _this3.quill.getSelection();
                    if (range) {
                        _this3.quill.removeFormat(range);
                        _this3.updateFormatWidgets()
                    }
                },
                link: this._prepareLinkHandler(),
                image: this._prepareImageHandler(),
                color: this._prepareColorClickHandler("color"),
                background: this._prepareColorClickHandler("background"),
                orderedList: this._prepareShortcutHandler("list", "ordered"),
                bulletList: this._prepareShortcutHandler("list", "bullet"),
                alignLeft: this._prepareShortcutHandler("align", "left"),
                alignCenter: this._prepareShortcutHandler("align", "center"),
                alignRight: this._prepareShortcutHandler("align", "right"),
                alignJustify: this._prepareShortcutHandler("align", "justify"),
                codeBlock: this._getDefaultClickHandler("code-block"),
                undo: function() {
                    _this3.quill.history.undo()
                },
                redo: function() {
                    _this3.quill.history.redo()
                },
                increaseIndent: function() {
                    _this3.quill.format("indent", "+1", USER_ACTION)
                },
                decreaseIndent: function() {
                    _this3.quill.format("indent", "-1", USER_ACTION)
                },
                superscript: this._prepareShortcutHandler("script", "super"),
                subscript: this._prepareShortcutHandler("script", "sub")
            }
        }
    }, {
        key: "_prepareShortcutHandler",
        value: function(formatName, shortcutValue) {
            var _this4 = this;
            return function() {
                var formats = _this4.quill.getFormat();
                var value = formats[formatName] === shortcutValue ? false : shortcutValue;
                _this4.quill.format(formatName, value, USER_ACTION);
                _this4.updateFormatWidgets(true)
            }
        }
    }, {
        key: "_prepareLinkHandler",
        value: function() {
            var _this5 = this;
            return function() {
                _this5.quill.focus();
                var selection = _this5.quill.getSelection();
                var hasEmbedContent = _this5._hasEmbedContent(selection);
                var formats = selection ? _this5.quill.getFormat() : {};
                var formData = {
                    href: formats.link || "",
                    text: selection && !hasEmbedContent ? _this5.quill.getText(selection) : "",
                    target: Object.prototype.hasOwnProperty.call(formats, "target") ? !!formats.target : true
                };
                _this5._editorInstance.formDialogOption("title", (0, _message.format)(DIALOG_LINK_CAPTION));
                var promise = _this5._editorInstance.showFormDialog({
                    formData: formData,
                    items: _this5._getLinkFormItems(selection)
                });
                promise.done(function(formData) {
                    if (selection && !hasEmbedContent) {
                        var text = formData.text || formData.href;
                        var index = selection.index,
                            length = selection.length;
                        formData.text = void 0;
                        length && _this5.quill.deleteText(index, length, SILENT_ACTION);
                        _this5.quill.insertText(index, text, "link", formData, USER_ACTION);
                        _this5.quill.setSelection(index + text.length, 0, USER_ACTION)
                    } else {
                        formData.text = !selection && !formData.text ? formData.href : formData.text;
                        _this5.quill.format("link", formData, USER_ACTION)
                    }
                });
                promise.fail(function() {
                    _this5.quill.focus()
                })
            }
        }
    }, {
        key: "_hasEmbedContent",
        value: function(selection) {
            return !!selection && this.quill.getText(selection).trim().length < selection.length
        }
    }, {
        key: "_getLinkFormItems",
        value: function(selection) {
            return [{
                dataField: "href",
                label: {
                    text: (0, _message.format)(DIALOG_LINK_FIELD_URL)
                }
            }, {
                dataField: "text",
                label: {
                    text: (0, _message.format)(DIALOG_LINK_FIELD_TEXT)
                },
                visible: !this._hasEmbedContent(selection)
            }, {
                dataField: "target",
                editorType: "dxCheckBox",
                editorOptions: {
                    text: (0, _message.format)(DIALOG_LINK_FIELD_TARGET)
                },
                cssClass: DIALOG_LINK_FIELD_TARGET_CLASS,
                label: {
                    visible: false
                }
            }]
        }
    }, {
        key: "_prepareImageHandler",
        value: function() {
            var _this6 = this;
            return function() {
                var formData = _this6.quill.getFormat();
                var isUpdateDialog = Object.prototype.hasOwnProperty.call(formData, "imageSrc");
                var defaultIndex = _this6._defaultPasteIndex;
                if (isUpdateDialog) {
                    var _quill$getFormat = _this6.quill.getFormat(defaultIndex - 1, 1),
                        imageSrc = _quill$getFormat.imageSrc;
                    formData.src = formData.imageSrc;
                    delete formData.imageSrc;
                    if (!imageSrc || 0 === defaultIndex) {
                        _this6.quill.setSelection(defaultIndex + 1, 0, SILENT_ACTION)
                    }
                }
                var formatIndex = _this6._embedFormatIndex;
                _this6._editorInstance.formDialogOption("title", (0, _message.format)(DIALOG_IMAGE_CAPTION));
                var promise = _this6._editorInstance.showFormDialog({
                    formData: formData,
                    items: _this6._imageFormItems
                });
                promise.done(function(formData) {
                    var index = defaultIndex;
                    if (isUpdateDialog) {
                        index = formatIndex;
                        _this6.quill.deleteText(index, 1, SILENT_ACTION)
                    }
                    _this6.quill.insertEmbed(index, "extendedImage", formData, USER_ACTION);
                    _this6.quill.setSelection(index + 1, 0, USER_ACTION)
                }).always(function() {
                    _this6.quill.focus()
                })
            }
        }
    }, {
        key: "_renderToolbar",
        value: function() {
            var _this7 = this;
            var container = this.options.container || this._getContainer();
            this._$toolbar = (0, _renderer2.default)("<div>").addClass(TOOLBAR_CLASS).appendTo(container);
            this._$toolbarContainer = (0, _renderer2.default)(container).addClass(TOOLBAR_WRAPPER_CLASS);
            _events_engine2.default.on(this._$toolbar, (0, _utils.addNamespace)("mousedown", this._editorInstance.NAME), function(e) {
                e.preventDefault()
            });
            this.toolbarInstance = this._editorInstance._createComponent(this._$toolbar, _toolbar2.default, this.toolbarConfig);
            this._editorInstance.on("optionChanged", function(_ref) {
                var name = _ref.name;
                if ("readOnly" === name || "disabled" === name) {
                    _this7.toolbarInstance.option("disabled", _this7.isInteractionDisabled)
                }
            })
        }
    }, {
        key: "clean",
        value: function() {
            this._toolbarWidgets.clear();
            if (this._$toolbarContainer) {
                this._$toolbarContainer.empty().removeClass(TOOLBAR_WRAPPER_CLASS)
            }
        }
    }, {
        key: "_getContainer",
        value: function() {
            var $container = (0, _renderer2.default)("<div>");
            this._editorInstance.$element().prepend($container);
            return $container
        }
    }, {
        key: "_prepareToolbarItems",
        value: function() {
            var _this8 = this;
            var resultItems = [];
            (0, _iterator.each)(this.options.items, function(index, item) {
                var newItem = void 0;
                if ((0, _type.isObject)(item)) {
                    newItem = _this8._handleObjectItem(item)
                } else {
                    if ((0, _type.isString)(item)) {
                        var buttonItemConfig = _this8._prepareButtonItemConfig(item);
                        newItem = _this8._getToolbarItem(buttonItemConfig)
                    }
                }
                if (newItem) {
                    resultItems.push(newItem)
                }
            });
            return resultItems
        }
    }, {
        key: "_handleObjectItem",
        value: function(item) {
            if (item.formatName && item.formatValues && this._isAcceptableItem("dxSelectBox")) {
                var selectItemConfig = this._prepareSelectItemConfig(item);
                return this._getToolbarItem(selectItemConfig)
            } else {
                if (item.formatName && this._isAcceptableItem("dxButton")) {
                    var defaultButtonItemConfig = this._prepareButtonItemConfig(item.formatName);
                    var buttonItemConfig = (0, _extend.extend)(true, defaultButtonItemConfig, item);
                    return this._getToolbarItem(buttonItemConfig)
                } else {
                    return this._getToolbarItem(item)
                }
            }
        }
    }, {
        key: "_isAcceptableItem",
        value: function(item, acceptableWidgetName) {
            return !item.widget || item.widget === acceptableWidgetName
        }
    }, {
        key: "_prepareButtonItemConfig",
        value: function(formatName) {
            var iconName = "clear" === formatName ? "clearformat" : formatName;
            var buttonText = (0, _inflector.titleize)(formatName);
            return {
                widget: "dxButton",
                formatName: formatName,
                options: {
                    hint: buttonText,
                    text: buttonText,
                    icon: iconName.toLowerCase(),
                    onClick: this._formatHandlers[formatName] || this._getDefaultClickHandler(formatName),
                    stylingMode: "text"
                },
                showText: "inMenu"
            }
        }
    }, {
        key: "_prepareSelectItemConfig",
        value: function(item) {
            var _this9 = this;
            return (0, _extend.extend)(true, {
                widget: "dxSelectBox",
                formatName: item.formatName,
                options: {
                    stylingMode: "filled",
                    dataSource: item.formatValues,
                    placeholder: (0, _inflector.titleize)(item.formatName),
                    onValueChanged: function(e) {
                        if (!_this9._isReset) {
                            _this9.quill.format(item.formatName, e.value, USER_ACTION);
                            _this9._setValueSilent(e.component, e.value)
                        }
                    }
                }
            }, item)
        }
    }, {
        key: "_prepareColorClickHandler",
        value: function(formatName) {
            var _this10 = this;
            return function() {
                var formData = _this10.quill.getFormat();
                var caption = "color" === formatName ? DIALOG_COLOR_CAPTION : DIALOG_BACKGROUND_CAPTION;
                _this10._editorInstance.formDialogOption("title", (0, _message.format)(caption));
                var promise = _this10._editorInstance.showFormDialog({
                    formData: formData,
                    items: [{
                        dataField: formatName,
                        editorType: "dxColorView",
                        editorOptions: {
                            onContentReady: function(e) {
                                (0, _renderer2.default)(e.element).closest("." + BOX_ITEM_CONTENT_CLASS).css("flexBasis", "auto")
                            },
                            focusStateEnabled: false
                        },
                        label: {
                            visible: false
                        }
                    }]
                });
                promise.done(function(formData) {
                    _this10.quill.format(formatName, formData[formatName], USER_ACTION)
                });
                promise.fail(function() {
                    _this10.quill.focus()
                })
            }
        }
    }, {
        key: "_getToolbarItem",
        value: function(item) {
            var _this11 = this;
            var baseItem = {
                options: {
                    onInitialized: function(e) {
                        if (item.formatName) {
                            e.component.$element().addClass(TOOLBAR_FORMAT_WIDGET_CLASS);
                            e.component.$element().toggleClass("dx-" + item.formatName.toLowerCase() + "-format", !!item.formatName);
                            _this11._toolbarWidgets.add(item.formatName, e.component)
                        }
                    }
                }
            };
            return (0, _extend.extend)(true, {
                location: "before",
                locateInMenu: "auto"
            }, this._getDefaultConfig(item.formatName), item, baseItem)
        }
    }, {
        key: "_getDefaultItemsConfig",
        value: function() {
            return {
                header: {
                    options: {
                        displayExpr: function(item) {
                            var isHeaderValue = (0, _type.isDefined)(item) && false !== item;
                            return isHeaderValue ? HEADING_TEXT + " " + item : NORMAL_TEXT
                        }
                    }
                },
                clear: {
                    options: {
                        disabled: true
                    }
                },
                undo: {
                    options: {
                        disabled: true
                    }
                },
                redo: {
                    options: {
                        disabled: true
                    }
                },
                separator: {
                    template: function(data, index, element) {
                        (0, _renderer2.default)(element).addClass(TOOLBAR_SEPARATOR_CLASS)
                    },
                    menuItemTemplate: function(data, index, element) {
                        (0, _renderer2.default)(element).addClass(TOOLBAR_MENU_SEPARATOR_CLASS)
                    }
                }
            }
        }
    }, {
        key: "_getDefaultConfig",
        value: function(formatName) {
            return this._getDefaultItemsConfig()[formatName]
        }
    }, {
        key: "updateHistoryWidgets",
        value: function() {
            var historyModule = this.quill.history;
            if (!historyModule) {
                return
            }
            var undoOps = historyModule.stack.undo;
            var redoOps = historyModule.stack.redo;
            this._updateHistoryWidget(this._toolbarWidgets.getByName("undo"), undoOps);
            this._updateHistoryWidget(this._toolbarWidgets.getByName("redo"), redoOps)
        }
    }, {
        key: "_updateHistoryWidget",
        value: function(widget, operations) {
            if (!widget) {
                return
            }
            widget.option("disabled", !operations.length)
        }
    }, {
        key: "updateFormatWidgets",
        value: function(isResetRequired) {
            var selection = this.quill.getSelection();
            if (!selection) {
                return
            }
            var formats = this.quill.getFormat(selection);
            var hasFormats = !(0, _type.isEmptyObject)(formats);
            if (!hasFormats || isResetRequired) {
                this._resetFormatWidgets()
            }
            for (var formatName in formats) {
                var widgetName = this._getFormatWidgetName(formatName, formats);
                var formatWidget = this._toolbarWidgets.getByName(widgetName) || this._toolbarWidgets.getByName(formatName);
                if (!formatWidget) {
                    continue
                }
                this._markActiveFormatWidget(formatName, formatWidget, formats)
            }
            this._toggleClearFormatting(hasFormats)
        }
    }, {
        key: "_markActiveFormatWidget",
        value: function(name, widget, formats) {
            if (this._isColorFormat(name)) {
                this._updateColorWidget(name, formats[name])
            }
            if ("value" in widget.option()) {
                this._setValueSilent(widget, formats[name])
            } else {
                widget.$element().addClass(ACTIVE_FORMAT_CLASS)
            }
        }
    }, {
        key: "_toggleClearFormatting",
        value: function(hasFormats) {
            var clearWidget = this._toolbarWidgets.getByName("clear");
            if (clearWidget) {
                clearWidget.option("disabled", !hasFormats)
            }
        }
    }, {
        key: "_isColorFormat",
        value: function(formatName) {
            return "color" === formatName || "background" === formatName
        }
    }, {
        key: "_updateColorWidget",
        value: function(formatName, color) {
            var formatWidget = this._toolbarWidgets.getByName(formatName);
            if (!formatWidget) {
                return
            }
            formatWidget.$element().find("." + ICON_CLASS).css("borderBottomColor", color || "transparent")
        }
    }, {
        key: "_getFormatWidgetName",
        value: function(formatName, formats) {
            var widgetName = void 0;
            switch (formatName) {
                case "align":
                    widgetName = formatName + (0, _inflector.titleize)(formats[formatName]);
                    break;
                case "list":
                    widgetName = formats[formatName] + (0, _inflector.titleize)(formatName);
                    break;
                case "code-block":
                    widgetName = "codeBlock";
                    break;
                case "script":
                    widgetName = formats[formatName] + formatName;
                    break;
                case "imageSrc":
                    widgetName = "image";
                    break;
                default:
                    widgetName = formatName
            }
            return widgetName
        }
    }, {
        key: "_setValueSilent",
        value: function(widget, value) {
            this._isReset = true;
            widget.option("value", value);
            this._isReset = false
        }
    }, {
        key: "_resetFormatWidgets",
        value: function() {
            var _this12 = this;
            this._toolbarWidgets.each(function(name, widget) {
                _this12._resetFormatWidget(name, widget)
            })
        }
    }, {
        key: "_resetFormatWidget",
        value: function(name, widget) {
            widget.$element().removeClass(ACTIVE_FORMAT_CLASS);
            if (this._isColorFormat(name)) {
                this._updateColorWidget(name)
            }
            if ("clear" === name) {
                widget.option("disabled", true)
            }
            if ("dxSelectBox" === widget.NAME) {
                this._setValueSilent(widget, null)
            }
        }
    }, {
        key: "addClickHandler",
        value: function(formatName, handler) {
            this._formatHandlers[formatName] = handler;
            var formatWidget = this._toolbarWidgets.getByName(formatName);
            if (formatWidget && "dxButton" === formatWidget.NAME) {
                formatWidget.option("onClick", handler)
            }
        }
    }, {
        key: "_embedFormatIndex",
        get: function() {
            var selection = this.quill.getSelection();
            if (selection) {
                if (selection.length) {
                    return selection.index
                } else {
                    return selection.index - 1
                }
            } else {
                return this.quill.getLength()
            }
        }
    }, {
        key: "_defaultPasteIndex",
        get: function() {
            var selection = this.quill.getSelection();
            return selection && selection.index || this.quill.getLength()
        }
    }, {
        key: "_imageFormItems",
        get: function() {
            return [{
                dataField: "src",
                label: {
                    text: (0, _message.format)(DIALOG_IMAGE_FIELD_URL)
                }
            }, {
                dataField: "width",
                label: {
                    text: (0, _message.format)(DIALOG_IMAGE_FIELD_WIDTH)
                }
            }, {
                dataField: "height",
                label: {
                    text: (0, _message.format)(DIALOG_IMAGE_FIELD_HEIGHT)
                }
            }, {
                dataField: "alt",
                label: {
                    text: (0, _message.format)(DIALOG_IMAGE_FIELD_ALT)
                }
            }]
        }
    }, {
        key: "toolbarConfig",
        get: function() {
            return {
                dataSource: this._prepareToolbarItems(),
                disabled: this.isInteractionDisabled,
                menuContainer: this._$toolbar
            }
        }
    }, {
        key: "isInteractionDisabled",
        get: function() {
            return this._editorInstance.option("readOnly") || this._editorInstance.option("disabled")
        }
    }]);
    return ToolbarModule
}(BaseModule);
exports.default = ToolbarModule;
