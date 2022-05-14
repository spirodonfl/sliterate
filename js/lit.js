if (typeof module !== "undefined") {
    var UTILS = require('./utils.js');
}

/**
 * TODO: Cached output?
 * - If you are referencing a file with lines (or an entire file)
 * - If you are referencing another files output
 * 
 * TODO: Variable type of "data"
 * 
 * TODO: When parsing files, respect "skipComments (likely when you parse JSON files and content = includeAsComment), skipNewlines, stripNewlines"
 */

var LIT = {
    types: ["text", "block", "table", "ordered_list", "unordered_list", "link", "variable", "h1", "h2", "h3", "h4", "h5", "h6", "image", "chalkboard"],
    variableTypes: ["text", "block", "number", "boolean", "data", "reference"],

    regexes: {
        variable: "({{{([a-zA-Z0-9\\-_.=]*)}}})",
    },

    list: {
        "text": "Text",
        "block": "Block",
        "table": "Table",
        "ordered_list": "Ordered List",
        "unordered_list": "Unordered List",
        "link": "Link",
        "variable": "Variable",
        "h1": "H1",
        "h2": "H2",
        "h3": "H3",
        "h4": "H4",
        "h5": "H5",
        "h6": "H6",
        "image": "Image",
        "chalkboard": "Chalkboard",
        "number": "Number",
        "boolean": "Boolean",
        "data": "Data",
        "reference": "Reference",
    },

    toFriendly: function (unfriendly) {
        if (this.list[unfriendly]) {
            return this.list[unfriendly];
        }

        return false;
    },

    newVariable: function () {
        return {
            group: "",
            name: "",
            file: "",
            directory: "",
            variable: "",
            content: "",
            output: "",
            lines: "",
            language: "markdown",
            type: "",
            value: true,
        };
    },

    newOutput: function () {
        return {
            name: "someName",
            file: "test.js",
            directory: "C:\\Development",
            language: "javascript",
            value: "Some stuff here",
        };
    },

    newContent: function () {
        return {
            name: "",
            group: "",
            language: "",
            type: "text",
            value: "CONTENT",
            tags: [],
            includeAsComment: false,
        }
    },

    validateObject: function (obj) {
        if (UTILS.hasNoValue(obj.name)) {
            return {error: "An object must have a name", field: "name"};
        }

        return true;
    },

    validateOutputObject: function (obj) {
        var parentValidation = LIT.validateObject(obj);
        if (parentValidation) {
            if (UTILS.hasNoValue(obj.file)) {
                return {error: "No file has been provided", field: "file"};
            } else if (UTILS.hasNoValue(obj.language)) {
                return {error: "No language has been provided", field: "language"};
            }
        } else {
            return parentValidation;
        }

        return true;
    },

    validateContentObject: function (obj) {
        // TODO: This
    },

    validateVariableObject: function (obj) {
        // TODO: This
    },

    findVariable: function (search, name) {
        for (var i = 0; i < search.length; ++i) {
            var item = search[i];
            if (item.name === name) {
                return item;
            }
        }

        return false;
    },

    findContent: function (search, name) {
        for (var i = 0; i < search.length; ++i) {
            var item = search[i];
            if (item.name === name) {
                return item;
            }
        }

        return false;
    },

    findOutput: function (search, name) {
        for (var i = 0; i < search.length; ++i) {
            var item = search[i];
            if (item.name === name) {
                return item;
            }
        }

        return false;
    },

    inApprovedTextFormat: function (type) {
        var approvedTextFormats = ["text", "h1", "h2", "h3", "h4", "h5", "h6"];
        for (var a = 0; a < approvedTextFormats.length; ++a) {
            if (approvedTextFormats[a] === type) {
                return true;
            }
        }

        return false;
    },

    inApprovedListFormat: function (type) {
        var approvedTextFormats = ["ordered_list", "unordered_list"];
        for (var a = 0; a < approvedTextFormats.length; ++a) {
            if (approvedTextFormats[a] === type) {
                return true;
            }
        }

        return false;
    },

    resolveOutput: function (search, output) {
        output._resolvedValue = "TEST";

        return output;
    },

    resolveContent: function (args) {
        var {litFile, content} = UTILS.mergeObjects({
            litFile: false,
            content: false,
        }, args);

        for (var c = 0; c < litFile.body.length; ++c) {
            var thisContent = litFile.body[c];
            var _resolvedValue = thisContent.value;
            var matchesInContent = UTILS.findMatches(LIT.regexes.variable, _resolvedValue);
            for (var mIC = 0; mIC < matchesInContent.length; ++mIC) {
                var matchInVariable = matchesInContent[mIC];
                var litVar = LIT.findVariable(litFile.variables, matchInVariable[2]);
                if (UTILS.hasValue(litVar)) {
                    litVar = LIT.resolveVariable({litFile, variable: litVar});
                    if (UTILS.hasValue(litVar._resolvedValue)) {
                        _resolvedValue = _resolvedValue.replace(matchInVariable[1], litVar._resolvedValue);
                    } else {
                        console.error("Tried to resolve a variable but could not", litVar);
                    }
                }
            }
            content._resolvedValue = _resolvedValue;
        }

        return content;
    },

    resolveVariable: function (args) {
        // TODO: All functions should do this
        // Reference: https://gomakethings.com/my-preferred-way-to-pass-arguments-into-a-function-with-vanilla-javascript/
        var {litFile, variable} = UTILS.mergeObjects({
            litFile: false,
            variable: false,
        }, args);
        if (UTILS.hasNoValue(variable._resolvedValue)) {
            if (variable.type === "number") {
                variable._resolvedValue = parseInt(variable.value);
                // TODO: Make sure string is number
            } else if (variable.type === "boolean") {
                if (variable.value === "0") {
                    variable._resolvedValue = 0;
                } else if (variable.value === "1") {
                    variable._resolvedValue = 1;
                } else {
                    // TODO: Error
                }
            } else if (LIT.inApprovedTextFormat(variable.type)) {
                var _resolvedValue = variable.value;
                var matchesInVariable = UTILS.findMatches(LIT.regexes.variable, _resolvedValue);
                for (var mIV = 0; mIV < matchesInVariable.length; ++mIV) {
                    var matchInVariable = matchesInVariable[mIV];
                    var litVar = LIT.findVariable(litFile.variables, matchInVariable[2]);
                    if (UTILS.hasValue(litVar)) {
                        litVar = LIT.resolveVariable({litFile, variable: litVar});
                        if (UTILS.hasValue(litVar._resolvedValue)) {
                            _resolvedValue = _resolvedValue.replace(matchInVariable[1], litVar._resolvedValue);
                        } else {
                            console.error("Tried to resolve a variable but could not", litVar);
                        }
                    }
                }
                variable._resolvedValue = _resolvedValue;
            } else if (variable.type === "reference" && variable.file === "self") {
                var _resolvedValue = false;
                if (UTILS.hasValue(variable.variable)) {
                    var subLitVar = LIT.findVariable(litFile.variables, variable.variable);
                    if (UTILS.hasValue(subLitVar)) {
                        subLitVar = LIT.resolveVariable({litFile, variable: subLitVar});
                        if (UTILS.hasValue(subLitVar._resolvedValue)) {
                            _resolvedValue = subLitVar._resolvedValue;
                        } else {
                            console.error("Tried to resolve a variable (from another variable) but could not", subLitVar);
                        }
                    }
                    variable._resolvedValue = _resolvedValue;
                } else if (UTILS.hasValue(variable.content)) {
                    var subLitContent = LIT.findContent(litFile.content, variable.content);
                    if (UTILS.hasValue(subLitContent)) {
                        subLitContent = LIT.resolveContent({litFile, content: subLitContent});
                        if (UTILS.hasValue(subLitContent._resolvedValue)) {
                            _resolvedValue = subLitContent._resolvedValue;
                        } else {
                            console.error("Tried to resolve content (from another variable) but could not", subLitContent);
                        }
                    }
                    variable._resolvedValue = _resolvedValue;
                } else if (UTILS.hasValue(variable.output)) {
                    // TODO: reference self output
                    // However, this gets complicated, so, for now, you cannot reference your own output
                } else {
                    console.error("Tried to reference self but did not provide enough parameters", variable);
                }
            } else if (variable.type === "reference" && variable.file !== "self" && variable.file !== "") {
                if (UTILS.hasValue(variable.lines)) {
                    var searchLines = variable.lines.split(",");
                    for (var s = 0; s < searchLines.length; ++s) {
                        searchLines[s] = searchLines[s].split("-");
                    }
                    var slines = [];
                    for (var s = 0; s < searchLines.length; ++s) {
                        var searchLine = searchLines[s];
                        if (searchLine.length === 1) {
                            slines.push(parseInt(searchLine[0]));
                        } else if (searchLine.length === 2) {
                            var start = searchLine[0];
                            for (var i = start; i < searchLine[1]; ++i) {
                                slines.push(parseInt(i));
                            }
                            slines.push(parseInt(searchLine[1]));
                        }
                    }
                    // Note: Lines always take precedence, no matter what!
                    // variable.lines.split(",")
                    // foreach
                    //   variableLine.split("-")
                    // This way you can have "12", "12,41", "12-41", "12,41-50", "12,41,50-55" etc...
                    // Or there are no lines and you just grab the whole damn file
                    // TODO: This is a memory efficient way to handle file reading (createreadstream) but annoying promises
                    // TODO: I guess you need async/await or just a promise
                    // var fileReadStream = fs.createReadStream(variable.directory + variable.file, {
                    //     highWaterMark: 12,
                    //     // start: 0,
                    //     // end: 62,
                    // });
                    // var lineCounter = 1;
                    // var line = "";
                    // fileReadStream.on('data', function (chunk) {
                    //     var chunkString = chunk.toString();
                    //     for (var c = 0; c < chunkString.length; ++c) {
                    //         line += chunkString[c];
                    //         if (chunkString[c].match("\\n")) {
                    //             line += chunkString[c];
                    //             // TODO: if (lineCounter === someLines) or if lineCounter is in someLines, append
                    //             ++lineCounter;
                    //             line = "";
                    //         }
                    //     }
                    // });
                    // fileReadStream.on("end", function () {
                    //     if (line !== "") {
                    //         line.push(line);
                    //         // TODO: if (lineCounter === someLines) or if lineCounter is in someLines, append
                    //     }
                    //     console.log('FINITO');
                    // });
                    // fileReadStream.on('error', function (error) {
                    //     console.error(error);
                    // });
                    var fs = require("fs");
                    var fileToRead = fs.readFileSync(variable.directory + variable.file, { encoding: "utf8" });
                    var lines = fileToRead.split("\n");
                    var foundLines = "";
                    for (var i = 0; i < slines.length; ++i) {
                        foundLines += lines[slines[i]];
                    }
                    variable._resolvedValue = foundLines;
                } else if (UTILS.hasValue(variable.variable) || UTILS.hasValue(variable.content) || UTILS.hasValue(variable.output)) {
                    var fs = require("fs");
                    var jsonFile = fs.readFileSync(variable.directory + variable.file, { encoding: "utf8" });
                    jsonFile = JSON.parse(jsonFile);
                    if (variable.variable) {
                        var jsonFileVariable = LIT.findAndResolveVariable(jsonFile, variable.variable);
                        if (UTILS.hasValue(jsonFileVariable._resolvedValue)) {
                            variable._resolvedValue = jsonFileVariable._resolvedValue;
                        }
                    } else if (variable.content) {
                        var jsonFileContent = LIT.findAndResolveContent(jsonFile, variable.content);
                        if (UTILS.hasValue(jsonFileContent._resolvedValue)) {
                            variable._resolvedValue = jsonFileContent._resolvedValue;
                        }
                    } else if (variable.output) {
                        var jsonFileOutput = LIT.findAndResolveOutput(jsonFile, variable.output);
                        if (UTILS.hasValue(jsonFileOutput._resolvedValue)) {
                            variable._resolvedValue = jsonFileOutput._resolvedValue;
                        }
                    }
                } else {
                    var fs = require("fs");
                    var fileToRead = fs.readFileSync(variable.directory + variable.file, { encoding: "utf8" });
                    variable._resolvedValue = fileToRead;
                }
            }
        }

        return variable;
    },

    findAndResolveVariable: function (litFile, name) {
        var item = LIT.findVariable(litFile.variables, name);
        if (UTILS.hasValue(item)) {
            item = LIT.resolveVariable({litFile, variable: item});
            if (UTILS.hasValue(item._resolvedValue)) {
                return item;
            }
        }

        return false;
    },

    findAndResolveContent: function (search, name) {
        var item = LIT.findContent(search, name);
        if (UTILS.hasValue(item)) {
            item = LIT.resolveContent(search, item);
            if (UTILS.hasValue(item._resolvedValue)) {
                return item;
            }
        }

        return false;
    },

    findAndResolveOutput: function (search, name) {
        var item = LIT.findOutpu(search, name);
        if (UTILS.hasValue(item)) {
            item = LIT.resolveOutput(search, item);
            if (UTILS.hasValue(item._resolvedValue)) {
                return item;
            }
        }

        return false;
    },
};

if (typeof module !== "undefined") {
    module.exports = LIT;
}