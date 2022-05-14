class LitWC extends WebComponent {
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
            moveUp: new CustomEvent("moveUp", {
                bubbles: false,
                cancelable: false,
                composed: true,
                detail: {data: false},
            }),
            moveDown: new CustomEvent("moveDown", {
                bubbles: false,
                cancelable: false,
                composed: true,
                detail: {data: false},
            }),
            createAbove: new CustomEvent("createAbove", {
                bubbles: false,
                cancelable: false,
                composed: true,
                detail: {data: false},
            }),
            createBelow: new CustomEvent("createBelow", {
                bubbles: false,
                cancelable: false,
                composed: true,
                detail: {data: false},
            }),
        }

        this.chalkboard = {
            state: {
                lineWidth: null,
                fillStyle: null,
                strokeStyle: null,
                shadowColor: null,
                shadowBlur: null,
                mouseDown: false,
                scroll: {
                    on: false,
                    lastPosition: {x: 0, y: 0},
                    currentPosition: {x: 0, y: 0},
                }
            },
            canvas: {
                element: false,
                context: false,
            },
            video: {
                element: false,
            }
        }
        this.drawHistory = [];
        this.data = {};

        this.initialize();
    }

    render() {
        this.render = this.superRoot.getElementById("render");

        var self = this;
        this.superRoot.addEventListener("click", this.handleClick.bind(this));
        // Note: Seems to work on mobile
        this.superRoot.addEventListener("input", function (evt) {
            console.log("INPUT");
            var composedPath = evt.composedPath();
            console.log(composedPath);
        });
        // Note: Seems to work on mobile
        this.superRoot.addEventListener("keyup", function (evt) {
            console.log("KEYUP");
            var composedPath = evt.composedPath();
            for (var p = 0; p < composedPath.length; ++p) {
                var element = composedPath[p];
                if (element instanceof HTMLElement) {
                    if (LIT.inApprovedTextFormat(self.data.type)) {
                        if (element.matches("span#value")) {
                            self.data.value = element.innerText;
                        }
                    } else if (LIT.inApprovedListFormat(self.data.type)) {
                        if (element.matches("span.value")) {
                            // Assuming parent is LI
                            var arrayLocation = element.parentNode.dataset.arrayLocation;
                            arrayLocation = arrayLocation.split(".");
                            var currentLocation = self.data.value;
                            for (var i = 0; i < arrayLocation.length; ++i) {
                                var index = parseInt(arrayLocation[i]);
                                if (i === 0) {
                                    currentLocation = currentLocation[index];
                                } else {
                                    currentLocation = currentLocation.children[index];
                                }
                            }
                            currentLocation.value = element.innerText;
                        }
                    } else if (self.data.type === "table") {
                        if (element.matches("span.value")) {
                            if (element.parentNode.matches("td.row-header-item")) {
                                var index = parseInt(element.parentNode.dataset.arrayLocation);
                                self.data.value.headers[index] = element.innerText;
                            } else if (element.parentNode.matches("td.row-data-item")) {
                                var itemIndex = parseInt(element.parentNode.dataset.arrayLocation);
                                var rowIndex = parseInt(element.parentNode.parentNode.dataset.arrayLocation);
                                self.data.value.rows[rowIndex][itemIndex] = element.innerText;
                            }
                        }
                    } else if (self.data.type === "block") {
                        if (element.matches("pre")) {
                            self.data.value = element.innerText;
                        }
                    } else if (self.data.type === "chalkboard" && element.matches("#chalkboard-controls #size")) {
                        this.chalkboard.state.lineWidth = parseInt(element.value);
                        this.chalkboard.state.halfLineWidth = this.chalkboard.state.lineWidth / 2;
                        this.chalkboard.state.shadowBlur = this.chalkboard.state.lineWidth / 4;
                    } else if (self.data.type === "chalkboard" && element.matches("#chalkboard-controls #color")) {
                        this.chalkboard.state.fillStyle = element.value;
                        this.chalkboard.state.strokeStyle = element.value;
                        this.chalkboard.state.shadowColor = element.value;
                    }
                }
            }
        });
    }

    handleClick(evt) {
        var composedPath = evt.composedPath();
        for (var p = 0; p < composedPath.length; ++p) {
            var element = composedPath[p];
            if (element instanceof HTMLElement) {
                if (element.matches("#move_up")) {
                    this.dispatchEvent(this.events.moveUp);
                    break;
                } else if (element.matches("#move_down")) {
                    this.dispatchEvent(this.events.moveDown);
                    break;
                } else if (element.matches("#create_above")) {
                    this.dispatchEvent(this.events.createAbove);
                    break;
                } else if (element.matches("#create_below")) {
                    this.dispatchEvent(this.events.createBelow);
                    break;
                } else if (element.matches("#floating-menu")) {
                    this.showFloatingMenu("actions");
                    break;
                } else if (element.matches("#edit")) {
                    this.showFloatingMenu("edit");
                    break;
                } else if (element.matches("#type")) {
                    this.showFloatingMenu("type");
                    break;
                } else if (element.matches("#name")) {
                    this.showFloatingMenu("form#name");
                    break;
                } else if (element.matches("#group")) {
                    this.showFloatingMenu("form#group");
                    break;
                } else if (element.matches("#language")) {
                    this.showFloatingMenu("form#language");
                    break;
                } else if (element.matches("#tags")) {
                    this.showFloatingMenu("form#tags");
                    break;
                } else if (element.matches("#done")) {
                    this.hideAllFloatingMenus();
                    if (LIT.inApprovedListFormat(this.data.type)) {
                        this.resetActiveListElements();
                    }
                    this.dispatchEvent(this.events.dataUpdated);
                    break;
                } else if (element.matches("#delete")) {
                    this.dispatchEvent(this.events.deleted);
                    break;
                } else if (element.matches("#floating-menu-type .set-type")) {
                    this.hideAllFloatingMenus();
                    this.updateType(element.id);
                    break;
                } else if (element.matches("#form-submit")) {
                    var attribute = element.dataset.attribute;
                    if (attribute === "tags") {
                        var newValue = this.qs("#form-input input").value;
                        newValue = newValue.split(",");
                        this.data.tags = newValue;
                    } else {
                        this.data[attribute] = this.qs("#form-input input").value;
                    }
                    this.hideAllFloatingMenus();
                    this.updateRender();
                    break;
                } else if (LIT.inApprovedTextFormat(this.data.type) && element.matches("span#value")) {
                    element.setAttribute("contenteditable", "true");
                    break;
                } else if (LIT.inApprovedListFormat(this.data.type) && element.matches("#remove_list_item")) {
                    var arrayLocation = this.qs("#render li.active").dataset.arrayLocation;
                    arrayLocation = arrayLocation.split(".");
                    var currentLocation = this.data.value;
                    for (var i = 0; i < arrayLocation.length; ++i) {
                        var index = parseInt(arrayLocation[i]);
                        if (i === 0) {
                            if (i === (arrayLocation.length - 1)) {
                                currentLocation.splice(index, 1);
                            } else {
                                currentLocation = currentLocation[index];
                            }
                        } else {
                            if (i === (arrayLocation.length - 1)) {
                                currentLocation.children.splice(index, 1);
                            } else {
                                currentLocation = currentLocation.children[index];
                            }
                        }
                    }
                    this.updateRender();
                    break;
                } else if (LIT.inApprovedListFormat(this.data.type) && element.matches("#add_list_item_below")) {
                    var arrayLocation = this.qs("#render li.active").dataset.arrayLocation;
                    arrayLocation = arrayLocation.split(".");
                    var currentLocation = this.data.value;
                    for (var i = 0; i < arrayLocation.length; ++i) {
                        var index = parseInt(arrayLocation[i]);
                        if (i === 0) {
                            if (i === (arrayLocation.length - 1)) {
                                currentLocation.splice((index + 1), 0, {value: "CONTENT", children: []});
                            } else {
                                currentLocation = currentLocation[index];
                            }
                        } else {
                            if (i === (arrayLocation.length - 1)) {
                                currentLocation.children.splice((index + 1), 0, {value: "CONTENT", children: []});
                            } else {
                                currentLocation = currentLocation.children[index];
                            }
                        }
                    }
                    this.updateRender();
                    break;
                } else if (LIT.inApprovedListFormat(this.data.type) && element.matches("#add_list_item_above")) {
                    var arrayLocation = this.qs("#render li.active").dataset.arrayLocation;
                    arrayLocation = arrayLocation.split(".");
                    var currentLocation = this.data.value;
                    for (var i = 0; i < arrayLocation.length; ++i) {
                        var index = parseInt(arrayLocation[i]);
                        if (i === 0) {
                            if (i === (arrayLocation.length - 1)) {
                                currentLocation.splice(index, 0, {value: "CONTENT", children: []});
                            } else {
                                currentLocation = currentLocation[index];
                            }
                        } else {
                            if (i === (arrayLocation.length - 1)) {
                                currentLocation.children.splice(index, 0, {value: "CONTENT", children: []});
                            } else {
                                currentLocation = currentLocation.children[index];
                            }
                        }
                    }
                    this.updateRender();
                    break;
                } else if (LIT.inApprovedListFormat(this.data.type) && element.matches("#add_list_item_sublist")) {
                    var arrayLocation = this.qs("#render li.active").dataset.arrayLocation;
                    arrayLocation = arrayLocation.split(".");
                    var currentLocation = this.data.value;
                    for (var i = 0; i < arrayLocation.length; ++i) {
                        var index = parseInt(arrayLocation[i]);
                        if (i === 0) {
                            currentLocation = currentLocation[index];
                        } else {
                            currentLocation = currentLocation.children[index];
                        }
                        if (i === (arrayLocation.length - 1)) {
                            currentLocation.children.push({value: "CONTENT", children: []});
                        }
                    }
                    this.updateRender();
                    break;
                } else if (this.data.type === "table" && element.matches("#add_table_header")) {
                    this.data.value.headers.push("CONTENT");
                    for (var i = 0; i < this.data.value.rows.length; ++i) {
                        this.data.value.rows[i].push("CONTENT");
                    }
                    this.updateRender();
                    break;
                } else if (this.data.type === "table" && element.matches("#remove_table_header")) {
                    var activeTD = this.qs("td.active");
                    if (activeTD.classList.contains("row-header-item")) {
                        var index = parseInt(activeTD.dataset.arrayLocation);
                        this.data.value.headers.splice(index, 1);
                        for (var i = 0; i < this.data.value.rows.length; ++i) {
                            var row = this.data.value.rows[i];
                            row.splice(index, 1);
                        }
                        this.updateRender();
                    }
                    break;
                } else if (this.data.type === "table" && element.matches("#remove_table_row")) {
                    var activeTD = this.qs("td.active");
                    if (activeTD.classList.contains("row-data-item")) {
                        // Assuming parent is TR
                        var index = parseInt(activeTD.parentNode.dataset.arrayLocation);
                        this.data.value.rows.splice(index, 1);
                        this.updateRender();
                    }
                    break;
                } else if (this.data.type === "table" && element.matches("#add_table_row_above")) {
                    var activeTD = this.qs("td.active");
                    if (activeTD.classList.contains("row-data-item")) {
                        // Assuming parent is TR
                        var index = parseInt(activeTD.parentNode.dataset.arrayLocation);
                        var row = [];
                        for (var i = 0; i < this.data.value.headers.length; ++i) {
                            row.push("CONTENT");
                        }
                        this.data.value.rows.splice(index, 0, row);
                        this.updateRender();
                    }
                    break;
                } else if (this.data.type === "table" && element.matches("#add_table_row_below")) {
                    var activeTD = this.qs("td.active");
                    if (activeTD.classList.contains("row-data-item")) {
                        // Assuming parent is TR
                        var index = parseInt(activeTD.parentNode.dataset.arrayLocation);
                        var row = [];
                        for (var i = 0; i < this.data.value.headers.length; ++i) {
                            row.push("CONTENT");
                        }
                        this.data.value.rows.splice((index + 1), 0, row);
                        this.updateRender();
                    }
                    break;
                } else if (LIT.inApprovedListFormat(this.data.type) && element.matches("span.value")) {
                    this.resetActiveListElements();
                    // Assuming parent is LI
                    if (!element.parentNode.classList.contains("active")) {
                        element.parentNode.classList.add("active");
                    }
                    element.setAttribute("contenteditable", "true");
                    break;
                } else if (this.data.type === "table" && element.matches("span.value")) {
                    this.resetActiveTableElements();
                    // Assuming parent is LI
                    if (!element.parentNode.classList.contains("active")) {
                        element.parentNode.classList.add("active");
                    }
                    element.setAttribute("contenteditable", "true");
                    break;
                } else if (this.data.type === "block" && element.matches("pre")) {
                    element.setAttribute("contenteditable", "true");
                    break;
                } else if (this.data.type === "chalkboard" && element.matches("#chalkboard")) {
                    // Nothing. Handled elsewhere
                } else if (this.data.type === "chalkboard" && element.matches("#chalkboard-controls #clear")) {
                    this.chalkboardReset();
                } else if (this.data.type === "chalkboard" && element.matches("#chalkboard-controls #start_camera")) {
                    var self = this;
                    (async function () {
                        var stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                        self.chalkboard.video.element.srcObject = stream;
                    })();
                } else if (this.data.type === "chalkboard" && element.matches("#chalkboard-controls #click")) {
                    this.chalkboard.canvas.context.drawImage(this.chalkboard.video.element, 0, 0, this.chalkboard.canvas.element.width, this.chalkboard.canvas.element.height);
                } else if (this.data.type === "chalkboard" && element.matches("#chalkboard-controls #scroll")) {
                    this.chalkboard.state.scroll.on = !this.chalkboard.state.scroll.on;
                    // TODO: This still needs more. Probably a separate functions
                    // canvasContext.clearRect(0, 0, canvas.width, canvas.height);
                    // for (var h = 0; h < drawHistory.length; ++h) {
                    //     var dwh = drawHistory[h];
                    //     if (dwh.action === "moveTo") {
                    //         canvasContext.beginPath();

                    //         canvasContext.moveTo((canvasPos.x + dwh.pos.x), (canvasPos.y + dwh.pos.y));
                            
                    //         canvasContext.lineWidth = dwh.lineWidth;
                    //         canvasContext.strokeStyle = dwh.strokeStyle;
                    //         canvasContext.shadowColor = dwh.shadowColor;
                    //         canvasContext.shadowBlur = dwh.shadowBlur;

                    //         canvasContext.fill();
                    //     } else if (dwh.action === "lineTo") {
                    //         canvasContext.lineTo((canvasPos.x + dwh.pos.x), (canvasPos.y + dwh.pos.y));
                    //         canvasContext.stroke();
                    //     } else if (dwh.action === "end") {
                    //         canvasContext.shadowColor = dwh.shadowColor;
                    //         canvasContext.shadowBlur = dwh.shadowBlur;
                    //         canvasContext.stroke();
                    //     }
                    // }
                } else if (element.matches("#render")) {
                    // You *need* this to be last in case none of the other elements got a hit above
                    this.showFloatingMenu();
                    break;
                }
            }
        }
    }

    chalkboardReset() {
        this.data.value = [];
        this.chalkboard.canvas.context.clearRect(0, 0, this.chalkboard.canvas.element.width, this.chalkboard.canvas.element.height);
    }

    resetActiveTableElements() {
        var tds = this.qsa("td.active");
        for (var i = 0; i < tds.length; ++i) {
            tds[i].classList.remove("active");
        }
    }

    resetActiveListElements() {
        var lis = this.qsa("li.active");
        for (var i = 0; i < lis.length; ++i) {
            lis[i].classList.remove("active");
        }
    }

    updateType(type) {
        var currentType = this.data.type;
        // Since we want to keep as much of our original data as possible, we do not override existing this.data unless we absolutely have to
        if (type !== currentType) {
            if (LIT.inApprovedListFormat(currentType)) {
                this.data.value = "CONTENT";
            }
            if (currentType === "table") {
                this.data.value = "CONTENT";
            }
            if (type === "block") {
                this.data.language = "markdown";
            } else if (LIT.inApprovedListFormat(type)) {
                this.data.value = [
                    {
                        value: this.data.value,
                        children: []
                    }
                ];
            } else if (type === "table") {
                this.data.value = {
                    headers: ["NEW HEADER"],
                    rows: [
                        [this.data.value]
                    ]
                };
            } else if (type === "chalkboard") {
                this.data.value = [];
            }
        }
        this.data.type = type;
        this.setAttribute("as", this.data.type);
        this.updateRender();
    }

    hideAllFloatingMenus() {
        var floatingMenus = this.qsa(".floating-menu");
        for (var f = 0; f < floatingMenus.length; ++f) {
            var floatingMenu = floatingMenus[f];
            if (floatingMenu instanceof HTMLElement) {
                if (!floatingMenu.classList.contains("hidden")) {
                    floatingMenu.classList.add("hidden");
                }
            }
        }
        this.qs("#form-label").innerHTML = "EMPTY";
        this.qs("#form-input").value = "";
        this.qs("#form-textarea").textContent = "";
    }

    // TODO: Fix floating menus not floating nicely beside each other (maybe css grid?)
    // TODO: Fix floating menus not disappearing if you're switching from "type" to a form entry or vice versa
    showFloatingMenu(which) {
        if (!which || which === null) {
            this.hideAllFloatingMenus();
            this.qs("#floating-menu").classList.remove("hidden");
        } else if (which === "actions") {
            var allActions = this.qsa("#floating-menu-actions .action");
            for (var i = 0; i < allActions.length; ++i) {
                allActions[i].classList.remove("hidden");
            }
            if (!LIT.inApprovedListFormat(this.data.type)) {
                this.qs("#add_list_item_above").classList.add("hidden");
                this.qs("#add_list_item_below").classList.add("hidden");
                this.qs("#add_list_item_sublist").classList.add("hidden");
                this.qs("#remove_list_item").classList.add("hidden");
            }
            if (this.data.type !== "table") {
                this.qs("#add_table_header").classList.add("hidden");
                this.qs("#add_table_row_above").classList.add("hidden");
                this.qs("#add_table_row_below").classList.add("hidden");
                this.qs("#remove_table_row").classList.add("hidden");
                this.qs("#remove_table_header").classList.add("hidden");
            }
            this.qs("#floating-menu-actions").classList.remove("hidden");
        } else if (which === "edit") {
            this.qs("#floating-menu-edit").classList.remove("hidden");
        } else if (which === "type") {
            var allTypes = this.qsa("#floating-menu-type .set-type");
            for (var i = 0; i < allTypes.length; ++i) {
                allTypes[i].classList.remove("active");
            }
            if (this.data.type) {
                this.qs("#floating-menu-type #" + this.data.type).classList.add("active");
            }
            this.qs("#floating-menu-type").classList.remove("hidden");
        } else if (which === "form#name") {
            if (!this.qs("#form-textarea").classList.contains("hidden")) {
                this.qs("#form-textarea").classList.add("hidden");
            }
            this.qs("#form-input").classList.remove("hidden");
            this.qs("#form-input input").value = this.data.name;
            this.qs("#form-label").innerHTML = "Name";
            this.qs("#form-submit").dataset.attribute = "name";
            this.qs("#floating-menu-form").classList.remove("hidden");
        } else if (which === "form#group") {
            if (!this.qs("#form-textarea").classList.contains("hidden")) {
                this.qs("#form-textarea").classList.add("hidden");
            }
            this.qs("#form-input").classList.remove("hidden");
            this.qs("#form-input input").value = this.data.group;
            this.qs("#form-label").innerHTML = "Group";
            this.qs("#form-submit").dataset.attribute = "group";
            this.qs("#floating-menu-form").classList.remove("hidden");
        } else if (which === "form#language") {
            if (!this.qs("#form-textarea").classList.contains("hidden")) {
                this.qs("#form-textarea").classList.add("hidden");
            }
            this.qs("#form-input").classList.remove("hidden");
            this.qs("#form-input input").value = this.data.language;
            this.qs("#form-label").innerHTML = "Language";
            this.qs("#form-submit").dataset.attribute = "language";
            this.qs("#floating-menu-form").classList.remove("hidden");
        } else if (which === "form#tags") {
            if (!this.qs("#form-textarea").classList.contains("hidden")) {
                this.qs("#form-textarea").classList.add("hidden");
            }
            this.qs("#form-input").classList.remove("hidden");
            this.qs("#form-input input").value = this.data.tags.join(",");
            this.qs("#form-label").innerHTML = "Tags";
            this.qs("#form-submit").dataset.attribute = "tags";
            this.qs("#floating-menu-form").classList.remove("hidden");
        }
    }

    proxyExample() {
        // TODO: Use the below method to manage form data instead of doing listeners on each one
        // Reference: https://gomakethings.com/working-with-forms-with-vanilla-javascript/
        // var formData = new FormData(this.form.wrapper);
        // for (var [key, value] of formData) {
        //     console.log(key);
        //     console.log(value);
        // }
        // console.log("TYPE:", formData.get("type"));
        // var sampleData = {me: "and"};
        // sampleData = UTILS.makeProxy({data: sampleData}, this);
        // console.log(sampleData);
        // sampleData.me = "poop";
        // formData = UTILS.makeProxy({data: formData}, this);
        // formData.type = "chalkboard";
        // // Cannot use set and get if you have a proxy...
        // // formData.set("type", "chalkboard");
        // // console.log(formData.get("type"));
        // // this.form.wrapper.reset();
    }

    slotsExample() {
        // // TODO: THIS WORKS! Get named slots??
        // console.log(this.superRoot.querySelectorAll("slot"));
        // console.log(this.superRoot.querySelectorAll("slot")[0].name);
        // * NOTE: This does not work! Neither does document.createTextNode()
        // var bbeight = document.createElement("div");
        // bbeight.innerHTML = "FARTS";
        // console.log(bbeight);
        // this.superRoot.querySelectorAll("slot")[0].assign(bbeight);
        // this.superRoot.querySelectorAll("slot")[0].assign();
        // *
        // // this.superRoot.querySelectorAll("slot")[0].innerHTML = "FARTS";
    }

    toJson() {
        return this.data;
    }

    fromJson(data) {
        this.data = data;

        if (UTILS.hasValue(data.group)) {
            this.classList.add("groups-" + data.group.length);
        }

        this.updateRender();
    }

    get litArrayIndex() {
        return parseInt(this.getAttribute("litArrayIndex"));
    }

    set litArrayIndex(index) {
        if (!isNaN(index)) {
            this.setAttribute("litArrayIndex", index);
        }
    }

    generateList(type, data, arrayLocation) {
        var listTPL = document.getElementById("LitWC." + type + "_list");
        var listEl = listTPL.content.cloneNode(true);
        var parentWrapper = listEl.querySelector(type);
        var LITPL = listEl.querySelector("li.tpl");
        for (var i = 0; i < data.length; ++i) {
            var item = data[i];
            var litEl = LITPL.cloneNode(true);
            litEl.classList.remove("tpl");
            if (arrayLocation !== null && arrayLocation !== undefined) {
                litEl.dataset.arrayLocation = arrayLocation.join(".") + "." + i;
            } else {
                litEl.dataset.arrayLocation = i;
            }
            litEl.querySelector("span.value").innerHTML = data[i].value;
            if (data[i].children && data[i].children.length > 0) {
                if (arrayLocation === null ||  arrayLocation === undefined) {
                    arrayLocation = [];
                }
                arrayLocation.push(i);
                var subList = this.generateList(type, data[i].children, arrayLocation);
                litEl.appendChild(subList);
            }
            parentWrapper.appendChild(litEl);
        }
        LITPL.remove();
        return listEl;
    }

    generateTable(data) {
        var tableTPL = document.getElementById("LitWC.table");
        var tableEl = tableTPL.content.cloneNode(true).querySelector("table");
        var tdRowHeaderTPL = tableEl.querySelector("td.tpl.row-header-item");
        var trRowDataTPL = tableEl.querySelector("tr.tpl.row-data");
        var tdRowDataTPL = tableEl.querySelector("td.tpl.row-data-item");
        for (var i = 0; i < data.headers.length; ++i) {
            var header = data.headers[i];
            var tdRowHeaderEl = tdRowHeaderTPL.cloneNode(true);
            tdRowHeaderEl.classList.remove("tpl");
            tdRowHeaderEl.dataset.arrayLocation = i;
            tdRowHeaderEl.querySelector("span.value").innerHTML = header;
            tableEl.querySelector("tr.row-header").appendChild(tdRowHeaderEl);
        }
        for (var i = 0; i < data.rows.length; ++i) {
            var row = data.rows[i];
            var trRowDataEl = trRowDataTPL.cloneNode(true);
            trRowDataEl.querySelector("td.tpl").remove();
            trRowDataEl.classList.remove("tpl");
            trRowDataEl.dataset.arrayLocation = i;
            for (var r = 0; r < row.length; ++r) {
                var tdRowDataEl = tdRowDataTPL.cloneNode(true);
                tdRowDataEl.dataset.arrayLocation = r;
                tdRowDataEl.querySelector("span.value").innerHTML = row[r];
                tdRowDataEl.classList.remove("tpl");
                trRowDataEl.appendChild(tdRowDataEl);
            }
            tableEl.appendChild(trRowDataEl);
        }
        trRowDataTPL.remove();
        tdRowHeaderTPL.remove();
        tdRowDataTPL.remove();
        return tableEl;
    }

    generateCanvas() {
        var tpl = document.getElementById("LitChalkboardWC.canvas");
        var tplEl = tpl.content.cloneNode(true);
        return tplEl;
    }

    setupCanvas(history) {
        this.chalkboard.canvas.element = this.superRoot.querySelector("#chalkboard-wrapper #chalkboard");
        this.chalkboard.canvas.element.width = this.getBoundingClientRect().width - 50;
        this.chalkboard.canvas.element.height = 200;
        this.chalkboard.canvas.context = this.chalkboard.canvas.element.getContext("2d");

        this.chalkboard.state.mouseDown = false;
        this.chalkboard.state.scroll.on = false;
        this.chalkboard.state.scroll.lastPosition = {x: 0, y: 0};
        this.chalkboard.state.scroll.currentPosition = {x: 0, y: 0};

        this.chalkboard.state.lineWidth = 10;
        this.chalkboard.state.fillStyle = "#fff";
        this.chalkboard.state.strokeStyle = "#fff";
        this.chalkboard.state.shadowColor = "#fff";
        this.chalkboard.state.shadowBlur = "#fff";

        this.chalkboard.video.element = this.superRoot.getElementById("video");

        //history = JSON.parse(history); // Assuming this.data.value is a JSON-ified array of drawings
        if (UTILS.hasValue(history) && history.length > 0) {
            for (var h = 0; h < history.length; ++h) {
                var entry = history[h];
                if (entry.action === "moveTo") {
                    this.chalkboard.canvas.context.beginPath();
                    this.chalkboard.canvas.context.moveTo(entry.pos.x, entry.pos.y);
                    this.chalkboard.canvas.context.lineWidth = entry.lineWidth;
                    this.chalkboard.canvas.context.strokeStyle = entry.strokeStyle;
                    this.chalkboard.canvas.context.fill();
                } else if (entry.action === "lineTo") {
                    this.chalkboard.canvas.context.lineTo(entry.pos.x, entry.pos.y);
                    this.chalkboard.canvas.context.stroke();
                } else if (entry.action === "end") {
                    this.chalkboard.canvas.context.shadowColor = entry.shadowColor;
                    this.chalkboard.canvas.context.shadowBlur = entry.shadowBlur;
                    this.chalkboard.canvas.context.stroke();
                }
            }
        }
        this.data.value = history;
        // TODO: Set initial linewidth and color
        // TODO: Group entries as objects
        // this.data.value = [];

        this.chalkboard.canvas.element.addEventListener('mousedown', this.handle_canvas_writingStart.bind(this));
        this.chalkboard.canvas.element.addEventListener('mousemove', this.handle_canvas_writingInProgress.bind(this));
        this.chalkboard.canvas.element.addEventListener('mouseup', this.handle_canvas_drawingEnd.bind(this));
        this.chalkboard.canvas.element.addEventListener('mouseout', this.handle_canvas_drawingEnd.bind(this));

        this.chalkboard.canvas.element.addEventListener('touchstart', this.handle_canvas_writingStart.bind(this));
        this.chalkboard.canvas.element.addEventListener('touchmove', this.handle_canvas_writingInProgress.bind(this));
        this.chalkboard.canvas.element.addEventListener('touchend', this.handle_canvas_drawingEnd.bind(this));
    }

    handle_canvas_writingStart(event) {
        // console.log("HIT Start", state);
        event.preventDefault();
        if (!this.chalkboard.state.scroll.on) {
            const mousePos = this.getMousePositionOnCanvas(event);

            this.chalkboard.canvas.context.beginPath();

            this.chalkboard.canvas.context.moveTo((this.chalkboard.state.scroll.currentPosition.x + mousePos.x), (this.chalkboard.state.scroll.currentPosition.y + mousePos.y));
            
            this.chalkboard.canvas.context.lineWidth = this.chalkboard.state.lineWidth;
            this.chalkboard.canvas.context.strokeStyle = this.chalkboard.state.strokeStyle;
            this.chalkboard.canvas.context.shadowColor = null;
            this.chalkboard.canvas.context.shadowBlur = null;

            this.data.value.push({
                action: "moveTo",
                pos: { x: (this.chalkboard.state.scroll.currentPosition.x + mousePos.x), y: (this.chalkboard.state.scroll.currentPosition.y + mousePos.y) },
                lineWidth: this.chalkboard.state.lineWidth,
                strokeStyle: this.chalkboard.state.strokeStyle,
                shadowColor: null,
                shadowBlur: null,
            });

            this.chalkboard.canvas.context.fill();
        } else {
            const mousePos = this.getMousePositionOnCanvas(event);
            this.chalkboard.state.scroll.lastPosition = mousePos;
        }
        this.chalkboard.state.mouseDown = true;
    }

    handle_canvas_writingInProgress(event) {
        // console.log("HIT Progress", state);
        event.preventDefault();

        if (this.chalkboard.state.mouseDown && !this.chalkboard.state.scroll.on) {
            const mousePos = this.getMousePositionOnCanvas(event);

            this.chalkboard.canvas.context.lineTo((this.chalkboard.state.scroll.currentPosition.x + mousePos.x), (this.chalkboard.state.scroll.currentPosition.y + mousePos.y));
            this.data.value.push({
                action: "lineTo",
                pos: { x: (this.chalkboard.state.scroll.currentPosition.x + mousePos.x), y: (this.chalkboard.state.scroll.currentPosition.y + mousePos.y) },
            });
            this.chalkboard.canvas.context.stroke();
        } else if (this.chalkboard.state.mouseDown && this.chalkboard.state.scroll.on) {
            const mousePos = this.getMousePositionOnCanvas(event);
            var diff = {x: (mousePos.x - this.chalkboard.state.scroll.lastPosition.x), y: (mousePos.y - this.chalkboard.state.scroll.lastPosition.y)};
            this.chalkboard.state.scroll.lastPosition = mousePos;
            this.chalkboard.state.scroll.currentPosition.x += diff.x;
            this.chalkboard.state.scroll.currentPosition.y += diff.y;
        }
    }

    handle_canvas_drawingEnd(event) {
        // console.log("HIT End", state);
        event.preventDefault();

        if (!this.chalkboard.state.scroll.on) {
            if (this.chalkboard.state.mouseDown) {
                this.chalkboard.canvas.context.shadowColor = this.chalkboard.state.shadowColor;
                this.chalkboard.canvas.context.shadowBlur = this.chalkboard.state.shadowBlur;

                this.chalkboard.canvas.context.stroke();
                this.data.value.push({
                    action: "end",
                    shadowColor: this.chalkboard.state.shadowColor,
                    shadowBlur: this.chalkboard.state.shadowBlur,
                });

                console.log(this.data.value);
                // var newImage = new Image;
                // newImage.style.position = "absolute";
                // newImage.style.zIndex = 0;
                // newImage.style.left = 0;
                // newImage.style.top = 0;
                // newImage.onload = function () {
                //     self.render.appendChild(newImage);
                // }
                // trimCanvas(canvas);
                // newImage.src = canvas.toDataURL("image/png", 0);
                // self.history.push(newImage);
                // self.form.value.value = canvas.toDataURL("image/png", 0);
                // canvas.width = this.getBoundingClientRect().width - 20;
                // canvas.height = 200;
                // canvasContext.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
        this.chalkboard.state.mouseDown = false;
    }

    getMousePositionOnCanvas(event) {
        const rect = this.chalkboard.canvas.element.getBoundingClientRect();
        console.log(event);
        if (!event.clientX && event.touches) {
            event.clientX = event.touches[0].clientX;
            event.clientY = event.touches[0].clientY;
        }
        const canvasX = event.clientX - rect.left;
        const canvasY = event.clientY - rect.top;
        console.log({ x: canvasX, y: canvasY });
        return { x: canvasX, y: canvasY };
    }

    /**
     * Trim a canvas.
     * 
     * @author Arjan Haverkamp (arjan at avoid dot org)
     * @param {canvas} canvas A canvas element to trim. This element will be trimmed (reference)
     * @param {int} threshold Alpha threshold. Allows for trimming semi-opaque pixels too. Range: 0 - 255
     * @returns {Object} Width and height of trimmed canvcas and left-top coordinate of trimmed area. Example: {width:400, height:300, x:65, y:104}
     */
    trimCanvas(canvas, threshold) {
        const ctx = canvas.getContext('2d'),
            w = canvas.width, h = canvas.height,
            imageData = ctx.getImageData(0, 0, w, h),
            tlCorner = { x:w+1, y:h+1 },
            brCorner = { x:-1, y:-1 };

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                if (imageData.data[((y * w + x) * 4) + 3] > threshold) {
                    tlCorner.x = Math.min(x, tlCorner.x);
                    tlCorner.y = Math.min(y, tlCorner.y);
                    brCorner.x = Math.max(x, brCorner.x);
                    brCorner.y = Math.max(y, brCorner.y);
                }
            }
        }

        const cut = ctx.getImageData(tlCorner.x, tlCorner.y, brCorner.x - tlCorner.x, brCorner.y - tlCorner.y);

        canvas.width = brCorner.x - tlCorner.x;
        canvas.height = brCorner.y - tlCorner.y;

        ctx.putImageData(cut, 0, 0);

        return {width:canvas.width, height:canvas.height, x:tlCorner.x, y:tlCorner.y};
    }

    updateRender() {
        // TODO: Example -> select "list" and it should pre-pop a list JSON so you don't have to write it by hand
        // TODO: []() to <div as="link" url="url">innerText</div>
        // TODO: {{{}}} to <div  as="variable">innerText</div>
        if (UTILS.hasValue(this.data.group)) {
            for (var i = 0; i < 100; ++i) {
                if (this.render.classList.contains("groups-" + i)) {
                    this.render.classList.remove("groups-" + i);
                }
            }
            this.render.classList.add("groups-" + this.data.group.split(".").length);
        } else {
            for (var i = 0; i < 100; ++i) {
                if (this.render.classList.contains("groups-" + i)) {
                    this.render.classList.remove("groups-" + i);
                }
            }
        }
        this.render.innerHTML = "";
        this.setAttribute("as", this.data.type);
        // TODO: Maybe it's actually ok to have empty values?
        if (this.data.language !== "" && this.data.type === "block") {
            var blockTPL = document.getElementById("LitWC.block");
            blockTPL = blockTPL.content.cloneNode(true);
            blockTPL.querySelector("pre").classList.add("language-" + this.data.language);
            blockTPL.querySelector("code").textContent = this.data.value;
            hljs.highlightElement(blockTPL.querySelector("pre"));
            this.render.appendChild(blockTPL);
        } else if (this.data.value.length !== "" && this.data.type === "ordered_list") {
            var list = this.generateList("ol", this.data.value);
            this.render.appendChild(list);
        } else if (this.data.value.length !== "" && this.data.type === "unordered_list") {
            var list = this.generateList("ul", this.data.value);
            this.render.appendChild(list);
        } else if (this.data.value.length !== "" && this.data.type === "table") {
            var table = this.generateTable(this.data.value);
            this.render.appendChild(table);
        } else if (this.data.type === "chalkboard") {
            this.render.appendChild(this.generateCanvas());
            this.setupCanvas(this.data.value);
        } else if (this.data.type === "image") {
            // TODO: This as either base64 or maybe a link to a file?
        } else {
            var span = document.createElement("span");
            span.id = "value";
            span.innerHTML = this.data.value;
            this.render.appendChild(span);
        }
    }
}
window.customElements.define("lit-wc", LitWC);