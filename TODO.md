# TODOs

```javascript
[lit_file](regexes.js?directory=js&line_start=17&line_end=20)
[lit_file](regexes.js?directory=js&line_start=15&line_end=20)
[lit_file](node_lit_server.js?directory=.&lit_tag=move_to_commonFunction)
```

- Need to implement API to save metadata file without having to download it (so it saves next to currently loaded MD file)
- When you click "Save File" the UI should
  - show you a status of the save as it progresses
- When you click the "Load File" the UI should automatically hide the popup menu
- Same as above for both the "Save Metadata" and the "Load Metadata"
- Any clicks to any of the menu items in "View" and "Edit" should automatically hide the popup
- The "Download Metadata" link needs some sprucing up but you have to think about how/what you would do
- For "build_index.js", it would be better if you could just parse attributes of the various tags you are referencing like \<script src="...">\</script> and grab the src, then you could re-reference those in the builder and extract the contents of the referenced file and put it inline in the "single" version
- It would be nice if you could deactivate certain menu items when the state of the application is not ready to handle those interactions which would help guide the user as to what their next steps should be
- We have the means to regex/parse out tags but what does actually implementing them look like?
  - In a large MD file, the ability to search through the file by searching tags is a useful tool
  - In a small MD file, tags do not really do anything
  - Is there a way to search tags throughout an entire project directory?
    - This implies the server needs to know about the project directory (which is probably covered by lit_main_directory? maybe not because that is file specific)
    - It also means a "glob" based search in the server
    - This is probably not doable offline unless you run the node script offline and let it build a searchable file of results and then load that into your offline UI, kinda weird but still doable
- We have the regex to parse out raw JSON strings inside the MD file so we should implement that and set some initial or default things we'd like to see in such JSON
  - Maybe we search for something like lit_main_directory and an array of metas and that's our starting point?
  - Anything beyond what we need to run the rendering of the MD is just extra fluff and perfectly fine to keep?
- Merge node_lit.js and node_lit_server.js because they should really be one and the same and then you would have some CLI arguments as to whether you want to run the server or not. If you do not then you just pass CLI arguments for an execution of whatever you need to run against the MD file in question
- Need to implement the "starts_with" && "ends_with" options
  - regex strings which you use to search a file you are extracting from
  - what if you never find the end?
  - allow the ability to have a null or not even defined ends_with so you can just go with "starts_with" all the way to the end of a file
- Need to implement "class" && "method" options
  - must be able to identify the language in question so you can appropriately search for classes and functions as not all languages structure those things the same
  - easiest to start with is plain javascript and php
- In node_lit.js, you are duplicating some lines of code. Primarily the metastring stuff and the stuff at the bottom of the file. Move those to functions. This makes them mergable too
- For node_lit_server.js (and maybe ultimately the merge of that and node_lit), detect a .env and pull in the values so you can set things like port && host by env
- Add an option for file references *not to have their base64* saved or compared or cached or anything so it's strictly just a reference. Maybe something like "cache=false"
- Chalkboard
- Display some information on the page like the name of the file and directory you're working with so you maintain context
- Ideally, server mode does not require the browser to maintain the meta object but can do so inside the server and then you just call it via API calls
- Custom resize the source & preview, like this https://www.brainbell.com/javascript/making-resizable-table-js.html

## Offline mode but point to server

Because offline mode & online mode got complicated, you now need to check (in offline mode) for two new parameters in the URL which are "port" and "host". This way, if you load an offline version but want to make requests to a running server, you can do so by going "index.html?port=9000&host=192.133.333.333". Use "window.location.protocol" to determine whether you're on "http" or "file" which tells you a local load or not

## Directly referencing other MD files?

The idea is to reference other MD files as parsed, not just raw, line by line extraction like other files. I do not know the benefit of this but... it could be used like below. Maybe this can simply be a linkaway to load up another of the page (online or offline) with the file preloaded?

\[lit_reference](/path/to/file.md)

## Adaptive referencing?

Referencing files by line numbers does work but if a file changes often you have to keep those references updated all the time.

Initially, I thought about making the lit system detect when you've edited a file and update the lines according to the diff but this only work when you are editing in browser. If you edit the file directly then you're forced to re-update all references.

To get around this, the "starts_with" && "ends_with" options are a good first step as they will just maintain their reference points regardless of how the file changes.

However, we may also want something else when regex can't quite do the trick. Honestly, I cannot think of a good scenario where regex just flat out fails to give us adaptive referencing but, for the moment, we'll assume such a scenario exists.

To that end, it might be good to have the ability to read files and search for something called a "lit_tag" which is a unique identifier in that file of whatever alphanumeric string you want. Then you would put, in your MD file, something like lit_file file ? ... & lit_tag=a_tag_here and it would just constantly reference that.

To end the tag you would just use it again somewhere later down the file so the first occurrence is a start and the second occurrence is the end. If no second occurrence, just go to the end.

When parsing, you would essentially have to keep track of starts and ends as you iterate line by line.

## Nested References?

In theory, you could have an MD file that has a "lit_file" reference to another MD file which references yet another one and so on. Is there a way to resolve those nested references? In the server version, likely, yes, but in the offline version, that does not seem likely.

## Named variables?

Maybe you want to have the ability to reference the same thing over and over without having to re-type it or copy paste a long string every time? Named variables are the answer.

\[lit_file](lit?variable=namedVariable)

\[lit_file_meta]:somefile.js?line_start=20&line_end=32&name=namedVariable