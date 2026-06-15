import { deepCopy } from "../utility";
import { makeSchemaResolver } from "./schema";
import { validator } from "@exodus/schemasafe";

export class SchemaContext {
  resolver: (address: string) => object;
  rootSchema: object;
  onError?: (
    path: string[],
    schemaPath: string[],
    value: any,
    schemaValue: any
  ) => string;

  constructor(
    baseSchemas: object | object[],
    onError?: (
      path: string[],
      schemaPath: string[],
      value: any,
      schemaValue: any
    ) => string
  ) {
    const schemas = Array.isArray(baseSchemas) ? baseSchemas : [baseSchemas];
    this.resolver = makeSchemaResolver(schemas);
    // Don't mutate the caller's schema object; if it has no $id, tag a shallow
    // copy instead (the $id is only needed by the validator below).
    const root = schemas[0];
    this.rootSchema = root["$id"]
      ? root
      : { ...root, $id: "http://schema-form.org/root" };
    this.onError = onError;
  }

  // Compiling a schema with @exodus/schemasafe generates validation code and is
  // expensive; validationErrors runs on essentially every keystroke. Cache the
  // compiled validator keyed by the *input* schema's identity (stable across
  // renders now that SchemaForm memoizes its schema), so each distinct schema
  // is compiled at most once for the lifetime of this context.
  private validatorCache = new WeakMap<object, ReturnType<typeof validator>>();

  validatorFor(schema: object, schemas: object[] = []) {
    return validator(schema, {
      includeErrors: true,
      allErrors: true,
      allowUnusedKeywords: true,
      formats: {
        password: (s: string) => true,
      },
      schemas,
    });
  }

  validationErrors(schema: object, value: any) {
    let validate = this.validatorCache.get(schema);
    if (!validate) {
      if (
        schema !== this.rootSchema &&
        !(schema["$id"] && schema["$id"] === this.rootSchema["$id"])
      ) {
        // this means we're validating a subschema of the root schema
        // so we repoint any refs in the subschema to point to the id of the root schema
        // and add the root schema in as a separate schema to allow the
        // refs to work
        const rootRefsSchema = this.baseRefsOnRoot(schema);
        validate = this.validatorFor(rootRefsSchema, [this.rootSchema]);
      } else {
        validate = this.validatorFor(schema);
      }
      this.validatorCache.set(schema, validate);
    }
    return validate(value) ? null : validate.errors;
  }

  private baseRefsOnRootInner(schema: object) {
    for (const key in schema) {
      if (key === "$ref" && schema[key].startsWith("#")) {
        schema[key] = this.rootSchema["$id"] + schema[key];
      } else if (schema[key] !== null && typeof schema[key] === "object") {
        this.baseRefsOnRootInner(schema[key]);
      }
    }
  }

  baseRefsOnRoot(schema: object): object {
    const schemaCopy = deepCopy(schema);
    this.baseRefsOnRootInner(schemaCopy);
    return schemaCopy;
  }
}
