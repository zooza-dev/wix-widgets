import React, { FC, useEffect, useState } from "react";
import { widget } from "@wix/editor";
import {
    Dropdown,
    FormField,
    Input,
    listItemSelectBuilder,
    SidePanel,
    WixDesignSystemProvider
} from "@wix/design-system";
import "@wix/design-system/styles.global.css";

const Panel: FC = () => {
    const [name, setName] = useState<string>("");
    const [apiURL, setApiURL] = useState<string>("https://api.zooza.app");

    useEffect(() => {
        widget.getProp("display-name").then((name) => setName(name || "Zooza"));
        widget.getProp("api-url").then((url) => setApiURL(url || "https://api.zooza.app")); // ✅ Set a valid default
    }, []);

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
        console.log("selectedApi", selectedOption);
    };

    return (
        <WixDesignSystemProvider>
            <SidePanel width="300" height={300}>
                <SidePanel.Content noPadding stretchVertically>
                    <SidePanel.Field>
                        <FormField label="Api key">
                            <Input
                                type="text"
                                value={name}
                                onChange={(event) => {
                                    const newName = event.target.value;
                                    setName(newName);
                                    widget.setProp("display-name", newName);
                                }}
                            />
                        </FormField>
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
                    </SidePanel.Field>
                </SidePanel.Content>
            </SidePanel>
        </WixDesignSystemProvider>
    );
};

export default Panel;
