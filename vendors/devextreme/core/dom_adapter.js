/**
 * DevExtreme (core/dom_adapter.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _typeof = "function" === typeof Symbol && "symbol" === typeof Symbol.iterator ? function(obj) {
    return typeof obj
} : function(obj) {
    return obj && "function" === typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj
};
var injector = require("./utils/dependency_injector");
var noop = require("./utils/common").noop;
var nativeDOMAdapterStrategy = {
    querySelectorAll: function(element, selector) {
        return element.querySelectorAll(selector)
    },
    elementMatches: function(element, selector) {
        var matches = element.matches || element.matchesSelector || element.mozMatchesSelector || element.msMatchesSelector || element.oMatchesSelector || element.webkitMatchesSelector || function(selector) {
            var doc = element.document || element.ownerDocument;
            if (!doc) {
                return false
            }
            var items = this.querySelectorAll(doc, selector);
            for (var i = 0; i < items.length; i++) {
                if (items[i] === element) {
                    return true
                }
            }
        }.bind(this);
        return matches.call(element, selector)
    },
    createElement: function(tagName, context) {
        context = context || this._document;
        return context.createElement(tagName)
    },
    createElementNS: function(ns, tagName, context) {
        context = context || this._document;
        return context.createElementNS(ns, tagName)
    },
    createTextNode: function(text, context) {
        context = context || this._document;
        return context.createTextNode(text)
    },
    isNode: function(element) {
        return "object" === ("undefined" === typeof element ? "undefined" : _typeof(element)) && "nodeType" in element
    },
    isElementNode: function(element) {
        return element && element.nodeType === Node.ELEMENT_NODE
    },
    isTextNode: function(element) {
        return element && element.nodeType === Node.TEXT_NODE
    },
    isDocument: function(element) {
        return element && element.nodeType === Node.DOCUMENT_NODE
    },
    removeElement: function(element) {
        var parentNode = element && element.parentNode;
        if (parentNode) {
            parentNode.removeChild(element)
        }
    },
    insertElement: function(parentElement, newElement, nextSiblingElement) {
        if (parentElement && newElement && parentElement !== newElement) {
            if (nextSiblingElement) {
                parentElement.insertBefore(newElement, nextSiblingElement)
            } else {
                parentElement.appendChild(newElement)
            }
        }
    },
    getAttribute: function(element, name) {
        return element.getAttribute(name)
    },
    setAttribute: function(element, name, value) {
        element.setAttribute(name, value)
    },
    removeAttribute: function(element, name) {
        element.removeAttribute(name)
    },
    setProperty: function(element, name, value) {
        element[name] = value
    },
    setText: function(element, text) {
        if (element) {
            element.textContent = text
        }
    },
    setClass: function(element, className, isAdd) {
        if (1 === element.nodeType && className) {
            if (element.classList) {
                if (isAdd) {
                    element.classList.add(className)
                } else {
                    element.classList.remove(className)
                }
            } else {
                var classNameSupported = "string" === typeof element.className;
                var elementClass = classNameSupported ? element.className : this.getAttribute(element, "class") || "";
                var classNames = elementClass.split(" ");
                var classIndex = classNames.indexOf(className);
                var resultClassName;
                if (isAdd && classIndex < 0) {
                    resultClassName = elementClass ? elementClass + " " + className : className
                }
                if (!isAdd && classIndex >= 0) {
                    classNames.splice(classIndex, 1);
                    resultClassName = classNames.join(" ")
                }
                if (void 0 !== resultClassName) {
                    if (classNameSupported) {
                        element.className = resultClassName
                    } else {
                        this.setAttribute(element, "class", resultClassName)
                    }
                }
            }
        }
    },
    setStyle: function(element, name, value) {
        element.style[name] = value || ""
    },
    _document: "undefined" === typeof document ? void 0 : document,
    getDocument: function() {
        return this._document
    },
    getActiveElement: function() {
        return this._document.activeElement
    },
    getBody: function() {
        return this._document.body
    },
    createDocumentFragment: function() {
        return this._document.createDocumentFragment()
    },
    getDocumentElement: function() {
        return this._document.documentElement
    },
    getLocation: function() {
        return this._document.location
    },
    getSelection: function() {
        return this._document.selection
    },
    getReadyState: function() {
        return this._document.readyState
    },
    getHead: function() {
        return this._document.head
    },
    hasDocumentProperty: function(property) {
        return property in this._document
    },
    listen: function(element, event, callback, options) {
        if (!element || !("addEventListener" in element)) {
            return noop
        }
        element.addEventListener(event, callback, options);
        return function() {
            element.removeEventListener(event, callback)
        }
    }
};
module.exports = injector(nativeDOMAdapterStrategy);
