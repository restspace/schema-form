import React, { useState, useEffect, useCallback } from 'react';
import SchemaForm from './schema-form';
import { ISchemaFormProps } from './schema-form';
import { ErrorObject, validate } from '../error';
import { isEmpty } from '../utility';
import _ from 'lodash';
import { SchemaContext } from '../schema/schemaContext';

export interface ISchemaSubmitFormProps extends ISchemaFormProps {
    onSubmit?(value: object): Promise<boolean>,
    onSubmitError?(value: object, error: ErrorObject): void,
    makeSubmitLink(onClick: () => void): React.ReactNode,
    onDirty?(isDirty: boolean): void,
}

export default function SchemaSubmitForm(props: ISchemaSubmitFormProps) {
    const { onDirty, onChange, schema, value } = props;
    const [ currentValue, setCurrentValue ] = useState(value);
    const [ currentErrors, setCurrentErrors ] = useState(new ErrorObject());
    const [ submitted, setSubmitted ] = useState(false);
    const [ dirty, setDirty ] = useState(false);

    // feed value into state when props change
    useEffect(() => {
        if (!_.isEqual(currentValue, value)) {
            if (onDirty) {
                onDirty(false);
                setDirty(false);
            }
            setCurrentValue(value);
            console.log('value changed, set clean');
        }
    }, [value]);

    useEffect(() => {
        if (!isEmpty(currentErrors) && props.onSubmitError) {
            props.onSubmitError(currentValue, currentErrors);
        }
    }, [currentErrors, submitted]);

    const handleChange = useCallback(
    (value: object, path: string[], errors: ErrorObject) => {
        setCurrentValue(value);
        if (!dirty && onDirty)
            onDirty(true);
        if (!dirty) {
            setDirty(true);
            console.log('-> dirty');
        }
        if (onChange)
            onChange(value, path, errors);
    }, [ dirty, onDirty, onChange ]);

    function onSubmit() {
        setSubmitted(true);
        const newErrors = validate(schema, currentValue, new SchemaContext(schema));
        setCurrentErrors(newErrors);
        if (props.onSubmit && isEmpty(newErrors)) {
            props.onSubmit(currentValue)
                .then((submitted) => {
                    if (submitted) {
                        if (onDirty) onDirty(false);
                        setDirty(false);
                    }
                });
        }
    }

    const classes = `sf-submit-form ${dirty ? "sf-dirty" : ""}`;

    return (
        <form className={classes}>
            <SchemaForm {...props} value={currentValue} onChange={handleChange} showErrors={submitted}/>
            <div className="sf-buttons">
                <div className="sf-submit">
                    {props.makeSubmitLink(onSubmit)}
                </div>
            </div>
        </form>
    );
}