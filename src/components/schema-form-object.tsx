import React from 'react'
import { ISchemaContainerProps, ComponentForType } from 'components/schema-form'
import { ErrorObject } from 'error'

export function SchemaFormObject({
    schema,
    path,
    value,
    errors,
    onChange,
    context
}: ISchemaContainerProps): React.ReactElement {
    function handleChange(key: string, newValue: object) {
        onChange({ ...value, [key]: newValue });
    }

    const objectClass = path.length === 0 ? "" : "sf-object sf-" + path[path.length - 1];
    return (
        <div className={objectClass}>
            {Object.entries(schema['properties']).map(([key, subSchema]) => (
                <ComponentForType
                    schema={subSchema as object}
                    path={[ ...path, key]}
                    value={value && value[key]}
                    errors={(errors instanceof ErrorObject) ? errors[key] : []}
                    onChange={(value) => handleChange(key, value)}
                    key={key}
                    context={context}/>
            ))}
        </div>
    )
}