import React from "react";
import { ErrorObject } from "error";
import Ajv from "ajv";
export interface ISchemaContainerProps {
    schema: object;
    path: string[];
    value: object;
    errors: ErrorObject | Ajv.ErrorObject[];
    context: ISchemaFormContext;
    onChange(value: object): void;
}
export interface ISchemaComponentProps {
    schema: object;
    path: string[];
    value: any;
    errors: Ajv.ErrorObject[];
    onChange(value: any): void;
    caption: string;
}
interface IComponentMap {
    [fieldType: string]: React.FC<ISchemaComponentProps>;
}
interface IContainerMap {
    [containerType: string]: React.FC<ISchemaContainerProps>;
}
interface ISchemaFormContext {
    components: IComponentMap;
    containers: IContainerMap;
}
interface ISchemaFormProps {
    schema: object;
    value: object;
    onChange?(value: object, errors: ErrorObject): void;
    showErrors?: boolean;
    components?: IComponentMap;
    containers?: IContainerMap;
}
export default function SchemaForm({ schema, value, onChange, showErrors }: ISchemaFormProps): React.ReactElement;
export declare function ComponentForType(props: ISchemaContainerProps): React.ReactElement;
export {};
