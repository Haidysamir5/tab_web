/**
 * DevExtreme (core/dom_component.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var $ = require("../core/renderer"),
    eventsEngine = require("../events/core/events_engine"),
    windowUtils = require("../core/utils/window"),
    extend = require("./utils/extend").extend,
    config = require("./config"),
    errors = require("./errors"),
    getPublicElement = require("../core/utils/dom").getPublicElement,
    windowResizeCallbacks = require("../core/utils/resize_callbacks"),
    commonUtils = require("./utils/common"),
    each = require("./utils/iterator").each,
    typeUtils = require("./utils/type"),
    inArray = require("./utils/array").inArray,
    publicComponentUtils = require("./utils/public_component"),
    dataUtils = require("./element_data"),
    Component = require("./component"),
    abstract = Component.abstract;
var RTL_DIRECTION_CLASS = "dx-rtl",
    VISIBILITY_CHANGE_CLASS = "dx-visibility-change-handler",
    VISIBILITY_CHANGE_EVENTNAMESPACE = "VisibilityChange";
var DOMComponent = Component.inherit({
    _getDefaultOptions: function() {
        return extend(this.callBase(), {
            width: void 0,
            height: void 0,
            rtlEnabled: config().rtlEnabled,
            elementAttr: {},
            disabled: false,
            integrationOptions: {}
        })
    },
    ctor: function(element, options) {
        this._$element = $(element);
        publicComponentUtils.attachInstanceToElement(this._$element, this, this._dispose);
        this.callBase(options)
    },
    _visibilityChanged: abstract,
    _dimensionChanged: abstract,
    _init: function() {
        this.callBase();
        this._attachWindowResizeCallback()
    },
    _setOptionsByDevice: function(instanceCustomRules) {
        this.callBase([].concat(this.constructor._classCustomRules || [], instanceCustomRules || []))
    },
    _isInitialOptionValue: function(name) {
        var isCustomOption = this.constructor._classCustomRules && Object.prototype.hasOwnProperty.call(this._convertRulesToOptions(this.constructor._classCustomRules), name);
        return !isCustomOption && this.callBase(name)
    },
    _attachWindowResizeCallback: function() {
        if (this._isDimensionChangeSupported()) {
            var windowResizeCallBack = this._windowResizeCallBack = this._dimensionChanged.bind(this);
            windowResizeCallbacks.add(windowResizeCallBack)
        }
    },
    _isDimensionChangeSupported: function() {
        return this._dimensionChanged !== abstract
    },
    _renderComponent: function() {
        this._initMarkup();
        if (windowUtils.hasWindow()) {
            this._render()
        }
    },
    _initMarkup: function() {
        this._renderElementAttributes();
        this._toggleRTLDirection(this.option("rtlEnabled"));
        this._renderVisibilityChange();
        this._renderDimensions()
    },
    _render: function() {
        this._attachVisibilityChangeHandlers()
    },
    _renderElementAttributes: function() {
        var attributes = extend({}, this.option("elementAttr")),
            classNames = attributes.class;
        delete attributes.class;
        this.$element().attr(attributes).addClass(classNames)
    },
    _renderVisibilityChange: function() {
        if (this._isDimensionChangeSupported()) {
            this._attachDimensionChangeHandlers()
        }
        if (!this._isVisibilityChangeSupported()) {
            return
        }
        this.$element().addClass(VISIBILITY_CHANGE_CLASS)
    },
    _renderDimensions: function() {
        var $element = this.$element();
        var element = $element.get(0);
        var width = this._getOptionValue("width", element);
        var height = this._getOptionValue("height", element);
        if (this._isCssUpdateRequired(element, height, width)) {
            $element.css({
                width: width,
                height: height
            })
        }
    },
    _isCssUpdateRequired: function(element, height, width) {
        return !!(width || height || element.style.width || element.style.height)
    },
    _attachDimensionChangeHandlers: function() {
        var that = this;
        var resizeEventName = "dxresize." + this.NAME + VISIBILITY_CHANGE_EVENTNAMESPACE;
        eventsEngine.off(that.$element(), resizeEventName);
        eventsEngine.on(that.$element(), resizeEventName, function() {
            that._dimensionChanged()
        })
    },
    _attachVisibilityChangeHandlers: function() {
        if (!this._isVisibilityChangeSupported()) {
            return
        }
        var that = this;
        var hidingEventName = "dxhiding." + this.NAME + VISIBILITY_CHANGE_EVENTNAMESPACE;
        var shownEventName = "dxshown." + this.NAME + VISIBILITY_CHANGE_EVENTNAMESPACE;
        that._isHidden = !that._isVisible();
        eventsEngine.off(that.$element(), hidingEventName);
        eventsEngine.on(that.$element(), hidingEventName, function() {
            that._checkVisibilityChanged("hiding")
        });
        eventsEngine.off(that.$element(), shownEventName);
        eventsEngine.on(that.$element(), shownEventName, function() {
            that._checkVisibilityChanged("shown")
        })
    },
    _isVisible: function() {
        return this.$element().is(":visible")
    },
    _checkVisibilityChanged: function(event) {
        if ("hiding" === event && this._isVisible() && !this._isHidden) {
            this._visibilityChanged(false);
            this._isHidden = true
        } else {
            if ("shown" === event && this._isVisible() && this._isHidden) {
                this._isHidden = false;
                this._visibilityChanged(true)
            }
        }
    },
    _isVisibilityChangeSupported: function() {
        return this._visibilityChanged !== abstract && windowUtils.hasWindow()
    },
    _clean: commonUtils.noop,
    _modelByElement: function() {
        var modelByElement = this.option("modelByElement") || commonUtils.noop;
        return modelByElement(this.$element())
    },
    _invalidate: function() {
        if (!this._updateLockCount) {
            throw errors.Error("E0007")
        }
        this._requireRefresh = true
    },
    _refresh: function() {
        this._clean();
        this._renderComponent()
    },
    _dispose: function() {
        this.callBase();
        this._clean();
        this._detachWindowResizeCallback()
    },
    _detachWindowResizeCallback: function() {
        if (this._isDimensionChangeSupported()) {
            windowResizeCallbacks.remove(this._windowResizeCallBack)
        }
    },
    _toggleRTLDirection: function(rtl) {
        this.$element().toggleClass(RTL_DIRECTION_CLASS, rtl)
    },
    _createComponent: function(element, component, config) {
        var that = this;
        config = config || {};
        var synchronizableOptions = commonUtils.grep(["rtlEnabled", "disabled"], function(value) {
            return !(value in config)
        });
        var nestedComponentOptions = that.option("nestedComponentOptions") || commonUtils.noop;
        that._extendConfig(config, extend({
            integrationOptions: this.option("integrationOptions"),
            rtlEnabled: this.option("rtlEnabled"),
            disabled: this.option("disabled")
        }, nestedComponentOptions(this)));
        var instance;
        if (typeUtils.isString(component)) {
            var $element = $(element)[component](config);
            instance = $element[component]("instance")
        } else {
            if (element) {
                instance = component.getInstance(element);
                if (instance) {
                    instance.option(config)
                } else {
                    instance = new component(element, config)
                }
            }
        }
        if (instance) {
            var optionChangedHandler = function(args) {
                if (inArray(args.name, synchronizableOptions) >= 0) {
                    instance.option(args.name, args.value)
                }
            };
            that.on("optionChanged", optionChangedHandler);
            instance.on("disposing", function() {
                that.off("optionChanged", optionChangedHandler)
            })
        }
        return instance
    },
    _extendConfig: function(config, extendConfig) {
        each(extendConfig, function(key, value) {
            config[key] = Object.prototype.hasOwnProperty.call(config, key) ? config[key] : value
        })
    },
    _defaultActionConfig: function() {
        return extend(this.callBase(), {
            context: this._modelByElement(this.$element())
        })
    },
    _defaultActionArgs: function() {
        var model = this._modelByElement(this.$element());
        return extend(this.callBase(), {
            element: this.element(),
            model: model
        })
    },
    _optionChanged: function(args) {
        switch (args.name) {
            case "width":
            case "height":
                this._renderDimensions();
                break;
            case "rtlEnabled":
                this._invalidate();
                break;
            case "elementAttr":
                this._renderElementAttributes();
                break;
            case "disabled":
            case "integrationOptions":
                break;
            default:
                this.callBase(args)
        }
    },
    _removeAttributes: function(element) {
        var i = element.attributes.length - 1;
        for (; i >= 0; i--) {
            var attribute = element.attributes[i];
            if (!attribute) {
                return
            }
            var attributeName = attribute.name;
            if (0 === attributeName.indexOf("aria-") || attributeName.indexOf("dx-") !== -1 || "role" === attributeName || "style" === attributeName || "tabindex" === attributeName) {
                element.removeAttribute(attributeName)
            }
        }
    },
    _removeClasses: function(element) {
        var classes = element.className.split(" ").filter(function(cssClass) {
            return 0 !== cssClass.lastIndexOf("dx-", 0)
        });
        element.className = classes.join(" ")
    },
    endUpdate: function() {
        var requireRender = !this._initializing && !this._initialized;
        this.callBase.apply(this, arguments);
        if (!this._updateLockCount) {
            if (requireRender) {
                this._renderComponent()
            } else {
                if (this._requireRefresh) {
                    this._requireRefresh = false;
                    this._refresh()
                }
            }
        }
    },
    $element: function() {
        return this._$element
    },
    element: function() {
        return getPublicElement(this.$element())
    },
    dispose: function() {
        var element = this.$element().get(0);
        dataUtils.cleanDataRecursive(element, true);
        element.textContent = "";
        this._removeAttributes(element);
        this._removeClasses(element)
    }
});
DOMComponent.getInstance = function(element) {
    return publicComponentUtils.getInstanceByElement($(element), this)
};
DOMComponent.defaultOptions = function(rule) {
    this._classCustomRules = this._classCustomRules || [];
    this._classCustomRules.push(rule)
};
module.exports = DOMComponent;
module.exports.default = module.exports;
