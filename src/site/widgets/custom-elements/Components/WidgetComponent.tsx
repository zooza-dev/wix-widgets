import React, { useEffect, useState } from "react";

type Props = {
    api_key: string;
    version: string;
    type: "registration_new" | "map" | "profile" | "checkout" | "video" | "calendar";
    api_url?: string;
};

export const WidgetComponent: React.FC<Props> = ({ api_key, version, type, api_url }) => {
    const [retryCount, setRetryCount] = useState(0);
    const [finalApiUrl, setFinalApiUrl] = useState(api_url || "https://api.zooza.app");
    const [currentPath, setCurrentPath] = useState(window.location.pathname + window.location.search + window.location.hash);

    // ✅ Hashes that should trigger a re-render
    const validHashes = new Set([
        '#notifications', '#accept_waitlist', '#enroll', '#upcoming_notifications',
        '#cancel_event', '#payment_response', '#generic_error', '#set_attendance',
        '#confirm', '#registration_failed', '#email_sent', "#select_schedule",
        "#change_schedule", '#reset', '#select_event', '#select_segment', '#add_person',
        "#fix_email", '#create_payment_request', '#apply_code', '#remove_person', '#order'
    ]);

    // ✅ Detect route changes and force rerender
    useEffect(() => {
        const handleRouteChange = () => {
            const newPath = window.location.pathname + window.location.search + window.location.hash;
            console.log("🔄 URL Changed, forcing widget reload:", newPath);

            // ✅ Ensure only specific `#hash` values trigger a reload
            if (window.location.hash && !validHashes.has(window.location.hash)) {
                console.log("⚠️ Ignoring unrelated hash change:", window.location.hash);
                return;
            }

            setCurrentPath(newPath);
        };

        window.addEventListener("wix-route-change", handleRouteChange);
        window.addEventListener("wix-query-change", handleRouteChange);
        window.addEventListener("hashchange", handleRouteChange);

        return () => {
            window.removeEventListener("wix-route-change", handleRouteChange);
            window.removeEventListener("wix-query-change", handleRouteChange);
            window.removeEventListener("hashchange", handleRouteChange);
        };
    }, []);

    // ✅ Load widget when the path (including query and hash) changes
    useEffect(() => {
        const MAX_RETRIES = 3;

        const loadWidget = () => {
            console.log(`🔄 Attempting to load widget (Try ${retryCount + 1}/${MAX_RETRIES})`);
            console.log("API Key:", api_key);
            console.log("API URL:", finalApiUrl);
            console.log("Current Path:", currentPath);

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
            scriptTag.id = `${api_key}`;
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
            widgetScript.src = `${finalApiUrl}/widgets/${version}/?type=${type}&ref=${encodeURIComponent(currentPath)}&v=${new Date().getTime()}`;

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
            }, 1500);
        };

        loadWidget();
    }, [currentPath, retryCount]);

    // ✅ Handle navigation manually for both `#hash` and `?query` changes
    useEffect(() => {
        // ✅ Function to handle internal navigation manually
        const handleAnchorClick = (event: Event) => {
            const target = event.target as HTMLAnchorElement;
            if (!target || target.tagName !== "A") return;

            const href = target.getAttribute("href");
            if (href && href.includes("#")) {
                event.preventDefault(); // ⛔ Prevent default anchor behavior
                console.log("🔄 Wix route change detected:", href);

                const newUrl = new URL(href, window.location.origin);
                window.history.pushState(null, "", newUrl.pathname + newUrl.hash);

                // ✅ Manually trigger Wix navigation event
                const wixRouteEvent = new CustomEvent("wix-route-change", {
                    detail: { path: newUrl.pathname, hash: newUrl.hash }
                });
                window.dispatchEvent(wixRouteEvent);
            }
            else return;
        };

        // ✅ Attach event listener for clicks on links with #
        document.addEventListener("click", handleAnchorClick);

        return () => {
            document.removeEventListener("click", handleAnchorClick);
        };
    }, []);

    return <div id="zooza-widget-container"></div>;
};
