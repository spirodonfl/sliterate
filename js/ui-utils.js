var UI_UTILS = {
    /**
     * Simulate a click event.
     * @public
     * @param {Element} elem  the element to simulate a click on
     */
    simulateClick: function (elem) {
        // Create our event (with options)
        var evt = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        // If cancelled, don't dispatch our event
        var canceled = !elem.dispatchEvent(evt);
    },

    howManyChildElements: function (elem) {
        var count = 0;
        for (var c = 0; c < elem.childNodes.length; ++c) {
            if (elem.childNodes[c] instanceof HTMLElement) {
                ++count;
            }
        }

        return count;
    },

    getSiblings: function (elem) {
        // Setup siblings array and get the first sibling
        var siblings = [];
        var sibling = elem.parentNode.firstChild;

        // Loop through each sibling and push to the array
        while (sibling) {
            if (sibling.nodeType === 1 && sibling !== elem) {
                siblings.push(sibling);
            }
            sibling = sibling.nextSibling
        }

        return siblings;
    },
};

// queryselector is about as fast as getelementby* but returns a static copy of an element instead of live
// that's ok if we just re-request an element
window.dqs = function (search) {
    return document.querySelector(search);
};
window.dqsa = function (search) {
    return document.querySelectorAll(search);
}