import React, { useState } from "react"
import { fieldType, nullOptionalsAllowed } from "schema/schema"
import { withoutFalsyProperties, camelToTitle } from "utility"
import { ErrorObject, errorPathsToObject, rectifyErrorPaths } from "error"
import { SchemaFormComponent } from "components/schema-form-component"
import Ajv from "ajv"

interface ISchemaContainerProps {
    schema: object,
    path: string[],
    value: object,
    errors: ErrorObject | Ajv.ErrorObject[],
    components: IComponentMap,
    onChange(value: object): void
}

export interface ISchemaComponentProps {
    schema: object,
    path: string[],
    value: any,
    errors: Ajv.ErrorObject[],
    onChange(value: any): void,
    caption: string
}

interface IComponentMap {
    [fieldType: string]: React.FC<ISchemaComponentProps>
}

interface ISchemaFormProps {
    schema: object,
    value: object,
    onChange?(value: object, errors: ErrorObject): void,
    showErrors?: boolean,
    components?: IComponentMap
}

const defaultComponentMap: IComponentMap = {
    "string": SchemaFormComponent,
    "enum": SchemaFormComponent,
    "boolean": SchemaFormComponent,
    "date": SchemaFormComponent,
    "email": SchemaFormComponent,
    "hidden": SchemaFormComponent
}

export default function SchemaForm({
    schema,
    value,
    onChange,
    showErrors
}: ISchemaFormProps): React.ReactElement {
    const [currentValue, setValue] = useState(value);
    const initErrors = showErrors || showErrors == undefined ? validate(value) : new ErrorObject();
    const [errors, setErrors] = useState(initErrors);

    function validate(newValue: object) {
        let ajv = new Ajv({ allErrors: true });
        ajv.validate(nullOptionalsAllowed(schema), withoutFalsyProperties(newValue));
        const newErrors = errorPathsToObject(rectifyErrorPaths(ajv.errors || []));
        return newErrors;
    }

    function handleChange(newValue: object) {
        setValue(newValue);
        let newErrors = validate(newValue);
        if (showErrors || showErrors === undefined) {
            setErrors(newErrors);
        }
        if (onChange) onChange(newValue, newErrors);
    }

    const componentMap = defaultComponentMap;

    return (
        <form className="sf-form">
            <ComponentForType schema={schema} path={[]} value={currentValue} errors={errors} onChange={handleChange} components={componentMap}/>
        </form>
    )
}

function ComponentForType(props: ISchemaContainerProps): React.ReactElement {
    switch (props.schema['type']) {
        case "object":
            return (<SchemaFormObject {...props} />);
        default:
            return (<SchemaFormComponentWrapper {...props} />);
    }
}

function SchemaFormObject({
    schema,
    path,
    value,
    errors,
    onChange,
    components
}: ISchemaContainerProps): React.ReactElement {
    function handleChange(key: string, newValue: object) {
        onChange({ ...value, [key]: newValue });
    }

    const objectClass = path.length === 0 ? "" : "sf-object sf-" + path[path.length - 1];
    return (
        <div className={objectClass}>
            {Object.entries(schema['properties']).map(([key, subSchema]) => (
                <ComponentForType
                    schema={subSchema as object}
                    path={[ ...path, key]}
                    value={value[key]}
                    errors={(errors instanceof ErrorObject) ? errors[key] : []}
                    onChange={(value) => handleChange(key, value)}
                    key={key}
                    components={components}/>
            ))}
        </div>
    )
}

function SchemaFormComponentWrapper({
    schema, path, value, errors, onChange, components
}: ISchemaContainerProps): React.ReactElement {
    const componentProps: ISchemaComponentProps = {
        schema, path, value, onChange,
        errors: (errors || []) as Ajv.ErrorObject[],
        caption: schema['title'] || camelToTitle(path[path.length - 1])
    }

    const component: React.FC<ISchemaComponentProps> = components[fieldType(schema)];
    
    if (component) {
        return component(componentProps) || (<></>)
    } else {
        return (<></>)
    }
}