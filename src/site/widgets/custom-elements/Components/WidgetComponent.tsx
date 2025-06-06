import React, { useEffect, useState } from "react";
import logo from "../../../../assets/logo_zooza.svg";

type Props = {
    api_key: string;
    version: string;
    type: "registration_new" | "map" | "profile" | "checkout" | "video" | "calendar";
    api_url?: string;
};

export const WidgetComponent: React.FC<Props> = ({ api_key, version, type, api_url }) => {
    const [retryCount, setRetryCount] = useState(0);
    const [finalApiUrl, setFinalApiUrl] = useState(api_url || "https://api.zooza.app");
    const [currentPath, setCurrentPath] = useState(window.location.href);

    const validHashes = new Set([
        "#notifications", "#accept_waitlist", "#enroll", "#upcoming_notifications",
        "#cancel_event", "#payment_response", "#generic_error", "#set_attendance",
        "#confirm", "#registration_failed", "#email_sent", "#select_schedule",
        "#change_schedule", "#reset", "#select_event", "#select_segment", "#add_person",
        "#fix_email", "#create_payment_request", "#apply_code", "#remove_person", "#order"
    ]);
    const isEditorMode = window.location.pathname.includes('/services/');


console.log("is editor: ", window.location.pathname)
    console.log("is editor: ", isEditorMode)



    useEffect(() => {
        if (!api_url) {
            console.warn("⚠️ `api_url` is missing! Using fallback:", finalApiUrl);
            if (window.location.hostname.endsWith(".co.uk")) {
                setFinalApiUrl("https://uk.api.zooza.app");
            }
        }
    }, [api_url]);

    // ✅ Reload widget when browser navigation occurs
    useEffect(() => {
        const handleRouteChange = () => {
            const newPath = window.location.href;
            console.log("🔄 URL Changed, forcing widget reload:", newPath);

            if (window.location.hash && !validHashes.has(window.location.hash)) {
                console.log("⚠️ Ignoring unrelated hash change:", window.location.hash);
                return;
            }

            setCurrentPath(newPath);
        };

        window.addEventListener("popstate", handleRouteChange);
        window.addEventListener("hashchange", handleRouteChange);
        window.addEventListener("wix-route-change", handleRouteChange);
        window.addEventListener("wix-query-change", handleRouteChange);

        return () => {
            window.removeEventListener("popstate", handleRouteChange);
            window.removeEventListener("hashchange", handleRouteChange);
            window.removeEventListener("wix-route-change", handleRouteChange);
            window.removeEventListener("wix-query-change", handleRouteChange);
        };
    }, []);

    // ✅ Reload widget when `currentPath` updates
    useEffect(() => {
        const MAX_RETRIES = 3;

        const loadWidget = () => {
            console.log(`🔄 Loading widget (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
            console.log("API Key:", api_key);
            console.log("API URL:", finalApiUrl);
            console.log("Current Path:", currentPath);

            if (!api_key || !finalApiUrl) {
                console.error("❌ Missing API key or API URL. Widget cannot be loaded.");
                return;
            }
            const bodyApiUrl = document.body.getAttribute('data-zooza-api-url');
            if(bodyApiUrl !== finalApiUrl){
                document.body.setAttribute('data-zooza-api-url', finalApiUrl);
            }

            const container = document.getElementById("zooza-widget-container");
            if (!container) {
                console.error("❌ Widget container not found!");
                return;
            }

            container.innerHTML = "";
            document.querySelectorAll("script[data-widget-id='zooza']").forEach((oldScript) => {
                console.log("🗑️ Removing old widget script...");
                oldScript.remove();
            });

            const scriptTag = document.createElement("script");
            scriptTag.id = `${api_key}`;
            scriptTag.setAttribute("data-version", version);
            scriptTag.setAttribute("data-widget-id", "zooza");
            scriptTag.setAttribute("data-zooza-api-url", finalApiUrl);
            scriptTag.type = "text/javascript";
            container.appendChild(scriptTag);

            const widgetScript = document.createElement("script");
            widgetScript.type = "text/javascript";
            widgetScript.async = true;
            widgetScript.src = `${finalApiUrl}/widgets/${version}/?type=${type}&ref=${encodeURIComponent(currentPath)}&v=${Date.now()}`;

            widgetScript.onload = () => {
                console.log("✅ Widget successfully loaded!");
                setRetryCount(0);
            };

            widgetScript.onerror = (err) => {
                console.error("❌ Failed to load widget script:", err);
                console.warn("⚠️ API URL issue detected:", finalApiUrl);
            };

            scriptTag.parentNode?.insertBefore(widgetScript, scriptTag.nextSibling);

            setTimeout(() => {
                if (!container.innerHTML.trim() && retryCount < MAX_RETRIES) {
                    console.warn(`⚠️ Widget not rendered, retrying... (${retryCount + 1}/${MAX_RETRIES})`);
                    setRetryCount((prev) => prev + 1);
                } else if (retryCount >= MAX_RETRIES) {
                    console.error("❌ Max retries reached. Widget failed to load.");
                }
            }, 1500);
        };

        loadWidget();
    }, [currentPath, retryCount]);

    // ✅ Manually handle anchor (`<a href="#xyz">`) clicks to trigger widget reload
    useEffect(() => {
        const handleAnchorClick = (event: Event) => {
            const target = event.target as HTMLAnchorElement;
            if (!target || target.tagName !== "A") return;

            const href = target.getAttribute("href");
            if (href && href.includes("#")) {
                event.preventDefault();
                console.log("🔄 Wix route change detected:", href);

                const newUrl = new URL(href, window.location.origin);
                window.history.pushState(null, "", newUrl.pathname + newUrl.hash);

                const wixRouteEvent = new CustomEvent("wix-route-change", {
                    detail: { path: newUrl.pathname, hash: newUrl.hash }
                });
                window.dispatchEvent(wixRouteEvent);
            }
        };

        document.addEventListener("click", handleAnchorClick);
        return () => {
            document.removeEventListener("click", handleAnchorClick);
        };
    }, []);

    if (api_key === "Zooza" || api_key === ""|| api_key === null|| api_key === undefined) {
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
            <div id="zooza-widget-container"></div>
        </>

    }

    return (
        <>
            <style>{`
                .zooza_branding{
                 display:none !important;
            }`}
            </style>
            <div id="zooza-widget-container"></div>
        </>
    );
};
