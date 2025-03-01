import React, {type FC} from 'react';
import ReactDOM from 'react-dom';
import reactToWebComponent from 'react-to-webcomponent';
import {WidgetComponent} from "../Components/WidgetComponent";


interface Props {
    displayName: string;
    apiURL: string;
}

const CustomElement: FC<Props> = ({
                                      displayName,
                                      apiURL

                                  }) => {


    return (
        <WidgetComponent api_key={displayName} type={"calendar"} version={"v2"} api_url={apiURL}  />
    );
};

const customElement = reactToWebComponent(
    CustomElement,
    React,
    ReactDOM as any,
    {
        props: {
            displayName: 'string',
            apiURL:'string',
        },
    }
);

export default customElement;
