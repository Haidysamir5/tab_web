/**
 * DevExtreme (ui/map.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var $ = require("../core/renderer"),
    eventsEngine = require("../events/core/events_engine"),
    Promise = require("../core/polyfills/promise"),
    fromPromise = require("../core/utils/deferred").fromPromise,
    registerComponent = require("../core/component_registrator"),
    errors = require("./widget/ui.errors"),
    devices = require("../core/devices"),
    Widget = require("./widget/ui.widget"),
    inflector = require("../core/utils/inflector"),
    each = require("../core/utils/iterator").each,
    extend = require("../core/utils/extend").extend,
    inArray = require("../core/utils/array").inArray,
    isNumeric = require("../core/utils/type").isNumeric,
    eventUtils = require("../events/utils"),
    pointerEvents = require("../events/pointer"),
    wrapToArray = require("../core/utils/array").wrapToArray;
var PROVIDERS = {
    googleStatic: require("./map/provider.google_static"),
    google: require("./map/provider.dynamic.google"),
    bing: require("./map/provider.dynamic.bing")
};
var MAP_CLASS = "dx-map",
    MAP_CONTAINER_CLASS = "dx-map-container",
    MAP_SHIELD_CLASS = "dx-map-shield",
    NATIVE_CLICK_CLASS = "dx-native-click";
var Map = Widget.inherit({
    _getDefaultOptions: function() {
        return extend(this.callBase(), {
            bounds: {
                northEast: null,
                southWest: null
            },
            center: {
                lat: 0,
                lng: 0
            },
            zoom: 1,
            width: 300,
            height: 300,
            type: "roadmap",
            provider: "google",
            autoAdjust: true,
            markers: [],
            markerIconSrc: null,
            onMarkerAdded: null,
            onMarkerRemoved: null,
            routes: [],
            onRouteAdded: null,
            onRouteRemoved: null,
            key: {
                bing: "",
                google: "",
                googleStatic: ""
            },
            controls: false,
            onReady: null,
            onUpdated: null,
            onClick: null
        })
    },
    _defaultOptionsRules: function() {
        return this.callBase().concat([{
            device: function() {
                return "desktop" === devices.real().deviceType && !devices.isSimulator()
            },
            options: {
                focusStateEnabled: true
            }
        }])
    },
    _init: function() {
        this.callBase();
        this.$element().addClass(MAP_CLASS).addClass(NATIVE_CLICK_CLASS);
        this._lastAsyncAction = Promise.resolve();
        this._checkOption("provider");
        this._checkOption("markers");
        this._checkOption("routes");
        this._initContainer();
        this._grabEvents();
        this._rendered = {}
    },
    _checkOption: function(option) {
        var value = this.option(option);
        if ("markers" === option && !Array.isArray(value)) {
            throw errors.Error("E1022")
        }
        if ("routes" === option && !Array.isArray(value)) {
            throw errors.Error("E1023")
        }
    },
    _initContainer: function() {
        this._$container = $("<div>").addClass(MAP_CONTAINER_CLASS);
        this.$element().append(this._$container)
    },
    _grabEvents: function() {
        var eventName = eventUtils.addNamespace(pointerEvents.down, this.NAME);
        eventsEngine.on(this.$element(), eventName, this._cancelEvent.bind(this))
    },
    _cancelEvent: function(e) {
        var cancelByProvider = this._provider && this._provider.isEventsCanceled(e) && !this.option("disabled");
        if (cancelByProvider) {
            e.stopPropagation()
        }
    },
    _saveRendered: function(option) {
        var value = this.option(option);
        this._rendered[option] = value.slice()
    },
    _render: function() {
        this.callBase();
        this._renderShield();
        this._saveRendered("markers");
        this._saveRendered("routes");
        this._provider = new(PROVIDERS[this.option("provider")])(this, this._$container);
        this._queueAsyncAction("render", this._rendered.markers, this._rendered.routes)
    },
    _renderShield: function() {
        var $shield;
        if (this.option("disabled")) {
            $shield = $("<div>").addClass(MAP_SHIELD_CLASS);
            this.$element().append($shield)
        } else {
            $shield = this.$element().find("." + MAP_SHIELD_CLASS);
            $shield.remove()
        }
    },
    _clean: function() {
        this._cleanFocusState();
        if (this._provider) {
            this._provider.clean()
        }
        this._provider = null;
        this._lastAsyncAction = Promise.resolve();
        this.setOptionSilent("bounds", {
            northEast: null,
            southWest: null
        });
        delete this._suppressAsyncAction
    },
    _optionChanged: function(args) {
        var name = args.name;
        var changeBag = this._optionChangeBag;
        this._optionChangeBag = null;
        switch (name) {
            case "disabled":
                this._renderShield();
                this.callBase(args);
                break;
            case "width":
            case "height":
                this.callBase(args);
                this._dimensionChanged();
                break;
            case "provider":
                this._suppressAsyncAction = true;
                this._invalidate();
                break;
            case "key":
                errors.log("W1001");
                break;
            case "bounds":
                this._queueAsyncAction("updateBounds");
                break;
            case "center":
                this._queueAsyncAction("updateCenter");
                break;
            case "zoom":
                this._queueAsyncAction("updateZoom");
                break;
            case "type":
                this._queueAsyncAction("updateMapType");
                break;
            case "controls":
                this._queueAsyncAction("updateControls", this._rendered.markers, this._rendered.routes);
                break;
            case "autoAdjust":
                this._queueAsyncAction("adjustViewport");
                break;
            case "markers":
            case "routes":
                this._checkOption(name);
                var prevValue = this._rendered[name];
                this._saveRendered(name);
                this._queueAsyncAction("update" + inflector.titleize(name), changeBag ? changeBag.removed : prevValue, changeBag ? changeBag.added : this._rendered[name]).then(function(result) {
                    if (changeBag) {
                        changeBag.resolve(result)
                    }
                });
                break;
            case "markerIconSrc":
                this._queueAsyncAction("updateMarkers", this._rendered.markers, this._rendered.markers);
                break;
            case "onReady":
            case "onUpdated":
            case "onMarkerAdded":
            case "onMarkerRemoved":
            case "onRouteAdded":
            case "onRouteRemoved":
            case "onClick":
                break;
            default:
                this.callBase.apply(this, arguments)
        }
    },
    _visibilityChanged: function(visible) {
        if (visible) {
            this._dimensionChanged()
        }
    },
    _dimensionChanged: function() {
        this._queueAsyncAction("updateDimensions")
    },
    _queueAsyncAction: function(name) {
        var options = [].slice.call(arguments).slice(1),
            isActionSuppressed = this._suppressAsyncAction;
        this._lastAsyncAction = this._lastAsyncAction.then(function() {
            if (!this._provider || isActionSuppressed) {
                return Promise.resolve()
            }
            return this._provider[name].apply(this._provider, options).then(function(result) {
                result = wrapToArray(result);
                var mapRefreshed = result[0];
                if (mapRefreshed) {
                    this._triggerReadyAction()
                }
                return result[1]
            }.bind(this))
        }.bind(this));
        return this._lastAsyncAction
    },
    _triggerReadyAction: function() {
        this._createActionByOption("onReady")({
            originalMap: this._provider.map()
        })
    },
    _triggerUpdateAction: function() {
        this._createActionByOption("onUpdated")()
    },
    setOptionSilent: function(name, value) {
        this._setOptionSilent(name, value)
    },
    addMarker: function(marker) {
        return this._addFunction("markers", marker)
    },
    removeMarker: function(marker) {
        return this._removeFunction("markers", marker)
    },
    addRoute: function(route) {
        return this._addFunction("routes", route)
    },
    removeRoute: function(route) {
        return this._removeFunction("routes", route)
    },
    _addFunction: function(optionName, addingValue) {
        var optionValue = this.option(optionName),
            addingValues = wrapToArray(addingValue);
        optionValue.push.apply(optionValue, addingValues);
        return this._partialArrayOptionChange(optionName, optionValue, addingValues, [])
    },
    _removeFunction: function(optionName, removingValue) {
        var optionValue = this.option(optionName),
            removingValues = wrapToArray(removingValue);
        each(removingValues, function(removingIndex, removingValue) {
            var index = isNumeric(removingValue) ? removingValue : inArray(removingValue, optionValue);
            if (index !== -1) {
                var removing = optionValue.splice(index, 1)[0];
                removingValues.splice(removingIndex, 1, removing)
            } else {
                throw errors.log("E1021", inflector.titleize(optionName.substring(0, optionName.length - 1)), removingValue)
            }
        });
        return this._partialArrayOptionChange(optionName, optionValue, [], removingValues)
    },
    _partialArrayOptionChange: function(optionName, optionValue, addingValues, removingValues) {
        return fromPromise(new Promise(function(resolve) {
            this._optionChangeBag = {
                resolve: resolve,
                added: addingValues,
                removed: removingValues
            };
            this.option(optionName, optionValue)
        }.bind(this)).then(function(result) {
            return result && 1 === result.length ? result[0] : result
        }), this)
    }
});
registerComponent("dxMap", Map);
module.exports = Map;
module.exports.default = module.exports;
