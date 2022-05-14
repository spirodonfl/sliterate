class WebComponent extends HTMLElement {
    addInnerStyle(text) {
        this.model.innerStyles.push(text);
    }

    addStyleUrl(url) {
        this.model.styleUrls.push(url);
        // Will become link rel="stylesheet" href=""
    }

    addInnerHtml(text) {
        this.model.innerHtmls.push(text);
    }

    addHtmlUrl(url) {
        this.model.htmlUrls.push(url);
    }

    constructor() {
        super();

        this.hasBeenInitialized = false;

        this.urlsFetched = 0;
        this.model = {
            innerStyles: [],
            styleUrls: [
                this.constructor.name + '.css',
            ],
            innerHtmls: [],
            htmlUrls: [
                this.constructor.name + '.html',
            ],
        }
    }

    initialize() {
        this.root = document.createElement('template');

        if (this.model.innerStyles.length > 0) {
            for (var i = 0; i < this.model.innerStyles.length; ++i) {
                var innerStyle = this.model.innerStyles[i];
                this.applyStyle(innerStyle);
            }
        }
        if (this.model.innerHtmls.length > 0) {
            for (var i = 0; i < this.model.innerHtmls.length; ++i) {
                var innerHtml = this.model.innerHtmls[i];
                this.applyHtml(innerHtml);
            }
        }
        if (this.model.styleUrls.length > 0) {
            for (var i = 0; i < this.model.styleUrls.length; ++i) {
                var styleUrl = this.model.styleUrls[i];
                if (WebComponentCache.fetch(styleUrl, this)) {
                    this.fetchComplete();
                }
            }
        }
        if (this.model.htmlUrls.length > 0) {
            for (var i = 0; i < this.model.htmlUrls.length; ++i) {
                var htmlUrl = this.model.htmlUrls[i];
                if (WebComponentCache.fetch(htmlUrl, this)) {
                    this.fetchComplete();
                }
            }
        }

        if (this.model.styleUrls.length === 0 && this.model.htmlUrls.length === 0) {
            // TODO: Turn this into an event and listen to it instead?
            this.postInitialize();
        }
    }

    applyStyle(styleText) {
        this.root.innerHTML += styleText;
    }

    applyHtml(htmlText) {
        this.root.innerHTML += htmlText;
    }

    fetchComplete(url, type) {
        ++this.urlsFetched;
        if (this.urlsFetched === (this.model.styleUrls.length + this.model.htmlUrls.length)) {
            for (var i = 0; i < this.model.styleUrls.length; ++i) {
                var styleUrl = this.model.styleUrls[i];
                styleUrl = WebComponentCache.fetch(styleUrl, this);
                this.applyStyle(styleUrl);
            }
            for (var i = 0; i < this.model.htmlUrls.length; ++i) {
                var htmlUrl = this.model.htmlUrls[i];
                htmlUrl = WebComponentCache.fetch(htmlUrl, this);
                this.applyHtml(htmlUrl);
            }
            this.postInitialize();
        }
    }

    postInitialize() {
        // if (!this.hasBeenInitialized) {
            this.superRoot = this.attachShadow({ mode: 'closed'});
            this.superRoot.appendChild(this.root.content.cloneNode(true));
            this.hasBeenInitialized = true;
        // }
    }

    connectedCallback() {
        // if (!this.hasBeenInitialized) {
            this.render();
        // }
    }

    render() {
        // ...
    }

    qs(selector) {
        return this.superRoot.querySelector(selector);
    }

    qsa(selector) {
        return this.superRoot.querySelectorAll(selector);
    }
}