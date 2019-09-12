import React from "react";
import { ErrorObject } from "error";
import { IComponentMap, IContainerMap, ActionType } from "components/schema-form-interfaces";
export interface ISchemaFormProps {
    schema: object;
    value: object;
    onChange?(value: object, path: string[], errors: ErrorObject, action?: ActionType): void;
    onFocus?(path: string[]): void;
    onBlur?(): void;
    onEditor?(data: object, path: string[]): any;
    showErrors?: boolean;
    components?: IComponentMap;
    containers?: IContainerMap;
    className?: string;
    changeOnBlur?: boolean;
    componentContext?: object;
}
export default function SchemaForm({ schema, value, onChange, onFocus, onBlur, onEditor, showErrors, className, changeOnBlur, componentContext, components, containers }: ISchemaFormProps): React.ReactElement;
