export function intersection<T>(arr0: T[], arr1: T[]): T[] {
    let output = new Array<T>();
    for (let val of arr0) {
        if (arr1.indexOf(val) >= 0) {
            output.push(val);
        }
    }
    return output;
}

export function union<T>(arr0: T[], arr1: T[]): T[] {
    let output = new Array<T>();
    for (let val of arr0) {
        output.push(val);
    }
    for (let val of arr1) {
        if (arr1.indexOf(val) < 0) {
            output.push(val);
        }
    }
    return output;
}

export function isEmpty(map: object | null): boolean {
    if (map === null) return false;

    for(var key in map) {
        return !map.hasOwnProperty(key);
    }
    return true;
}

export function deepCopy(obj: object): object {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = deepCopy(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = deepCopy(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

export function copySetPath(value: object, path: string[], valueAtPath: any): object {
    if (path.length === 0) {
        return valueAtPath;
    } else {
        return {
            ...value,
            [path[0]]: copySetPath(value[path[0]], path.slice(1), valueAtPath)
        }
    }
}

export function withoutFalsyProperties(value: object): object {
    const newValue = deepCopy(value);
    deleteFalsyProperties(newValue);
    return newValue;
}

function deleteFalsyProperties(value: any) {
    if (Array.isArray(value)) {
        for (let item of value) {
            deleteFalsyProperties(item);
        }
    } else if (typeof value == "object") {
        for (let key in value) {
            if (!value[key]) {
                delete value[key];
            } else {
                deleteFalsyProperties(value[key]);
            }
        }
    }
}

export function camelToTitle(camel: string): string {
    camel = camel.trim();
    const words: string[] = [];
    let start = 0;
    for (let end = 1; end < camel.length; end++) {
        if ('A' <= camel[end] && camel[end] <= 'Z') {
            words.push(camel.substring(start, end).toLowerCase());
            start = end;
        }
    }
    words.push(camel.substring(start, camel.length).toLowerCase());

    return words.join(' ').replace(/[a-z]/i, (ltr) => ltr.toUpperCase());
}
