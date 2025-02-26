/**
 * DevExtreme (ui/radio_group/radio_group.js)
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
var _devices = require("../../core/devices");
var _devices2 = _interopRequireDefault(_devices);
var _utils = require("../widget/utils.ink_ripple");
var _utils2 = _interopRequireDefault(_utils);
var _component_registrator = require("../../core/component_registrator");
var _component_registrator2 = _interopRequireDefault(_component_registrator);
var _uiCollection_widget = require("../collection/ui.collection_widget.edit");
var _uiCollection_widget2 = _interopRequireDefault(_uiCollection_widget);
var _ui = require("../editor/ui.data_expression");
var _ui2 = _interopRequireDefault(_ui);
var _editor = require("../editor/editor");
var _editor2 = _interopRequireDefault(_editor);

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
var RADIO_BUTTON_CHECKED_CLASS = "dx-radiobutton-checked",
    RADIO_BUTTON_CLASS = "dx-radiobutton",
    RADIO_BUTTON_ICON_CHECKED_CLASS = "dx-radiobutton-icon-checked",
    RADIO_BUTTON_ICON_CLASS = "dx-radiobutton-icon",
    RADIO_BUTTON_ICON_DOT_CLASS = "dx-radiobutton-icon-dot",
    RADIO_GROUP_HORIZONTAL_CLASS = "dx-radiogroup-horizontal",
    RADIO_GROUP_VERTICAL_CLASS = "dx-radiogroup-vertical",
    RADIO_VALUE_CONTAINER_CLASS = "dx-radio-value-container",
    RADIO_GROUP_CLASS = "dx-radiogroup",
    RADIO_FEEDBACK_HIDE_TIMEOUT = 100;
var RadioCollection = function(_CollectionWidget) {
    _inherits(RadioCollection, _CollectionWidget);

    function RadioCollection() {
        _classCallCheck(this, RadioCollection);
        return _possibleConstructorReturn(this, (RadioCollection.__proto__ || Object.getPrototypeOf(RadioCollection)).apply(this, arguments))
    }
    _createClass(RadioCollection, [{
        key: "_focusTarget",
        value: function() {
            return this.$element().parent()
        }
    }, {
        key: "_getDefaultOptions",
        value: function() {
            var defaultOptions = _get(RadioCollection.prototype.__proto__ || Object.getPrototypeOf(RadioCollection.prototype), "_getDefaultOptions", this).call(this);
            return (0, _extend.extend)(defaultOptions, _ui2.default._dataExpressionDefaultOptions(), {
                _itemAttributes: {
                    role: "radio"
                }
            })
        }
    }, {
        key: "_initMarkup",
        value: function() {
            _get(RadioCollection.prototype.__proto__ || Object.getPrototypeOf(RadioCollection.prototype), "_initMarkup", this).call(this);
            this.itemElements().addClass(RADIO_BUTTON_CLASS)
        }
    }, {
        key: "_keyboardEventBindingTarget",
        value: function() {
            return this._focusTarget()
        }
    }, {
        key: "_postprocessRenderItem",
        value: function(args) {
            var html = args.itemData.html,
                itemElement = args.itemElement;
            if (!html) {
                var $radio = (0, _renderer2.default)("<div>").addClass(RADIO_BUTTON_ICON_CLASS);
                (0, _renderer2.default)("<div>").addClass(RADIO_BUTTON_ICON_DOT_CLASS).appendTo($radio);
                var $radioContainer = (0, _renderer2.default)("<div>").append($radio).addClass(RADIO_VALUE_CONTAINER_CLASS);
                (0, _renderer2.default)(itemElement).prepend($radioContainer)
            }
            _get(RadioCollection.prototype.__proto__ || Object.getPrototypeOf(RadioCollection.prototype), "_postprocessRenderItem", this).call(this, args)
        }
    }, {
        key: "_processSelectableItem",
        value: function($itemElement, isSelected) {
            _get(RadioCollection.prototype.__proto__ || Object.getPrototypeOf(RadioCollection.prototype), "_processSelectableItem", this).call(this, $itemElement, isSelected);
            $itemElement.toggleClass(RADIO_BUTTON_CHECKED_CLASS, isSelected).find("." + RADIO_BUTTON_ICON_CLASS).first().toggleClass(RADIO_BUTTON_ICON_CHECKED_CLASS, isSelected);
            this.setAria("checked", isSelected, $itemElement)
        }
    }, {
        key: "_refreshContent",
        value: function() {
            this._prepareContent();
            this._renderContent()
        }
    }, {
        key: "_supportedKeys",
        value: function() {
            var parent = _get(RadioCollection.prototype.__proto__ || Object.getPrototypeOf(RadioCollection.prototype), "_supportedKeys", this).call(this);
            return (0, _extend.extend)({}, parent, {
                enter: function(e) {
                    e.preventDefault();
                    return parent.enter.apply(this, arguments)
                },
                space: function(e) {
                    e.preventDefault();
                    return parent.space.apply(this, arguments)
                }
            })
        }
    }, {
        key: "itemElements",
        value: function() {
            var elements = _get(RadioCollection.prototype.__proto__ || Object.getPrototypeOf(RadioCollection.prototype), "itemElements", this).call(this);
            return elements.not(elements.find(this._itemSelector()))
        }
    }]);
    return RadioCollection
}(_uiCollection_widget2.default);
var RadioGroup = function(_Editor) {
    _inherits(RadioGroup, _Editor);

    function RadioGroup() {
        _classCallCheck(this, RadioGroup);
        return _possibleConstructorReturn(this, (RadioGroup.__proto__ || Object.getPrototypeOf(RadioGroup)).apply(this, arguments))
    }
    _createClass(RadioGroup, [{
        key: "_clean",
        value: function() {
            delete this._inkRipple;
            _get(RadioGroup.prototype.__proto__ || Object.getPrototypeOf(RadioGroup.prototype), "_clean", this).call(this)
        }
    }, {
        key: "_dataSourceOptions",
        value: function() {
            return {
                paginate: false
            }
        }
    }, {
        key: "_defaultOptionsRules",
        value: function() {
            var defaultOptionsRules = _get(RadioGroup.prototype.__proto__ || Object.getPrototypeOf(RadioGroup.prototype), "_defaultOptionsRules", this).call(this);
            return defaultOptionsRules.concat([{
                device: {
                    tablet: true
                },
                options: {
                    layout: "horizontal"
                }
            }, {
                device: function() {
                    return "desktop" === _devices2.default.real().deviceType && !_devices2.default.isSimulator()
                },
                options: {
                    focusStateEnabled: true
                }
            }])
        }
    }, {
        key: "_fireContentReadyAction",
        value: function(force) {
            force && _get(RadioGroup.prototype.__proto__ || Object.getPrototypeOf(RadioGroup.prototype), "_fireContentReadyAction", this).call(this)
        }
    }, {
        key: "_focusTarget",
        value: function() {
            return this.$element()
        }
    }, {
        key: "_getAriaTarget",
        value: function() {
            return this.$element()
        }
    }, {
        key: "_getDefaultOptions",
        value: function() {
            var defaultOptions = _get(RadioGroup.prototype.__proto__ || Object.getPrototypeOf(RadioGroup.prototype), "_getDefaultOptions", this).call(this);
            return (0, _extend.extend)(defaultOptions, (0, _extend.extend)(_ui2.default._dataExpressionDefaultOptions(), {
                hoverStateEnabled: true,
                activeStateEnabled: true,
                layout: "vertical",
                useInkRipple: false
            }))
        }
    }, {
        key: "_getItemValue",
        value: function(item) {
            return this._valueGetter ? this._valueGetter(item) : item.text
        }
    }, {
        key: "_getSubmitElement",
        value: function() {
            return this._$submitElement
        }
    }, {
        key: "_init",
        value: function() {
            _get(RadioGroup.prototype.__proto__ || Object.getPrototypeOf(RadioGroup.prototype), "_init", this).call(this);
            this._activeStateUnit = "." + RADIO_BUTTON_CLASS;
            this._feedbackHideTimeout = RADIO_FEEDBACK_HIDE_TIMEOUT;
            this._initDataExpressions()
        }
    }, {
        key: "_initMarkup",
        value: function() {
            this.$element().addClass(RADIO_GROUP_CLASS);
            this._renderSubmitElement();
            this.setAria("role", "radiogroup");
            this._renderRadios();
            this.option("useInkRipple") && this._renderInkRipple();
            _get(RadioGroup.prototype.__proto__ || Object.getPrototypeOf(RadioGroup.prototype), "_initMarkup", this).call(this)
        }
    }, {
        key: "_itemClickHandler",
        value: function(_ref) {
            var itemElement = _ref.itemElement,
                event = _ref.event,
                itemData = _ref.itemData;
            if (this.itemElements().is(itemElement)) {
                var newValue = this._getItemValue(itemData);
                if (newValue !== this.option("value")) {
                    this._saveValueChangeEvent(event);
                    this.option("value", newValue)
                }
            }
        }
    }, {
        key: "_optionChanged",
        value: function(args) {
            var name = args.name,
                value = args.value;
            this._dataExpressionOptionChanged(args);
            switch (name) {
                case "useInkRipple":
                    this._invalidate();
                    break;
                case "focusStateEnabled":
                case "accessKey":
                case "tabIndex":
                    this._setCollectionWidgetOption(name, value);
                    break;
                case "disabled":
                    _get(RadioGroup.prototype.__proto__ || Object.getPrototypeOf(RadioGroup.prototype), "_optionChanged", this).call(this, args);
                    this._setCollectionWidgetOption(name, value);
                    break;
                case "dataSource":
                    this._setCollectionWidgetOption("dataSource", this._dataSource);
                    break;
                case "valueExpr":
                    this._setCollectionWidgetOption("keyExpr", this._getCollectionKeyExpr());
                    break;
                case "value":
                    this._setCollectionWidgetOption("selectedItemKeys", [value]);
                    this._setSubmitValue(value);
                    _get(RadioGroup.prototype.__proto__ || Object.getPrototypeOf(RadioGroup.prototype), "_optionChanged", this).call(this, args);
                    break;
                case "items":
                case "itemTemplate":
                case "displayExpr":
                    break;
                case "layout":
                    this._renderLayout();
                    this._updateItemsSize();
                    break;
                default:
                    _get(RadioGroup.prototype.__proto__ || Object.getPrototypeOf(RadioGroup.prototype), "_optionChanged", this).call(this, args)
            }
        }
    }, {
        key: "_render",
        value: function() {
            this._renderLayout();
            _get(RadioGroup.prototype.__proto__ || Object.getPrototypeOf(RadioGroup.prototype), "_render", this).call(this);
            this._updateItemsSize()
        }
    }, {
        key: "_renderInkRipple",
        value: function() {
            this._inkRipple = _utils2.default.render({
                waveSizeCoefficient: 3.3,
                useHoldAnimation: false,
                isCentered: true
            })
        }
    }, {
        key: "_renderLayout",
        value: function() {
            var layout = this.option("layout"),
                $element = this.$element();
            $element.toggleClass(RADIO_GROUP_VERTICAL_CLASS, "vertical" === layout);
            $element.toggleClass(RADIO_GROUP_HORIZONTAL_CLASS, "horizontal" === layout)
        }
    }, {
        key: "_renderRadios",
        value: function() {
            var _this3 = this;
            var $radios = (0, _renderer2.default)("<div>").appendTo(this.$element());
            this._radios = this._createComponent($radios, RadioCollection, {
                displayExpr: this.option("displayExpr"),
                accessKey: this.option("accessKey"),
                dataSource: this._dataSource,
                focusStateEnabled: this.option("focusStateEnabled"),
                itemTemplate: this.option("itemTemplate"),
                keyExpr: this._getCollectionKeyExpr(),
                noDataText: "",
                onContentReady: function() {
                    return _this3._fireContentReadyAction(true)
                },
                onItemClick: this._itemClickHandler.bind(this),
                scrollingEnabled: false,
                selectionByClick: false,
                selectionMode: "single",
                selectedItemKeys: [this.option("value")],
                tabIndex: this.option("tabIndex")
            })
        }
    }, {
        key: "_renderSubmitElement",
        value: function() {
            this._$submitElement = (0, _renderer2.default)("<input>").attr("type", "hidden").appendTo(this.$element());
            this._setSubmitValue()
        }
    }, {
        key: "_setOptionsByReference",
        value: function() {
            _get(RadioGroup.prototype.__proto__ || Object.getPrototypeOf(RadioGroup.prototype), "_setOptionsByReference", this).call(this);
            (0, _extend.extend)(this._optionsByReference, {
                value: true
            })
        }
    }, {
        key: "_setSubmitValue",
        value: function(value) {
            value = value || this.option("value");
            var submitValue = "this" === this.option("valueExpr") ? this._displayGetter(value) : value;
            this._$submitElement.val(submitValue)
        }
    }, {
        key: "_setCollectionWidgetOption",
        value: function() {
            this._setWidgetOption("_radios", arguments)
        }
    }, {
        key: "_toggleActiveState",
        value: function($element, value, e) {
            _get(RadioGroup.prototype.__proto__ || Object.getPrototypeOf(RadioGroup.prototype), "_toggleActiveState", this).call(this, $element, value, e);
            if (this._inkRipple) {
                var event = {
                    element: $element.find("." + RADIO_BUTTON_ICON_CLASS),
                    event: e
                };
                value ? this._inkRipple.showWave(event) : this._inkRipple.hideWave(event)
            }
        }
    }, {
        key: "_updateItemsSize",
        value: function() {
            if ("horizontal" === this.option("layout")) {
                this.itemElements().css("height", "auto")
            } else {
                var itemsCount = this.option("items").length;
                this.itemElements().css("height", 100 / itemsCount + "%")
            }
        }
    }, {
        key: "focus",
        value: function() {
            this._radios && this._radios.focus()
        }
    }, {
        key: "itemElements",
        value: function() {
            return this._radios.itemElements()
        }
    }]);
    return RadioGroup
}(_editor2.default);
RadioGroup.include(_ui2.default);
(0, _component_registrator2.default)("dxRadioGroup", RadioGroup);
module.exports = RadioGroup;
