import React, { useEffect, useState } from "react";

type Props = {
    api_key: string;
    version: string;
    type: string;
    api_url?: string;  // ✅ Make `api_url` optional
};

export const WidgetComponent: React.FC<Props> = ({ api_key, version, type, api_url }) => {
    const [retryCount, setRetryCount] = useState(0);
    const [finalApiUrl, setFinalApiUrl] = useState(api_url || "https://api.zooza.app"); // ✅ Default API URL

    useEffect(() => {
        if (!api_url) {
            console.warn("⚠️ `api_url` is missing! Using fallback:", finalApiUrl);
            if (window.location.hostname.endsWith(".co.uk")) {
                setFinalApiUrl("https://uk.api.zooza.app");
            }
            setFinalApiUrl("https://api.zooza.app"); // ✅ Ensure it has a default value
        }
    }, [api_url]);

    useEffect(() => {
        const MAX_RETRIES = 3;
        const loadWidget = () => {
            console.log(`🔄 Attempting to load widget (Try ${retryCount + 1}/${MAX_RETRIES})`);
            console.log("API Key:", api_key);
            console.log("API URL:", finalApiUrl);

            if (!api_key || !finalApiUrl) {
                console.error("❌ Missing API key or API URL. Widget cannot be loaded.");
                return;
            }

            const container = document.getElementById("zooza-widget-container");
            if (!container) {
                console.error("❌ Widget container not found!");
                return;
            }

            // 🗑️ Remove previous widget before adding a new one
            container.innerHTML = "";

            // ✅ Remove old script to prevent duplication
            document.querySelectorAll("script[data-widget-id='zooza']").forEach((oldScript) => {
                console.log("🗑️ Removing old widget script...");
                oldScript.remove();
            });

            // ✅ Create a new script tag for the widget
            const scriptTag = document.createElement("script");
            scriptTag.id = `widget-script-${api_key}`;
            scriptTag.setAttribute("data-version", version);
            scriptTag.setAttribute("data-widget-id", "zooza");
            scriptTag.setAttribute("data-zooza-api-url", finalApiUrl);
            scriptTag.type = "text/javascript";

            container.appendChild(scriptTag);

            // ✅ Load widget dynamically
            const widgetScript = document.createElement("script");
            widgetScript.type = "text/javascript";
            widgetScript.async = true;
            document.body.setAttribute("data-zooza-api-url", finalApiUrl);
            widgetScript.src = `${finalApiUrl}/widgets/${version}/?type=${type}&ref=${encodeURIComponent(window.location.href)}&v=${new Date().getTime()}`;

            widgetScript.onload = () => {
                console.log("✅ Widget successfully loaded!");
                setRetryCount(0); // Reset retry count on success
            };

            widgetScript.onerror = (err) => {
                console.error("❌ Failed to load widget script:", err);
                console.warn("⚠️ API URL issue detected:", finalApiUrl);
            };

            scriptTag.parentNode?.insertBefore(widgetScript, scriptTag.nextSibling);

            // ✅ Check if widget appears, retry if needed
            setTimeout(() => {
                if (!container.innerHTML.trim() && retryCount < MAX_RETRIES) {
                    console.warn(`⚠️ Widget not rendered, retrying... (${retryCount + 1}/${MAX_RETRIES})`);
                    setRetryCount((prev) => prev + 1);
                } else if (retryCount >= MAX_RETRIES) {
                    console.error("❌ Max retries reached. Widget failed to load.");
                }
            }, 1500); // Wait 1.5 seconds before checking

        };

        loadWidget();
    }, [api_key, version, type, finalApiUrl, retryCount,document.body.getAttribute("data-zooza-api-url")]);

    return <div id="zooza-widget-container"></div>;
};
