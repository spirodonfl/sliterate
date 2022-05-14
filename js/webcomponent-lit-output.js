class LitOutputWC extends WebComponent {
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

        this.informationElement = false;

        this.initialize();
    }

    render() {
        this.informationElement = this.superRoot.getElementById("information");

        this.form.wrapper = this.superRoot.getElementById("edit-form");

        // TODO: More explicit selections, maybe by iterating the "edit-form" children
        this.form.file = this.superRoot.getElementById("file");
        this.form.directory = this.superRoot.getElementById("directory");
        this.form.name = this.superRoot.getElementById("name");
        this.form.language = this.superRoot.getElementById("language");
        this.form.value = this.superRoot.getElementById("value");
        this.form.done = this.superRoot.getElementById("done");
        this.form.delete = this.superRoot.getElementById("delete");

        this.render = this.superRoot.getElementById("render");

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
        this.superRoot.addEventListener("change", function (evt) {
            var composedPath = evt.composedPath();
            for (var p = 0; p < composedPath.length; ++p) {
                var element = composedPath[p];
                if (element instanceof HTMLElement) {
                    if (element.matches("input, textarea, select")) {
                        self.updateRender();
                        self.dispatchEvent(self.events.dataUpdated);
                    }
                }
            }
        });
    }

    showEditForm() {
        if (this.form.value !== "") {
            this.render.childNodes[0].setAttribute("contenteditable", "true");
        }
        this.form.wrapper.classList.remove("hidden");
    }

    hideEditForm() {
        if (this.form.value !== "") {
            this.render.childNodes[0].setAttribute("contenteditable", "");
        }
        if (!this.form.wrapper.classList.contains('hidden')) {
            this.form.wrapper.classList.add("hidden");
        }
    }

    toJson() {
        var data = {};
        data.name = this.form.name.value;
        data.language = this.form.language.value;
        data.value = this.form.value.value;
        data.file = this.form.file.value;
        data.directory = this.form.directory.value;

        return data;
    }

    fromJson(data) {
        var information = [];
        if (data.name && data.name !== false) {
            this.form.name.value = data.name;
        }
        if (data.language && data.language !== false) {
            this.form.language.value = data.language;
        }
        if (data.value && data.value !== false) {
            this.form.value.value = data.value;
        }
        if (data.file && data.file !== false) {
            this.form.file.value = data.file;
        }
        if (data.directory && data.directory !== false) {
            this.form.directory.value = data.directory;
        }

        this.updateRender();
    }

    updateRender() {
        // TODO: Make "contenteditable='true'" a way to edit content
        this.render.innerHTML = "";
        if (this.form.language.value !== "") {
            var pre = document.createElement("pre");
            var code = document.createElement("code");
            pre.appendChild(code);
            code.classList.add("language-" + this.form.language.value);
            code.textContent = this.form.value.value;
            this.render.appendChild(pre);
            hljs.highlightElement(pre);
        } else {
            this.render.innerHTML = this.form.value.value;
        }

        // TODO: Works but make this better and apply to other components
        this.informationElement.innerHTML = "";
        if (UTILS.hasValue(this.form.name.value)) {
            var div = document.createElement("div");
            div.innerHTML = "Name: " + this.form.name.value;
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
window.customElements.define("lit-output-wc", LitOutputWC);