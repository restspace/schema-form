import Ajv from "ajv";
export declare class SchemaContext {
    resolver: (address: string) => object;
    rootSchema: object;
    getAjv(): Ajv.Ajv;
    constructor(baseSchemas: object | object[]);
    validationErrors(schema: object, value: any): Ajv.ErrorObject[] | null | undefined;
    private baseRefsOnRootInner;
    baseRefsOnRoot(schema: object): object;
}
