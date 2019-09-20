import React, { useContext } from "react";
import { ISchemaContainerProps } from "components/schema-form-interfaces"
import { SchemaFormComponentWrapper } from "components/schema-form-component";
import { ValueDispatch, ValueAction } from "components/schema-form-value-context";
import { fieldCaption } from "schema/schema";

export function MultiSelectButtonEditor(props: ISchemaContainerProps): React.ReactElement {
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
    const arrayValue = value as string[];

    function handleCheckChange(ev: React.ChangeEvent) {
        dispatch(ValueAction.set(path, ev.target['value']));
    }

    function handleFocus() {
        onFocus(path);
    }

    function checks(isError: boolean) {
        const classes = `sf-control sf-check-buttons ${isError && 'sf-has-error'}`;
        const readOnly = schema['readOnly'] || false;
        const baseProps = { name, readOnly, onFocus: handleFocus, onBlur };
        const enums = schema['items']['enum'] as string[];
        if (!enums || schema['type'] !== 'array') {
            throw(`In schema ${JSON.stringify(schema)}, editor: checkButtons must be an array type with items an enum property`);
        }

        return (
            <div className={classes}>
            {enums.map((enumValue, idx) =>
                <span className="sf-multi-check" key={enumValue}>
                    <input
                        {...baseProps}
                        id={name + '_' + idx}
                        type="checkbox"
                        checked={arrayValue.indexOf(enumValue) > -1}
                        className="sf-check-button"
                        onChange={handleCheckChange}
                        value={enumValue} />
                    <label htmlFor={name + '_' + idx}>{enumValue}</label>
                </span>
             )}
             </div>);
    }

    const isError = errors.length > 0;
    const caption = fieldCaption(schema, path);
    return (
        <SchemaFormComponentWrapper {...props} caption={caption}>
            {checks(isError)}
        </SchemaFormComponentWrapper>
    );
}