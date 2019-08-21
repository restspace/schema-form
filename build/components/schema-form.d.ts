import React from "react";
import { ErrorObject } from "error";
import { IComponentMap, IContainerMap, ActionType } from "components/schema-form-interfaces";
export interface ISchemaFormProps {
    schema: object;
    value: object;
    onChange?(value: object, path: string[], errors: ErrorObject, action?: ActionType): void;
    onFocus?(path: string[]): void;
    showErrors?: boolean;
    components?: IComponentMap;
    containers?: IContainerMap;
    className?: string;
    changeOnBlur?: boolean;
}
export default function SchemaForm({ schema, value, onChange, onFocus, showErrors, className, changeOnBlur }: ISchemaFormProps): React.ReactElement;
