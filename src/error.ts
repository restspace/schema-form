import Ajv from "ajv"

export class ErrorObject {
    [ errorName: string ]: Ajv.ErrorObject[] | ErrorObject
}

export function rectifyErrorPaths(errors: Ajv.ErrorObject[]): Ajv.ErrorObject[] {
    return errors.map((e) => ({
        ...e,
        dataPath: e.params['missingProperty']
            ? e.dataPath + '.' + e.params['missingProperty'] 
            : e.dataPath
    }));
}

export function errorPathsToObject(errors: Ajv.ErrorObject[]): ErrorObject {
    const errorObj = new ErrorObject();
    for (let error of errors) {
        const wasAttached = attachError(errorObj, error.dataPath.split('.').slice(1), error);
        if (!wasAttached)
            attachError(errorObj, [ '.' ], error);
    }
    return errorObj;
}

function attachError(errorObj: ErrorObject, path: string[], error: Ajv.ErrorObject): boolean {
    if (path.length === 0)
        return false;

    let errorObjVal = errorObj[path[0]];
    let wasAttached = false;
    if (path.length === 1) {
        if (errorObjVal && Array.isArray(errorObj[path[0]])) {
            (errorObjVal as Ajv.ErrorObject[]).push(error);
        } else {
            errorObj[path[0]] = [ error ];
        }
        wasAttached = true;
    } else if (path.length > 1) {
        if (!errorObjVal) {
           errorObjVal = new ErrorObject();
           errorObj[path[0]] = errorObjVal; 
        }
        if (errorObjVal instanceof ErrorObject) {
            wasAttached = attachError(errorObjVal, path.slice(1), error);
        }
    }
    return wasAttached;
}