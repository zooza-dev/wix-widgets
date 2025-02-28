import React, {type FC} from 'react';
import ReactDOM from 'react-dom';
import reactToWebComponent from 'react-to-webcomponent';
import {WidgetComponent} from "../Components/WidgetComponent";


interface Props {
    displayName: string;
    apiURL: string;
}

const CustomElement: FC<Props> = (props) => {


    return (
        <WidgetComponent api_key={props.displayName} type={"video"} version={"v2"} api_url={props.apiURL}  />
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
