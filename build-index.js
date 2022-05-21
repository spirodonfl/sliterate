// NOTE: To make highlight.js uninified browser version
// Clone repo: https://github.com/highlightjs/highlight.js
// Run: node tools/build.js -t browser --no-minify

var fs = require("fs");

function readFile(file) {
    return fs.readFileSync(file, { encoding: "utf8" });
}

// TODO: Would be better if you could just parse the tags inside the HTML files like <script src=".."></script> instead of managing everything here

var css = {
    mediaVars: "css/css-media-vars.css",
    lit: "css/lit.css",
    highlight: "css/highlight.11.5.0.css",
    highlightDark: "css/highlight-dark-mode.css",
};

var html = {
    body: "html/body.tpl.html",
    litWC: "html/litWC.tpl.html",
    litOutputWC: "html/litOutputWC.tpl.html",
    litVariableWC: "html/litVariableWC.tpl.html",
    litChalkboardWC: "html/litChalkboardWC.tpl.html",
};

var js = {
    highlight: "js/highlight.11.5.0.js",
    polyfillComposedPath: "js/polyfill-composedPath.js",
    strings: "js/strings.js",
    utils: "js/utils.js",
    lit: "js/lit.js",
    uiUtils: "js/ui-utils.js",
    webcomponentCache: "js/webcomponent-cache.js",
    webcomponent: "js/webcomponent.js",
    webcomponentLit: "js/webcomponent-lit.js",
    webcomponentLitFile: "js/webcomponent-lit-file.js",
    webcomponentLitVariable: "js/webcomponent-lit-variable.js",
    webcomponentLitOutput: "js/webcomponent-lit-output.js",
    webcomponentLitChalkboard: "js/webcomponent-lit-chalkboard.js",
    litUi: "js/lit-ui.js",
    regexes: "js/regexes.js",
    marked: "js/marked.umd.js",
};

// Note: Double slashing so the regex is parsed correctly
var prefix = "\\{\\{\\{\\s";
var postfix = "\\s\\}\\}\\}";

/**
 * For highlight.js
 * 
 * You *have* to escape all "$" scalar signs for [insert reasons here] before this works inline
 * Array of regex & replacements below
 * '(.*)\$'$
 * "$1\$"

 * '(.*)\$',$
 * "$1\$",

 * '(.*)\$'\s\}$
 * "$1\$" }

 * '(.*)\$'\s\},$
 * "$1\$" },

 * '(.*)\$', 
 * "$1\$", 

 * '(.*)\$'\),
 * "$1\$"),

 * '(.*)\$';
 * "$1\$";

 * '(.*)\$' 
 * "$1\$" 
 * 
 * Around line 1176 where you see this "function langRe(value, global) {"
 * You need replace the "source(value)" because it does a weird backslash things that borks out
 * 
 * var val = source(value);
 * if (val.match(/^\\\(\?\:\(\?/)) {
 *   val = val.substring(1);
 * }
 * return new RegExp(
 *   val,
 */

// TODO: index.html
var wrapper = readFile("html/index.tpl.html");

for (var item in html) {
    wrapper = wrapper.replace(new RegExp(prefix + item + postfix, "g"), readFile(html[item]));
}

for (var item in css) {
    wrapper = wrapper.replace(new RegExp(prefix + "css." + item + postfix, "g"), "<style>" + readFile(css[item]) + "</style>");
}

for (var item in js) {
    wrapper = wrapper.replace(new RegExp(prefix + "js." + item + postfix, "g"), "<script>" + readFile(js[item]) + "</script>");
}

fs.writeFileSync("index.single.html", wrapper, { encoding: "utf8" });

var wrapper = readFile("html/index.tpl.html");

for (var item in html) {
    wrapper = wrapper.replace(new RegExp(prefix + item + postfix, "g"), readFile(html[item]));
}

for (var item in css) {
    wrapper = wrapper.replace(new RegExp(prefix + "css." + item + postfix, "g"), "<link rel=\"stylesheet\" href=\"" + css[item] + "\">");
}

for (var item in js) {
    wrapper = wrapper.replace(new RegExp(prefix + "js." + item + postfix, "g"), "<script src=\"" + js[item] + "\"></script>");
}

fs.writeFileSync("index.html", wrapper, { encoding: "utf8" });