import { ValidationError } from "@exodus/schemasafe";
import { jsonPointerToPath, nullOptionalsAllowed } from "./schema/schema";
import { afterLast, getByPath, withoutNoValueProperties } from "./utility";
import { SchemaContext } from "./schema/schemaContext";
import { JSONSchema } from "./components/schema-form-interfaces";

export interface ErrorItem {
  path: string[];
  message: string;
}

export class ErrorObject {
  [errorName: string]: ErrorItem[] | ErrorObject;

  static forKey(errors: any, key: string) {
    return (errors instanceof ErrorObject && errors[key]) || [];
  }
}

export function validate(
  schema: JSONSchema,
  value: object,
  context: SchemaContext
) {
  const validationErrors = context.validationErrors(
    nullOptionalsAllowed(schema),
    withoutNoValueProperties(value)
  );
  const errorItems = (validationErrors || []).map((ve) =>
    errorMapper(
      schema,
      value,
      ve.keywordLocation,
      ve.instanceLocation,
      context.onError
    )
  );
  const errorObj = errorPathsToObject(errorItems);
  return errorObj;
}

export function errorMapper(
  schema: any,
  value: any,
  keywordLocation: string,
  instanceLocation: string,
  onError?: (
    path: string[],
    schemaPath: string[],
    value: any,
    schemaValue: any
  ) => string
): ErrorItem {
  const path = jsonPointerToPath(instanceLocation)
    .replace(/\[/g, ".[")
    .split(".");
  const val = getByPath(value, path);
  const keyword = afterLast(keywordLocation, "/");
  const schemaPath = jsonPointerToPath(keywordLocation)
    .replace(/\[/g, ".[")
    .split(".");
  const keyValue = getByPath(schema, schemaPath);

  if (onError) {
    const msg = onError(path, schemaPath, val, keyValue);
    if (msg)
      return {
        path,
        message: msg,
      };
  }

  switch (keyword) {
    case "required":
      return {
        path,
        message: "Please enter a value for this item",
      };
    case "minimum":
      return {
        path,
        message: `Please enter a number at least ${keyValue}`,
      };
    case "maximum":
      return {
        path,
        message: `Please enter a number at most ${keyValue}`,
      };
    case "minLength":
      return {
        path,
        message: `Please enter text of at least ${keyValue} characters`,
      };
    case "maxLength":
      return {
        path,
        message: `Please enter text no longer than ${keyValue} characters`,
      };
    case "minItems":
      return {
        path,
        message: `Please enter at least ${keyValue} items`,
      };
    case "maxItems":
      return {
        path,
        message: `Please enter no more than ${keyValue} items`,
      };
    case "pattern":
      return {
        path,
        message: `Please enter properly formatted value`,
      };
    case "format":
      const valMap = {
        "date-time": "date and time",
        time: "time",
        date: "date",
        email: "email address",
      } as Record<string, string>;
      return {
        path,
        message: `Please enter a properly formatted ${valMap[keyValue]}`,
      } as ErrorItem;
    case "const":
      return {
        path,
        message: `Please enter the value ${JSON.stringify(keyValue)}`,
      };
  }

  return {
    path,
    message: `'${
      val === null ? "null" : val === undefined ? "undefined" : val
    }' Fails to satisfy schema at ${jsonPointerToPath(keywordLocation)}`,
  };
}

export function errorPathsToObject(errors: ErrorItem[]): ErrorObject {
  const errorObj = new ErrorObject();
  for (let error of errors) {
    const wasAttached = attachError(errorObj, error.path, error);
    if (!wasAttached) attachError(errorObj, [""], error);
  }
  return errorObj;
}

function attachError(
  errorObj: ErrorObject,
  path: string[],
  error: ErrorItem
): boolean {
  if (path.length === 0) return false;

  let errorObjChild = errorObj[path[0]];
  let wasAttached = false;
  if (path.length === 1) {
    if (errorObjChild && Array.isArray(errorObjChild)) {
      errorObjChild.push(error);
    } else {
      errorObj[path[0]] = [error];
    }
    wasAttached = true;
  } else if (path.length > 1) {
    if (!errorObjChild) {
      errorObjChild = new ErrorObject();
      errorObj[path[0]] = errorObjChild;
    }
    if (errorObjChild instanceof ErrorObject) {
      wasAttached = attachError(errorObjChild, path.slice(1), error);
    }
  }
  return wasAttached;
}
