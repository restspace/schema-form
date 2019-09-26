/// <reference types="react" />
import Ajv from 'ajv';
import { ErrorObject } from 'error';
export interface ISchemaContainerProps {
    schema: object;
    path: string[];
    value: object;
    errors: ErrorObject | Ajv.ErrorObject[];
    onFocus(path: string[]): void;
    onBlur(): void;
    onEditor?(data: object, path: string[]): any;
    context: ISchemaFormContext;
}
export interface ISchemaComponentProps {
    schema: object;
    path: string[];
    value: any;
    errors: Ajv.ErrorObject[];
    onFocus(path: string[]): void;
    onBlur(): void;
    onEditor?(data: object, path: string[]): any;
    caption: string;
    context?: object;
}
export interface IComponentMap {
    [fieldType: string]: React.FC<ISchemaComponentProps>;
}
export interface IContainerMap {
    [containerType: string]: React.FC<ISchemaContainerProps>;
}
export interface ISchemaFormContext {
    components: IComponentMap;
    containers: IContainerMap;
    collapsible?: boolean;
    componentContext?: object;
}
