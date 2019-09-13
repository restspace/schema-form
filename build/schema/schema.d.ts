export declare function fieldType(schema: object): string;
export declare function emptyValue(schema: object): any;
export declare function fieldCaption(schema: object, path: string[]): string;
/** manipulate the schema to allow any optional property to have a null value
 * which is appropriate for form input */
export declare function nullOptionalsAllowed(schema: object): object;
export declare function conjoin(schema0: object | null, schema1: object | null): object | null;
export declare function disjoin(schema0: object | null, schema1: object | null): object | null;
export declare function fieldUnion(baseSchema: object, schema: object | null): object | null;
export declare function schemaHasConditional(schema: object): any;
export declare function applyConditional(schema: object, val: object): object | null;
export declare function mergeOrders(order0: string[], order1: string[]): string[];
export declare function applyOrder<T>(items: T[], selector: (item: T) => string, order: string[]): T[];
