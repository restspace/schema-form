import React, { useState } from "react"
import { fieldType, nullOptionalsAllowed } from "schema/schema"
import { withoutFalsyProperties, camelToTitle } from "utility"
import { ErrorObject, errorPathsToObject, rectifyErrorPaths, getAjv } from "error"
import { SchemaFormComponent } from "components/schema-form-component"
import { SchemaFormArray } from "components/schema-form-array"
import { SchemaFormObject } from "components/schema-form-object"
import Ajv from "ajv"

export interface ISchemaContainerProps {
    schema: object,
    path: string[],
    value: object,
    errors: ErrorObject | Ajv.ErrorObject[],
    context: ISchemaFormContext,
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

interface IContainerMap {
    [containerType: string]: React.FC<ISchemaContainerProps>
}

interface ISchemaFormContext {
    components: IComponentMap,
    containers: IContainerMap
}

interface ISchemaFormProps {
    schema: object,
    value: object,
    onChange?(value: object, errors: ErrorObject): void,
    showErrors?: boolean,
    components?: IComponentMap,
    containers?: IContainerMap
}

const defaultComponentMap: IComponentMap = {
    "string": SchemaFormComponent,
    "enum": SchemaFormComponent,
    "boolean": SchemaFormComponent,
    "date": SchemaFormComponent,
    "email": SchemaFormComponent,
    "hidden": SchemaFormComponent,
    "password": SchemaFormComponent,
    "textarea": SchemaFormComponent
}

const defaultContainerMap: IContainerMap = {
    "array": SchemaFormArray,
    "object": SchemaFormObject
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
        let ajv = getAjv();
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

    const context: ISchemaFormContext = {
        components: defaultComponentMap,
        containers: defaultContainerMap
    }

    return (
        <form className="sf-form">
            <ComponentForType schema={schema} path={[]} value={currentValue} errors={errors} onChange={handleChange} context={context}/>
        </form>
    )
}

export function ComponentForType(props: ISchemaContainerProps): React.ReactElement {
    const container: React.FC<ISchemaContainerProps> = props.context.containers[props.schema['type']];
    
    if (container) {
        return container(props) || (<></>)
    } else {
        return (<SchemaFormComponentWrapper {...props} />);
    }
}

function SchemaFormComponentWrapper({
    schema, path, value, errors, onChange, context
}: ISchemaContainerProps): React.ReactElement {
    const componentProps: ISchemaComponentProps = {
        schema, path, value, onChange,
        errors: (errors || []) as Ajv.ErrorObject[],
        caption: schema['title'] || camelToTitle(path[path.length - 1])
    }

    const component: React.FC<ISchemaComponentProps> = context.components[fieldType(schema)];
    
    if (component) {
        return component(componentProps) || (<></>)
    } else {
        return (<></>)
    }
}