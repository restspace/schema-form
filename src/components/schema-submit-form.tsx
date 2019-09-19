import React, { useState, useEffect, useCallback } from 'react';
import SchemaForm from 'components/schema-form';
import { ISchemaFormProps } from 'components/schema-form';
import { ErrorObject, validate } from 'error';
import { isEmpty } from 'utility';
import _ from 'lodash';

export interface ISchemaSubmitFormProps extends ISchemaFormProps {
    onSubmit?(value: object): Promise<boolean>,
    makeSubmitLink(onClick: () => void): React.ReactNode,
    onDirty?(isDirty: boolean): void,
}

export default function SchemaSubmitForm(props: ISchemaSubmitFormProps) {
    const { onDirty, onChange, schema, value } = props;
    const [ currentValue, setCurrentValue ] = useState(value);
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
    }, [ onDirty, onChange ]);

    function onSubmit() {
        setSubmitted(true);
        const newErrors = validate(schema, currentValue);
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