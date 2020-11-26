export declare function intersection<T>(arr0: T[], arr1: T[]): T[];
export declare function union<T>(arr0: T[], arr1: T[]): T[];
export declare function isEmpty(map: object | null): boolean;
export declare function deepCopy(obj: object): object;
export declare function copySetPath(value: object, path: string[], valueAtPath: any): object;
export declare function withoutNoValueProperties(value: object): object;
export declare function camelToTitle(camel: string): string;
export declare function getByPath(value: object, path: string[]): any;
export declare function parseUrl(url: string): {
    scheme: string;
    domain: string;
    path: string;
    queryString: string;
    fragment: string;
    resourceName: string;
    resourceExtension: string;
};
