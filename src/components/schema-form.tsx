import React, { useState, useEffect, useCallback, useRef } from "react"
import { ErrorObject, validate } from "error"
import { SchemaFormComponent } from "components/schema-form-component"
import { SchemaFormArray } from "components/schema-form-array"
import { SchemaFormObject } from "components/schema-form-object"
import { ComponentForType } from "components/component-for-type"
import { IComponentMap, IContainerMap, ISchemaFormContext, ActionType } from "components/schema-form-interfaces"
import { UploadEditor } from "editors/upload-editor";
import { RadioButtonsEditor } from "editors/radio-buttons-editor";
import _ from "lodash";


export interface ISchemaFormProps {
    schema: object,
    value: object,
    onChange?(value: object, path: string[], errors: ErrorObject, action?: ActionType): void,
    onFocus?(path: string[]): void,
    onBlur?(): void,
    onEditor?(data: object, path: string[]): any,
    showErrors?: boolean,
    components?: IComponentMap,
    containers?: IContainerMap,
    className?: string,
    changeOnBlur?: boolean,
    componentContext?: object
}

const defaultComponentMap: IComponentMap = {
    "string": SchemaFormComponent,
    "number": SchemaFormComponent,
    "enum": SchemaFormComponent,
    "boolean": SchemaFormComponent,
    "date": SchemaFormComponent,
    "email": SchemaFormComponent,
    "hidden": SchemaFormComponent,
    "password": SchemaFormComponent,
    "textarea": SchemaFormComponent,
    "upload": UploadEditor,
    "radioButtons": RadioButtonsEditor
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
    onBlur,
    onEditor,
    showErrors,
    className,
    changeOnBlur,
    componentContext,
    components,
    containers
}: ISchemaFormProps): React.ReactElement {
    const [currentValue, setCurrentValue] = useState(value);
    const refValue = useRef(value);
    const initErrors = showErrors || showErrors == undefined ? validate(schema, value) : new ErrorObject();
    const [errors, setErrors] = useState(initErrors);
    const refShowErrors = useRef(showErrors);

    // The use of refValue here allows the stored callback handleChange to get access to the current value
    // without needing to be recreated with a different closure, i.e. without needing to add
    // a dependency
    refValue.current = currentValue;

    // This updates the internal state currentValue with an external change of the value prop
    useEffect(() => {
        if (!_.isEqual(refValue.current, value)) {
            console.log("CH: useEffect1 setCurrentValue");
            setCurrentValue(value);
        }
    }, [value]);

    // update error state with new props
    useEffect(() => {
        if (showErrors || showErrors == undefined) {
            if (_.isEqual(refValue.current, value) && refShowErrors.current === showErrors) return;
            const newErrors = validate(schema, value);
            if (_.isEqual(errors, newErrors) && refShowErrors.current === showErrors) return;
            console.log("CH: useEffect2 setErrors");
            setErrors(newErrors);
        }
        refShowErrors.current = showErrors;
    }, [value, schema, showErrors]);

    const handleChange = useCallback(
    (newPathValue: object, path: string[], action?: ActionType) => {
        const newValue = _.cloneDeep(refValue.current);
        _.set(newValue, path, newPathValue);
        //console.log(`setting - ${JSON.stringify(newPathValue)} at path ${path.join('.')} produces ${JSON.stringify(newValue)}`);
        console.log("CH: handleChange setCurrentValue");
        setCurrentValue(newValue);
        let newErrors = validate(schema, newValue);
        if (showErrors || showErrors === undefined) {
            setErrors(newErrors);
        }
        if (onChange && (action !== undefined || !changeOnBlur)) onChange(newValue, path, newErrors, action);
    }, [schema, onChange, changeOnBlur]);

    const handleFocus = useCallback(
    (path: string[]) => {
        if (onFocus) onFocus(path);
    }, [onFocus]);

    const handleBlur = useCallback(
    () => {
        if (onBlur) onBlur();
    }, [onBlur]);

    const formClass = `sf-form ${className}`;
    const context: ISchemaFormContext = {
        components: Object.assign(defaultComponentMap, components || {}),
        containers: Object.assign(defaultContainerMap, containers || {}),
        componentContext
    }

    //console.log('FORM rendering ' + JSON.stringify(currentValue));
    return (
        <div className={formClass}>
            <ComponentForType schema={schema} path={[]} value={currentValue} errors={errors}
                onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} onEditor={onEditor}
                context={context}/>
        </div>
    )
}