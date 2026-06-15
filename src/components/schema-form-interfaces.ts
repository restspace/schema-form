import { ErrorItem, ErrorObject } from "../error";
import { ActionType } from "./schema-form-value-context";
import { SchemaContext } from "../schema/schemaContext";

// A JSON Schema is an open-ended object; the form reads many keyword properties
// (type, properties, items, format, oneOf, …) dynamically by string key. The
// index signature expresses that dynamic access without the deprecated
// suppressImplicitAnyIndexErrors compiler flag (each access is `any`, matching
// the previous behaviour) while still being a distinct, self-documenting type.
export interface JSONSchema {
  [keyword: string]: any;
}

export interface ISchemaContainerProps {
  schema: JSONSchema;
  path: string[];
  value: object;
  isRequired?: boolean;
  errors: ErrorObject | ErrorItem[];
  onFocus(path: string[]): void;
  onBlur(path: string[]): void;
  onEditor?(data: object, path: string[]): any;
  context: ISchemaFormContext;
}

// export function containerPropsEqual(props0: ISchemaContainerProps, props1: ISchemaContainerProps): boolean {
//     return _.isEqual(props0.value, props1.value)
//         && props0.path === props1.path
//         && props0.schema === props1.schema
//         && props0.errors === props1.errors
//         && props0.context === props1.context;
// }

export interface ISchemaComponentProps {
  schema: JSONSchema;
  path: string[];
  value: any;
  isRequired?: boolean;
  errors: ErrorItem[];
  onFocus(path: string[]): void;
  onBlur(path: string[]): void;
  onEditor?(data: object, path: string[]): any;
  caption: string;
  context?: { [key: string]: any };
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
  componentContext?: { [key: string]: any };
  schemaContext: SchemaContext;
  outerPropsChange: boolean;
  // Read (as context['gridMode']) by the array/object containers.
  gridMode?: boolean;
}
