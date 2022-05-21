class LitFileWC extends WebComponent {
    constructor() {
        super();

        // this.shadowMode = "open";

        this.initialize();

        this.data = null;
        this.showingEditForm = false;
        this.renderedSource = false;

        this.events = {
            saveFile: new CustomEvent("saveFile", {
                bubbles: false,
                cancelable: false,
                composed: true,
                detail: {data: false},
            }),
        };
    }

    render() {
        if (this.data !== null) {
            this.updateRender();
        }
    }

    setData(data) {
        // TODO: Confirm that we are receiving a file record
        this.data = data;
        if (this.hasBeenInitialized) {
            this.updateRender();
        }
    }

    showEditSource() {
        this.superRoot.getElementById("render").classList.remove("hidden");
        if (!this.renderedSource) {
            var unencoded = decodeURIComponent(window.atob(this.data.base64));
            var sourcePre = document.createElement("pre");
            // TODO: Autodetect from data
            sourcePre.classList.add("javascript");
            var sourceCode = document.createElement("code");
            sourceCode.setAttribute("contenteditable", "true");
            sourceCode.textContent = unencoded;
            sourcePre.appendChild(sourceCode);
            this.superRoot.getElementById("render").appendChild(sourcePre);
            hljs.highlightElement(sourceCode);
            var saveBtn = document.createElement("button");
            saveBtn.id = "save_source";
            saveBtn.innerHTML = "Save This";
            var self = this;
            saveBtn.addEventListener("click", function () {
                // TODO: send this to /save
                self.data.base64 = window.btoa(encodeURIComponent(sourceCode.innerText));
                self.dispatchEvent(self.events.saveFile);
            });
            this.superRoot.getElementById("render").appendChild(saveBtn);
            var editBtn = document.createElement("button");
            editBtn.id = "edit_file";
            editBtn.innerHTML = "Edit File";
            editBtn.addEventListener("click", function () {
                var url = "";
                url += "/raw.html";
                url += "?file=" + self.data.file;
                console.log([litMainDirectory, self.data]);
                if (typeof self.data.directory !== "undefined" && self.data.directory !== null) {
                    if (self.data.main_directory !== null) {
                        url += "&directory=" + self.data.main_directory + "/" + self.data.directory;
                    } else {
                        url += "&directory=" + self.data.directory;
                    }
                } else if (self.data.main_directory) {
                    url += "&directory=" + self.data.main_directory;
                }
                window.open(url, "_blank");
            });
            this.superRoot.getElementById("render").appendChild(editBtn);
            this.renderedSource = true;
        }
    }

    hideEditSource() {
        this.superRoot.getElementById("render").classList.add("hidden");
    }

    updateRender() {
        this.superRoot.getElementById("cta").innerHTML = "";

        var ctaBtn = document.createElement("div");
        ctaBtn.classList.add("button-cta");
        ctaBtn.innerHTML = "Edit referenced file [" + this.data.normalized + "]";
        var self = this;
        ctaBtn.addEventListener("click", function () {
            if (!self.showingEditForm) {
                self.showEditSource();
                self.showingEditForm = true;
            } else {
                self.hideEditSource();
                self.showingEditForm = false;
            }
        });
        this.superRoot.getElementById("cta").appendChild(ctaBtn);
    }
}
window.customElements.define("lit-file-wc", LitFileWC);