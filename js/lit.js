// TODO: Named variables. Usage would be (approximately something like) below:
// [lit_file](lit?variable=namedVariable)
// [lit_file_meta]:somefile.js?line_start=20&line_end=32&name=namedVariable

// Note: We do not use this directly right now but it's here because we will in the future
var litMeta = [];
var litFiles = [];
function updateMarkdown() {
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
        }

        document.querySelector("#markdown_preview").innerHTML = marked.parse(markdownText);
    }
}

// Note: Determines if we're loading an MD file or a meta file
// TODO: Find a better place to put this or track this
var loadFileType = 0;

window.addEventListener("load", function () {
    marked.setOptions({
        highlight: function(code, lang) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
        },
        langPrefix: 'hljs language-', // highlight.js css expects a top-level 'hljs' class.
    });
    updateMarkdown();

    document.addEventListener("keyup", function (evt) {
        var composedPath = evt.composedPath();
        for (var p = 0; p < composedPath.length; ++p) {
            var element = composedPath[p];
            if (element instanceof HTMLElement) {
                if (element.matches("markdown_source")) {
                    updateMarkdown();
                }
            }
        }
    });

    document.addEventListener("click", function (evt) {
        var composedPath = evt.composedPath();
        for (var p = 0; p < composedPath.length; ++p) {
            var element = composedPath[p];
            if (element instanceof HTMLElement) {
                if (element.matches("#show_only_source")) {
                    // TODO: Can we make this a class instead?
                    document.getElementById("markdown").style.gridTemplateColumns = "1fr 0px";
                } else if (element.matches("#show_only_preview")) {
                    // TODO: Can we make this a class instead?
                    document.getElementById("markdown").style.gridTemplateColumns = "0px 1fr";
                } else if (element.matches("#show_source_and_preview")) {
                    // TODO: Can we make this a class instead?
                    document.getElementById("markdown").style.gridTemplateColumns = "1fr 1fr";
                } else if (element.matches("#load_file")) {
                    loadFileType = 0;
                    UI_UTILS.simulateClick(document.getElementById("file_input"));
                } else if (element.matches("#load_metadata")) {
                    loadFileType = 1;
                    UI_UTILS.simulateClick(document.getElementById("file_input"));
                }
            }
        }
    });

    document.addEventListener("change", function (evt) {
        var composedPath = evt.composedPath();
        for (var p = 0; p < composedPath.length; ++p) {
            var element = composedPath[p];
            if (element instanceof HTMLElement) {
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
        }
    }, true);
});