import React, { useContext, useState } from 'react';
import { ComponentForType } from 'components/component-for-type'
import { ISchemaContainerProps } from 'components/schema-form-interfaces'
import { ErrorObject } from 'error'
import { fieldCaption, emptyValue } from 'schema/schema';
import { ValueDispatch, ValueAction } from 'components/schema-form-value-context';
import _ from 'lodash';

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
    const [ collapsed, setCollapsed ] = useState(false);
    const itemSchema = schema['items'];
    const valueArray = Array.isArray(value) ? value as any[] : [];
    const pathEl = path.length ? _.last(path) : '';
    const arrayClass = path.length === 0 ? "" : "sf-array sf-" + pathEl;
    const count = valueArray.length;
    const updatable = !(schema['readOnly'] || false);

    const handleDelete = (path: string[]) => () => dispatch(ValueAction.delete(path));
    const handleUp = (path: string[]) => () => dispatch(ValueAction.up(path));
    const handleDown = (path: string[]) => () => dispatch(ValueAction.down(path));
    const handleDuplicate = (path: string[]) => () => dispatch(ValueAction.duplicate(path));
    const handleAdd = () => dispatch(ValueAction.create(path, emptyValue(itemSchema)));

    function arrayElement(v: object, i: number) {
        const newPath = [ ...path, `${i}` ];
        const newErrors = ErrorObject.forKey(errors, `[${i}]`);

        return (
        <div className="sf-element">
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
                <span className="sf-control-button sf-delete-button oi" onClick={handleDelete(newPath)} title="Delete">x</span>
                {i > 0 && <span className="sf-control-button sf-up-button oi" onClick={handleUp(newPath)} title="Move up">^</span>}
                {i < count - 1 && <span className="sf-control-button sf-down-button oi" onClick={handleDown(newPath)} title="Move down">v</span>}
                <span className="sf-control-button sf-duplication-button oi" onClick={handleDuplicate(newPath)} title="Duplicate">+</span>
            </div>}
        </div>);
    }

    const collapsible = (context.collapsible && path.length > 0) || false;
    const onCollapserClick = () => setCollapsed(collapsed => !collapsed);
    const collapserClasses = "sf-collapser " + (collapsed ? "sf-collapsed" : "sf-open");
    const caption = fieldCaption(schema, path);
    const showTitle = path.length > 0 && (collapsible || caption);

    return (
        <div className={arrayClass}>
            {showTitle && <div className="sf-title">
                {collapsible && <span className={collapserClasses} onClick={onCollapserClick}></span>}
                {fieldCaption(schema, path) || '\u00A0'}
            </div>}
            {!collapsed && <div className="sf-array-fieldset fieldset">
                {valueArray.map((v, i) => <React.Fragment key={i}>{arrayElement(v, i)}</React.Fragment>)}
            </div>}
            {updatable && <span className="sf-control-button sf-add-button" onClick={handleAdd} title="Add new">+</span>}
        </div>
    );
}