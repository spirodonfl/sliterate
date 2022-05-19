// TODO: Visual way of opening a file & directory instead of query parameters
// TODO: Manually set language
// TODO: Take inline styles and put them into stylesheet
// TODO: Make sure highlightjs dark mode css is also applied in regular index (markdown mode)

function requestFile(file) {
    console.log("Requesting file:", file);
    var params = {
        file: file.file,
    };
    if (typeof file.directory !== "undefined") {
        params.directory = file.directory;
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
        document.querySelector("#editor").textContent = rawFile;
        document.querySelector("#source").textContent = rawFile;
        hljs.highlightElement(document.querySelector("#editor"));
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
            body: window.btoa(encodeURIComponent(document.getElementById("editor").innerText))
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

var delay = false;
function handleKeyUp(element) {
    if (element.matches("#source")) {
        document.querySelector("#editor").textContent = document.querySelector("#source").value;
        clearTimeout(delay);
        delay = setTimeout(function () {
            hljs.highlightElement(document.querySelector("#editor"));
        }, 1000);
    }
}

function handleClick(element) {
    if (element.matches("#save_file")) {
        saveFile();
    }
}

function handleChange(element) {
    // ...
}

window.addEventListener("load", function () {
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