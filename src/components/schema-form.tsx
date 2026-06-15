import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useReducer,
} from "react";
import { ErrorObject, validate } from "../error";
import { SchemaFormComponent } from "./schema-form-component";
import { SchemaFormArray } from "./schema-form-array";
import { SchemaFormObject } from "./schema-form-object";
import { ComponentForType } from "./component-for-type";
import {
  IComponentMap,
  IContainerMap,
  ISchemaFormContext,
} from "./schema-form-interfaces";
import {
  ValueDispatch,
  ValueAction,
  valueReducer,
  ValueActionType,
} from "./schema-form-value-context";
import { UploadEditor } from "../editors/upload-editor";
import { RadioButtonsEditor } from "../editors/radio-buttons-editor";
import { MultiSelectButtonsEditor } from "../editors/multi-select-buttons-editor";
import isEqual from "lodash-es/isEqual";
import { makeSchemaResolver } from "../schema/schema";
import { SchemaContext } from "../schema/schemaContext";
import { OneOfRadioEditor } from "../editors/oneOf-radio-editor";

export interface ISchemaFormProps {
  schema: object | object[];
  value: object;
  onChange?(
    value: object,
    path: string[],
    errors: ErrorObject,
    action?: ValueActionType
  ): void;
  onFocus?(path: string[]): void;
  onBlur?(path: string[]): void;
  onEditor?(data: object, path: string[]): any;
  onError?(
    path: string[],
    schemaPath: string[],
    value: any,
    schemaValue: any
  ): string;
  showErrors?: boolean;
  components?: IComponentMap;
  containers?: IContainerMap;
  className?: string;
  changeOnBlur?: boolean;
  collapsible?: boolean;
  gridMode?: boolean;
  componentContext?: object;
  schemaResolver?(address: string): object;
}

const defaultComponentMap: IComponentMap = {
  null: SchemaFormComponent,
  string: SchemaFormComponent,
  number: SchemaFormComponent,
  integer: SchemaFormComponent,
  enum: SchemaFormComponent,
  boolean: SchemaFormComponent,
  date: SchemaFormComponent,
  "date-time": SchemaFormComponent,
  email: SchemaFormComponent,
  hidden: SchemaFormComponent,
  password: SchemaFormComponent,
  textarea: SchemaFormComponent,
  currency: SchemaFormComponent,
  upload: UploadEditor,
  uploadMulti: UploadEditor,
  radioButtons: RadioButtonsEditor,
};

const defaultContainerMap: IContainerMap = {
  array: SchemaFormArray,
  object: SchemaFormObject,
  multiCheck: MultiSelectButtonsEditor,
  oneOfRadio: OneOfRadioEditor,
};

export default function SchemaForm(
  props: ISchemaFormProps
): React.ReactElement {
  const {
    value,
    schema,
    onChange,
    onFocus,
    onBlur,
    onEditor,
    onError,
    showErrors,
    className,
    changeOnBlur,
    collapsible,
    gridMode,
    componentContext,
    components,
    containers,
  } = props;

  const [isPropsChange, setIsPropsChange] = useState(true);

  // Merge custom maps into a *new* object so the module-level defaults are
  // never mutated (mutation would leak custom components across every
  // SchemaForm instance in the app). Memoize the SchemaContext separately so
  // its validator cache survives across renders / form interactions.
  const schemaContext = useMemo(
    () => new SchemaContext(schema, onError),
    [schema, onError]
  );
  const mergedComponents = useMemo(
    () => Object.assign({}, defaultComponentMap, components || {}),
    [components]
  );
  const mergedContainers = useMemo(
    () => Object.assign({}, defaultContainerMap, containers || {}),
    [containers]
  );
  const mergedComponentContext = useMemo(() => {
    let cc = componentContext;
    if (schema && schema["currencySymbol"]) {
      cc = { ...(cc || {}), currencySymbol: schema["currencySymbol"] };
    }
    if (gridMode !== undefined) {
      cc = { ...(cc || {}), gridMode };
    }
    return cc;
  }, [componentContext, schema, gridMode]);

  const context: ISchemaFormContext = useMemo(
    () => ({
      components: mergedComponents,
      containers: mergedContainers,
      schemaContext,
      outerPropsChange: isPropsChange,
      componentContext: mergedComponentContext,
      collapsible,
    }),
    [
      mergedComponents,
      mergedContainers,
      schemaContext,
      isPropsChange,
      mergedComponentContext,
      collapsible,
    ]
  );

  const [currentValue, dispatch] = useReducer(valueReducer, value);
  const refLastCurrentValue = useRef(currentValue);
  const refLastPropValue = useRef(value);
  const initErrors = () =>
    showErrors || showErrors == undefined
      ? validate(schema, currentValue, context.schemaContext)
      : new ErrorObject();
  const [errors, setErrors] = useState(initErrors);
  const refShowErrors = useRef(showErrors);
  const refOnChange = useRef(onChange);

  // update error state with new current
  // TODO substitute with useDeepEqualEffect
  useEffect(() => {
    if (showErrors || showErrors == undefined) {
      // check if value changed since last render
      if (
        isEqual(refLastCurrentValue.current, currentValue) &&
        refShowErrors.current === showErrors
      )
        return;
      const newErrors = validate(schema, currentValue, context.schemaContext);
      if (isEqual(errors, newErrors) && refShowErrors.current === showErrors)
        return;
      setErrors(newErrors);
    }
    refShowErrors.current = showErrors;
    refLastCurrentValue.current = currentValue;
  }, [currentValue, schema, showErrors, refShowErrors, refLastCurrentValue]);

  // This updates the internal state currentValue with an external change of the value prop
  useEffect(() => {
    if (!isEqual(refLastCurrentValue.current, value)) {
      setIsPropsChange(true);
      dispatch(ValueAction.replace(value));
    }
    refLastCurrentValue.current = value;
  }, [value, changeOnBlur, refLastPropValue]);

  // used to isolate dispatchChange from changes to onChange prop which can be caused by client code
  useEffect(() => {
    refOnChange.current = onChange;
  }, [onChange, refOnChange]);

  const dispatchChange = useCallback(
    (action: ValueAction) => {
      dispatch(action);
      const onChange = refOnChange.current;
      if (onChange && (action !== undefined || !changeOnBlur)) {
        const newValue = valueReducer(refLastCurrentValue.current, action);
        const newErrors = validate(schema, newValue, context.schemaContext);
        const isPropsChange =
          action.type === ValueActionType.Down || // actions that potentially reorder fields
          action.type === ValueActionType.Up ||
          action.type === ValueActionType.Delete ||
          action.type === ValueActionType.DeleteProperties ||
          action.type === ValueActionType.Duplicate;
        setIsPropsChange(isPropsChange);
        onChange(newValue, action.path, newErrors, action.type);
      }
    },
    [dispatch, refOnChange, refLastCurrentValue, schema, changeOnBlur]
  );

  const handleFocus = useCallback(
    (path: string[]) => {
      if (onFocus) onFocus(path);
    },
    [onFocus]
  );

  const handleBlur = useCallback(
    (path: string[]) => {
      if (onBlur) onBlur(path);
    },
    [onBlur]
  );

  const formClass = `sf-form ${className}`;

  if (!schema) {
    return <></>;
  } else {
    return (
      <ValueDispatch.Provider value={dispatchChange}>
        <div className={formClass}>
          <ComponentForType
            schema={Array.isArray(schema) ? schema[0] : schema}
            path={[]}
            value={currentValue}
            errors={errors}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onEditor={onEditor}
            context={context}
          />
        </div>
      </ValueDispatch.Provider>
    );
  }
}
