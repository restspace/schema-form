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
    if (arr0.indexOf(val) < 0) {
      output.push(val);
    }
  }
  return output;
}

// Structural-sharing clone: returns a copy of `root` in which only the nodes
// along `path` are shallow-cloned. Sibling/untouched subtrees keep their
// original references, so an immutable update along `path` is O(path) rather
// than O(whole tree). Cloning stops at the first missing/primitive node so the
// caller (e.g. lodash set) can build any remaining structure freshly.
export function cloneAlongPath<T>(root: T, path: string[]): T {
  if (root === null || typeof root !== "object") return root;
  const newRoot: any = Array.isArray(root) ? (root as any).slice() : { ...root };
  let cursor: any = newRoot;
  for (let i = 0; i < path.length; i++) {
    const key = path[i];
    const child = cursor[key];
    if (child === null || typeof child !== "object") break;
    cursor[key] = Array.isArray(child) ? child.slice() : { ...child };
    cursor = cursor[key];
  }
  return newRoot;
}

export function isEmpty(map: object | null): boolean {
  if (map === null) return false;

  for (var key in map) {
    if (Object.prototype.hasOwnProperty.call(map, key)) return false;
  }
  return true;
}

export function deepCopy<T>(obj: T): T {
  const source: any = obj;
  let copy: any;

  // Handle the 3 simple types, and null or undefined
  if (null == source || "object" != typeof source) return obj;

  // Handle Date
  if (source instanceof Date) {
    copy = new Date();
    copy.setTime(source.getTime());
    return copy;
  }

  // Handle Array
  if (source instanceof Array) {
    copy = [];
    for (var i = 0, len = source.length; i < len; i++) {
      copy[i] = deepCopy(source[i]);
    }
    return copy;
  }

  // Handle Object
  if (source instanceof Object) {
    copy = {};
    for (var attr in source) {
      if (source.hasOwnProperty(attr)) copy[attr] = deepCopy(source[attr]);
    }
    return copy;
  }

  throw new Error("Unable to copy obj! Its type isn't supported.");
}

export function copySetPath(
  value: object,
  path: string[],
  valueAtPath: any
): object {
  if (path.length === 0) {
    return valueAtPath;
  } else {
    return {
      ...value,
      [path[0]]: copySetPath((value as any)[path[0]], path.slice(1), valueAtPath),
    };
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
    if ("A" <= camel[end] && camel[end] <= "Z") {
      words.push(camel.substring(start, end).toLowerCase());
      start = end;
    }
  }
  words.push(camel.substring(start, camel.length).toLowerCase());

  return words.join(" ").replace(/[a-z]/i, (ltr) => ltr.toUpperCase());
}

export const upTo = (str: string, match: string, start?: number) => {
  const pos = str.indexOf(match, start);
  return pos < 0 ? str.substring(start || 0) : str.substring(start || 0, pos);
};

export const upToLast = (str: string, match: string, end?: number) => {
  const pos = str.lastIndexOf(match, end);
  return pos < 0 ? str.substring(0, end || str.length) : str.substring(0, pos);
};

export const after = (str: string, match: string, start?: number) => {
  const pos = str.indexOf(match, start);
  return pos < 0 ? "" : str.substring(pos + match.length);
};

export const afterLast = (str: string, match: string, end?: number) => {
  const pos = str.lastIndexOf(match, end);
  return pos < 0 ? "" : str.substring(pos + match.length, end || str.length);
};

export const last = <T>(a: ArrayLike<T>) => a[a.length - 1];

export function getByPath(value: object, path: string[]): any {
  if (path.length === 0) return value;

  const [head, ...tail] = path;

  if (Array.isArray(value)) {
    return getByPath(value[indexFromPathElement(head)], tail);
  } else if (typeof value === "object") {
    return getByPath((value as any)[head], tail);
  } else {
    return undefined;
  }
}

function indexFromPathElement(pathEl: string): number {
  if (!/^\[[0-9]+\]$/.test(pathEl))
    throw `value at path is array but path element is ${pathEl}`;
  const idx = parseInt(pathEl.substring(1, pathEl.length - 1));
  return idx;
}

export function parseUrl(url: string) {
  let urlElements = {
    scheme: "",
    domain: "",
    path: "",
    queryString: "",
    fragment: "",
    resourceName: "",
    resourceExtension: "",
  };
  if (!url) return urlElements;
  const urlParse = url.match(
    /^((https?:\/\/)([^?#/]+))?\/([^?#]*)(\?.*)?(#.*)?$/
  );
  if (!urlParse) return urlElements;
  urlElements = {
    scheme: urlParse[2],
    domain: urlParse[3],
    path: urlParse[4],
    queryString: urlParse[5],
    fragment: urlParse[6],
    resourceName: "",
    resourceExtension: "",
  };
  urlElements.queryString = urlElements.queryString
    ? urlElements.queryString.substr(1)
    : "";
  const pathParts = urlElements.path.split("/");
  urlElements.resourceName = pathParts[pathParts.length - 1];
  const rnParts = urlElements.resourceName.split(".");
  if (rnParts.length > 1) {
    urlElements.resourceExtension = rnParts.pop() || "";
    urlElements.resourceName = rnParts.join(".");
  }

  return urlElements;
}

export interface BrowserInfo {
  isOpera: boolean;
  isFirefox: boolean;
  isSafari: boolean;
  isIE: boolean;
  isEdge: boolean;
  isChrome: boolean;
  isBlink: boolean;
}

let cachedBrowserInfo: BrowserInfo | null = null;

// Detected lazily (and cached) rather than at module load, so importing the
// library in a non-browser environment (SSR / Node / tests) does not throw on
// the missing window/navigator/document globals.
export function getBrowserInfo(): BrowserInfo {
  if (cachedBrowserInfo) return cachedBrowserInfo;

  if (
    typeof window === "undefined" ||
    typeof navigator === "undefined" ||
    typeof document === "undefined"
  ) {
    cachedBrowserInfo = {
      isOpera: false,
      isFirefox: false,
      isSafari: false,
      isIE: false,
      isEdge: false,
      isChrome: false,
      isBlink: false,
    };
    return cachedBrowserInfo;
  }

  const info: BrowserInfo = {
    // Opera 8.0+
    isOpera:
      (!!(window as any)["opr"] && !!(window as any)["opr"]["addons"]) ||
      !!(window as any)["opera"] ||
      navigator.userAgent.indexOf(" OPR/") >= 0,

    // Firefox 1.0+
    isFirefox: typeof (window as any)["InstallTrigger"] !== "undefined",

    // Safari 3.0+ "[object HTMLElementConstructor]"
    isSafari:
      /constructor/i.test((window as any)["HTMLElement"] as unknown as string) ||
      (function (p) {
        return p.toString() === "[object SafariRemoteNotification]";
      })(
        !(window as any)["safari"] ||
          (typeof (window as any)["safari"] !== "undefined" &&
            (window as any)["safari"].pushNotification)
      ),

    // Internet Explorer 6-11
    isIE: /*@cc_on!@*/ false || !!(document as any)["documentMode"],

    // Chrome 1 - 71
    isChrome:
      !!(window as any)["chrome"] &&
      (!!(window as any)["chrome"]["webstore"] || !!(window as any)["chrome"]["runtime"]),
    isEdge: false,
    isBlink: false,
  };

  // Edge 20+
  info.isEdge = !info.isIE && !!(window as any)["StyleMedia"];
  // Blink engine detection
  info.isBlink = (info.isChrome || info.isOpera) && !!(window as any)["CSS"];

  cachedBrowserInfo = info;
  return info;
}
