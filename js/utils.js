if (typeof module !== "undefined") {
    var os = require('os');
} else {
    var os = false;
}

var UTILS = {
    hasNoValue: function (value) {
        if (value === false || value === null || value === "" || value === undefined || value === -1) {
            return true;
        }
        return false;
    },
    hasValue: function (value) {
        return !UTILS.hasNoValue(value);
    },

    osSlash: function () {
        return os.platform() === 'win32' ? '\\' : '/';
    },

    inArray: function (needle, haystack) {
        for (var i = 0; i < haystack.length; ++i) {
            if (haystack[i] === needle) {
                return true;
            }
        }

        return false;
    },

    objectKeysToArray: function (obj) {
        var objArray = [];
        for (var prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                if (obj[prop].constructor === Object) {
                    var subArray = UTILS.objectKeysToArray(obj[prop]);
                    for (var s = 0; s < subArray.length; ++s) {
                        objArray.push(prop + "-" + subArray[s]);
                    }
                } else {
                    objArray.push(prop);
                }
            }
        }

        return objArray;
    },

    findMatches: function (regexString, content) {
        var matchesFound = [];
        var rex = new RegExp(regexString, 'gmi');
        while (matchFound = rex.exec(content)) {
            matchesFound.push(matchFound);
        }
        return matchesFound;
    },

    mergeObjects: function () {
        var resObj = {};
        for (var i = 0; i < arguments.length; ++i) {
             var obj = arguments[i],
                 keys = Object.keys(obj);
             for (var j = 0; j < keys.length; ++j) {
                 resObj[keys[j]] = obj[keys[j]];
             }
        }
        return resObj;
    },

    entityMap: {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
        "/": "&#x2F;",
        "`": "&#x60;",
        "=": "&#x3D;",
    },

    escapeHtml: function (string) {
        return String(string).replace(/[&<>"'`=\/]/g, function(s) {
            return UTILS.entityMap[s];
        });
    },

    unescapeHtml: function (string) {
        return String(string).replace(/[&<>"'`=\/]/g, function(s) {
            return UTILS.entityMap[s];
        });
    },

    // Reference: https://gomakethings.com/better-proxy-performance-in-vanilla-js/
    // Usage: makeProxy(options, _this);
    /**
     * Create settings and getters for data Proxy
     * @param  {Constructor} instance The current instantiation
     * @return {Object}               The setter and getter methods for the Proxy
     */
    dataHandler: function (instance) {
        return {
            get: function (obj, prop) {

                // If the property is "isProxy", item is already being intercepted by this proxy handler
                // return true
                if (prop === '_isProxy') return true;

                // If the property is an array or object and not already a proxy, make it one
                if (typeof obj[prop] === 'object' && !obj[prop]._isProxy) {
                    obj[prop] = new Proxy(obj[prop], UTILS.dataHandler(instance));
                }

                return obj[prop];
            },
            set: function (obj, prop, value) {
                if (obj[prop] === value) return true;
                obj[prop] = value;
                // render(instance);
                console.log("* PROXY -> SET");
                return true;
            },
            deleteProperty: function (obj, prop) {
                delete obj[prop];
                // render(instance);
                console.log("* PROXY -> DELETE");
                return true;
            }
        };
    },

    /**
     * Create a proxy from a data object
     * @param  {Object}     options  The options object
     * @param  {Contructor} instance The current parent instantiation
     * @return {Proxy}               The Proxy
     */
    makeProxy: function (options, instance) {
        if (options.setters) return !options.store ? options.data : null;
        if (!options.data) return null;
        return new Proxy(options.data, UTILS.dataHandler(instance));
    },
};

if (typeof module !== "undefined") {
    module.exports = UTILS;
}