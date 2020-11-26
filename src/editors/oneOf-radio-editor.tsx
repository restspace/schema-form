import React, { useState, useContext, useEffect } from "react";
import { ISchemaContainerProps } from "../components/schema-form-interfaces"
import { SchemaFormComponentWrapper } from "../components/schema-form-component";
import { fieldCaption, deleteSubschemaProperties } from "../schema/schema";
import Ajv from "ajv";
import _ from "lodash";
import { ComponentForType } from "../components/component-for-type";
import { ValueDispatch, ValueAction } from "../components/schema-form-value-context";
import { validate } from "../error";
import { isEmpty } from "../utility";

export function OneOfRadioEditor(props: ISchemaContainerProps): React.ReactElement {
    const {
        schema,
        path,
        value,
        errors,
        onFocus,
        onBlur,
        onEditor,
        context
    } = props;
    const name = path.join('.');
    const [ currentIdx, setCurrentIdx ] = useState(-1);
    const dispatch = useContext(ValueDispatch);
    const oneOf: any[] = schema['oneOf'];

    useEffect(() => {
        if (context.outerPropsChange) { // only infer chosen option if the value change is a result of a props change to the external SchemaForm
            if (value !== null) {
                let newIdx = 0;
                for (let subschema of oneOf) {
                    const errors = validate(subschema, value, context.schemaContext);
                    if (isEmpty(errors)) {
                        setCurrentIdx(newIdx);
                        break;
                    }
                    newIdx++;
                }
                if (newIdx >= oneOf.length) newIdx = -1;
            } else {
                setCurrentIdx(-1);
            }
        }
    }, [value]);

    const handleCheckChange = (idx: number) => () => {
        setCurrentIdx(idx);
        if (currentIdx >= 0) {
            dispatch(ValueAction.set(path, deleteSubschemaProperties(value, oneOf[currentIdx])));
        }
    }

    function handleFocus() {
        onFocus(path);
    }

    function handleBlur() {
        onBlur(path);
    }

    function radios(isError: boolean, currentIdx: number) {
        const classes = `sf-control sf-radio-buttons ${isError && 'sf-has-error'}`;
        const readOnly = schema['readOnly'] || false;
        const baseProps = { name, readOnly, onFocus: handleFocus, onBlur: handleBlur };
        const opts = oneOf && oneOf.map((subschema, i) => (subschema['title'] as string) || 'option ' + i.toString());
        if (!opts) {
            throw(`In schema ${JSON.stringify(schema)}, editor: oneOfRadioEditor must be a subschema with an oneOf property`);
        }

        return (
            <div className='sf-row sf-schema-selector'>
                <div className={classes}>
                {opts.map((opt, idx) =>
                    <span className="sf-radio" key={opt}>
                        <input
                            {...baseProps}
                            id={name + '_' + idx}
                            type="radio"
                            checked={idx === currentIdx}
                            className="sf-radio-button"
                            onChange={handleCheckChange(idx)}
                            value={idx} />
                        <label htmlFor={name + '_' + idx}>{opt}</label>
                    </span>
                )}
                </div>
            </div>
        );
    }

    const isError = errors.length > 0;
    const convErrors = (errors || []) as Ajv.ErrorObject[];
    const itemSchema = currentIdx >= 0 ? oneOf[currentIdx] : null;
    const caption = itemSchema ? fieldCaption(itemSchema, path) : '';
    return (
        <>
            {radios(isError, currentIdx)}
            {itemSchema && <ComponentForType
                schema={itemSchema as object}
                path={path}
                value={value}
                errors={errors}
                onFocus={onFocus}
                onBlur={onBlur}
                onEditor={onEditor}
                context={context}
            />}
        </>
    );
}