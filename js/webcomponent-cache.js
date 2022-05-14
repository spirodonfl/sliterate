var WebComponentCache = {
    cache: {},
    fetch: function (url, wc) {
        if (!WebComponentCache.cache[url]) {
            if (document.getElementById(url)) {
                WebComponentCache.cache[url] = document.getElementById(url).innerHTML.toString();
                wc.fetchComplete(url);
            } else {
                // Note: Why not fetch? It seems fetch outperforms during JSON operations but that's about it
                // Reference: https://gomakethings.com/the-fetch-api-performance-vs.-xhr-in-vanilla-js/#:~:text=The%20Fetch%20API%20might%20be%20faster%20than%20XHR%20%23&text=fetch()%20will%20be%20the,calls%20aren't%20any%20faster.
                // Set up our HTTP request
                var xhr = new XMLHttpRequest();

                // Setup our listener to process compeleted requests
                xhr.onreadystatechange = function () {

                    // Only run if the request is complete
                    if (xhr.readyState !== 4) return;

                    // Process our return data
                    if (xhr.status >= 200 && xhr.status < 300) {
                        // What do when the request is successful
                        WebComponentCache.cache[url] = xhr.responseText;
                        wc.fetchComplete(url);
                    }
                };

                // Create and send a GET request
                // The first argument is the post type (GET, POST, PUT, DELETE, etc.)
                // The second argument is the endpoint URL
                xhr.open('GET', url);
                xhr.send();
            }
        } else {
            return WebComponentCache.cache[url];
        }
    }
};