/**
 * DevExtreme (ui/dialog.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _renderer = require("../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _component = require("../core/component");
var _component2 = _interopRequireDefault(_component);
var _action = require("../core/action");
var _action2 = _interopRequireDefault(_action);
var _devices = require("../core/devices");
var _devices2 = _interopRequireDefault(_devices);
var _config = require("../core/config");
var _config2 = _interopRequireDefault(_config);
var _dom = require("../core/utils/dom");
var _deferred = require("../core/utils/deferred");
var _type = require("../core/utils/type");
var _iterator = require("../core/utils/iterator");
var _extend = require("../core/utils/extend");
var _window = require("../core/utils/window");
var _events_engine = require("../events/core/events_engine");
var _view_port = require("../core/utils/view_port");
var _message = require("../localization/message");
var _message2 = _interopRequireDefault(_message);
var _ui = require("./widget/ui.errors");
var _ui2 = _interopRequireDefault(_ui);
var _popup = require("./popup");
var _popup2 = _interopRequireDefault(_popup);
var _common = require("../core/utils/common");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var window = (0, _window.getWindow)();
var DEFAULT_BUTTON = {
    text: "OK",
    onClick: function() {
        return true
    }
};
var DX_DIALOG_CLASSNAME = "dx-dialog";
var DX_DIALOG_WRAPPER_CLASSNAME = DX_DIALOG_CLASSNAME + "-wrapper";
var DX_DIALOG_ROOT_CLASSNAME = DX_DIALOG_CLASSNAME + "-root";
var DX_DIALOG_CONTENT_CLASSNAME = DX_DIALOG_CLASSNAME + "-content";
var DX_DIALOG_MESSAGE_CLASSNAME = DX_DIALOG_CLASSNAME + "-message";
var DX_DIALOG_BUTTONS_CLASSNAME = DX_DIALOG_CLASSNAME + "-buttons";
var DX_DIALOG_BUTTON_CLASSNAME = DX_DIALOG_CLASSNAME + "-button";
var DX_BUTTON_CLASSNAME = "dx-button";
var FakeDialogComponent = _component2.default.inherit({
    ctor: function(element, options) {
        this.callBase(options)
    },
    _defaultOptionsRules: function() {
        return this.callBase().concat([{
            device: {
                platform: "ios"
            },
            options: {
                width: 276
            }
        }, {
            device: {
                platform: "android"
            },
            options: {
                lWidth: "60%",
                pWidth: "80%"
            }
        }])
    }
});
exports.FakeDialogComponent = FakeDialogComponent;
exports.title = "";
exports.custom = function(options) {
    var deferred = new _deferred.Deferred;
    var defaultOptions = (new FakeDialogComponent).option();
    options = (0, _extend.extend)(defaultOptions, options);
    var $element = (0, _renderer2.default)("<div>").addClass(DX_DIALOG_CLASSNAME).appendTo((0, _view_port.value)());
    var isMessageDefined = "message" in options;
    var isMessageHtmlDefined = "messageHtml" in options;
    if (isMessageDefined) {
        _ui2.default.log("W1013")
    }
    var messageHtml = String(isMessageHtmlDefined ? options.messageHtml : options.message);
    var $message = (0, _renderer2.default)("<div>").addClass(DX_DIALOG_MESSAGE_CLASSNAME).html(messageHtml);
    var popupToolbarItems = [];
    var toolbarItemsOption = options.toolbarItems;
    if (toolbarItemsOption) {
        _ui2.default.log("W0001", "DevExpress.ui.dialog", "toolbarItems", "16.2", "Use the 'buttons' option instead")
    } else {
        toolbarItemsOption = options.buttons
    }(0, _iterator.each)(toolbarItemsOption || [DEFAULT_BUTTON], function() {
        var action = new _action2.default(this.onClick, {
            context: popupInstance
        });
        popupToolbarItems.push({
            toolbar: "bottom",
            location: _devices2.default.current().android ? "after" : "center",
            widget: "dxButton",
            options: (0, _extend.extend)({}, this, {
                onClick: function() {
                    var result = action.execute.apply(action, arguments);
                    hide(result)
                }
            })
        })
    });
    var popupInstance = new _popup2.default($element, (0, _extend.extend)({
        title: options.title || exports.title,
        showTitle: (0, _common.ensureDefined)(options.showTitle, true),
        dragEnabled: (0, _common.ensureDefined)(options.dragEnabled, true),
        height: "auto",
        width: function() {
            var isPortrait = (0, _renderer2.default)(window).height() > (0, _renderer2.default)(window).width(),
                key = (isPortrait ? "p" : "l") + "Width",
                widthOption = Object.prototype.hasOwnProperty.call(options, key) ? options[key] : options.width;
            return (0, _type.isFunction)(widthOption) ? widthOption() : widthOption
        },
        showCloseButton: options.showCloseButton || false,
        ignoreChildEvents: false,
        onContentReady: function(args) {
            args.component.$content().addClass(DX_DIALOG_CONTENT_CLASSNAME).append($message)
        },
        onShowing: function(e) {
            e.component.bottomToolbar().addClass(DX_DIALOG_BUTTONS_CLASSNAME).find("." + DX_BUTTON_CLASSNAME).addClass(DX_DIALOG_BUTTON_CLASSNAME);
            (0, _dom.resetActiveElement)()
        },
        onShown: function(e) {
            var $firstButton = e.component.bottomToolbar().find("." + DX_BUTTON_CLASSNAME).first();
            (0, _events_engine.trigger)($firstButton, "focus")
        },
        onHiding: function() {
            deferred.reject()
        },
        toolbarItems: popupToolbarItems,
        animation: {
            show: {
                type: "pop",
                duration: 400
            },
            hide: {
                type: "pop",
                duration: 400,
                to: {
                    opacity: 0,
                    scale: 0
                },
                from: {
                    opacity: 1,
                    scale: 1
                }
            }
        },
        rtlEnabled: (0, _config2.default)().rtlEnabled,
        boundaryOffset: {
            h: 10,
            v: 0
        }
    }, options.popupOptions));
    popupInstance._wrapper().addClass(DX_DIALOG_WRAPPER_CLASSNAME);
    if (options.position) {
        popupInstance.option("position", options.position)
    }
    popupInstance._wrapper().addClass(DX_DIALOG_ROOT_CLASSNAME);

    function show() {
        popupInstance.show();
        return deferred.promise()
    }

    function hide(value) {
        deferred.resolve(value);
        popupInstance.hide().done(function() {
            popupInstance.$element().remove()
        })
    }
    return {
        show: show,
        hide: hide
    }
};
exports.alert = function(messageHtml, title, showTitle) {
    var options = (0, _type.isPlainObject)(messageHtml) ? messageHtml : {
        title: title,
        messageHtml: messageHtml,
        showTitle: showTitle,
        dragEnabled: showTitle
    };
    return exports.custom(options).show()
};
exports.confirm = function(messageHtml, title, showTitle) {
    var options = (0, _type.isPlainObject)(messageHtml) ? messageHtml : {
        title: title,
        messageHtml: messageHtml,
        showTitle: showTitle,
        buttons: [{
            text: _message2.default.format("Yes"),
            onClick: function() {
                return true
            }
        }, {
            text: _message2.default.format("No"),
            onClick: function() {
                return false
            }
        }],
        dragEnabled: showTitle
    };
    return exports.custom(options).show()
};
