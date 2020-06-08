import Ajv from 'ajv';
import { ErrorObject } from 'error';
import _ from 'lodash';
import { ActionType } from 'components/schema-form-value-context';
import { SchemaContext } from 'schema/schemaContext';

export interface ISchemaContainerProps {
    schema: object,
    path: string[],
    value: object,
    isRequired?: boolean,
    errors: ErrorObject | Ajv.ErrorObject[],
    onFocus(path: string[]): void,
    onBlur(path: string[]): void,
    onEditor?(data: object, path: string[]): any,
    context: ISchemaFormContext
}

// export function containerPropsEqual(props0: ISchemaContainerProps, props1: ISchemaContainerProps): boolean {
//     return _.isEqual(props0.value, props1.value)
//         && props0.path === props1.path
//         && props0.schema === props1.schema
//         && props0.errors === props1.errors
//         && props0.context === props1.context;
// }

export interface ISchemaComponentProps {
    schema: object,
    path: string[],
    value: any,
    isRequired?: boolean,
    errors: Ajv.ErrorObject[]
    onFocus(path: string[]): void,
    onBlur(path: string[]): void,
    onEditor?(data: object, path: string[]): any,
    caption: string,
    context?: object
}

export interface IComponentMap {
    [fieldType: string]: React.FC<ISchemaComponentProps>
}

export interface IContainerMap {
    [containerType: string]: React.FC<ISchemaContainerProps>
}

export interface ISchemaFormContext {
    components: IComponentMap,
    containers: IContainerMap,
    collapsible?: boolean,
    componentContext?: object,
    schemaContext: SchemaContext,
    outerPropsChange: boolean
}