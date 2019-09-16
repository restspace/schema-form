import Ajv from "ajv";
export declare class ErrorObject {
    [errorName: string]: Ajv.ErrorObject[] | ErrorObject;
    static forKey(errors: any, key: string): ErrorObject | Ajv.ErrorObject[];
    static attachError(errors: ErrorObject, message: string): Ajv.ErrorObject[];
}
export declare function validate(schema: object, value: object): ErrorObject;
export declare function getAjv(): Ajv.Ajv;
export declare function rectifyErrorPaths(errors: Ajv.ErrorObject[]): Ajv.ErrorObject[];
export declare function errorPathsToObject(errors: Ajv.ErrorObject[]): ErrorObject;
