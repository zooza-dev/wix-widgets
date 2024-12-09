import React, {FC, useEffect} from "react";
import {widget} from "@wix/editor";

type Props = {
    api_key: string;
    version: string
    type: string
}

export const WidgetComponent: FC<Props> = (props) => {

    console.log(widget.__type)
    useEffect(() => {

        const loadZoozaWidgetScript = () => {
            if (!document.getElementById('zooza-widget-script')) {
                const script = document.createElement('script');
                script.type = 'text/javascript';
                script.async = true;
                script.id = 'zooza-widget-script';
                document.body.setAttribute('data-zooza-api-url', 'https://api.zooza.app');
                const url = `https://api.zooza.app/widgets/${props.version}/`;
                script.src = `${url}?ref=${encodeURIComponent(window.location.href)}&type=${props.type}`;

                const embedder = document.getElementById(props.api_key);
                if (embedder) {
                    embedder.appendChild(script);
                }
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', loadZoozaWidgetScript);
        } else {
            loadZoozaWidgetScript();
        }
    }, [props.api_key, widget]);

    return (
        <div>
            <div id={props.api_key} data-version={props.version} data-widget-id="zooza"></div>
        </div>
    );
};
