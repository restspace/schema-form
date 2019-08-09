import React from 'react'
import { ComponentForType } from 'components/component-for-type'
import { ErrorObject } from 'error'
import { fieldCaption } from 'schema/schema'
import { ISchemaContainerProps } from 'components/schema-form-interfaces'

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

    function handleChange(key: string, newValue: object, path: string[]) {
        onChange({ ...value, [key]: newValue }, path);
    }

    return (
        <div className={objectClass}>
            <div className="sf-title">{fieldCaption(schema, path) || '\u00A0'}</div>
            <fieldset className="sf-object-fieldset">
            {Object.entries(schema['properties']).map(([key, subSchema]) => (
                <ComponentForType
                    schema={subSchema as object}
                    path={[ ...path, key]}
                    value={value && value[key]}
                    errors={(errors instanceof ErrorObject) ? errors[key] : []}
                    onChange={(value, path) => handleChange(key, value, path)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    key={key}
                    context={context}/>
            ))}
            </fieldset>
        </div>
    )
}