// NOTE: To make highlight.js uninified browser version
// Clone repo: https://github.com/highlightjs/highlight.js
// Run: node tools/build.js -t browser --no-minify

var fs = require("fs");

var wrapper = fs.readFileSync("html/index.tpl.html", { encoding: "utf8" });

var css = {
    mediaVars: fs.readFileSync("css/css-media-vars.css", { encoding: "utf8" }),
    lit: fs.readFileSync("css/lit.css", { encoding: "utf8" }),
    highlight: fs.readFileSync("css/highlight.11.5.0.css", { encoding: "utf8" }),
};

var html = {
    body: fs.readFileSync("html/body.tpl.html", { encoding: "utf8" }),
    litWC: fs.readFileSync("html/litWC.tpl.html", { encoding: "utf8" }),
    litOutputWC: fs.readFileSync("html/litOutputWC.tpl.html", { encoding: "utf8" }),
    litVariableWC: fs.readFileSync("html/litVariableWC.tpl.html", { encoding: "utf8" }),
    litChalkboardWC: fs.readFileSync("html/litChalkboardWC.tpl.html", { encoding: "utf8" }),
};

var js = {
    highlight: fs.readFileSync("js/highlight.11.5.0.js", { encoding: "utf8" }),
    polyfillComposedPath: fs.readFileSync("js/polyfill-composedPath.js", { encoding: "utf8" }),
    strings: fs.readFileSync("js/strings.js", { encoding: "utf8" }),
    utils: fs.readFileSync("js/utils.js", { encoding: "utf8" }),
    lit: fs.readFileSync("js/lit.js", { encoding: "utf8" }),
    uiUtils: fs.readFileSync("js/ui-utils.js", { encoding: "utf8" }),
    webcomponentCache: fs.readFileSync("js/webcomponent-cache.js", { encoding: "utf8" }),
    webcomponent: fs.readFileSync("js/webcomponent.js", { encoding: "utf8" }),
    webcomponentLit: fs.readFileSync("js/webcomponent-lit.js", { encoding: "utf8" }),
    webcomponentLitVariable: fs.readFileSync("js/webcomponent-lit-variable.js", { encoding: "utf8" }),
    webcomponentLitOutput: fs.readFileSync("js/webcomponent-lit-output.js", { encoding: "utf8" }),
    webcomponentLitChalkboard: fs.readFileSync("js/webcomponent-lit-chalkboard.js", { encoding: "utf8" }),
    litUi: fs.readFileSync("js/lit-ui.js", { encoding: "utf8" }),
};

wrapper = wrapper.replace(/\{\{\{\sbody\s\}\}\}/g, html.body);
wrapper = wrapper.replace(/\{\{\{\shtml.litWC\s\}\}\}/g, html.litWC);
wrapper = wrapper.replace(/\{\{\{\shtml.litOutputWC\s\}\}\}/g, html.litOutputWC);
wrapper = wrapper.replace(/\{\{\{\shtml.litVariableWC\s\}\}\}/g, html.litVariableWC);
wrapper = wrapper.replace(/\{\{\{\shtml.litChalkboardWC\s\}\}\}/g, html.litChalkboardWC);

wrapper = wrapper.replace(/\{\{\{\scss\.mediaVars\s\}\}\}/g, "<style>" + css.mediaVars + "</style>");
wrapper = wrapper.replace(/\{\{\{\scss\.lit\s\}\}\}/g, "<style>" + css.lit + "</style>");
wrapper = wrapper.replace(/\{\{\{\scss\.highlight\s\}\}\}/g, "<style>" + css.highlight + "</style>");

wrapper = wrapper.replace(/\{\{\{\sjs\.polyfillComposedPath\s\}\}\}/g, "<script>" + js.polyfillComposedPath + "</script>");
wrapper = wrapper.replace(/\{\{\{\sjs\.strings\s\}\}\}/g, "<script>" + js.strings + "</script>");
wrapper = wrapper.replace(/\{\{\{\sjs\.utils\s\}\}\}/g, "<script>" + js.utils + "</script>");
wrapper = wrapper.replace(/\{\{\{\sjs\.lit\s\}\}\}/g, "<script>" + js.lit + "</script>");
wrapper = wrapper.replace(/\{\{\{\sjs\.uiUtils\s\}\}\}/g, "<script>" + js.uiUtils + "</script>");
wrapper = wrapper.replace(/\{\{\{\sjs\.webcomponentCache\s\}\}\}/g, "<script>" + js.webcomponentCache + "</script>");
wrapper = wrapper.replace(/\{\{\{\sjs\.webcomponent\s\}\}\}/g, "<script>" + js.webcomponent + "</script>");
wrapper = wrapper.replace(/\{\{\{\sjs\.webcomponentLit\s\}\}\}/g, "<script>" + js.webcomponentLit + "</script>");
wrapper = wrapper.replace(/\{\{\{\sjs\.webcomponentLitVariable\s\}\}\}/g, "<script>" + js.webcomponentLitVariable + "</script>");
wrapper = wrapper.replace(/\{\{\{\sjs\.webcomponentLitOutput\s\}\}\}/g, "<script>" + js.webcomponentLitOutput + "</script>");
wrapper = wrapper.replace(/\{\{\{\sjs\.webcomponentLitChalkboard\s\}\}\}/g, "<script>" + js.webcomponentLitChalkboard + "</script>");
wrapper = wrapper.replace(/\{\{\{\sjs\.litUi\s\}\}\}/g, "<script>" + js.litUi + "</script>");

wrapper = wrapper.replace(/\{\{\{\sjs\.highlight\s\}\}\}/g, "<script>" + js.highlight + "</script>");

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

fs.writeFileSync("index.html", wrapper, { encoding: "utf8" });