import React, { useState, useEffect } from 'react';
import SchemaForm from 'components/schema-form';
import { ISchemaFormProps } from 'components/schema-form';
import { ErrorObject, validate } from 'error';
import { isEmpty } from 'utility';

export interface ISchemaSubmitFormProps extends ISchemaFormProps {
    onSubmit?(value: object): Promise<boolean>,
    makeSubmitLink(onClick: () => void): React.ReactNode,
    onDirty?(isDirty: boolean): void,
}

export default function SchemaSubmitForm(props: ISchemaSubmitFormProps) {
    const [value, setValue] = useState(props.value);
    const [submitted, setSubmitted] = useState(false);
    const [dirty, setDirty] = useState(false);
    // feed value into state when props change
    useEffect(() => {
        if (value !== props.value) {
            if (props.onDirty) props.onDirty(false);
            setDirty(false);
            setValue(props.value);
            console.log('value changed, set clean');
        }
    }, [props.value]);

    function onChange(value: object, path: string[], errors: ErrorObject) {
        setValue(value);
        if (!dirty && props.onDirty)
            props.onDirty(true);
        if (!dirty) {
            setDirty(true);
            console.log('-> dirty');
        }
        if (props.onChange)
            props.onChange(value, path, errors);
    }

    function onSubmit() {
        setSubmitted(true);
        const newErrors = validate(props.schema, value);
        if (props.onSubmit && isEmpty(newErrors)) {
            props.onSubmit(value)
                .then((submitted) => {
                    if (submitted) {
                        if (props.onDirty) props.onDirty(false);
                        setDirty(false);
                    }
                });
        }
    }

    const classes = `sf-submit-form ${dirty ? "sf-dirty" : ""}`;

    return (
        <form className={classes}>
            <SchemaForm {...props} value={value} onChange={onChange} showErrors={submitted}/>
            <div className="sf-buttons">
                <div className="sf-submit">
                    {props.makeSubmitLink(onSubmit)}
                </div>
            </div>
        </form>
    );
}