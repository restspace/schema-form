import React from "react";
import { ErrorObject } from "error";
import Ajv from "ajv";
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
interface ISchemaFormProps {
    schema: object;
    value: object;
    onChange?(value: object, errors: ErrorObject): void;
    showErrors?: boolean;
    components?: IComponentMap;
}
export default function SchemaForm({ schema, value, onChange, showErrors }: ISchemaFormProps): React.ReactElement;
export {};
