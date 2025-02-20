import React, {FC, useEffect, useState} from "react";
import {widget} from "@wix/editor";
import {FormField, Input, SidePanel, WixDesignSystemProvider} from "@wix/design-system";
import '@wix/design-system/styles.global.css';

 const Panel: FC = () => {
  const [name, setName] = useState<string>('');

  useEffect(() => {
    widget.getProp('display-name').then(name => setName(name || 'Zooza'));
  }, [setName]);

  return (
      <WixDesignSystemProvider>
        <SidePanel width="300">
          <SidePanel.Content noPadding stretchVertically>
            <SidePanel.Field>
              <FormField label="Api key">
                <Input
                    type="text"
                    value={name}
                    onChange={(event) => {
                      const newName = event.target.value;
                      setName(newName);
                      widget.setProp('display-name', newName);
                    }}
                />
              </FormField>
            </SidePanel.Field>
          </SidePanel.Content>
        </SidePanel>
      </WixDesignSystemProvider>
  );
};
export default Panel
