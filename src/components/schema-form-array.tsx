import React, { useContext } from 'react';
import { ComponentForType } from 'components/component-for-type'
import { ISchemaContainerProps } from 'components/schema-form-interfaces'
import { ErrorObject } from 'error'
import { fieldCaption, emptyValue } from 'schema/schema';
import { ValueDispatch, ValueAction } from 'components/schema-form-value-context';

export function SchemaFormArray({
    schema,
    path,
    value,
    errors,
    onFocus,
    onBlur,
    onEditor,
    context
}: ISchemaContainerProps): React.ReactElement {
    const dispatch = useContext(ValueDispatch);
    const itemSchema = schema['items'];
    const valueArray = (value || []) as object[];
    const pathEl = path.length ? path[path.length - 1] : '';
    const arrayClass = path.length === 0 ? "" : "sf-array sf-" + pathEl;
    const count = valueArray.length;
    const updatable = !(schema['readOnly'] || false);

    const handleDelete = (path: string[]) => () => dispatch(ValueAction.delete(path));
    const handleUp = (path: string[]) => () => dispatch(ValueAction.up(path));
    const handleDown = (path: string[]) => () => dispatch(ValueAction.down(path));
    const handleAdd = () => dispatch(ValueAction.create(path, emptyValue(itemSchema)));

    function arrayElement(v: object, i: number) {
        const newPath = [ ...path, `${i}` ];
        const newErrors = (errors instanceof ErrorObject) ? errors[`${i}`] : [];

        return (
        <div className="sf-element" key={i}>
            <ComponentForType
                schema={itemSchema as object}
                path={newPath}
                value={v}
                errors={newErrors}
                onFocus={onFocus}
                onBlur={onBlur}
                onEditor={onEditor}
                context={context}
            />
            {updatable && <div className="sf-array-buttons">
                <span className="sf-control-button sf-delete-button oi" onClick={handleDelete(newPath)}>x</span>
                {i > 0 && <span className="sf-control-button sf-up-button oi" onClick={handleUp(newPath)}>^</span>}
                {i < count - 1 && <span className="sf-control-button sf-down-button oi" onClick={handleDown(newPath)}>v</span>}
            </div>}
        </div>);
    }

    return (
        <div className={arrayClass}>
            <div className="sf-title">{fieldCaption(schema, path) || '\u00A0'}</div>
            <fieldset className="sf-array-fieldset">
                {valueArray.map((v, i) => arrayElement(v, i))}
            </fieldset>
            {updatable && <span className="sf-control-button sf-add-button" onClick={handleAdd}>+</span>}
        </div>
    );
}