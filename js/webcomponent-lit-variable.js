class LitVariableWC extends WebComponent {
    constructor() {
        super();

        this.events = {
            dataUpdated: new CustomEvent("dataUpdated", {
                bubbles: false,
                cancelable: false,
                composed: true,
                detail: {data: false},
            }),
            deleted: new CustomEvent("deleted", {
                bubbles: false,
                cancelable: false,
                composed: true,
                detail: {data: false},
            }),
        }

        this.form = {};

        this.initialize();
    }

    render() {
        this.form.wrapper = this.superRoot.getElementById("edit-form");

        // TODO: More explicit selections, maybe by iterating the "edit-form" children
        this.form.type = this.superRoot.getElementById("type");
        this.form.name = this.superRoot.getElementById("name");
        this.form.group = this.superRoot.getElementById("group");
        this.form.language = this.superRoot.getElementById("language");
        this.form.file = this.superRoot.getElementById("file");
        this.form.directory = this.superRoot.getElementById("directory");
        this.form.output = this.superRoot.getElementById("output");
        this.form.content = this.superRoot.getElementById("content");
        this.form.variable = this.superRoot.getElementById("variable");
        this.form.lines = this.superRoot.getElementById("lines");
        this.form.value = this.superRoot.getElementById("value");
        this.form.done = this.superRoot.getElementById("done");
        this.form.delete = this.superRoot.getElementById("delete");

        this.informationElement = this.superRoot.getElementById("information");

        this.render = this.superRoot.getElementById("render");

        this.typeOptions();

        var self = this;
        this.superRoot.addEventListener("click", function (evt) {
            var composedPath = evt.composedPath();
            for (var p = 0; p < composedPath.length; ++p) {
                var element = composedPath[p];
                if (element instanceof HTMLElement) {
                    if (element.matches("div#render") || element.matches("div#information")) {
                        self.showEditForm();
                    } else if (element.matches("button#done")) {
                        self.updateRender();
                        self.hideEditForm();
                        self.dispatchEvent(self.events.dataUpdated);
                    } else if (element.matches("button#delete")) {
                        self.updateRender();
                        self.hideEditForm();
                        self.dispatchEvent(self.events.deleted);
                    }
                }
            }
        });
        this.superRoot.addEventListener("change", function (evt) {
            console.log(evt);
            var composedPath = evt.composedPath();
            for (var p = 0; p < composedPath.length; ++p) {
                var element = composedPath[p];
                if (element instanceof HTMLElement) {
                    if (
                        element.matches("form input") ||
                        element.matches("form textarea") ||
                        element.matches("form select")) {
                        self.updateRender();
                        self.dispatchEvent(self.events.dataUpdated);
                    }
                }
            }
        });
        this.superRoot.addEventListener("keyup", function (evt) {
            var composedPath = evt.composedPath();
            for (var p = 0; p < composedPath.length; ++p) {
                var element = composedPath[p];
                if (element instanceof HTMLElement) {
                    if (element.matches("pre")) {
                        self.form.value.value = self.render.childNodes[0].innerText;
                    } else if (element.matches("textarea#value")) {
                        // TODO: Find a better way to see if "pre" even exists and never assume it's in the first spot anyways
                        if (self.render.childNodes.length > 0) {
                            if (self.render.childNodes[0].nodeName.toLowerCase() == "pre") {
                                self.render.childNodes[0].textContent = self.form.value.value;
                            }
                        }
                    }
                }
            }
        });
    }

    showEditForm() {
        if (this.form.type.value === "text" || this.form.type.value === "block") {
            if (this.render.childNodes.length > 0) {
                if (this.render.childNodes[0].nodeName.toLowerCase() == "pre") {
                    this.render.childNodes[0].setAttribute("contenteditable", "true");
                }
            }
        }
        this.form.wrapper.classList.remove("hidden");
    }

    hideEditForm() {
        if (this.form.type.value === "text" || this.form.type.value === "block") {
            if (this.render.childNodes.length > 0) {
                if (this.render.childNodes[0].nodeName.toLowerCase() == "pre") {
                    this.render.childNodes[0].setAttribute("contenteditable", "");
                }
            }
        }
        if (!this.form.wrapper.classList.contains('hidden')) {
            this.form.wrapper.classList.add("hidden");
        }
    }

    toJson() {
        // TODO: Verification of structure and values
        // Example: if you are referencing a file, don't export the value. If you have both filled out, error (?)
        var data = {};
        // TODO: Maybe FormData?
        // Reference: https://gomakethings.com/working-with-forms-with-vanilla-javascript/
        data.type = this.form.type.value;
        data.name = this.form.name.value;
        data.group = this.form.group.value;
        data.language = this.form.language.value;
        data.file = this.form.file.value;
        data.directory = this.form.directory.value;
        data.variable = this.form.variable.value;
        data.lines = this.form.lines.value;
        data.output = this.form.output.value;
        data.content = this.form.content.value;
        if (data.type === "ordered_list" || data.type === "unordered_list") {
            data.value = JSON.parse(this.form.value.value);
        } else {
            data.value = this.form.value.value;
        }

        return data;
    }

    fromJson(data) {
        // TODO: Should verify all values exist
        this.form.type.innerHTML = "";
        this.typeOptions(data.type);
        this.setAttribute("as", data.type);
        if (data.name && data.name !== false) {
            this.form.name.value = data.name;
        }
        if (data.file && data.file !== false) {
            this.form.file.value = data.file;
        }
        if (data.directory && data.directory !== false) {
            this.form.directory.value = data.directory;
        }
        if (data.content && data.content !== false) {
            this.form.content.value = data.content;
        }
        if (data.variable && data.variable !== false) {
            this.form.variable.value = data.variable;
        }
        if (data.lines && data.lines !== false) {
            this.form.lines.value = data.lines;
        }
        if (data.output && data.output !== false) {
            this.form.output.value = data.output;
        }
        if (data.group !== false && data.group !== null && data.group !== undefined) {
            this.form.group.value = data.group;
        }
        if (data.language && data.language !== false) {
            this.form.language.value = data.language;
        }
        if (data.value && data.value !== false) {
            if (data.type === "ordered_list" || data.type === "unordered_list") {
                this.form.value.value = JSON.stringify(data.value);
            } else {
                this.form.value.value = data.value;
            }
        }

        this.updateRender();
    }

    typeOptions(currentValue) {
        for (var i = 0; i < LIT.variableTypes.length; ++i) {
            var option = document.createElement("option");
            option.value = LIT.variableTypes[i];
            option.textContent = LIT.toFriendly(LIT.variableTypes[i]);
            if (currentValue === LIT.variableTypes[i]) {
                option.setAttribute("selected", "true");
            }
            this.form.type.appendChild(option);
        }
    }

    updateRender() {
        // TODO: Regex nested variables & links and render them in nice HTML and then do the opposite too
        // TODO: Table
        this.render.innerHTML = "";
        if (this.form.language.value !== "" && this.form.type.value === "block") {
            var pre = document.createElement("pre");
            var code = document.createElement("code");
            pre.appendChild(code);
            code.classList.add("language-" + this.form.language.value);
            code.textContent = this.form.value.value;
            this.render.appendChild(pre);
            hljs.highlightElement(pre);
        } else if (this.form.value.length !== "" && this.form.type.value === "ordered_list") {
            var list = document.createElement("ol");
            var valueAsArray = JSON.parse(this.form.value.value);
            for (var i = 0; i < valueAsArray.length; ++i) {
                var li = document.createElement("li");
                li.innerHTML = valueAsArray[i].value;
                list.appendChild(li);
            }
            this.render.appendChild(list);
        } else if (this.form.value.length !== "" && this.form.type.value === "unordered_list") {
            var list = document.createElement("ul");
            var valueAsArray = JSON.parse(this.form.value.value);
            for (var i = 0; i < valueAsArray.length; ++i) {
                var li = document.createElement("li");
                li.innerHTML = valueAsArray[i].value;
                list.appendChild(li);
            }
            this.render.appendChild(list);
        } else {
            this.render.innerHTML = this.form.value.value;
        }

        // TODO: Works but make this better and apply to other components
        if (UTILS.hasValue(this.form.name.value)) {
            var div = document.createElement("div");
            div.innerHTML = "Name: " + this.form.name.value;
            this.informationElement.appendChild(div);
            this.informationElement.classList.remove("hidden");
        }
        if (UTILS.hasValue(this.form.group.value)) {
            var div = document.createElement("div");
            div.innerHTML = "Group: " + this.form.group.value;
            this.informationElement.appendChild(div);
            this.informationElement.classList.remove("hidden");
        }
        if (UTILS.hasValue(this.form.type.value)) {
            var div = document.createElement("div");
            div.innerHTML = "Type: " + this.form.type.value;
            this.informationElement.appendChild(div);
            this.informationElement.classList.remove("hidden");
        }
        if (UTILS.hasValue(this.form.language.value)) {
            var div = document.createElement("div");
            div.innerHTML = "Language: " + this.form.language.value;
            this.informationElement.appendChild(div);
            this.informationElement.classList.remove("hidden");
        }
        if (UTILS.hasValue(this.form.file.value)) {
            var div = document.createElement("div");
            div.innerHTML = "File: " + this.form.file.value;
            this.informationElement.appendChild(div);
            this.informationElement.classList.remove("hidden");
        }
    }
}
window.customElements.define("lit-variable-wc", LitVariableWC);