import Ajv from "ajv";
import { SchemaContext } from "schema/schemaContext";
export declare class ErrorObject {
    [errorName: string]: Ajv.ErrorObject[] | ErrorObject;
    static forKey(errors: any, key: string): ErrorObject | Ajv.ErrorObject[];
    static attachError(errors: ErrorObject, message: string): Ajv.ErrorObject[];
}
export declare function validate(schema: object, value: object, context: SchemaContext): ErrorObject;
export declare function rectifyErrorPaths(errors: Ajv.ErrorObject[]): Ajv.ErrorObject[];
export declare function errorPathsToObject(errors: Ajv.ErrorObject[]): ErrorObject;
