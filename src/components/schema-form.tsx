import React, { useState, useEffect, useCallback, useRef, useReducer } from "react"
import { ErrorObject, validate } from "error"
import { SchemaFormComponent } from "components/schema-form-component"
import { SchemaFormArray } from "components/schema-form-array"
import { SchemaFormObject } from "components/schema-form-object"
import { ComponentForType } from "components/component-for-type"
import { IComponentMap, IContainerMap, ISchemaFormContext } from "components/schema-form-interfaces"
import { ValueDispatch, ValueAction, valueReducer, ValueActionType } from "components/schema-form-value-context";
import { UploadEditor } from "editors/upload-editor";
import { RadioButtonsEditor } from "editors/radio-buttons-editor";
import { MultiSelectButtonsEditor } from "editors/multi-select-buttons-editor";
import _ from "lodash";


export interface ISchemaFormProps {
    schema: object,
    value: object,
    onChange?(value: object, path: string[], errors: ErrorObject, action?: ValueActionType): void,
    onFocus?(path: string[]): void,
    onBlur?(): void,
    onEditor?(data: object, path: string[]): any,
    showErrors?: boolean,
    components?: IComponentMap,
    containers?: IContainerMap,
    className?: string,
    changeOnBlur?: boolean,
    collapsible?: boolean,
    componentContext?: object
}

const defaultComponentMap: IComponentMap = {
    "string": SchemaFormComponent,
    "number": SchemaFormComponent,
    "enum": SchemaFormComponent,
    "boolean": SchemaFormComponent,
    "date": SchemaFormComponent,
    "date-time": SchemaFormComponent,
    "email": SchemaFormComponent,
    "hidden": SchemaFormComponent,
    "password": SchemaFormComponent,
    "textarea": SchemaFormComponent,
    "upload": UploadEditor,
    "uploadMulti": UploadEditor,
    "radioButtons": RadioButtonsEditor
}

const defaultContainerMap: IContainerMap = {
    "array": SchemaFormArray,
    "object": SchemaFormObject,
    "multiCheck": MultiSelectButtonsEditor
}

export default function SchemaForm(props: ISchemaFormProps): React.ReactElement {
    const {
        value,
        schema,
        onChange,
        onFocus,
        onBlur,
        onEditor,
        showErrors,
        className,
        changeOnBlur,
        collapsible,
        componentContext,
        components,
        containers
    } = props;
    const [currentValue, dispatch] = useReducer(valueReducer, value);
    const refLastCurrentValue = useRef(currentValue);
    const refLastPropValue = useRef(value);
    const initErrors = () => showErrors || showErrors == undefined ? validate(schema, currentValue) : new ErrorObject();
    const [errors, setErrors] = useState(initErrors);
    const refShowErrors = useRef(showErrors);
    const refOnChange = useRef(onChange);

    // update error state with new current
    // TODO substitute with useDeepEqualEffect
    useEffect(() => {
        if (showErrors || showErrors == undefined) {
            // check if value changed since last render
            if (_.isEqual(refLastCurrentValue.current, currentValue) && refShowErrors.current === showErrors) return;
            const newErrors = validate(schema, currentValue);
            if (_.isEqual(errors, newErrors) && refShowErrors.current === showErrors) return;
            console.log("ER Updating errors:");
            console.log(_.cloneDeep(newErrors));
            setErrors(newErrors);
        }
        refShowErrors.current = showErrors;
        refLastCurrentValue.current = currentValue;
    }, [currentValue, schema, showErrors, refShowErrors, refLastCurrentValue ]);

    // This updates the internal state currentValue with an external change of the value prop
    useEffect(() => {
        if (!_.isEqual(refLastCurrentValue.current, value)) {
            console.log("PROPS Update from props value:");
            console.log(_.cloneDeep(value));
            dispatch(ValueAction.replace(value));
        }
        refLastCurrentValue.current = value;
    }, [value, changeOnBlur, refLastPropValue]);

    // used to isolate dispatchChange from changes to onChange prop which can be caused by client code
    useEffect(() => {
        refOnChange.current = onChange;
    }, [onChange, refOnChange]);

    const dispatchChange = useCallback((action: ValueAction) => {
        //console.log(`setting - ${JSON.stringify(newPathValue)} at path ${path.join('.')} produces ${JSON.stringify(newValue)}`);
        console.log("CH: internal value change:");
        dispatch(action);
        const onChange = refOnChange.current;
        if (onChange && (action !== undefined || !changeOnBlur)) {
            const newValue = valueReducer(refLastCurrentValue.current, action);
            const newErrors = validate(schema, newValue);
            onChange(newValue, action.path, newErrors, action.type);
        }
    }, [ dispatch, refOnChange, refLastCurrentValue, schema, changeOnBlur ]);

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
        componentContext, collapsible
    }

    //console.log('FORM rendering ' + JSON.stringify(currentValue));
    return (
        <ValueDispatch.Provider value={dispatchChange}>
            <div className={formClass}>
                <ComponentForType schema={schema} path={[]} value={currentValue} errors={errors}
                    onFocus={handleFocus} onBlur={handleBlur} onEditor={onEditor}
                    context={context}/>
            </div>
        </ValueDispatch.Provider>
    )
}