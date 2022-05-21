// TODO: Named variables. Usage would be (approximately something like) below:
// [lit_file](lit?variable=namedVariable)
// [lit_file_meta]:somefile.js?line_start=20&line_end=32&name=namedVariable
// TODO: Move todos to README or TODO.md
// TODO: Reference other lit parsed files like this [lit_reference](/path/to/file.md) which should linkaway to appropriate online version and autoloaded
// TODO: chalkboard
// TODO: "Save Meta Only" button (offline only)
// TODO: "Save Source" button (offline only)
// TODO: Move common parse functionality in node_lit and node_lit_server to common class
// TODO: Make sure that the regexes don't prematurely make a match WHILE YOU ARE TYPING
// TODO: If there are references to other files inside a loaded markdown file then apply a directory path reference to the rendered link so you can actually click on the link and go to the file. Example: if you reference ./somefile.pdf then add http://localhost:8000/open?file=somefile.pdf&directory=/some/directory and node_lit_server will go reach out and pull the file and open it for you
// TODO: Because offline mode & online mode got complicated, you now need to check (in offline mode) for two new parameters in the URL which are "port" and "host". This way, if you load an offline version but want to make requests to a running server, you can do so by going "index.html?port=9000&host=192.133.333.333". Use "window.location.protocol" to determine whether you're on "http" or "file" which tells you a local load or not
// TODO: Would be good to display things like file and directory on the page so you know what you're working with
// TODO: Allow online/server mode to update lit meta file records and notify you when metas are out of date (base64 compares). Probably best to do that server side and ship you the updated base64
// TODO: Pull in raw.js and raw.html as an alternative mode to markdown mode
// TODO: Allow editing of pulled in file meta and save the edits back to the file (good use of webcomponent?). Note that, if you do this, every other reference to the same file you just edited has to be updated. Also, pick and choose which references to update
// For the above, what you have to do is prepend a link to the file in "raw" mode so you can go edit it
// Why this choice and not inline editing? Inline editing means overtaking the entire UI and going into raw mode and saving the existing state and then jumping back after a save has been done and then forcing an update
// What you could do is put a link above the file and have an "edit" option next to it and when you click a contenteditable thing pops up right below with highlightjs and a save button and save saves the local object and then you can force the update to the remote
// TODO: Ideally, online mode has no dependency on locally storing base64 objects and can depend on the server to do the heavy work, updating constantly
// TODO: Add an "ignore" option so you can just have a proper link to a file
// TODO: Force metadata into its own file. Easier to manage and keeps main file cleaner.

function requestFileResolution(litFile) {
    console.log("Requesting file:", litFile);
    var params = {
        main_directory: litMainDirectory,
        file: litFile.file,
    };
    if (litFile.directory !== null) {
        params.directory = litFile.directory;
    }
    if (litFile.line_start !== null && litFile.line_end !== null) {
        params.line_start = litFile.line_start;
        params.line_end = litFile.line_end;
    }
    var urlParams = new URLSearchParams(params);
    fetch("/lit?" + urlParams, {
        method: "get",
        headers: {
            "Accept": "*"
        }
    }).then(function (response) {
        if (response.ok) {
            return response.text();
        } else {
            return Promise.reject(response);
        }
    }).then(function (base64Body) {
        var newMeta = {};
        var queryParams = [];
        if (litFile.directory) {
            newMeta.directory = litFile.directory;
            queryParams.push("directory=" + litFile.directory);
        }
        if (litFile.file) {
            newMeta.file = litFile.file;
            queryParams.push("file=" + litFile.file);
        }
        if (litFile.line_start) {
            newMeta.line_start = litFile.line_start;
            queryParams.push("line_start=" + litFile.line_start);
        }
        if (litFile.line_end) {
            newMeta.line_end = litFile.line_end;
            queryParams.push("line_end=" + litFile.line_end);
        }
        newMeta.base64 = base64Body;
        queryParams.push("base64=" + base64Body);
        newMeta.normalized = normalizeLitFileRecord(newMeta);
        litMeta.push(newMeta);

        fileResolutionCompleted();
    }).catch(function (error) {
        console.error(error);
    });
}

function requestFileCheck(litFile) {
    console.log("Requesting file:", litFile);
    var params = {
        main_directory: litMainDirectory,
        file: litFile.file,
    };
    if (litFile.directory !== null) {
        params.directory = litFile.directory;
    }
    if (litFile.line_start !== null && litFile.line_end !== null) {
        params.line_start = litFile.line_start;
        params.line_end = litFile.line_end;
    }
    var urlParams = new URLSearchParams(params);
    fetch("/lit?" + urlParams, {
        method: "get",
        headers: {
            "Accept": "*"
        }
    }).then(function (response) {
        if (response.ok) {
            return response.text();
        } else {
            return Promise.reject(response);
        }
    }).then(function (base64Body) {
        var meta = findLitFileMetaRecord(litFile);
        if (meta) {
            if (meta.base64 !== base64Body) {
                meta.base64mismatch = base64Body;
                updateMarkdown();
            }
        }
    }).catch(function (error) {
        console.error(error);
    });
}

function requestForceFileUpdate(litFile) {
    console.log("Requesting file:", litFile);
    var params = {
        main_directory: litMainDirectory,
        file: litFile.file,
    };
    if (litFile.directory !== null) {
        params.directory = litFile.directory;
    }
    if (litFile.line_start !== null && litFile.line_end !== null) {
        params.line_start = litFile.line_start;
        params.line_end = litFile.line_end;
    }
    var urlParams = new URLSearchParams(params);
    fetch("/lit?" + urlParams, {
        method: "get",
        headers: {
            "Accept": "*"
        }
    }).then(function (response) {
        if (response.ok) {
            return response.text();
        } else {
            return Promise.reject(response);
        }
    }).then(function (base64Body) {
        var meta = findLitFileMeta(litFile);
        if (meta) {
            if (meta.base64 !== base64Body) {
                meta.base64mismatch = null;
                meta.base64 = base64Body;
                var queryParams = [];
                queryParams.push("file=" + meta.file);
                queryParams.push("directory=" + meta.directory);
                queryParams.push("line_start=" + meta.line_start);
                queryParams.push("line_end=" + meta.line_end);
                queryParams.push("base64=" + meta.base64);
                // TODO: This is awkward. Are we sure this is the only way?
                // TODO: This makes the textarea lose focus and breaks ability to type continuously
                // Add a button to inject meta at the end but, when doing updateMarkdown, use js object instead of relying on text
                // This means one initial pass on load to gather any existing meta
                document.getElementById("markdown_source").value += markdownText.replace(meta.matched, "[lit_file_meta]:" + meta.file + "?" + queryParams.join("&"));
                updateMarkdown();
            }
        }
    }).catch(function (error) {
        console.error(error);
    });
}

function requestFile(litFile) {
    console.log("Requesting file:", litFile);
    var params = {
        file: litFile.file,
    };
    if (litFile.directory !== null) {
        params.directory = litFile.directory;
    }
    var urlParams = new URLSearchParams(params);
    fetch("/raw?" + urlParams, {
        method: "get",
        headers: {
            "Accept": "*"
        }
    }).then(function (response) {
        if (response.ok) {
            return response.text();
        } else {
            return Promise.reject(response);
        }
    }).then(function (rawFile) {
        document.getElementById("markdown_source").value = rawFile;
        updateMarkdown();
    }).catch(function (error) {
        console.error(error);
    });
}

function saveFile(fileData, body, callback) {
    // TODO: We are assuming we have the data we need up front (file, directory, litMainDirectory) but we can't assume these things
    console.log("Saving loaded file");
    var postParams = {
        file: fileData.file,
        directory: fileData.directory,
    };
    // TODO: Move [lit_main_directory] into meta file otherwise it will be impossible to keep track when multiple users are affecting the same MD files
    if (typeof litMainDirectory !== "undefined" && litMainDirectory !== null) {
        postParams.main_directory = litMainDirectory;
    }
    if (fileData.line_start && fileData.line_end) {
        postParams.line_start = fileData.line_start;
        postParams.line_end = fileData.line_end;
    }
    if ((typeof body === "undefined" || body === null) && fileData.base64) {
        body = fileData.base64;
    }
    var urlParams = new URLSearchParams(postParams);
    fetch("/save?" + urlParams, {
        method: "post",
        headers: {
            "Accept": "*"
        },
        body: body
    }).then(function (response) {
        if (response.ok) {
            return response.text();
        } else {
            return Promise.reject(response);
        }
    }).then(function (response) {
        // Nothing to do
        if (typeof callback !== "undefined") {
            callback();
        }
    }).catch(function (error) {
        console.error(error);
    });
}

function LIT_FILE_RECORD() {
    return {
        file: null,
        directory: null,
        line_start: null,
        line_end: null,
        matched: null,
        normalized: null,
        lines: [],
    };
}

function LIT_FILE_META_RECORD() {
    return {
        file: null,
        directory: null,
        line_start: null,
        line_end: null,
        base64: null,
        base64mismatch: null,
        normalized: null,
        matched: null,
    };
}

function normalizeLitFileRecord(lfr) {
    // TODO: We are making a lot of assumptions about certain properties existing and having values
    var normalized = "";
    normalized += lfr.file;
    if (
        (lfr.line_start && lfr.line_end) ||
        lfr.directory
    ) {
        normalized += "?";
    }
    if (lfr.line_start && lfr.line_end) {
        normalized += "line_start=" + lfr.line_start + "&line_end=" + lfr.line_end;
    }
    if (lfr.directory) {
        normalized += "directory=" + lfr.directory;
    }

    return normalized;
}

function extractFromSource(sourceText) {
    var inBlock = false;
    var match = false;
    linesToFileRecords = [];
    var lines = sourceText.split("\n");
    for (var lineCursor = 0; lineCursor < lines.length; ++lineCursor) {
        var line = lines[lineCursor];

        if (line.match(/^```/)) {
            inBlock = lineCursor;
        }
        if (line == "```") {
            inBlock = false;
        }

        match = line.match(Regexes.main_directory);
        if (match) {
            litMainDirectory = match[1];
            continue;
        }

        match = line.match(Regexes.anyFile);
        if (match) {
            var litFileRecord = LIT_FILE_RECORD();
            match = line.match(Regexes.urlWithParameters);
            if (match) {
                litFileRecord.matched = match[0];
                match = line.match(Regexes.urlParameters);
                if (match) {
                    for (var m in match) {
                        var split = match[m].split("=");
                        litFileRecord[split[0]] = split[1];
                    }
                }
                match = line.match(Regexes.justUrl);
                if (match) {
                    litFileRecord.file = match[1];
                }
            }
            litFileRecord.lines.push(lineCursor);

            var recordExists = false;
            litFileRecord.normalized = normalizeLitFileRecord(litFileRecord);
            for (var f = 0; f < litFiles.length; ++f) {
                if (litFiles[f].normalized === litFileRecord.normalized) {
                    litFiles[f].lines.push(lineCursor);
                    recordExists = litFiles[f];
                    break;
                }
            }
            if (!recordExists) {
                litFiles.push(litFileRecord);
                linesToFileRecords[lineCursor] = litFileRecord;
                recordExists = litFileRecord;
            } else {
                linesToFileRecords[lineCursor] = recordExists;
            }

            var litFileMetaRecord = findLitFileMetaRecord(recordExists);
            if (!litFileMetaRecord) {
                missingFileMetas.push(recordExists);
            }
        }

        // TODO: This *pretty much* matches what's inside node_lit so maybe put it in a common place
        match = line.match(Regexes.anyFileMeta);
        if (match) {
            var litMetaRecord = LIT_FILE_META_RECORD();
            match = line.match(Regexes.urlWithParameters);
            if (match) {
                litMetaRecord.matched = match[0];
                match = line.match(Regexes.urlParameters);
                if (match) {
                    for (var m in match) {
                        var split = match[m].split("=");
                        litMetaRecord[split[0]] = split[1];
                    }
                }
                match = line.match(Regexes.justFileMetaUrl);
                if (match) {
                    litMetaRecord.file = match[1];
                }
            }

            var recordExists = false;
            litMetaRecord.normalized = normalizeLitFileRecord(litMetaRecord);
            for (var f = 0; f < litMeta.length; ++f) {
                if (litMeta[f].normalized === litMetaRecord.normalized) {
                    if (litMeta[f].base64 !== litMetaRecord.base64) {
                        litMeta[f].base64mismatch = litMetaRecord.base64;
                    }
                    recordExists = true;
                    break;
                }
            }
            if (!recordExists) {
                litMeta.push(litMetaRecord);
            }
        }
    }
}

function replaceFileRecords(sourceText) {
    var inBlock = false;
    var lines = sourceText.split("\n");
    var updatedLines = [];
    for (var lineCursor = 0; lineCursor < lines.length; ++lineCursor) {
        var line = lines[lineCursor];

        if (line.match(/^```/)) {
            inBlock = lineCursor;
        }
        if (line == "```") {
            inBlock = false;
        }

        if (linesToFileRecords[lineCursor] && linesToFileRecords[lineCursor].matched === line) {
            var litFileMetaRecord = findLitFileMetaRecord(linesToFileRecords[lineCursor]);
            if (inBlock) {
                updatedLines[(inBlock - 1)] += "\n\n<lit-file-wc lit-file-record=\"" + lineCursor + "\"></lit-file-wc>\n\n";
            } else {
                updatedLines[(lineCursor - 1)] += "\n\n<lit-file-wc lit-file-record=\"" + lineCursor + "\"></lit-file-wc>\n\n";
            }
            if (litFileMetaRecord.base64mismatch) {
                var mismatch = "--------OUT OF DATE--------\n";
                mismatch += decodeURIComponent(window.atob(litFileMetaRecord.base64));
                mismatch += "--------OUT OF DATE--------\n";
                mismatch += decodeURIComponent(window.atob(litFileMetaRecord.base64mismatch));
                mismatch += "--------OUT OF DATE--------\n";
                updatedLines.push(mismatch);
            } else {
                updatedLines.push("----" + linesToFileRecords[lineCursor].matched + "----\n" + decodeURIComponent(window.atob(litFileMetaRecord.base64)));
            }
        } else {
            updatedLines.push(line);
        }
    }

    return updatedLines;
}

// Note: We do not use this directly right now but it's here because we will in the future
var litMeta = [];
var litFiles = [];
var litMainDirectory = "";
var inBlock = false;
var linesToFileRecords = [];
var missingFileMetas = [];

function updateMarkdown() {
    if (!Regexes) {
        // TODO: Show a better error than this
        alert("Need regexes to work!");
    } else {
        var markdownText = document.getElementById("markdown_source").value;
        extractFromSource(markdownText);
        if (missingFileMetas.length > 0) {
            totalFilesResolved = 0;
            for (var m = 0; m < missingFileMetas.length; ++m) {
                requestFileResolution(missingFileMetas[m]);
            }
        } else {
            runReplaceFileRecords();
        }
    }
}

var totalFilesResolved = 0;
function fileResolutionCompleted() {
    ++totalFilesResolved;
    if (totalFilesResolved === missingFileMetas.length) {
        runReplaceFileRecords();
    }
}

function runReplaceFileRecords() {
    var markdownText = document.getElementById("markdown_source").value;
    markdownText = replaceFileRecords(markdownText).join("\n");
    document.querySelector("#markdown_preview").innerHTML = marked.parse(markdownText);
    var litFileWCs = document.querySelectorAll("lit-file-wc");
    for (var l = 0; l < litFileWCs.length; ++l) {
        if (litFileWCs[l] instanceof HTMLElement) {
            var litFileWC = litFileWCs[l];
            var lineCursor = litFileWC.getAttribute("lit-file-record");
            if (linesToFileRecords[lineCursor]) {
                var metaFileRecord = findLitFileMetaRecord(linesToFileRecords[lineCursor]);
                if (metaFileRecord) {
                    metaFileRecord.main_directory = litMainDirectory;
                    litFileWC.setData(metaFileRecord);
                }
            }
        }
    }
}

function findLitFileMetaRecord(litFile) {
    for (var j = 0; j < litMeta.length; ++j) {
        if (litMeta[j].normalized === litFile.normalized) {
            return litMeta[j];
        }
    }

    return false;
}

function checkFileReferences() {
    for (var f = 0; f < litFiles.length; ++f) {
        requestFileCheck(litFiles[f]);
    }
}

function forceUpdateAllFileReferences() {
    for (var f = 0; f < litFiles.length; ++f) {
        requestForceFileUpdate(litFiles[f]);
    }
}

// Note: Determines if we're loading an MD file or a meta file
// TODO: Find a better place to put this or track this
var loadFileType = 0;

var params = new Proxy(new URLSearchParams(window.location.search), {
    get: function (searchParams, prop) { return searchParams.get(prop) },
});

function iterateComposedPath(event) {
    var composedPath = event.composedPath();
    for (var p = 0; p < composedPath.length; ++p) {
        var element = composedPath[p];
        if (element instanceof HTMLElement) {
            handleEvent(event.type, element);
        }
    }
}

function handleEvent(eventType, element) {
    if (eventType === "keyup") {
        handleKeyUp(element);
    } else if (eventType === "click") {
        handleClick(element);
    } else if (eventType === "change") {
        handleChange(element);
    } else if (eventType === "saveFile") {
        if (element.matches("lit-file-wc")) {
            var meta = findLitFileMetaRecord(element.data);
            meta.base64 = element.data.base64;
            saveFile(element.data, null, updateMarkdown);
        }
    }
}

function handleKeyUp(element) {
    if (element.matches("#markdown_source")) {
        updateMarkdown();
    }
}

function handleClick(element) {
    if (element.matches("#show_only_source")) {
        // TODO: Can we make this a class instead?
        document.getElementById("markdown").style.gridTemplateColumns = "100% 0px";
    } else if (element.matches("#show_only_preview")) {
        // TODO: Can we make this a class instead?
        document.getElementById("markdown").style.gridTemplateColumns = "0px 100%";
    } else if (element.matches("#show_source_and_preview")) {
        // TODO: Can we make this a class instead?
        document.getElementById("markdown").style.gridTemplateColumns = "1fr 1fr";
    } else if (element.matches("#load_file")) {
        loadFileType = 0;
        UI_UTILS.simulateClick(document.getElementById("file_input"));
    } else if (element.matches("#load_metadata")) {
        loadFileType = 1;
        UI_UTILS.simulateClick(document.getElementById("file_input"));
    } else if (element.matches("#copy_source")) {
        navigator.clipboard.writeText(document.querySelector("#markdown_source").value);
    } else if (element.matches("#save_file")) {
        saveFile(params, window.btoa(encodeURIComponent(document.getElementById("markdown_source").value)));
    } else if (element.matches("#check_file_references")) {
        checkFileReferences();
    } else if (element.matches("#force_update_all_file_references")) {
        forceUpdateAllFileReferences();
    } else if (element.matches("#menu_file")) {
        element.nextSibling.nextSibling.classList.toggle("hidden");
    } else if (element.matches("#menu_view")) {
        element.nextSibling.nextSibling.classList.toggle("hidden");
    } else if (element.matches("#menu_edit")) {
        element.nextSibling.nextSibling.classList.toggle("hidden");
    } else if (element.matches("#save_metadata")) {
        var downloadLink = document.getElementById("download_metadata");
        downloadLink.setAttribute("href", "data:application/json;charset=utf-8," + JSON.stringify({main_directory: litMainDirectory, file_metas: litMeta}, null, 2));
        downloadLink.setAttribute("download", "lit-data.json");
    }
}

function handleChange(element) {
    if (element.matches("#file_input")) {
        let file = element.files[0];

        let reader = new FileReader();

        reader.readAsText(file);

        reader.onload = function() {
            // TODO: Would be nice if you had the option to override existing metadata so you don't double up
            if (loadFileType === 0) {
                // TODO: This makes the textarea lose focus and breaks ability to type continuously
                document.querySelector("#markdown_source").value = reader.result;
            } else if (loadFileType === 1) {
                // TODO: This makes the textarea lose focus and breaks ability to type continuously
                var meta = JSON.parse(reader.result);
                if (meta.main_directory) {
                    litMainDirectory = meta.main_directory;
                }
                if (meta.file_metas) {
                    litMeta = meta.file_metas;
                }
            }
            updateMarkdown();
        };

        reader.onerror = function() {
            console.log(reader.error);
        };
    }
}

window.addEventListener("load", function () {
    marked.setOptions({
        highlight: function(code, lang) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
        },
        langPrefix: 'hljs language-', // highlight.js css expects a top-level 'hljs' class.
    });
    // updateMarkdown();

    document.addEventListener("keyup", iterateComposedPath);

    document.addEventListener("click", iterateComposedPath);

    document.addEventListener("change", iterateComposedPath, true);

    document.addEventListener("saveFile", iterateComposedPath, true);

    if (params.file) {
        var req = {};
        req.file = params.file;
        if (params.directory) {
            req.directory = params.directory;
        }
        requestFile(req);
    }
});