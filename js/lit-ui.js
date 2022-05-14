 /**
  * TODO: If you edit a piece of content of type "text" then it must reparse for variable and link
  * TODO: Are you mixing dashes and underscores in your ids? Check and make consistent
  * - Apparently, queryselector is at least on par or faster than getelementbyid so maybe use that
  * -- Down side, queryselector returns a static list (so you need to re-run the selector if you want the latest changes)
  * TODO: Variables (using files) need skipComments, skipNewlines and stripNewlines
  * TODO: Outputs need skipComments, skipNewlines and stripNewlines
  * 
  * TODO: insertAdjacentHTML is much faster than innerHTML because it does not disturb existing HTML. Use it appropriately!
  * Refer to this for more information https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML
  * root.content.insertAdjacentHTML('afterbegin', this.model.innerStyle);
  */

var UI = {
    initialize: function () {
        this.litBody = document.getElementById("lit_body");
        this.litVariables = document.getElementById("lit_variables");
        this.litOutputs = document.getElementById("lit_outputs");
        this.litJson = document.getElementById("lit_json");
        this.jsonBody = document.getElementById("json_body");

        // TODO: Update this with more traps
        document.addEventListener("click", function (evt) {
            console.log(evt);
            var composedPath = evt.composedPath();
            for (var p = 0; p < composedPath.length; ++p) {
                var element = composedPath[p];
                if (element instanceof HTMLElement) {
                    if (element.matches("#main_navigation-new")) {
                        console.log("MAIN NAVIGATION NEW");
                    } else if (element.matches("#main_navigation-load")) {
                        // TODO: From file vs reload current
                        UI_UTILS.simulateClick(document.getElementById("upload"));
                    } else if (element.matches("#main_navigation-view")) {
                        UI.jsonBody.classList.toggle("hidden");
                    } else if (element.matches("#main_navigation-save")) {
                        var data = {body: [], variables: [], outputs: []};

                        // var contents = document.getElementsByTagName("lit-wc");
                        var contents = UI.litBody.childNodes;
                        for (var i = 0; i < contents.length; ++i) {
                            if (contents[i] instanceof HTMLElement) {
                                var content = contents[i];
                                data.body.push(content.toJson());
                            }
                        }

                        var contents = document.getElementsByTagName("lit-variable-wc");
                        for (var i = 0; i < contents.length; ++i) {
                            if (contents[i] instanceof HTMLElement) {
                                var content = contents[i];
                                data.variables.push(content.toJson());
                            }
                        }

                        var contents = document.getElementsByTagName("lit-output-wc");
                        for (var i = 0; i < contents.length; ++i) {
                            if (contents[i] instanceof HTMLElement) {
                                var content = contents[i];
                                console.log(content.toJson());
                                data.outputs.push(content.toJson());
                            }
                        }

                        document.getElementById("lit_json").textContent = JSON.stringify(data, null, 2);
                    } else if (element.matches("#main_navigation-download")) {
                        document.getElementById("main_navigation-file").classList.remove("hidden");
                        var downloadLink = document.getElementById("main_navigation-file-anchor");
                        downloadLink.setAttribute("href", "data:application/json;charset=utf-8," + encodeURIComponent(UI.litJson.textContent));
                        downloadLink.setAttribute("download", "lit-data.json");
                    } else if (element.matches("#add-content")) {
                        var data = LIT.newContent();
                        var litWC = new LitWC();
                        UI.litBody.appendChild(litWC);
                        litWC.fromJson(data);
                    } else if (element.matches("#add-output")) {
                        var data = LIT.newOutput();
                        var litOutputWC = new LitOutputWC();
                        UI.litOutputs.appendChild(litOutputWC);
                        litOutputWC.fromJson(data);
                    } else if (element.matches("#add-variable")) {
                        var data = LIT.newVariable();
                        var litVariableWC = new LitVariableWC();
                        UI.litVariables.appendChild(litVariableWC);
                        litVariableWC.fromJson(data);
                    }
                }
            }
        }, true);
        document.addEventListener("change", function (evt) {
            var composedPath = evt.composedPath();
            for (var p = 0; p < composedPath.length; ++p) {
                var element = composedPath[p];
                if (element instanceof HTMLElement) {
                    if (element.matches("#upload")) {
                        let file = element.files[0];

                        let reader = new FileReader();

                        reader.readAsText(file);

                        reader.onload = function() {
                            UI.litJson.innerText = reader.result;
                            UI.convertContentToHtml();
                            UI.convertVariablesToHtml();
                            UI.convertOutputsToHtml();
                        };

                        reader.onerror = function() {
                            console.log(reader.error);
                        };
                    }
                }
            }
        }, true);
        // TODO: Update JSON and array index?
        document.addEventListener("deleted", function (evt) {
            var composedPath = evt.composedPath();
            for (var p = 0; p < composedPath.length; ++p) {
                var element = composedPath[p];
                if (element instanceof HTMLElement) {
                    if (
                        element.matches("lit-wc") ||
                        element.matches("lit-chalkboard-wc") ||
                        element.matches("lit-output-wc") ||
                        element.matches("lit-variable-wc")
                    ) {
                        element.remove();
                    }
                }
            }
        }, true);
        // TODO: Update JSON and array index?
        document.addEventListener("moveUp", function (evt) {
            var composedPath = evt.composedPath();
            for (var p = 0; p < composedPath.length; ++p) {
                var element = composedPath[p];
                if (element instanceof HTMLElement) {
                    if (element.matches("lit-wc")) {
                        // TODO: Is this really the best way to do this? Seems a bit much. Can you not just move the element?
                        if (element.previousElementSibling) {
                            var data = element.toJson();
                            var newLitWC = new LitWC();
                            element.parentNode.insertBefore(newLitWC, element.previousElementSibling);
                            newLitWC.fromJson(data);
                            element.remove();
                            // TODO: Re-order JSON too or, at the very least, you gotta update litArrayIndex here
                        }
                    } else if (element.matches("lit-chalkboard-wc")) {
                        // TODO: Is this really the best way to do this? Seems a bit much. Can you not just move the element?
                        if (element.previousElementSibling) {
                            var data = element.toJson();
                            var newLitWC = new LitChalkboardWC();
                            element.parentNode.insertBefore(newLitWC, element.previousElementSibling);
                            newLitWC.fromJson(data);
                            element.remove();
                            // TODO: Re-order JSON too or, at the very least, you gotta update litArrayIndex here
                        }
                    }
                }
            }
        }, true);
        // TODO: Update JSON and array index?
        document.addEventListener("moveDown", function (evt) {
            var composedPath = evt.composedPath();
            for (var p = 0; p < composedPath.length; ++p) {
                var element = composedPath[p];
                if (element instanceof HTMLElement) {
                    if (element.matches("lit-wc")) {
                        if (element.nextElementSibling && element.nextElementSibling.nextElementSibling) {
                            var data = element.toJson();
                            var newLitWC = new LitWC();
                            element.parentNode.insertBefore(newLitWC, element.nextElementSibling.nextElementSibling);
                            newLitWC.fromJson(data);
                            element.remove();
                            // TODO: Re-order JSON too or, at the very least, you gotta update litArrayIndex here
                        } else if (element.nextElementSibling) {
                            var data = element.toJson();
                            var newLitWC = new LitWC();
                            element.nextElementSibling.after(newLitWC);
                            newLitWC.fromJson(data);
                            element.remove();
                        }
                    } else if (element.matches("lit-chalkboard-wc")) {
                        if (element.nextElementSibling && element.nextElementSibling.nextElementSibling) {
                            var data = element.toJson();
                            var newLitWC = new LitChalkboardWC();
                            element.parentNode.insertBefore(newLitWC, element.nextElementSibling.nextElementSibling);
                            newLitWC.fromJson(data);
                            element.remove();
                            // TODO: Re-order JSON too or, at the very least, you gotta update litArrayIndex here
                        } else if (element.nextElementSibling) {
                            var data = element.toJson();
                            var newLitWC = new LitChalkboardWC();
                            element.nextElementSibling.after(newLitWC);
                            newLitWC.fromJson(data);
                            element.remove();
                        }
                    }
                }
            }
        }, true);
        // TODO: Update JSON and array index?
        document.addEventListener("createAbove", function (evt) {
            var composedPath = evt.composedPath();
            for (var p = 0; p < composedPath.length; ++p) {
                var element = composedPath[p];
                if (element instanceof HTMLElement) {
                    if (element.matches("lit-wc") || element.matches("lit-chalkboard-wc")) {
                        if (element.previousElementSibling) {
                            var data = {value: "New", type: "text", group: false};
                            var newLitWC = new LitWC();
                            element.parentNode.insertBefore(newLitWC, element.previousElementSibling);
                            newLitWC.fromJson(data);
                            // TODO: Re-order JSON too or, at the very least, you gotta update litArrayIndex here
                        } else {
                            // TODO: Move this element down and create one above... somehow
                        }
                    }
                }
            }
        }, true);
        // TODO: Update JSON and array index?
        document.addEventListener("createBelow", function (evt) {
            var composedPath = evt.composedPath();
            for (var p = 0; p < composedPath.length; ++p) {
                var element = composedPath[p];
                if (element instanceof HTMLElement) {
                    if (element.matches("lit-wc") || element.matches("lit-chalkboard-wc")) {
                        if (element.nextElementSibling) {
                            var data = {value: "New", type: "text", group: false};
                            var newLitWC = new LitWC();
                            element.parentNode.insertBefore(newLitWC, element.nextElementSibling);
                            newLitWC.fromJson(data);
                            // TODO: Re-order JSON too or, at the very least, you gotta update litArrayIndex here
                        } else {
                            // TODO: Move this element up and create one below... somehow
                        }
                    }
                }
            }
        }, true);
    },

    getContentFromJson: function () {
        var json = JSON.parse(document.getElementById('lit_json').innerText);
        console.log("getContentFromJson:", json);
        return json;
    },

    convertContentToHtml: function () {
        var json = this.getContentFromJson();
        json = json.body;

        for (var i = 0; i < json.length; ++i) {
            // var lit = json[i];
            // if (json[i].type === "chalkboard") {
            //     var litChalkboardWC = new LitChalkboardWC();
            //     litChalkboardWC.litArrayIndex = i;
                
            //     this.litBody.appendChild(litChalkboardWC);
            //     litChalkboardWC.fromJson(json[i]);
            // }
            var litWC = new LitWC();
            litWC.litArrayIndex = i;
            
            this.litBody.appendChild(litWC);
            litWC.fromJson(json[i]);
        }
    },

    convertVariablesToHtml: function () {
        var json = this.getContentFromJson();
        json = json.variables;

        for (var i = 0; i < json.length; ++i) {
            // var lit = json[i];
            var litVariableWC = new LitVariableWC();
            this.litVariables.appendChild(litVariableWC);
            litVariableWC.fromJson(json[i]);
        }
    },

    convertOutputsToHtml: function () {
        var json = this.getContentFromJson();
        json = json.outputs;

        for (var i = 0; i < json.length; ++i) {
            // var lit = json[i];
            var litOutputWC = new LitOutputWC();
            this.litOutputs.appendChild(litOutputWC);
            litOutputWC.fromJson(json[i]);
        }
    },
};

window.addEventListener('load', function () {
    UI.initialize();
});
