import React, { FC, useEffect, useState } from "react";
import { widget } from "@wix/editor";
import {
  Dropdown,
  FormField,
  Input,
  listItemSelectBuilder,
  SidePanel,
  WixDesignSystemProvider,
  Text
} from "@wix/design-system";
import "@wix/design-system/styles.global.css";



const Panel: FC = () => {
  const [name, setName] = useState<string>("");
  const [apiURL, setApiURL] = useState<string>("https://api.zooza.app");

  useEffect(() => {
    widget.getProp("display-name").then((name) => setName(name || ""));
    widget.getProp("api-url").then((url) => setApiURL(url || "https://api.zooza.app")); // ✅ Set a valid default
  }, [setName, setApiURL]);

  // ✅ Define API options (Database Sections)
  const apis = [
    { id: "uk", value: "https://uk.api.zooza.app", label: "United Kingdom" },
    { id: "eu", value: "https://api.zooza.app", label: "Europe Union" },
    { id: "test", value: "https://api-test.zooza.app", label: "Test Environment" },
  ];

  // ✅ Create dropdown options (Only Display Section Names)
  const options = apis.map(({ id, label }) =>
      listItemSelectBuilder({ id, title: label, label })
  );

  // ✅ Find the selected option based on apiURL
  const selectedApi = apis.find((api) => api.value === apiURL);

  // ✅ Handle Selection
  const onSelect = (id: string) => {
    const selectedOption = apis.find((api) => api.id === id);
    if (selectedOption) {
      setApiURL(selectedOption.value);
      widget.setProp("api-url", selectedOption.value);
    }
  };


  return (
      <WixDesignSystemProvider>
        <SidePanel width="300">
          <SidePanel.Content noPadding stretchVertically>
            <SidePanel.Field>
              <FormField label="API Key">
                <Input
                    type="text"
                    value={name}
                    placeholder="Enter your Zooza API key"
                    onChange={(event) => {
                      const newName = event.target.value;
                      setName(newName);
                      widget.setProp("display-name", newName);
                    }}
                />
              </FormField>

              <Text size="tiny">
                To obtain your API key, go to the&nbsp;
                <a href="https://zooza.app" target="_blank" rel="noopener noreferrer">Zooza App</a>.<br/>
                If you are in the UK, visit&nbsp;
                <a href="https://uk.zooza.app" target="_blank" rel="noopener noreferrer">Zooza UK</a>.<br/><br/>
                In Zooza, go to the <strong>Publish</strong> section. In the <strong>Widgets</strong> card, you’ll find a list of widgets.<br/>
                Click on the widget you want to add to your Wix site, choose <strong>Integration: WiX</strong>, and copy the API key shown.<br/>
                Paste it into the input field above.
              </Text>
            </SidePanel.Field>

            <SidePanel.Field>
              <FormField label="Api Section">
                <Dropdown
                    placeholder="Select api Section"
                    valueParser={(option) => option.label} // ✅ Shows only section names
                    selectedId={selectedApi?.id} // ✅ Keeps selected item
                    options={options}
                    onSelect={(e) => onSelect(e.id as string)}
                />
              </FormField>
              <Text light secondary size="tiny">
                Choose the appropriate API section based on your location:
                <ul>
                  <li><strong>Europe Union</strong> – for users located in the EU.</li>
                  <li><strong>United Kingdom</strong> – for users in the UK.</li>
                </ul>
                Support for additional regions will be added soon.
                <br/><br/>
                <strong>Note:</strong> The <strong>Test Environment</strong> is for testing purposes only. The API key
                from Zooza will not function in this environment.
              </Text>
            </SidePanel.Field>
            <SidePanel.Field>
              <Text>
                Don't have a Zooza account?
                <a href="https://signup.zooza.online" target="_blank" rel="noopener noreferrer">
                  Create one here.
                </a>
              </Text>
            </SidePanel.Field>
          </SidePanel.Content>
        </SidePanel>
      </WixDesignSystemProvider>
  );
};

export default Panel;
