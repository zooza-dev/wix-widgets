import React, {FC, useEffect} from "react";

type Props = {
    api_key: string;
    version: string;
    type: string;
};

export const WidgetComponent: FC<Props> = ({api_key, version, type}) => {
    useEffect(() => {
        const loadZoozaWidgetScript = () => {
            if (!document.getElementById("zooza-widget-script")) {
                // External script
                const script = document.createElement("script");
                script.type = "text/javascript";
                script.async = true;
                script.id = "zooza-widget-script";
                document.body.setAttribute("data-zooza-api-url", "https://api.zooza.app");

                const url = `https://api.zooza.app/widgets/${version}/`;
                script.src = `${url}?ref=${encodeURIComponent(window.location.href)}&type=${type}`;

                const embedder = document.getElementById(api_key);
                if (embedder) {
                    embedder.appendChild(script);

                    // Inline script for route handling
                    const inlineScript = document.createElement("script");
                    inlineScript.textContent = `
    console.log('External script loaded');

    // Function to handle hash change logic
    function onRouteChange(location) {
        console.log('Detected Wix route change:', location);

        // Fire a custom DOM event
        const customRouteEvent = new CustomEvent('wix-route-change', {
            detail: { path: location.pathname, query: location.search, hash: location.hash }
        });
        window.dispatchEvent(customRouteEvent);
    }

    // Function to attach click event to all <a> elements
    function attachRouteChangeHandler() {
        const anchorTags = document.querySelectorAll('.zooza a');

        anchorTags.forEach((anchor) => {
            // Avoid duplicate handlers
            if (!anchor.hasAttribute('data-route-handler')) {
                anchor.setAttribute('data-route-handler', 'true'); // Mark as handled

                anchor.addEventListener('click', (event) => {
                    const href = anchor.getAttribute('href');

              
                    if (!href || href.startsWith('#')) return;

                    const url = new URL(href, window.location.origin);

                    // Check if the link points to the same origin
                    const isSameOrigin = url.origin === window.location.origin;

                    if (isSameOrigin) {
                        event.preventDefault(); // Prevent default navigation

                        // Update the browser's history state
                        window.history.pushState(null, '', url);

                        // Call the route change handler with the new URL
                        onRouteChange(url);
                    }
                });
            }
        });
    }

    // Attach handlers to existing links
    attachRouteChangeHandler();

    // Observe DOM changes to attach handlers to dynamically added links
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                attachRouteChangeHandler(); // Re-attach handlers for new <a> elements
            }
        });
    });

    // Start observing changes in the body or the specific embedder
    const target = document.body || document.getElementById('${api_key}');
    if (target) {
        observer.observe(target, { childList: true, subtree: true });
    }
`;
                    document.body.appendChild(inlineScript);

                }
            }
        };

        // Load script on DOM ready or immediately if already loaded
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", loadZoozaWidgetScript);
        } else {
            loadZoozaWidgetScript();
        }

        // MutationObserver for dynamic changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "childList" && mutation.addedNodes.length) {
                    console.log("New content detected:", mutation.addedNodes);
                }
            });
        });

        const embedder = document.getElementById(api_key);
        if (embedder) {
            observer.observe(embedder, {childList: true, subtree: true});
        }

        return () => {
            // Cleanup observer on component unmount
            observer.disconnect();
        };
    }, [api_key, version, type]);

    return <div id={api_key} data-version={version} data-widget-id="zooza"></div>;
};




