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

function requestFileResolution(litFile) {
    console.log("Requesting file:", litFile);
    var params = {
        main_directory: litMainDirectory,
        file: litFile.file,
    };
    if (typeof litFile.directory !== "undefined") {
        params.directory = litFile.directory;
    }
    if (typeof litFile.line_start !== "undefined" && typeof litFile.line_end !== "undefined") {
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
        litMeta.push(newMeta);

        var markdownText = document.getElementById("markdown_source").value;
        markdownText += "\n" + "[lit_file_meta]:" + newMeta.file + "?" + queryParams.join("&");
        document.getElementById("markdown_source").value = markdownText;
        updateMarkdown();
    }).catch(function (error) {
        console.error(error);
    });
}

function requestFile(litFile) {
    console.log("Requesting file:", litFile);
    var params = {
        file: litFile.file,
    };
    if (typeof litFile.directory !== "undefined") {
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

function saveFile() {
    if (params.file && params.directory) {
        console.log("Saving loaded file");
        var urlParams = new URLSearchParams({
            file: params.file,
            directory: params.directory,
        });
        fetch("/save?" + urlParams, {
            method: "post",
            headers: {
                "Accept": "*"
            },
            body: window.btoa(encodeURIComponent(document.getElementById("markdown_source").value))
        }).then(function (response) {
            if (response.ok) {
                return response.text();
            } else {
                return Promise.reject(response);
            }
        }).then(function (response) {
            // Nothing to do
        }).catch(function (error) {
            console.error(error);
        });
    } else {
        // TODO: Load up a link to auto download the file
    }
}

// Note: We do not use this directly right now but it's here because we will in the future
var litMeta = [];
var litFiles = [];
var litMainDirectory = "";
function updateMarkdown() {
    litMeta = [];
    litFiles = [];
    litMainDirectory = "";
    if (!Regexes) {
        // TODO: Show a better error than this
        alert("Need regexes to work!");
    } else {
        var markdownText = document.getElementById("markdown_source").value;

        var lines = markdownText.split("\n");
        for (var l = 0; l < lines.length; ++l) {
            var line = lines[l];

            var match = line.match(Regexes.anyFile);
            if (match) {
                var litFileRecord = {};
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
                litFiles.push(litFileRecord);
            }

            // TODO: This *pretty much* matches what's inside node_lit so maybe put it in a common place
            match = line.match(Regexes.anyFileMeta);
            if (match) {
                var litMetaRecord = {};
                match = line.match(Regexes.urlWithParameters);
                if (match) {
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

                var replace = decodeURIComponent(litMetaRecord.base64);
                replace = atob(replace);
                for (var f = 0; f < litFiles.length; ++f) {
                    var file = litFiles[f];
                    var match = true;
                    if (file.directory) {
                        if (!litMetaRecord.directory || litMetaRecord.directory !== file.directory) {
                            match = false;
                        }
                    }
                    if (file.line_start && file.line_end) {
                        if (!litMetaRecord.line_start || !litMetaRecord.line_end) {
                            match = false;
                        } else if (litMetaRecord.line_start !== file.line_start) {
                            match = false;
                        } else if (litMetaRecord.line_end !== file.line_end) {
                            match = false;
                        }
                    }
                    if (match) {
                        markdownText = markdownText.replaceAll(file.matched, replace);
                    }
                }
                litMeta.push(litMetaRecord);
            }

            match = line.match(Regexes.main_directory);
            if (match) {
                litMainDirectory = match[1];
            }
        }

        for (var i = 0; i < litFiles.length; ++i) {
            var haveMeta = false;
            for (var j = 0; j < litMeta.length; ++j) {
                var match = true;
                for (var prop in litFiles[i]) {
                    if (litFiles[i].file && litMeta[j].file) {
                        if (litFiles[i].file !== litMeta[j].file) {
                            match = false;
                            break;
                        }
                    }
                    if (litFiles[i].directory && litMeta[j].directory) {
                        if (litFiles[i].directory !== litMeta[j].directory) {
                            match = false;
                            break;
                        }
                    }
                    if (litFiles[i].line_start && litMeta[j].line_start) {
                        if (litFiles[i].line_start !== litMeta[j].line_start) {
                            match = false;
                            break;
                        }
                    }
                    if (litFiles[i].line_end && litMeta[j].line_end) {
                        if (litFiles[i].line_end !== litMeta[j].line_end) {
                            match = false;
                            break;
                        }
                    }
                }
                if (match) {
                    haveMeta = true;
                    break;
                }
            }

            if (!haveMeta) {
                requestFileResolution(litFiles[i]);
            }
        }

        document.querySelector("#markdown_preview").innerHTML = marked.parse(markdownText);
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
        saveFile();
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
                document.querySelector("#markdown_source").value = reader.result;
            } else if (loadFileType === 1) {
                document.querySelector("#markdown_source").value += reader.result;
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

    if (params.file) {
        var req = {};
        req.file = params.file;
        if (params.directory) {
            req.directory = params.directory;
        }
        requestFile(req);
    }
});