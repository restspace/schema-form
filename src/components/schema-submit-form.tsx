import React, { useState, useEffect } from 'react';
import SchemaForm from 'components/schema-form';
import { ISchemaFormProps } from 'components/schema-form';
import { ErrorObject } from 'error';
import { isEmpty } from 'utility';

export interface ISchemaSubmitFormProps extends ISchemaFormProps {
    onSubmit?(value: object): void,
    submitLabel?: string
}

export default function SchemaSubmitForm(props: ISchemaSubmitFormProps) {
    const [value, setValue] = useState(props.value);
    const [errors, setErrors] = useState({} as ErrorObject);
    const [submitted, setSubmitted] = useState(false);
    // feed value into state when props change
    useEffect(() => {
        setValue(value);
    }, [value]);

    function onChange(value: object, path: string[], errors: ErrorObject) {
        setValue(value);
        setErrors(errors);
        if (props.onChange)
            props.onChange(value, path, errors);
    }

    function onSubmit(ev: React.FormEvent) {
        ev.preventDefault();
        setSubmitted(true);
        if (props.onSubmit && isEmpty(errors))
            props.onSubmit(value);
    }

    return (
        <form className="sf-submit-form" onSubmit={onSubmit}>
            <SchemaForm {...props} onChange={onChange} showErrors={submitted}/>
            <button className="sf-submit">{props.submitLabel || "Submit"}</button>
        </form>
    );
}