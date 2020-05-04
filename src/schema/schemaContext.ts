import { makeSchemaResolver } from "./schema";
import Ajv from "ajv";
import _ from "lodash";

export class SchemaContext {
    resolver: (address: string) => object;
    rootSchema: object;
    getAjv() {
        const ajv = new Ajv({ allErrors: true });
        ajv.addFormat("password", () => true);
        return ajv;
    }

    constructor(baseSchemas: object | object[]) {
        const schemas = Array.isArray(baseSchemas) ? baseSchemas : [ baseSchemas ];
        this.resolver = makeSchemaResolver(schemas);
        this.rootSchema = schemas[0];
        if (!this.rootSchema['$id']) {
            this.rootSchema['$id'] = 'http://schema-form.org/root';
        }
    }

    validationErrors(schema: object, value: any) {
        const ajv = this.getAjv();
        if (schema !== this.rootSchema && !(schema['$id'] && schema['$id'] === this.rootSchema['$id'])) {
            // this means we're validating a subschema of the root schema
            // so we repoint any refs in the subschema to point to the id of the root schema
            // and add the root schema in as a separate schema to allow the
            // refs to work
            const rootRefsSchema = this.baseRefsOnRoot(schema);
            ajv.addSchema(this.rootSchema);
            return ajv.validate(rootRefsSchema, value) ? null : ajv.errors;
        } else {
            return ajv.validate(schema, value) ? null : ajv.errors;
        }
    }

    private baseRefsOnRootInner(schema: object) {
        for (const key in schema) {
            if (key === '$ref' && schema[key].startsWith('#')) {
                schema[key] = this.rootSchema['$id'] + schema[key];
            } else if (schema[key] !== null && typeof(schema[key]) === 'object') {
                schema[key] = this.baseRefsOnRootInner(schema[key]);
            }
        }
    }

    baseRefsOnRoot(schema: object): object {
        const schemaCopy = _.cloneDeep(schema);
        this.baseRefsOnRootInner(schemaCopy);
        return schemaCopy;
    }
}