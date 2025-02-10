import React, { FC, useEffect, useState } from "react";

type Props = {
    api_key: string;
    version: string;
    type: string;
};

export const WidgetComponent: FC<Props> = ({ api_key, version, type }) => {
    const [apiKey, setApiKey] = useState<string | undefined>();

    useEffect(() => {
        const el = document.querySelector("#project-token");

        // @ts-ignore
        const detectedApiKey =
            //el?.dataset.projectToken ||
            api_key;
        setApiKey(detectedApiKey);

        const loadZoozaWidgetScript = () => {
            if (!document.getElementById("zooza-widget-script") && detectedApiKey) {
                const script = document.createElement("script");
                script.type = "text/javascript";
                script.async = true;
                script.id = "zooza-widget-script";
                document.body.setAttribute("data-zooza-api-url", "https://api.zooza.app");

                const url = `https://api.zooza.app/widgets/${version}/`;
                script.src = `${url}?ref=${encodeURIComponent(window.location.href)}&type=${type}`;

                const embedder = document.getElementById(detectedApiKey);
                if (embedder) {
                    embedder.appendChild(script);

                    // Inline script for route handling
                    const inlineScript = document.createElement("script");
                    inlineScript.textContent = `
                        console.log('External script loaded');
                        function onRouteChange(location) {
                            console.log('Detected Wix route change:', location);
                            const customRouteEvent = new CustomEvent('wix-route-change', {
                                detail: { path: location.pathname, query: location.search, hash: location.hash }
                            });
                            window.dispatchEvent(customRouteEvent);
                        }
                        function attachRouteChangeHandler() {
                            document.querySelectorAll('.zooza a').forEach((anchor) => {
                                if (!anchor.hasAttribute('data-route-handler')) {
                                    anchor.setAttribute('data-route-handler', 'true');
                                    anchor.addEventListener('click', (event) => {
                                        const href = anchor.getAttribute('href');
                                        if (!href || href.startsWith('#')) return;
                                        const url = new URL(href, window.location.origin);
                                        if (url.origin === window.location.origin) {
                                            event.preventDefault();
                                            window.history.pushState(null, '', url);
                                            onRouteChange(url);
                                        }
                                    });
                                }
                            });
                        }
                        attachRouteChangeHandler();
                        const observer = new MutationObserver(() => attachRouteChangeHandler());
                        observer.observe(document.body, { childList: true, subtree: true });
                    `;
                    document.body.appendChild(inlineScript);
                }
            }
        };

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", loadZoozaWidgetScript);
        } else {
            loadZoozaWidgetScript();
        }

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "childList" && mutation.addedNodes.length) {
                    console.log("New content detected:", mutation.addedNodes);
                }
            });
        });

        if (detectedApiKey) {
            const embedder = document.getElementById(detectedApiKey);
            if (embedder) {
                observer.observe(embedder, { childList: true, subtree: true });
            }
        }

        return () => {
            observer.disconnect();
        };
    }, [api_key, version, type]);

    if (!apiKey) {
        return <div>Loading...</div>;
    }

    return <div id={apiKey} data-version={version} data-widget-id="zooza"></div>;
};
