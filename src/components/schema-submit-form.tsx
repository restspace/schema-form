import React, { useState, useEffect } from 'react';
import SchemaForm from 'components/schema-form';
import { ISchemaFormProps } from 'components/schema-form';
import { ErrorObject, validate } from 'error';
import { isEmpty } from 'utility';

export interface ISchemaSubmitFormProps extends ISchemaFormProps {
    onSubmit?(value: object): void,
    makeSubmitLink(onClick: () => void): React.ReactNode,
}

export default function SchemaSubmitForm(props: ISchemaSubmitFormProps) {
    const [value, setValue] = useState(props.value);
    const [errors, setErrors] = useState({} as ErrorObject);
    const [submitted, setSubmitted] = useState(false);
    // feed value into state when props change
    useEffect(() => {
        setValue(props.value);
    }, [props.value]);

    function onChange(value: object, path: string[], errors: ErrorObject) {
        setValue(value);
        setErrors(errors);
        if (props.onChange)
            props.onChange(value, path, errors);
    }

    function onSubmit() {
        setSubmitted(true);
        const newErrors = validate(props.schema, value);
        setErrors(newErrors);
        if (props.onSubmit && isEmpty(newErrors))
            props.onSubmit(value);
    }

    return (
        <form className="sf-submit-form">
            <SchemaForm {...props} value={value} onChange={onChange} showErrors={submitted}/>
            <div className="sf-buttons">
                <div className="sf-submit">
                    {props.makeSubmitLink(onSubmit)}
                </div>
            </div>
        </form>
    );
}