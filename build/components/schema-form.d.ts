import React from "react";
import { ErrorObject } from "../error";
import { IComponentMap, IContainerMap } from "./schema-form-interfaces";
import { ValueActionType } from "./schema-form-value-context";
export interface ISchemaFormProps {
    schema: object | object[];
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
    gridMode?: boolean;
    componentContext?: object;
    schemaResolver?(address: string): object;
}
export default function SchemaForm(props: ISchemaFormProps): React.ReactElement;
