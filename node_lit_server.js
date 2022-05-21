var http = require("http");
var url = require("url");
var fs = require("fs");
var path = require("path");
var readline = require("readline");

var host = "0.0.0.0";
var port = 8000;

var defaultHeaders = {
    "Access-Control-Allow-Origin": "*"
};

function toBase64(string) {
    var buff = new Buffer.from(string, "utf8");
    return buff.toString("base64");
}

function fromBase64(string) {
    var buff = new Buffer.from(string, "base64");
    return buff.toString();
}

var requestListener = function (request, response) {
    var queryObject = url.parse(request.url, true).query;

    var split = request.url.split("?");
    if (split[0] === "/lit") {
        if (queryObject.file) {
            var filePath = queryObject.file;
            if (queryObject.directory) {
                filePath = queryObject.directory + "/" + filePath;
            }
            if (queryObject.main_directory) {
                filePath = queryObject.main_directory + "/" + filePath;
            }

            console.log("About to look for " + filePath);
            if (!fs.existsSync(filePath)) {
                response.writeHead(404, defaultHeaders);
                response.write("Not Found!");
                response.end();
            } else {
                if (queryObject.line_start && queryObject.line_end) {
                    var lineCursor = 0;
                    var extracted = "";
                    var readlineInterface = readline.createInterface({
                        input: fs.createReadStream(filePath),
                        output: process.stdout,
                        terminal: false,
                    });
                    readlineInterface.on("line", function (line) {
                        ++lineCursor;
                        if (queryObject.line_start && queryObject.line_end) {
                            if (lineCursor >= queryObject.line_start && lineCursor <= queryObject.line_end) {
                                extracted += line + "\n";
                            }
                        }
                    });
                    readlineInterface.on("close", function () {
                        var base64 = encodeURIComponent(extracted);
                        var encodedBase64 = toBase64(base64);
                        response.writeHead(200, defaultHeaders);
                        response.write(encodedBase64);
                        response.end();
                    });
                } else {
                    var wholeFile = fs.readFileSync(filePath, { encoding: "utf8" });
                    var base64 = encodeURIComponent(wholeFile);
                    var encodedBase64 = toBase64(base64);
                    response.writeHead(200, defaultHeaders);
                    response.write(encodedBase64);
                    response.end();
                }
            }
        }
    } else if (split[0] === "/raw") {
        if (queryObject.file) {
            var filePath = queryObject.file;
            if (queryObject.directory) {
                filePath = queryObject.directory + "/" + filePath;
            }
            if (queryObject.main_directory) {
                filePath = queryObject.main_directory + "/" + filePath;
            }

            console.log("About to look for " + filePath);
            if (!fs.existsSync(filePath)) {
                response.writeHead(404, defaultHeaders);
                response.write("Not Found!");
                response.end();
            } else {
                var wholeFile = fs.readFileSync(filePath, { encoding: "utf8" });
                response.writeHead(200, defaultHeaders);
                response.write(wholeFile);
                response.end();
            }
        }
    } else if (split[0] === "/save") {
        // TODO: Better callbacks & mode detections (i.e: not getting body twice)
        if (queryObject.file && queryObject.directory) {
            if (queryObject.line_start && queryObject.line_end) {
                var body = "";
                request.on("data", function (chunk) {
                    body += chunk.toString();
                });
                request.on("end", function () {
                    var lineCursor = 0;
                    var extracted = [];
                    // TODO: This is weird, detecting directory vs main_directory
                    var path = queryObject.directory + "/" + queryObject.file;
                    if (!fs.existsSync(path)) {
                        if (queryObject.directory !== "null") {
                            path = queryObject.main_directory + "/" + queryObject.directory + "/" + queryObject.file;
                        } else {
                            path = queryObject.main_directory + "/" + queryObject.file;
                        }
                    }
                    var readlineInterface = readline.createInterface({
                        // TODO: Better file path detection including main_directory
                        input: fs.createReadStream(path),
                        output: process.stdout,
                        terminal: false,
                    });
                    readlineInterface.on("line", function (line) {
                        ++lineCursor;
                        if (lineCursor === parseInt(queryObject.line_start)) {
                            var unencoded = fromBase64(body);
                            unencoded = decodeURIComponent(unencoded);
                            extracted.push(unencoded);
                        }
                        if (lineCursor >= queryObject.line_start && lineCursor <= queryObject.line_end) {
                            // ...
                        } else {
                            extracted.push(line);
                        }
                    });
                    readlineInterface.on("close", function () {
                        fs.writeFileSync(path, extracted.join("\n"), { encoding: "utf8" });
                        response.writeHead(200, defaultHeaders);
                        response.write("DONE");
                        response.end();
                    });
                });
            } else {
                var body = "";
                request.on("data", function (chunk) {
                    body += chunk.toString();
                });
                request.on("end", function () {
                    var unencoded = fromBase64(body);
                    unencoded = decodeURIComponent(unencoded);
                    // TODO: Better file path detection including main_directory
                    fs.writeFileSync(queryObject.directory + "/" + queryObject.file, unencoded, { encoding: "utf8" });

                    response.writeHead(200, defaultHeaders);
                    response.write("DONE");
                    response.end();
                });
            }
        } else {
            response.writeHead(500, defaultHeaders);
            response.write("Need file & directory");
            response.end();
        }
    } else {
        var filePath = "." + split[0];
        if (filePath === "./") {
            filePath = "./index.html";
        }
        var extname = path.extname(filePath);
        var contentType = 'text/html';
        switch (extname) {
            case '.js':
                contentType = 'text/javascript';
                break;
            case '.css':
                contentType = 'text/css';
                break;
            case '.json':
                contentType = 'application/json';
                break;
            case '.png':
                contentType = 'image/png';
                break;      
            case '.jpg':
                contentType = 'image/jpg';
                break;
            case '.wav':
                contentType = 'audio/wav';
                break;
        }
        fs.readFile(filePath, function(error, content) {
            if (error) {
                if(error.code == "ENOENT"){
                    fs.readFile("./404.html", function(error, content) {
                        var headers = defaultHeaders;
                        headers["Content-Type"] = contentType;
                        response.writeHead(200, headers);
                        response.end(content, "utf-8");
                    });
                }
                else {
                    response.writeHead(500);
                    response.end("Sorry, check with the site admin for error: " + error.code + " ..\n");
                    response.end(); 
                }
            }
            else {
                var headers = defaultHeaders;
                headers["Content-Type"] = contentType;
                response.writeHead(200, headers);
                response.end(content, "utf-8");
            }
        });
    }
}

var server = http.createServer(requestListener);
server.listen(port, host, function () {
    console.log("Server is running on http://" + host + ":" + port);
});