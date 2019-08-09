import React from "react";
import { ISchemaComponentProps } from "components/schema-form-interfaces"
import { fieldType } from "schema/schema"

export function SchemaFormComponent({
    schema,
    path,
    value,
    errors,
    onChange,
    onFocus,
    onBlur,
    caption
}: ISchemaComponentProps): React.ReactElement {
    const name = path.join('.');

    function handleChange(ev: React.ChangeEvent) {
        onChange(ev.target['value'], path);
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
        const commonProps = { ...baseProps, value: (value || '').toString(), onChange: handleChange };

        switch (fieldType(schema)) {
            case "string":
                return (<input {...commonProps} type="text" className={classes("sf-string")} />)
            case "boolean":
                return (<input {...baseProps} type="checkbox" checked={(value || false) as boolean} className={classes("sf-boolean sf-checkbox")} onChange={handleCheckChange} />)
            case "number":
                return (<input {...commonProps} type="number" className={classes("sf-number")} />)
            case "date":
                return (<input {...commonProps} type="date" className={classes("sf-date")} />)
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
                <select {...commonProps} className={classes("sf-enum")}>
                    {schema['enum'].map((val: string) =>
                        (<option key={val} value={val}>{val}</option>))}
                </select>
                )

        }
        return (<div>No such type</div>)
    }

    const isError = errors.length > 0;
    return (
    <>
        <div className="sf-row">
            {caption && <label htmlFor={name} className={"sf-caption " + (isError && "sf-has-error")}>{caption}</label>}
            {schemaInput(isError)}
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