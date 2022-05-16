Marked - Markdown Parser
========================

[Marked] lets you convert [Markdown] into HTML.  Markdown is a simple text format whose goal is to be very easy to read and write, even when not converted to HTML.  This demo page will let you type anything you like and see how it gets converted.  Live.  No more waiting around.

How To Use The Demo
-------------------

1. Type in stuff on the left.
2. See the live updates on the right.

That's it.  Pretty simple.  There's also a drop-down option in the upper right to switch between various views:

- **Preview:**  A live display of the generated HTML as it would render in a browser.
- **HTML Source:**  The generated HTML before your browser makes it pretty.
- **Lexer Data:**  What [marked] uses internally, in case you like gory stuff like this.
- **Quick Reference:**  A brief run-down of how to format things using markdown.

Why Markdown?
-------------

[lit_tags]:- "just,some_tags,here with stuff"
It's easy.  It's not overly bloated, unlike HTML.  Also, as the creator of [markdown] says,

> The overriding design goal for Markdown's
> formatting syntax is to make it as readable
> as possible. The idea is that a
> Markdown-formatted document should be
> publishable as-is, as plain text, without
> looking like it's been marked up with tags
> or formatting instructions.

Ready to start writing?  Either start changing stuff on the left or
[clear everything](/demo/?text=) with a simple click.

[Marked]: https://github.com/markedjs/marked/
[Markdown]: http://daringfireball.net/projects/markdown/

```javascript
var bb8 = true;
var bb9 = false;

[lit_file](somefile.js?line_start=2&line_end=5)
[lit_file](node_lit.js?directory=../&line_start=20&line_end=30)
```

[lit_file](somefile.js?line_start=2&line_end=5)

[lit_file_meta]:somefile.js?line_start=2&line_end=5&base64=ICBjb25zdCBwYWQgPSBuZXcgQXJyYXkoMSArIHBhZGxlbikuam9pbigwKQogIHJldHVybiAocGFkICsgbnVtKS5zbGljZSgtcGFkLmxlbmd0aCkKfQoK
[lit_file_meta]:node_lit.js?line_start=20&line_end=30&directory=../&base64=fTsKCmZvciAodmFyIGFyZ0kgPSAyOyBhcmdJIDwgcHJvY2Vzcy5hcmd2Lmxlbmd0aDsgKythcmdJKSB7CiAgICBpZiAocHJvY2Vzcy5hcmd2W2FyZ0ldLm1hdGNoKC8tLWZpbGUvZ20pKSB7CiAgICAgICAgdmFyIGN1c3RvbUFyZ3VtZW50ID0gcHJvY2Vzcy5hcmd2W2FyZ0ldOwogICAgICAgIGN1c3RvbUFyZ3VtZW50ID0gY3VzdG9tQXJndW1lbnQuc3BsaXQoIj0iKTsKICAgICAgICBidWlsZC5fZmlsZSA9IGN1c3RvbUFyZ3VtZW50WzFdOwogICAgfSBlbHNlIGlmIChwcm9jZXNzLmFyZ3ZbYXJnSV0ubWF0Y2goLy0tcGF0aC9nbSkpIHsKICAgICAgICB2YXIgY3VzdG9tQXJndW1lbnQgPSBwcm9jZXNzLmFyZ3ZbYXJnSV07CiAgICAgICAgY3VzdG9tQXJndW1lbnQgPSBjdXN0b21Bcmd1bWVudC5zcGxpdCgiPSIpOwogICAgICAgIGJ1aWxkLl9wYXRoID0gY3VzdG9tQXJndW1lbnRbMV07Cg%3D%3D
