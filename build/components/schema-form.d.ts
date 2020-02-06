import React from "react";
import { ErrorObject } from "error";
import { IComponentMap, IContainerMap } from "components/schema-form-interfaces";
import { ValueActionType } from "components/schema-form-value-context";
export interface ISchemaFormProps {
    schema: object;
    value: object;
    onChange?(value: object, path: string[], errors: ErrorObject, action?: ValueActionType): void;
    onFocus?(path: string[]): void;
    onBlur?(path: string[]): void;
    onEditor?(data: object, path: string[]): any;
    showErrors?: boolean;
    components?: IComponentMap;
    containers?: IContainerMap;
    className?: string;
    changeOnBlur?: boolean;
    collapsible?: boolean;
    componentContext?: object;
}
export default function SchemaForm(props: ISchemaFormProps): React.ReactElement;
