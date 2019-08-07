import React from 'react';
import { camelToTitle } from 'utility';
import { ISchemaContainerProps, ComponentForType } from 'components/schema-form'
import { ErrorObject } from 'error'

export function SchemaFormArray({
    schema,
    path,
    value,
    errors,
    onChange,
    context
}: ISchemaContainerProps): React.ReactElement {
    const itemSchema = schema['items'];
    const valueArray = (value || []) as object[];
    const arrayClass = path.length === 0 ? "" : "sf-array sf-" + path[path.length - 1];
    const count = valueArray.length;
    const caption = schema['title'] || camelToTitle(path[path.length - 1])

    function handleChange(i: number, newValue: object) {
        const newValueArray = [ ...valueArray ];
        newValueArray[i] = newValue;
        onChange(newValueArray);
    }

    function handleDelete(i: number) {
        return () => {
            const newValueArray = [ ...valueArray ];
            newValueArray.splice(i, 1);
            onChange(newValueArray);
        }
    }

    function handleUp(i: number) {
        return () => {
            const newValueArray = [ ...valueArray ];
            const mover = newValueArray[i];
            newValueArray[i] = newValueArray[i - 1];
            newValueArray[i - 1] = mover;
            onChange(newValueArray);
        }
    }

    function handleDown(i: number) {
        return () => {
            const newValueArray = [ ...valueArray ];
            const mover = newValueArray[i];
            newValueArray[i] = newValueArray[i + 1];
            newValueArray[i + 1] = mover;
            onChange(newValueArray);
        }
    }

    function handleAdd() {
        onChange([ ...valueArray, null ]);
    }

    return (
        <div className={arrayClass}>
            <div className="sf-title">{caption}</div>
            <fieldset className="sf-array-fieldset">
            {valueArray.map((v, i) => (
                <div className="sf-element" key={i}>
                    <ComponentForType
                        schema={itemSchema as object}
                        path={[ ...path, `[${i}]` ]}
                        value={v}
                        errors={(errors instanceof ErrorObject) ? errors[`[${i}]`] : []}
                        onChange={(value) => handleChange(i, value)}
                        context={context}
                        />
                    <div className="sf-array-buttons">
                        <span className="sf-control-button sf-delete-button oi" onClick={handleDelete(i)}>x</span>
                        {i > 0 && <span className="sf-control-button sf-up-button oi" onClick={handleUp(i)}>^</span>}
                        {i < count - 1 && <span className="sf-control-button sf-down-button oi" onClick={handleDown(i)}>v</span>}
                    </div>
                </div>
            ))}
            </fieldset>
            <span className="sf-control-button sf-add-button" onClick={handleAdd}>+</span>
        </div>
    );
}