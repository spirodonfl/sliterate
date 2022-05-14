/**
 * TODO: Use SVG instead of Canvas? How would this work?
 * 
 * https://editor.method.ac/
 * https://github.com/svgdotjs/svg.draw.js/
 * https://svgjs.dev/docs/3.0/plugins/
 * https://www.angularfix.com/2021/10/how-to-draw-rectangle-on-svg-with-mouse.html
 * https://gliffy.github.io/canvas2svg/
 * https://levelup.gitconnected.com/draw-an-svg-to-canvas-and-download-it-as-image-in-javascript-f7f7713cf81f
 * You can google SVG to canvas, loads of information
 */

class LitChalkboardWC extends WebComponent {
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

        this.history = [];

        this.form = {};
        this.structure = {};
        this.data = {};

        this.initialize();
    }

    render() {
        this.structure.wrapper = this.superRoot.getElementById("edit-structure");
        this.structure.moveUp = this.superRoot.getElementById("move_up");
        this.structure.moveDown = this.superRoot.getElementById("move_down");
        this.structure.createAbove = this.superRoot.getElementById("create_above");
        this.structure.createBelow = this.superRoot.getElementById("create_below");
        // TODO: Root listeners
        this.structure.moveUp.addEventListener("click", function () {
            this.dispatchEvent(this.events.moveUp);
        }.bind(this));
        this.structure.moveDown.addEventListener("click", function () {
            this.dispatchEvent(this.events.moveDown);
        }.bind(this));
        this.structure.createAbove.addEventListener("click", function () {
            this.dispatchEvent(this.events.createAbove);
        }.bind(this));
        this.structure.createBelow.addEventListener("click", function () {
            this.dispatchEvent(this.events.createBelow);
        }.bind(this));

        this.form.wrapper = this.superRoot.getElementById("edit-form");

        // TODO: More explicit selections, maybe by iterating the "edit-form" children
        this.form.type = this.superRoot.getElementById("type");
        this.form.name = this.superRoot.getElementById("name");
        this.form.group = this.superRoot.getElementById("group");
        this.form.language = this.superRoot.getElementById("language");
        this.form.value = this.superRoot.getElementById("value");
        this.form.done = this.superRoot.getElementById("done");
        this.form.delete = this.superRoot.getElementById("delete");

        // this.listenToFormChanges();

        this.listenToFormDone();
        this.listenToFormDelete();

        this.render = this.superRoot.getElementById("render");
        this.render.addEventListener("click", function () {
            this.showStructureForm();
            this.showEditForm();
        }.bind(this));

        this.typeOptions();
    }

    listenToFormChanges() {
        for (var f in this.form) {
            if (f !== "wrapper") {
                var formElement = this.form[f];
                formElement.addEventListener("change", function (evt) {
                    this.updateRender();
                    this.dispatchEvent(this.events.dataUpdated);
                }.bind(this));
            }
        }
    }

    listenToFormDone() {
        this.form.done.addEventListener('click', function (evt) {
            this.updateRender();
            this.hideStructureForm();
            this.hideEditForm();
            this.dispatchEvent(this.events.dataUpdated);
        }.bind(this));
    }

    listenToFormDelete() {
        this.form.delete.addEventListener('click', function (evt) {
            this.updateRender();
            this.hideStructureForm();
            this.hideEditForm();
            this.dispatchEvent(this.events.deleted);
        }.bind(this));   
    }

    showEditForm() {
        if (this.form.type.value === "text" || this.form.type.value === "block") {
            // TODO: Reference this better
            if (this.render.childNodes.length > 0) {
                if (this.render.childNodes[0].nodeName.toLowerCase() == "pre") {
                    this.render.childNodes[0].setAttribute("contenteditable", "true");
                }
            }
        }
        this.form.wrapper.classList.remove("hidden");
        // TODO: There *must* be a better way. Also, only on certain types
        this.form.value.addEventListener("keyup", function () {
            if (this.render.childNodes.length > 0) {
                if (this.render.childNodes[0].nodeName.toLowerCase() == "pre") {
                    this.render.childNodes[0].textContent = this.form.value.value;
                }
            }
        }.bind(this));
    }

    hideEditForm() {
        if (this.form.type.value === "text" || this.form.type.value === "block") {
            this.render.childNodes[0].setAttribute("contenteditable", "");
        }
        if (!this.form.wrapper.classList.contains('hidden')) {
            this.form.wrapper.classList.add("hidden");
        }
    }

    showStructureForm() {
        this.structure.wrapper.classList.remove("hidden");
    }

    hideStructureForm() {
        if (!this.structure.wrapper.classList.contains('hidden')) {
            this.structure.wrapper.classList.add("hidden");
        }
    }

    toJson() {
        var data = {};
        data.type = this.form.type.value;
        data.name = this.form.name.value;
        data.group = this.form.group.value;
        data.language = this.form.language.value;
        data.value = this.form.value.value;

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
        if (data.group !== false && data.group !== null && data.group !== undefined && data.group !== "") {
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
        
        if (data.group) {
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

    typeOptions(currentValue) {
        for (var i = 0; i < LIT.types.length; ++i) {
            var option = document.createElement("option");
            option.value = LIT.types[i];
            option.textContent = LIT.toFriendly(LIT.types[i]);
            if (currentValue === LIT.types[i]) {
                option.setAttribute("selected", "true");
            }
            this.form.type.appendChild(option);
        }
    }

    updateRender() {
        /**
         * TODO: To make diagrams work you need
         * - Each object to be its own canvas with data
         * - A tree of children where each child is an object with data
         * - Obviously, a parent
         * - Each child (and the parent) should have its own history
         * - Each child should have a group it *can* belong to
         * - Each child can have metadata of other types too (need to figure this one out)
         * 
         * TODO: Should be able to alter height of chalkboard
         * TODO: Should be able to scroll chalkboard
         * TODO: Should be able to adjust colors, stroke width, etc...
         * TODO: Should be able to clear
         * TODO: Do not need language
         */
        this.render.innerHTML = "";
        if (this.form.value.length !== "" && this.form.type.value === "chalkboard") {
            var self = this;

            var chalkboardTPL = document.getElementById("LitChalkboardWC.canvas");
            var chalkboardHTML = chalkboardTPL.content.cloneNode(true);
            this.render.appendChild(chalkboardHTML);

            var canvas = this.superRoot.getElementById("chalkboard");
            var clearButton = this.superRoot.getElementById("clear");
            var lineWidthInput = this.superRoot.getElementById("size");
            var fillStyleInput = this.superRoot.getElementById("color");
            var videoElement = this.superRoot.getElementById("video");
            var btnStartCamera = this.superRoot.getElementById("start_camera");
            var btnClick = this.superRoot.getElementById("click");
            var scrollButton = this.superRoot.getElementById("scroll");

            canvas.width = this.getBoundingClientRect().width - 50;
            canvas.height = 200;
            var canvasContext = canvas.getContext("2d");

            var loadedImage = new Image;
            loadedImage.onload = function () {
                // TODO: Scroll the canvas -> drawImage(image, offsetX, offsetY)
                // Example: if you set below to 20, 20 then your drawn image will be offset so just redraw canvas with offset
                canvasContext.drawImage(loadedImage, 0, 0);
            }
            loadedImage.src = this.form.value.value;

            var state = {
                mousedown: false,
                scroll: false,
            };
            var scrollLastPos = {x: 0, y: 0};
            var canvasPos = {x: 0, y: 0};
            var originalImage = new Image;

            var lineWidth = 10;
            var halfLineWidth = lineWidth / 2;
            var fillStyle = '#fff';
            var strokeStyle = '#fff';
            var shadowColor = '#fff';
            var shadowBlur = lineWidth / 4;

            lineWidthInput.value = "10";
            lineWidthInput.addEventListener("keyup", function (evt) {
                lineWidth = lineWidthInput.value;
            });

            fillStyleInput.value = "#fff";
            fillStyleInput.addEventListener("keyup", function (evt) {
                fillStyle = fillStyleInput.value;
                strokeStyle = fillStyleInput.value;
                shadowColor = fillStyleInput.value;
            });

            // TODO: THIS ALSO MOTHER EFFING WORKS!!!!!!!!!!
            // Need to the update the UI because it's SUPER wonky but it works
            btnStartCamera.addEventListener("click", async function () {
                var stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                videoElement.srcObject = stream;
            });
            btnClick.addEventListener("click", function () {
                canvasContext.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            });

            // TODO: DRAW HISTORY WORKS TOO!!
            // So you can wrap a mouse start & end as one object
            // If you drag and drop an object into the canvas, you can do a simple draw history of its own as the object (then you can make borders and resize and stuff)
            // If you drop an image into the canvas, same deal, your history can handle that and it's an object
            // Your drawhistory can be filled with objects which have their own draw history. Perfect!
            // Each object can have a parent position with min/max bounds so you can see if it's in viewport or not
            // You will have to save and load draw history in data json
            var drawHistory = [];
            // TODO: THIS MOTHER FRIGGING WORKS!!!! UPDATE IT AND MAKE IT NICE!!!
            scrollButton.addEventListener("click", function () {
                state.scroll = !state.scroll;
                canvasContext.clearRect(0, 0, canvas.width, canvas.height);
                for (var h = 0; h < drawHistory.length; ++h) {
                    var dwh = drawHistory[h];
                    if (dwh.action === "moveTo") {
                        canvasContext.beginPath();

                        canvasContext.moveTo((canvasPos.x + dwh.pos.x), (canvasPos.y + dwh.pos.y));
                        
                        canvasContext.lineWidth = dwh.lineWidth;
                        canvasContext.strokeStyle = dwh.strokeStyle;
                        canvasContext.shadowColor = dwh.shadowColor;
                        canvasContext.shadowBlur = dwh.shadowBlur;

                        canvasContext.fill();
                    } else if (dwh.action === "lineTo") {
                        canvasContext.lineTo((canvasPos.x + dwh.pos.x), (canvasPos.y + dwh.pos.y));
                        canvasContext.stroke();
                    } else if (dwh.action === "end") {
                        canvasContext.shadowColor = dwh.shadowColor;
                        canvasContext.shadowBlur = dwh.shadowBlur;
                        canvasContext.stroke();
                    }
                }
            });

            /**
             * Trim a canvas.
             * 
             * @author Arjan Haverkamp (arjan at avoid dot org)
             * @param {canvas} canvas A canvas element to trim. This element will be trimmed (reference)
             * @param {int} threshold Alpha threshold. Allows for trimming semi-opaque pixels too. Range: 0 - 255
             * @returns {Object} Width and height of trimmed canvcas and left-top coordinate of trimmed area. Example: {width:400, height:300, x:65, y:104}
             */
            const trimCanvas = (canvas, threshold = 0) => {
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

            function handleWritingStart(event) {
                // console.log("HIT Start", state);
                event.preventDefault();
                if (!state.scroll) {
                    const mousePos = getMousePositionOnCanvas(event);

                    canvasContext.beginPath();

                    canvasContext.moveTo((canvasPos.x + mousePos.x), (canvasPos.y + mousePos.y));
                    
                    canvasContext.lineWidth = lineWidth;
                    canvasContext.strokeStyle = strokeStyle;
                    canvasContext.shadowColor = null;
                    canvasContext.shadowBlur = null;

                    drawHistory.push({
                        action: "moveTo",
                        pos: { x: (canvasPos.x + mousePos.x), y: (canvasPos.y + mousePos.y) },
                        lineWidth: lineWidth,
                        strokeStyle: strokeStyle,
                        shadowColor: null,
                        shadowBlur: null,
                    });

                    canvasContext.fill();
                } else {
                    // ...
                    const mousePos = getMousePositionOnCanvas(event);
                    scrollLastPos = mousePos;
                }
                state.mousedown = true;
            }

            function handleWritingInProgress(event) {
                // console.log("HIT Progress", state);
                event.preventDefault();

                if (state.mousedown && !state.scroll) {
                    const mousePos = getMousePositionOnCanvas(event);

                    canvasContext.lineTo((canvasPos.x + mousePos.x), (canvasPos.y + mousePos.y));
                    drawHistory.push({
                        action: "lineTo",
                        pos: { x: (canvasPos.x + mousePos.x), y: (canvasPos.y + mousePos.y) },
                    });
                    canvasContext.stroke();
                } else if (state.mousedown && state.scroll) {
                    // ...
                    const mousePos = getMousePositionOnCanvas(event);
                    var diff = {x: (mousePos.x - scrollLastPos.x), y: (mousePos.y - scrollLastPos.y)};
                    scrollLastPos = mousePos;
                    canvasPos.x += diff.x;
                    canvasPos.y += diff.y;
                }
            }

            function handleDrawingEnd(event) {
                // console.log("HIT End", state);
                event.preventDefault();

                if (!state.scroll) {
                    if (state.mousedown) {
                        canvasContext.shadowColor = shadowColor;
                        canvasContext.shadowBlur = shadowBlur;

                        canvasContext.stroke();
                        drawHistory.push({
                            action: "end",
                            shadowColor: shadowColor,
                            shadowBlur: shadowBlur,
                        });
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
                        self.form.value.value = canvas.toDataURL("image/png", 0);
                        // canvas.width = this.getBoundingClientRect().width - 20;
                        // canvas.height = 200;
                        // canvasContext.clearRect(0, 0, canvas.width, canvas.height);
                    }
                }
                state.mousedown = false;
            }

            function handleClearButtonClick(event) {
                event.preventDefault();

                self.form.value.value = "";

                clearCanvas();
            }

            function getMousePositionOnCanvas(event) {
                const rect = canvas.getBoundingClientRect();
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

            function clearCanvas() {
                canvasContext.clearRect(0, 0, canvas.width, canvas.height);
            }

            canvas.addEventListener('mousedown', handleWritingStart);
            canvas.addEventListener('mousemove', handleWritingInProgress);
            canvas.addEventListener('mouseup', handleDrawingEnd);
            canvas.addEventListener('mouseout', handleDrawingEnd);

            canvas.addEventListener('touchstart', handleWritingStart);
            canvas.addEventListener('touchmove', handleWritingInProgress);
            canvas.addEventListener('touchend', handleDrawingEnd);

            clearButton.addEventListener('click', handleClearButtonClick);
        } else {
            alert("Want a chalkoard but no data???", this.form);
        }
    }
}
window.customElements.define("lit-chalkboard-wc", LitChalkboardWC);