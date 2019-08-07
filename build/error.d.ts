import Ajv from "ajv";
export declare class ErrorObject {
    [errorName: string]: Ajv.ErrorObject[] | ErrorObject;
}
export declare function getAjv(): Ajv.Ajv;
export declare function rectifyErrorPaths(errors: Ajv.ErrorObject[]): Ajv.ErrorObject[];
export declare function errorPathsToObject(errors: Ajv.ErrorObject[]): ErrorObject;
