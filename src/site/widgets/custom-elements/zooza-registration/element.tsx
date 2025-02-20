import React, { type FC } from 'react';
import ReactDOM from 'react-dom';
import reactToWebComponent from 'react-to-webcomponent';
import styles from './element.module.css';
import {WidgetComponent} from "../Components/WidgetComponent";



interface Props {
  displayName?: string;
}

const CustomElement: FC<Props> = ({
  displayName
}) => {


  return (
    <>
        <WidgetComponent api_key={displayName as string} type={"registration_new"} version={"v1"}  />
    </>
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
