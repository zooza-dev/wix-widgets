import React, { FC, useEffect, useState } from "react";

type Props = {
    api_key: string;
    version: string;
    type: string;
};

export const WidgetComponent: FC<Props> = ({ api_key, version, type }) => {
    const [apiKey, setApiKey] = useState<string | undefined>(api_key);

    useEffect(() => {
        const loadZoozaWidgetScript = () => {
            if (!apiKey) return;

            const existingScript = document.getElementById("zooza-widget-script");
            if (existingScript && existingScript.getAttribute("data-loaded") === "true") return;

            const script = document.createElement("script");
            script.type = "text/javascript";
            script.async = true;
            script.id = "zooza-widget-script";
            script.setAttribute("data-loaded", "true");

            const currentValue = document.body.getAttribute("data-zooza-api-url");
            document.body.setAttribute("data-zooza-api-url", currentValue && currentValue.trim() ? currentValue : "https://uk.api.zooza.app");



            script.src = `https://api.zooza.app/widgets/${version}/?ref=${encodeURIComponent(
                window.location.href
            )}&type=${type}`;

            const embedder = document.querySelector(`[data-widget-id="zooza"]`);
            if (embedder) {
                embedder.appendChild(script);

                // Inline route handling script
                const inlineScript = document.createElement("script");
                inlineScript.textContent = `
          function onRouteChange(location) {
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
                          if (!href || href.startsWith('#') || href.includes('://')) return;
                          event.preventDefault();
                          const url = new URL(href, window.location.origin);
                          window.history.pushState(null, '', url);
                          onRouteChange(url);
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

        const embedder = document.querySelector(`[data-widget-id="zooza"]`);
        if (embedder) {
            observer.observe(embedder, { childList: true, subtree: true });
        }

        return () => {
            document.removeEventListener("DOMContentLoaded", loadZoozaWidgetScript);
            observer.disconnect();
        };
    }, [apiKey, version, type]);

    if (!apiKey) {
        return <div>Loading...</div>;
    }

    return <div id={apiKey} data-version={version} data-widget-id="zooza"></div>;
};
