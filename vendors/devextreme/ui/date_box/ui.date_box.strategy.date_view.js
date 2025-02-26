/**
 * DevExtreme (ui/date_box/ui.date_box.strategy.date_view.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var $ = require("../../core/renderer"),
    window = require("../../core/utils/window").getWindow(),
    DateView = require("./ui.date_view"),
    DateBoxStrategy = require("./ui.date_box.strategy"),
    support = require("../../core/utils/support"),
    extend = require("../../core/utils/extend").extend,
    dateUtils = require("./ui.date_utils"),
    messageLocalization = require("../../localization/message");
var DateViewStrategy = DateBoxStrategy.inherit({
    NAME: "DateView",
    getDefaultOptions: function() {
        return extend(this.callBase(), {
            openOnFieldClick: true,
            applyButtonText: messageLocalization.format("OK")
        })
    },
    getDisplayFormat: function(displayFormat) {
        return displayFormat || dateUtils.FORMATS_MAP[this.dateBox.option("type")]
    },
    popupConfig: function(config) {
        return {
            showTitle: true,
            toolbarItems: this.dateBox._popupToolbarItemsConfig(),
            onInitialized: config.onInitialized,
            defaultOptionsRules: [{
                device: function(_device) {
                    return "win" === _device.platform && _device.version && 8 === _device.version[0]
                },
                options: {
                    showNames: true
                }
            }, {
                device: function(_device2) {
                    return "win" === _device2.platform && _device2.phone && _device2.version && 8 === _device2.version[0]
                },
                options: {
                    animation: null
                }
            }, {
                device: {
                    platform: "android"
                },
                options: {
                    width: 333,
                    height: 331
                }
            }, {
                device: function(_device3) {
                    var platform = _device3.platform,
                        version = _device3.version;
                    return "generic" === platform || "ios" === platform || "win" === platform && version && 10 === version[0]
                },
                options: {
                    width: "auto",
                    height: "auto"
                }
            }, {
                device: function(_device4) {
                    var platform = _device4.platform,
                        phone = _device4.phone;
                    return "generic" === platform && phone
                },
                options: {
                    width: 333,
                    maxWidth: "100%",
                    maxHeight: "100%",
                    height: "auto",
                    position: {
                        collision: "flipfit flip"
                    }
                }
            }, {
                device: {
                    platform: "ios",
                    phone: true
                },
                options: {
                    width: "100%",
                    position: {
                        my: "bottom",
                        at: "bottom",
                        of: window
                    }
                }
            }]
        }
    },
    _renderWidget: function() {
        if (support.inputType(this.dateBox.option("mode")) && this.dateBox._isNativeType() || this.dateBox.option("readOnly")) {
            if (this._widget) {
                this._widget.$element().remove();
                this._widget = null
            }
            return
        }
        var popup = this._getPopup();
        if (this._widget) {
            this._widget.option(this._getWidgetOptions())
        } else {
            var element = $("<div>").appendTo(popup.$content());
            this._widget = this._createWidget(element)
        }
        this._widget.$element().appendTo(this._getWidgetContainer())
    },
    _getWidgetName: function() {
        return DateView
    },
    _getWidgetOptions: function() {
        return {
            value: this.dateBoxValue() || new Date,
            type: this.dateBox.option("type"),
            minDate: this.dateBox.dateOption("min") || new Date(1900, 0, 1),
            maxDate: this.dateBox.dateOption("max") || new Date(Date.now() + 50 * dateUtils.ONE_YEAR),
            onDisposing: function() {
                this._widget = null
            }.bind(this)
        }
    }
});
module.exports = DateViewStrategy;
