import React from 'react'
import { ComponentForType } from 'components/component-for-type'
import { ErrorObject } from 'error'
import { fieldCaption } from 'schema/schema'
import { ISchemaContainerProps } from 'components/schema-form-interfaces';
import _ from 'lodash';

type NestedList = string | NestedListArray;
interface NestedListArray extends Array<NestedList> {}

export function SchemaFormObject({
    schema,
    path,
    value,
    errors,
    onFocus,
    onBlur,
    onEditor,
    context
}: ISchemaContainerProps): React.ReactElement {
    const pathEl = path.length ? path[path.length - 1] : '';
    const objectClass = path.length === 0 ? "" : "sf-object sf-" + pathEl;

    function renderSection(order: NestedList, properties: [string, unknown][], i?: number) {
        if (typeof order === 'string') {
            const [key, subSchema] = properties.find(([key, _]) => key === order) || ['', null];
            if (key) {
                return (
                    <ComponentForType
                        schema={subSchema as object}
                        path={[ ...path, key ]}
                        value={value && value[key]}
                        errors={ErrorObject.forKey(errors, key)}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        onEditor={onEditor}
                        key={key}
                        context={context}/>
                )
            }
        } else {
            return (
                <section key={i || 0}>
                    {order.map((subOrder, i) => renderSection(subOrder, properties, i))}
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