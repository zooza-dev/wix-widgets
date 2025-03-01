import React, { FC, useEffect, useState } from "react";

type Props = {
    api_key: string;
    version: string;
    type: string;
    api_url: string;
};

export const WidgetComponent: FC<Props> = ({ api_key, version, type, api_url }) => {
    const [apiKey] = useState(api_key);

    useEffect(() => {
        if (!apiKey) return;

        // Create script tag inside the div
        const scriptTag = document.createElement("script");
        scriptTag.id = apiKey;
        scriptTag.setAttribute("data-version", version);
        scriptTag.setAttribute("data-widget-id", "zooza");
        scriptTag.type = "text/javascript";

        const container = document.getElementById("zooza-widget-container");
        if (container) {
            container.appendChild(scriptTag);
        }

        // Load external widget script
        const loadZoozaWidgetScript = () => {
            const existingScript = document.getElementById("zooza-widget-script");
            if (existingScript && existingScript.getAttribute("data-loaded") === "true") return;

            const widgetScript = document.createElement("script");
            widgetScript.id = "zooza-widget-script";
            widgetScript.setAttribute("data-widget-id", "zooza");
            widgetScript.type = "text/javascript";
            widgetScript.async = true;
            widgetScript.setAttribute("data-loaded", "true");

            const currentValue = document.body.getAttribute("data-zooza-api-url");
            document.body.setAttribute("data-zooza-api-url", currentValue?.trim() ? currentValue : api_url);

            widgetScript.src = `${api_url}/widgets/${version}/?ref=${encodeURIComponent(
                window.location.href
            )}&type=${type}`;

            scriptTag.parentNode?.insertBefore(widgetScript, scriptTag.nextSibling);

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

        if (container) {
            observer.observe(container, { childList: true, subtree: true });
        }

        return () => {
            document.removeEventListener("DOMContentLoaded", loadZoozaWidgetScript);
            observer.disconnect();
        };
    }, [apiKey, version, type]);

    return (
        <div id="zooza-widget-container">
            <script id={apiKey} data-version={version} data-widget-id="zooza"></script>
        </div>
    );
};
