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

export function withoutNoValueProperties(value: object): object {
    const newValue = deepCopy(value);
    deleteNoValueProperties(newValue);
    return newValue;
}

function deleteNoValueProperties(value: any) {
    if (Array.isArray(value)) {
        for (let item of value) {
            deleteNoValueProperties(item);
        }
    } else if (typeof value == "object") {
        for (let key in value) {
            if (!value[key] && value[key] !== 0 && value[key] !== false) {
                delete value[key];
            } else {
                deleteNoValueProperties(value[key]);
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

export function getByPath(value: object, path: string[]): any {
    if (path.length === 0) return value;

    const [head, ...tail] = path;

    if (Array.isArray(value)) {
        return getByPath(value[indexFromPathElement(head)], tail);
    } else if (typeof value === 'object') {
        return getByPath(value[head], tail);
    } else {
        return undefined;
    }
}

function indexFromPathElement(pathEl: string): number {
    if (!/^\[[0-9]+\]$/.test(pathEl)) throw(`value at path is array but path element is ${pathEl}`);
    const idx = parseInt(pathEl.substring(1, pathEl.length - 1));
    return idx;
}

export function parseUrl(url: string) {
    let urlElements = {
        scheme: '',
        domain: '',
        path: '',
        queryString: '',
        fragment: '',
        resourceName: '',
        resourceExtension: ''
    }
    if (!url) return urlElements;
    const urlParse = url.match(/^((https?:\/\/)([^?#/]+))?\/([^?#]*)(\?.*)?(#.*)?$/);
    if (!urlParse) return urlElements;
    urlElements = {
        scheme: urlParse[2],
        domain: urlParse[3],
        path: urlParse[4],
        queryString: urlParse[5],
        fragment: urlParse[6],
        resourceName: '',
        resourceExtension: ''
    }
    urlElements.queryString = urlElements.queryString ? urlElements.queryString.substr(1) : '';
    const pathParts = urlElements.path.split('/');
    urlElements.resourceName = pathParts[pathParts.length - 1];
    const rnParts = urlElements.resourceName.split('.');
    if (rnParts.length > 1) {
        urlElements.resourceExtension = rnParts.pop() || '';
        urlElements.resourceName = rnParts.join('.');
    }

    return urlElements;
}

export const browserInfo: { 
    isOpera: boolean, isFirefox: boolean, isSafari: boolean, isIE: boolean, isEdge: boolean, isChrome: boolean, isBlink: boolean
 } = {
    // Opera 8.0+
    isOpera: (!!window['opr'] && !!window['opr']['addons']) || !!window['opera'] || navigator.userAgent.indexOf(' OPR/') >= 0,

    // Firefox 1.0+
    isFirefox: typeof window['InstallTrigger'] !== 'undefined',

    // Safari 3.0+ "[object HTMLElementConstructor]" 
    isSafari: /constructor/i.test(window['HTMLElement'] as unknown as string) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof window['safari'] !== 'undefined' && window['safari'].pushNotification)),

    // Internet Explorer 6-11
    isIE: /*@cc_on!@*/false || !!document['documentMode'],

    // Chrome 1 - 71
    isChrome: !!window['chrome'] && (!!window['chrome']['webstore'] || !!window['chrome']['runtime']),
    isEdge: false,
    isBlink: false
}

// Edge 20+
browserInfo.isEdge = !browserInfo.isIE && !!window['StyleMedia'];
// Blink engine detection
browserInfo.isBlink = (browserInfo.isChrome || browserInfo.isOpera) && !!window['CSS'];
