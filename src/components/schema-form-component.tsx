import React from "react";
import { ISchemaComponentProps } from "components/schema-form"
import { fieldType } from "schema/schema"

export function SchemaFormComponent({
    schema,
    path,
    value,
    errors,
    onChange,
    caption
}: ISchemaComponentProps): React.ReactElement {
    const name = path.join('.');

    function handleChange(ev: React.ChangeEvent) {
        onChange(ev.target['value']);
    }

    function handleCheckChange(ev: React.ChangeEvent) {
        onChange(ev.target['checked']);
    }

    function handleNumberChange(ev: React.ChangeEvent) {
        onChange(parseFloat(ev.target['value']));
    }

    function schemaInput(isError: boolean) {
        const classes = (specific: string) => `sf-control ${specific} ${isError && 'sf-has-error'}`;

        switch (fieldType(schema)) {
            case "string":
                return (<input type="text" name={name} id={name} value={(value || '').toString()} className={classes("sf-string")} onChange={handleChange} />)
            case "boolean":
                return (<input type="checkbox" name={name} id={name} checked={(value || false) as boolean} className={classes("sf-boolean sf-checkbox")} onChange={handleCheckChange} />)
            case "number":
                return (<input type="number" name={name} id={name} value={(value || '').toString()} className={classes("sf-number")} onChange={handleNumberChange} />)
            case "date":
                return (<input type="date" name={name} id={name} value={(value || '').toString()} className={classes("sf-date")} onChange={handleChange} />)
            case "email":
                return (<input type="email" name={name} id={name} value={(value || '').toString()} className={classes("sf-email")} onChange={handleChange} />)
            case "password":
                return (<input type="password" name={name} id={name} value={(value || '').toString()} className={classes("sf-password")} onChange={handleChange} />)
            case "hidden":
                return (<input type="hidden" name={name} id={name} value={(value || '').toString()} className="sf-hidden" onChange={handleChange} />)
            case "textarea":
                return (<textarea name={name} id={name} value={(value || '').toString()} className={classes("sf-textarea")} onChange={handleChange} />)
            case "enum":
                return (
                <select name={name} id={name} value={(value || '').toString()} className={classes("sf-enum")} onChange={handleChange}>
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
            <label htmlFor={name} className={"sf-caption " + (isError && "sf-has-error")}>{caption}</label>
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