import React, { FunctionComponent } from "react";
import { ISchemaComponentProps } from "components/schema-form-interfaces"
import { fieldType } from "schema/schema"

export const SchemaFormComponentWrapper: FunctionComponent<ISchemaComponentProps> = ({ errors, caption, children, schema }) => {
    const isError = errors.length > 0;
    const errorClass = isError ? "sf-has-error" : "";
    return (
    <>
        <div className="sf-row">
            {caption && <label htmlFor={name} className={"sf-caption " + errorClass}>
                {caption}
                {schema['description'] && (<><br/><span className={"sf-description " + errorClass}>
                    {schema['description']}
                </span></>)}
            </label>}
            {children}
        </div>
        {isError && <div className="sf-row sf-error-row">
            <label className="sf-caption"></label>
            {errors.map((err, idx) => (
                <label key={idx} className="sf-error" htmlFor={name}>{err.message}</label>
            ))}
        </div>}
    </>
    );
}

export function SchemaFormComponent(props: ISchemaComponentProps): React.ReactElement {
    const {
        schema,
        path,
        value,
        errors,
        onChange,
        onFocus,
        onBlur
    } = props;
    const name = path.join('.');

    function handleChange(ev: React.FormEvent) {
        const val = ev.target['value'] as string;
        onChange(val === '' ? null : val, path);
    }

    function handleChangeNumber(ev: React.FormEvent) {
        const str = ev.target['value'] as string;
        if (str === '')
            onChange(null, path);
        else { 
            const num = parseFloat(str);
            if (!isNaN(num)) {
                onChange(num, path);
            }
        }
    }

    function handleCheckChange(ev: React.ChangeEvent) {
        onChange(ev.target['checked'], path);
    }

    function handleFocus() {
        onFocus(path);
    }

    function schemaInput(isError: boolean) {
        const classes = (specific: string) => `sf-control ${specific} ${isError && 'sf-has-error'}`;
        const readOnly = schema['readOnly'] || false;
        const baseProps = { name, readOnly, id: name, onFocus: handleFocus, onBlur };
        const commonProps = { ...baseProps, value: (value || '').toString(), onChange: () => {}, onInput: handleChange };
        const selectProps = { ...baseProps, value: (value || '').toString(), onChange: handleChange };

        switch (fieldType(schema)) {
            case "string":
                return (<input {...commonProps} type="text" className={classes("sf-string")} />)
            case "boolean":
                return (<input {...baseProps} type="checkbox" checked={(value || false) as boolean} className={classes("sf-boolean sf-checkbox")} onChange={handleCheckChange} />)
            case "number":
                return (<input {...commonProps} type="number" className={classes("sf-number")} onInput={handleChangeNumber} />)
            case "date":
                return (<input {...commonProps} type="date" className={classes("sf-date")} />)
            case "date-time":
                return (<input {...commonProps} type="datetime-local" className={classes("sf-datetime")} />)
            case "email":
                return (<input {...commonProps} type="email" className={classes("sf-email")} />)
            case "password":
                return (<input {...commonProps} type="password" className={classes("sf-password")} />)
            case "hidden":
                return (<input {...commonProps} type="hidden" className="sf-hidden" />)
            case "textarea":
                return (<textarea {...commonProps} className={classes("sf-textarea")} />)
            case "enum":
                return (
                <select {...selectProps} className={classes("sf-enum")}>
                    {schema['enum'].map((val: string) =>
                        (<option key={val} value={val}>{val}</option>))}
                </select>
                )
        }
        return (<div>No such type</div>)
    }

    const isError = errors.length > 0;
    return (
        <SchemaFormComponentWrapper {...props}>
            {schemaInput(isError)}
        </SchemaFormComponentWrapper>
    );
}