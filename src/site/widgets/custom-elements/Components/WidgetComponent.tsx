import React, { useEffect, useRef } from "react";
import logo from "../../../../assets/logo_zooza.svg";

type Props = {
    api_key: string;
    version: string;
    type: "registration_new" | "map" | "profile" | "checkout" | "video" | "calendar";
    api_url?: string;
};

export const WidgetComponent: React.FC<Props> = ({ api_key, version, type, api_url }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const initializedRef = useRef(false);

    const isEditorMode = window.location.pathname.includes('/services/');

    const resolvedApiUrl = api_url ||
        (window.location.hostname.endsWith(".co.uk") ? "https://uk.api.zooza.app" : "https://api.zooza.app");

    // Load widget — deferred by one tick so all attribute-to-prop updates from
    // react-to-webcomponent settle before we load the script.
    // When props change rapidly (Wix sets display-name, then api-url), each render
    // cancels the previous pending timer via cleanup, so only the final render loads.
    useEffect(() => {
        if (initializedRef.current) return;
        const container = containerRef.current;
        if (!container) return;
        if (!api_key || api_key === "Zooza") return;

        const timer = setTimeout(() => {
            if (initializedRef.current) return;
            initializedRef.current = true;

            // Reset v2 widget init guard
            delete (document as any).zooza_initialised;

            // Set API URL on body for widgets that read it
            document.body.setAttribute('data-zooza-api-url', resolvedApiUrl);

            // Metadata script tag — v1/v2 widgets find this via [data-widget-id="zooza"]
            const scriptTag = document.createElement("script");
            scriptTag.id = api_key;
            scriptTag.setAttribute("data-version", version);
            scriptTag.setAttribute("data-widget-id", "zooza");
            scriptTag.setAttribute("data-zooza-api-url", resolvedApiUrl);
            scriptTag.type = "text/javascript";
            container.appendChild(scriptTag);

            // Widget loader script
            const widgetScript = document.createElement("script");
            widgetScript.type = "text/javascript";
            widgetScript.async = true;
            widgetScript.src = `${resolvedApiUrl}/widgets/${version}/?type=${type}&ref=${encodeURIComponent(window.location.href)}&v=${Date.now()}`;

            widgetScript.onload = () => console.log("✅ Widget loaded:", type);
            widgetScript.onerror = (err) => {
                console.error("❌ Widget script failed:", err);
                initializedRef.current = false;
            };

            scriptTag.parentNode?.insertBefore(widgetScript, scriptTag.nextSibling);
        }, 0);

        // If props change before the timer fires, cancel and let the next render try
        return () => clearTimeout(timer);
    }, [api_key, version, type, resolvedApiUrl]);

    // Cleanup only on actual component unmount (empty deps = mount/unmount only)
    useEffect(() => {
        return () => {
            const container = containerRef.current;
            if (container) container.innerHTML = "";
            initializedRef.current = false;
            delete (document as any).zooza_initialised;
        };
    }, []);

    if (api_key === "Zooza" || api_key === "" || api_key === null || api_key === undefined) {
        return (
            <div style={{
                alignContent: "center",
                textAlign: "center",
                padding: '10px',
                border: '1px solid red',
                backgroundColor: '#ffe6e6',
                borderRadius: '5px',
                height: "90%"
            }}>
                <strong>API Key Not Configured!</strong>
                <p>To activate this widget, please enter your API key in the settings.</p>
                <p>Double-click on the widget or click the <strong>Settings</strong> button to open the configuration panel.</p>
                <p>Once in settings, enter your API key to enable the widget.</p>
                <img height={60} src={logo} alt="Zooza logo"/>
            </div>
        );
    }
    if (isEditorMode) {
        return <>
            <div style={{
                alignContent: "center",
                textAlign: "center",
                padding: '8px',
                marginBottom: '8px',
                border: '1px dashed #bbb',
                backgroundColor: '#fafafa',
                borderRadius: '5px'
            }}>
                <strong>Widget Preview</strong>
                <p>The Zooza widget may not display correctly in the editor. It will work properly after publishing.</p>
                <img height={40} src={logo} alt="Zooza logo"/>
            </div>
            <style>{`
                .zooza_branding{
                 display:none !important;
            }`}
            </style>
            <div ref={containerRef}></div>
        </>
    }

    return (
        <>
            <style>{`
                .zooza_branding{
                 display:none !important;
            }`}
            </style>
            <div ref={containerRef}></div>
        </>
    );
};