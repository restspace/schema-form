export declare function fieldType(schema: object): string;
/** manipulate the schema to allow any optional property to have a null value
 * which is appropriate for form input */
export declare function nullOptionalsAllowed(schema: object): object;
export declare function conjoin(schema0: object | null, schema1: object | null): object | null;
export declare function disjoin(schema0: object | null, schema1: object | null): object | null;
export declare function fieldUnion(baseSchema: object, schema: object | null): object | null;
