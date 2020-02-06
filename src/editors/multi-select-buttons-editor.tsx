import React, { useContext } from "react";
import { ISchemaContainerProps } from "components/schema-form-interfaces"
import { SchemaFormComponentWrapper } from "components/schema-form-component";
import { ValueDispatch, ValueAction } from "components/schema-form-value-context";
import { fieldCaption } from "schema/schema";
import Ajv from "ajv";
import _ from "lodash";

export function MultiSelectButtonsEditor(props: ISchemaContainerProps): React.ReactElement {
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
    const arrayValue = value as string[] || [];

    const handleCheckChange = (enumValue: string) => (ev: React.ChangeEvent) => {
        const newValue = (!!ev.target['checked'])
            ? _.union(arrayValue, [ enumValue ])
            : _.without(arrayValue, enumValue);

        dispatch(ValueAction.set(path, newValue));
    }

    function handleFocus() {
        onFocus(path);
    }

    function handleBlur() {
        onBlur(path);
    }

    function checks(isError: boolean) {
        const classes = `sf-control sf-check-buttons ${isError && 'sf-has-error'}`;
        const readOnly = schema['readOnly'] || false;
        const baseProps = { name, readOnly, onFocus: handleFocus, onBlur: handleBlur };
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
                        checked={arrayValue && arrayValue.indexOf(enumValue) > -1}
                        className="sf-check-button"
                        onChange={handleCheckChange(enumValue)} />
                    <label htmlFor={name + '_' + idx}>{enumValue}</label>
                </span>
             )}
             </div>);
    }

    const isError = errors.length > 0;
    const caption = fieldCaption(schema, path);
    const convErrors = (errors || []) as Ajv.ErrorObject[];
    return (
        <SchemaFormComponentWrapper {...props} caption={caption} errors={convErrors} >
            {checks(isError)}
        </SchemaFormComponentWrapper>
    );
}