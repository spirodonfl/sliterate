var Regexes = {
    // Below looks for {{{file="somefile2.js" directory="./" line_start="1" line_end="5"}}}
    // any: /\{\{\{([a-zA-Z0-9\-\_\s\=\"\.\\\/]+)\}\}\}/g,
    // options: /([a-zA-Z0-9\-\_]+)=\"([a-zA-Z0-9\-\_\s\=\.\\\/]+)\"/g,

    // Below looks for [lit_file](/path/to/some/file.js?line_start=20&line_end=30)
    anyFile: /^\[lit_file\]\(.*\)$/g,
    urlParameters: /([^(?&]+)=([^)?&]+)/g,
    urlWithParameters: /(.*)\?(.*)/,
    justUrl: /\]\((.*)\?/,

    // Below looks for [lit_file_meta]:/path/to/some/file.js?line_start=20&line_end=30&base64=sdfsdfasdfasdfawef
    anyFileMeta: /^\[lit_file_meta\]\:/g,
    justFileMetaUrl: /\]\:(.*)\?/,

    // Below looks for [lit_tags]:- "some,tags,here"
    anyTags: /^\[lit_tags\]\:\-/g,
    justTags: /\]\:\-\s"(.*)"/,

    // Should just be a raw JSON string.
    // Useful if you need to have extra stuff in the file but do not want it rendered
    metadata: /\[_json_metadata\]\:\-\s\'(.*)\'$/m,

    main_directory: /^\[lit_main_directory\]\:(.*)/,
};

if (typeof module !== "undefined") {
    module.exports = Regexes;
}