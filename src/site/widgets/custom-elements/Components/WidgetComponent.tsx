import React, { useEffect, useState } from "react";

type Props = {
    api_key: string;
    version: string;
    type: string;
    api_url: string;
};

export const WidgetComponent: React.FC<Props> = ({ api_key, version, type, api_url }) => {
    const [currentHref, setCurrentHref] = useState(window.location.href);

    // ✅ Track URL changes and trigger widget reloading
    useEffect(() => {
        const handleURLChange = () => setCurrentHref(window.location.href);

        window.addEventListener("popstate", handleURLChange);
        window.addEventListener("pushstate", handleURLChange);
        window.addEventListener("replacestate", handleURLChange);

        return () => {
            window.removeEventListener("popstate", handleURLChange);
            window.removeEventListener("pushstate", handleURLChange);
            window.removeEventListener("replacestate", handleURLChange);
        };
    }, []);

    useEffect(() => {
        console.log("🔄 URL changed:", currentHref);

        const container = document.getElementById("zooza-widget-container");

        if (container) {
            console.log("🗑️ Removing old widget...");
            container.innerHTML = ""; // Clear all previous content
        }

        // ✅ Remove any existing script
        const existingScript = document.getElementById("zooza-widget-script");
        if (existingScript) {
            console.log("🗑️ Removing old script...");
            existingScript.remove();
        }

        console.log("✅ Creating new widget script...");

        // ✅ Create new script tag for widget
        const scriptTag = document.createElement("script");
        scriptTag.id = "zooza-widget-script";
        scriptTag.setAttribute("data-version", version);
        scriptTag.setAttribute("data-widget-id", "zooza");
        scriptTag.type = "text/javascript";

        if (container) {
            container.appendChild(scriptTag);
        }

        // ✅ Load the widget script dynamically
        const widgetScript = document.createElement("script");
        widgetScript.id = "zooza-dynamic-script";
        widgetScript.type = "text/javascript";
        widgetScript.async = true;
        widgetScript.src = `${api_url}/widgets/${version}/?type=${type}&ref=${encodeURIComponent(currentHref)}`;

        // ✅ Ensure script executes correctly
        widgetScript.onload = () => console.log("✅ Widget script loaded!");
        widgetScript.onerror = (err) => console.error("❌ Widget script failed to load:", err);

        scriptTag.parentNode?.insertBefore(widgetScript, scriptTag.nextSibling);

        return () => {
            console.log("🗑️ Cleaning up widget before unmount...");
            widgetScript.remove();
        };
    }, [currentHref, api_key, version, type, api_url]);

    return <div id="zooza-widget-container"></div>;
};
