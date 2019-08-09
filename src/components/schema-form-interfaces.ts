import Ajv from 'ajv'
import { ErrorObject } from 'error'

export interface ISchemaContainerProps {
    schema: object,
    path: string[],
    value: object,
    errors: ErrorObject | Ajv.ErrorObject[],
    context: ISchemaFormContext,
    onChange(value: object, path: string[]): void,
    onFocus(path: string[]): void,
    onBlur(): void
}

export interface ISchemaComponentProps {
    schema: object,
    path: string[],
    value: any,
    errors: Ajv.ErrorObject[],
    onChange(value: any, path: string[]): void,
    onFocus(path: string[]): void,
    onBlur(): void,
    caption: string
}

export interface IComponentMap {
    [fieldType: string]: React.FC<ISchemaComponentProps>
}

export interface IContainerMap {
    [containerType: string]: React.FC<ISchemaContainerProps>
}

export interface ISchemaFormContext {
    components: IComponentMap,
    containers: IContainerMap
}