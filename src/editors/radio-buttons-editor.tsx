import React, { useContext } from "react";
import { ISchemaComponentProps } from "components/schema-form-interfaces"
import { SchemaFormComponentWrapper } from "components/schema-form-component";
import { ValueDispatch, ValueAction } from "components/schema-form-value-context";

export function RadioButtonsEditor(props: ISchemaComponentProps): React.ReactElement {
    const {
        schema,
        path,
        value,
        errors,
        onFocus,
        onBlur
    } = props;
    const name = path.join('.');
    const dispatch = useContext(ValueDispatch);

    function handleCheckChange(ev: React.ChangeEvent) {
        dispatch(ValueAction.set(path, ev.target['value']));
    }

    function handleFocus() {
        onFocus(path);
    }

    function handleBlur() {
        onBlur(path);
    }

    function radios(isError: boolean) {
        const classes = `sf-control sf-radio-buttons ${isError && 'sf-has-error'}`;
        const readOnly = schema['readOnly'] || false;
        const baseProps = { name, readOnly, onFocus: handleFocus, onBlur: handleBlur };
        const enums = schema['enum'] as string[];
        if (!enums) throw(`In schema ${JSON.stringify(schema)}, editor: radioButtons requires an enum property`);

        return (
            <div className={classes}>
            {enums.map((enumValue, idx) =>
                <span className="sf-radio" key={enumValue}>
                    <input
                        {...baseProps}
                        id={name + '_' + idx}
                        type="radio"
                        checked={value === enumValue}
                        className="sf-radio-button"
                        onChange={handleCheckChange}
                        value={enumValue} />
                    <label htmlFor={name + '_' + idx}>{enumValue}</label>
                </span>
             )}
             </div>);
    }

    const isError = errors.length > 0;
    return (
        <SchemaFormComponentWrapper {...props}>
            {radios(isError)}
        </SchemaFormComponentWrapper>
    );
}