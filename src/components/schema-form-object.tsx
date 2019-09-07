import React from 'react'
import { ComponentForType } from 'components/component-for-type'
import { ErrorObject } from 'error'
import { fieldCaption, applyOrder } from 'schema/schema'
import { ISchemaContainerProps, ActionType } from 'components/schema-form-interfaces';

type NestedList = string | NestedListArray;
interface NestedListArray extends Array<NestedList> {}

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

    function renderSection(order: NestedList, properties: [string, unknown][]) {
        if (typeof order === 'string') {
            const [key, subSchema] = properties.find(([key, _]) => key === order) || ['', null];
            if (key) {
                return (
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
                )
            }
        } else {
            return (
                <section>
                    {order.map((subOrder) => renderSection(subOrder, properties))}
                </section>
            )
        }
        return <></>;
    }
    
    let topOrder: NestedListArray = schema['order'] || Object.keys(schema['properties']);
    let properties = Object.entries(schema['properties']);

    return (
        <div className={objectClass}>
            <div className="sf-title">{fieldCaption(schema, path) || '\u00A0'}</div>
            <fieldset className="sf-object-fieldset">
                {topOrder.map((subOrder) => renderSection(subOrder, properties))}
            </fieldset>
        </div>
    )
}