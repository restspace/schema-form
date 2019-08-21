import React from 'react'
import { ComponentForType } from 'components/component-for-type'
import { ErrorObject } from 'error'
import { fieldCaption, applyOrder } from 'schema/schema'
import { ISchemaContainerProps, ActionType } from 'components/schema-form-interfaces'

export function SchemaFormObject({
    schema,
    path,
    value,
    errors,
    onChange,
    onFocus,
    onBlur,
    context
}: ISchemaContainerProps): React.ReactElement {
    const pathEl = path.length ? path[path.length - 1] : '';
    const objectClass = path.length === 0 ? "" : "sf-object sf-" + pathEl;

    function handleChange(key: string, newValue: object, path: string[], action?: ActionType) {
        onChange({ ...value, [key]: newValue }, path, action);
    }

    let properties = Object.entries(schema['properties']);
    if (schema['order'])
        properties = applyOrder(properties, ([key, _]) => key, schema['order']);

    return (
        <div className={objectClass}>
            <div className="sf-title">{fieldCaption(schema, path) || '\u00A0'}</div>
            <fieldset className="sf-object-fieldset">
            {properties.map(([key, subSchema]) => (
                <ComponentForType
                    schema={subSchema as object}
                    path={[ ...path, key]}
                    value={value && value[key]}
                    errors={(errors instanceof ErrorObject) ? errors[key] : []}
                    onChange={(value, path, action) => handleChange(key, value, path, action)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    key={key}
                    context={context}/>
            ))}
            </fieldset>
        </div>
    )
}