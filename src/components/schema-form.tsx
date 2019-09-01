import React, { useState, useEffect } from "react"
import { ErrorObject, validate } from "error"
import { SchemaFormComponent } from "components/schema-form-component"
import { SchemaFormArray } from "components/schema-form-array"
import { SchemaFormObject } from "components/schema-form-object"
import { ComponentForType } from "components/component-for-type"
import { IComponentMap, IContainerMap, ISchemaFormContext, ActionType } from "components/schema-form-interfaces"


export interface ISchemaFormProps {
    schema: object,
    value: object,
    onChange?(value: object, path: string[], errors: ErrorObject, action?: ActionType): void,
    onFocus?(path: string[]): void,
    showErrors?: boolean,
    components?: IComponentMap,
    containers?: IContainerMap,
    className?: string,
    changeOnBlur?: boolean
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
    onFocus,
    showErrors,
    className,
    changeOnBlur
}: ISchemaFormProps): React.ReactElement {
    const [currentValue, setValue] = useState(value);
    const initErrors = showErrors || showErrors == undefined ? validate(schema, value) : new ErrorObject();
    const [errors, setErrors] = useState(initErrors);
    const [lastPath, setLastPath] = useState(null as string[] | null);

    // feed value into state when props change
    useEffect(() => {
        setValue(value);
    }, [value]);

    // update error state with new props
    useEffect(() => {
        const newErrors = validate(schema, value);
        if (showErrors || showErrors == undefined) {
            setErrors(newErrors);
        }
    }, [value, showErrors]);

    function handleChange(newValue: object, path: string[], action?: ActionType) {
        setValue(newValue);
        setLastPath(path);
        let newErrors = validate(schema, newValue);
        if (showErrors || showErrors === undefined) {
            setErrors(newErrors);
        }
        if (onChange && (action !== undefined || !changeOnBlur)) onChange(newValue, path, newErrors, action);
    }

    function handleFocus(path: string[]) {
        setLastPath(null);
        if (onFocus) onFocus(path);
    }

    function handleBlur() {
        if (onChange && changeOnBlur && lastPath) onChange(currentValue, lastPath, errors);
    }

    const formClass = `sf-form ${className}`;
    const context: ISchemaFormContext = {
        components: defaultComponentMap,
        containers: defaultContainerMap
    }

    return (
        <div className={formClass}>
            <ComponentForType schema={schema} path={[]} value={currentValue} errors={errors}
                onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur}
                context={context}/>
        </div>
    )
}