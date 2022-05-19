// TODO: Investigate possibility of *nested* references
// Right now, you *could*, in theory, reference another MD file which references other files
// If you do that, can you deep resolve references into the file you are currently dealing with?

var fs = require("fs");
// var path = require("path");
var readline = require("readline");
var UTILS = require("./js/utils.js");
var Regexes = require("./js/regexes.js");

var files = [];
var metas = [];
var options = {
    forceFileUpdates: true,
    debug: false,
    singleFile: false,
};
var build = {
    _file: null,
    _path: null,
    file: function () {
        return ((this._path) ? this._path + UTILS.osSlash() : "") + this._file;
    }
};

for (var argI = 2; argI < process.argv.length; ++argI) {
    if (process.argv[argI].match(/--file/gm)) {
        var customArgument = process.argv[argI];
        customArgument = customArgument.split("=");
        build._file = customArgument[1];
    } else if (process.argv[argI].match(/--path/gm)) {
        var customArgument = process.argv[argI];
        customArgument = customArgument.split("=");
        build._path = customArgument[1];
    } else if (process.argv[argI].match(/--debug/gm)) {
        options.debug = true;
    } else if (process.argv[argI].match(/--force_file_updates/gm)) {
        options.forceFileUpdates = true;
    } else if (process.argv[argI].match(/--single_file/gm)) {
        options.singleFile = true;
    }
}

console.log("-- LIT BUILD [Markdown] --");
console.log("--------------------------");
console.log("-- Parsing file: " + build.file());
console.log("--------------------------");

function toBase64(string) {
    var buff = new Buffer.from(string, "utf8");
    return buff.toString("base64");
}

function fromBase64(string) {
    var buff = new Buffer.from(string, "base64");
    return buff.toString();
}

function findFileMeta(thisFile) {
    var haveFileMeta = false;
    for (var m = 0; m < metas.length; ++m) {
        var thisFileMeta = metas[m];
        var match = true;
        for (var property in thisFile) {
            if (!thisFileMeta[property] || thisFileMeta[property] !== thisFile[property]) {
                match = false;
            }
        }
        if (match) {
            haveFileMeta = thisFileMeta;
            break;
        }
    }

    return haveFileMeta;
}

function extractFile(thisFile) {
    // TODO: if (thisFile.starts_with && thisFile.ends_with)
    // TODO: if (thisFile.class && thisFile.method)
    var lineCursor = 0;
    var extracted = "";
    var path = thisFile.file;
    if (thisFile.directory) {
        path = thisFile.directory + path;
    }
    var fileExists = true;
    if (!fs.existsSync(path)) {
        if (!fs.existsSync(build._path + UTILS.osSlash() + path)) {
            fileExists = false;
            console.log("-- ERROR! File does not exist!", thisFile.file);
        } else {
            path = build._path + UTILS.osSlash() + path;
        }
    }
    if (fileExists) {
        var readlineInterface = readline.createInterface({
            input: fs.createReadStream(path),
            output: process.stdout,
            terminal: false,
        });
        readlineInterface.on("line", function (line) {
            ++lineCursor;
            if (thisFile.line_start && thisFile.line_end) {
                if (lineCursor >= thisFile.line_start && lineCursor <= thisFile.line_end) {
                    extracted += line + "\n";
                }
            }
        });
        readlineInterface.on("close", function () {
            var base64 = toBase64(extracted);
            var encodedBase64 = encodeURIComponent(base64);
            var fileMeta = findFileMeta(thisFile);
            if (fileMeta) {
                if (fileMeta.base64 !== encodedBase64) {
                    console.log("File is out of date");
                    // TODO: Sometimes you may have metadata in the MD file + an extra file
                    // In those cases, you must reconcile the two (ask the user to do this)
                    // Also, you must identify WHICH metadata is out of date
                    // This is so the user knows whether it's the single file or the extra file that's causing sync issues
                    console.log("File: " + fileMeta.file);
                    if (fileMeta.directory) {
                        console.log("Directory: " + fileMeta.directory);
                    }
                    if (!options.forceFileUpdates) {
                        console.log("Please update the reference to this file");
                    } else {
                        fileMeta.base64 = encodedBase64;
                    }
                } else {
                    console.log("Pass!");
                }
            } else {
                thisFile.base64 = encodedBase64;
                metas.push(thisFile);
            }
            processedFile();
        });
    }
}

var filesProcessed = 0;
function processedFile() {
    ++filesProcessed;
    if (filesProcessed === files.length) {
        var aboveMeta = "";
        var aboveMetaCursor = 0;
        var readlineInterface = readline.createInterface({
            input: fs.createReadStream(build.file()),
            output: process.stdout,
            terminal: false,
        });
        readlineInterface.on("line", function (line) {
            ++aboveMetaCursor;
            if (aboveMetaCursor < metaStartsAt) {
                aboveMeta += line + "\n";
            }
        });
        readlineInterface.on("close", function (line) {
            if (options.singleFile) {
                var newOutput = aboveMeta + "\n";
                // TODO: You are using this twice. Put into a function.
                for (var m = 0; m < metas.length; ++m) {
                    var metaString = "[lit_file_meta]:";
                    metaString += metas[m].file;
                    if (metas[m].line_start && metas[m].line_end) {
                        metaString += "?line_start=" + metas[m].line_start;
                        metaString += "&line_end=" + metas[m].line_end;
                    }
                    if (metas[m].directory) {
                        metaString += "&directory=" + metas[m].directory;
                    }
                    metaString += "&base64=" + metas[m].base64;
                    metaString += "\n";
                    newOutput += metaString;
                }
                fs.writeFileSync(build.file(), newOutput, {encoding: "utf8"});
            } else {
                var newOutput = "";
                for (var m = 0; m < metas.length; ++m) {
                    var metaString = "[lit_file_meta]:";
                    metaString += metas[m].file;
                    if (metas[m].line_start && metas[m].line_end) {
                        metaString += "?line_start=" + metas[m].line_start;
                        metaString += "&line_end=" + metas[m].line_end;
                    }
                    if (metas[m].directory) {
                        metaString += "&directory=" + metas[m].directory;
                    }
                    metaString += "&base64=" + metas[m].base64;
                    metaString += "\n";
                    newOutput += metaString;
                }
                fs.writeFileSync(build.file() + ".meta", newOutput, {encoding: "utf8"});
            }

            console.log("--------------------------");
            console.log("Finished");
            console.log("--------------------------");
        });
    }
}

var lineCursor = 0;
var metaStartsAt = null;
var readlineInterface = readline.createInterface({
    input: fs.createReadStream(build.file()),
    output: process.stdout,
    terminal: false,
});
readlineInterface.on("line", function (line) {
    // console.log(line);
    var match = line.match(Regexes.anyFile);
    if (match) {
        var litData = {};
        match = line.match(Regexes.urlWithParameters);
        if (match) {
            match = line.match(Regexes.urlParameters);
            if (match) {
                for (var m in match) {
                    var split = match[m].split("=");
                    litData[split[0]] = split[1];
                }
            }
            match = line.match(Regexes.justUrl);
            if (match) {
                litData.file = match[1];
            }
        }

        files.push(litData);
    }

    match = line.match(Regexes.anyFileMeta);
    if (match) {
        if (metaStartsAt === null) {
            metaStartsAt = lineCursor;
        }
        var litData = {};
        match = line.match(Regexes.urlWithParameters);
        if (match) {
            match = line.match(Regexes.urlParameters);
            if (match) {
                for (var m in match) {
                    var split = match[m].split("=");
                    litData[split[0]] = split[1];
                }
            }
            match = line.match(Regexes.justFileMetaUrl);
            if (match) {
                litData.file = match[1];
            }
        }

        metas.push(litData);
    }
    ++lineCursor;
});
readlineInterface.on("close", function () {
    for (var f = 0; f < files.length; ++f) {
        var thisFile = files[f];
        extractFile(thisFile);
    }
});