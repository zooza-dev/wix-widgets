import React, {type FC} from 'react';
import ReactDOM from 'react-dom';
import reactToWebComponent from 'react-to-webcomponent';
import {WidgetComponent} from "../Components/WidgetComponent";


interface Props {
    displayName: string;
}

const CustomElement: FC<Props> = (props) => {


    return (
        <WidgetComponent api_key={props.displayName} type={"calendar"} version={"v2"}  />
    );
};

const customElement = reactToWebComponent(
    CustomElement,
    React,
    ReactDOM as any,
    {
        props: {
            displayName: 'string',
        },
    }
);

export default customElement;
