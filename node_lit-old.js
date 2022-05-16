var fs = require('fs');
var path = require('path');
var UTILS = require('./utils.js');
var LIT = require('./lit.js');

var options = {
    debug: false,
};

var _c = {
    clearExtras: function (extras) {
        // If we don't sanitize extras then the console output goes weird if, for example, extras is null
        if (!extras) { return ''; } else { return extras; }
    },
    debug: function (message, extras) {
        extras = this.clearExtras(extras);
        if (options.debug === true) {
            console.log('# DEBUG:: ' + message, extras);
        }
    },
    error: function (message, extras) {
        extras = this.clearExtras(extras);
        console.trace('# ERROR:: ' + message, extras);
    },
    log: function (message, extras) {
        extras = this.clearExtras(extras);
        console.log('- ' + message, extras);
    }, 
}

var build = {
    // If false, default to lit-build.js, otherwise combine this with path
    file: false,
    // If false, default to path where you are calling from
    path: false,
    // Will be auto filled
    fullPath: false,
    // Figure out full path
    location: function () {
        if (this.fullPath === false) {
            if (this.file === false) {
                this.file = 'index.json';
            }
            if (this.path === false) {
                _c.debug('Path from process', process.cwd());
                this.path = process.cwd();
            }
            this.fullPath = this.path + UTILS.osSlash() + this.file;
            if (!fs.existsSync(this.fullPath)) {
                _c.error('Build path does not exist', this.fullPath);
                process.exit();
            }
        }

        // TODO: If build.file is empty then we have to iterate all json files in the current directory

        return this.fullPath;
    },
};

for (var argI = 2; argI < process.argv.length; ++argI) {
    if (process.argv[argI].match(/--file/gm)) {
        var customArgument = process.argv[argI];
        customArgument = customArgument.split('=');
        build.file = customArgument[1];
    } else if (process.argv[argI].match(/--path/gm)) {
        var customArgument = process.argv[argI];
        customArgument = customArgument.split('=');
        build.path = customArgument[1];
    } else if (process.argv[argI].match(/--debug/gm)) {
        options.debug = true;
    }
}

console.log('-- LIT BUILD --');
console.log('---------------');
console.log('- Using build file:', build.location());
console.log('---------------');

var litFile = fs.readFileSync(build.file, { encoding: 'utf8' });
litFile = JSON.parse(litFile);
for (o = 0; o < litFile.outputs.length; ++o) {
    var output = litFile.outputs[o];
    var validated = LIT.validateOutputObject(output);
    if (validated) {
        output.lines = [];
        if (output.value === "" || output.value === false) {
            for (var c = 0; c < litFile.body.length; ++c) {
                var content = litFile.body[c];
                // Note: Blocks may be comments but then they should be treated as comments first and never code output so we run comments first
                if (LIT.inApprovedTextFormat(content.type) && content.includeAsComment === "1") {
                    var litVar = LIT.findAndResolveVariable(litFile, match[2]);
                    if (UTILS.hasValue(litVar)) {
                        if (output.language === "javascript" || output.language === "php") {
                            var newValue = "/**\\n";
                            var lines = content.value.split("\\n");
                            for (var l = 0; l < lines.length; ++l) {
                                lines[l] = "* " + lines[l];
                            }
                            newValue += lines.join("\\n");
                            newValue += "*/";
                            content.value = newValue;
                        }
                    }
                } else if (content.type === "block" && content.language !== "" && content.language === output.language) {
                    var matches = UTILS.findMatches(LIT.regexes.variable, content.value);
                    for (var m = 0; m < matches.length; ++m) {
                        var match = matches[m];
                        var litVar = LIT.findAndResolveVariable(litFile, match[2]);
                        if (litVar.type === "block" && litVar.language !== output.language) { continue; }
                        if (UTILS.hasValue(litVar)) {
                            content.value = content.value.replace(match[1], litVar._resolvedValue);
                        }
                    }
                    output.lines.push(content.value);
                }
                if (output.directory && output.directory !== "") {
                    if (!fs.existsSync(output.directory)) {
                        fs.mkdirSync(output.directory);
                    }
                }
                fs.writeFileSync(output.directory + output.file, output.lines.join(""), { encoding: "utf8" });
            }
        } else {
            var matches = UTILS.findMatches(LIT.regexes.variable, output.value);
            for (var m = 0; m < matches.length; ++m) {
                var match = matches[m];
                var litVar = LIT.findAndResolveVariable(litFile, match[2]);
                if (litVar.type === "block" && litVar.language !== output.language) { continue; }
                if (UTILS.hasValue(litVar)) {
                    output.value = output.value.replace(match[1], litVar._resolvedValue);
                }
            }
            output.lines.push(output.value);
            if (output.directory && output.directory !== "") {
                if (!fs.existsSync(output.directory)) {
                    fs.mkdirSync(output.directory);
                }
            }
            fs.writeFileSync(output.directory + output.file, output.lines.join(""), { encoding: "utf8" });
        }
    } else {
        _c.error(validated);
    }
}