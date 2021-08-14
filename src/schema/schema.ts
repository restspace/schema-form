import { union, intersection, deepCopy, isEmpty, camelToTitle } from "../utility";
import jsonpointer from "jsonpointer";
import _ from "lodash";
import { ISchemaFormContext } from "../components/schema-form-interfaces";
import { SchemaContext } from "./schemaContext";

export function fieldType(schema: object): string {
    let type = schema['type'];
    if (schema['enum'])
        type = "enum";
    if (schema['format'])
        type += "-" + schema['format'];
    if (schema['hidden'])
        type = "hidden";
    if (schema['editor'])
        type = schema['editor'];
    switch (type) {
        case "string-date-time":
        case "string-date":
        case "string-time":
        case "string-email":
        case "string-password":
        case "number-currency":
            return schema['format'];
        default:
            return type;
    }
}

export function containerType(schema: object): string {
    let type = schema['type'];
    if (schema['editor']) type = schema['editor'];
    return type;
}

export function emptyValue(schema: object): any {
    switch (schema['type'] || '') {
        case 'object': return {};
        case 'array': return [];
        default: return null;
    }
}

export function fieldCaption(schema: object, path: string[], value?: any): string {
    if (value) {
        let objectTitle = value && schema['objectTitle'] && value[schema['objectTitle']];
        objectTitle = objectTitle || value['title'];
        if (objectTitle) {
            return objectTitle.toString();
        }
    }
    const pathEl = path && path.length ? path[path.length - 1] : '';
    const title = schema['title'];
    let idx: number | null = pathEl && pathEl.match(/^\d+$/) ? parseInt(pathEl) + 1 : null;
    return idx
        ? (title ? title.replace('##', idx) : '')
        : (title || camelToTitle(pathEl));
}

/** manipulate the schema to allow any optional property to have a null value
 * which is appropriate for form input */
export function nullOptionalsAllowed(schema: object): object {
    let newSchema = deepCopy(schema);
    nullOptionalsAllowedApply(newSchema);
    return newSchema;
}

function nullOptionalsAllowedApply(schema: object) {
    let req : Array<string> = schema['required'] || [];
    if (schema['$ref']) return;
    switch (schema['type']) {
        case 'object':
            const properties = schema['properties'] || {};
            for (let prop in properties) {
                if (req.indexOf(prop) < 0) {
                    nullOptionalsAllowedApply(schema['properties'][prop]);
                }
            }
            break;
        case 'array':
            const items = schema['items'] || {};
            nullOptionalsAllowedApply(items);
            if (items['oneOf'] && !(items['oneOf'] as any[]).some(subschema => subschema["type"] == "null")) {
                items['oneOf'].push({ type: 'null' });
            }
            break;
        default:
            if (Array.isArray(schema['type'])) {
                if (schema['type'].indexOf('null') < 0) {
                    schema['type'].push('null');
                }
            } else if (schema['type'] != 'null') {
                schema['type'] = [schema['type'], 'null'];
            }
            break;
    }
    if (schema['definitions']) {
        for (let defn in schema['definitions']) {
            nullOptionalsAllowedApply(schema['definitions'][defn]);
        }
    }
}

export function conjoin(schema0: object | null, schema1: object | null): object | null {
    if (schema0 === null || schema1 === null)
        return null;

    if (isEmpty(schema0))
        return deepCopy(schema1);

    let schema = deepCopy(schema0);

    for (let prop in schema1) {
        switch (prop) {
            case 'properties':
                if (!schema['properties']) {
                    schema['properties'] = {};
                }
                for (let p in schema1['properties']) {
                    let res = conjoin(schema['properties'][p], schema1['properties'][p]);
                    if (res === null) {
                        delete schema['properties'][p];
                    } else {
                        schema['properties'][p] = res
                    }
                }
                break;
            case 'order': 
                if (!schema['order']) {
                    schema['order'] = schema1['order']
                } else {
                    schema['order'] = mergeOrders(schema['order'], schema1['order']);
                }
                break;
            case 'items':
                schema['items'] = conjoin(schema['items'], schema1['items']);
                break;
            case 'type':
            case 'enum':
            case 'const':
                let val1 = schema1[prop];
                let val = schema[prop];
                if (!val) {
                    if (prop == 'enum' && schema['const']) {
                        val = schema['const'];
                    } else if (prop == 'const' && schema['enum']) {
                        val = schema['enum'];
                    } else {
                        schema[prop] = schema1[prop];
                        break;
                    }
                }
                if (!Array.isArray(val1)) {
                    val1 = [val1];
                }
                if (!Array.isArray(val)) {
                    val = [val];
                }
                schema[prop] = intersection<string>(<string[]>val1, <string[]>val);
                if (schema[prop] == []) {
                    return null;
                }
                if (prop == 'type' && schema['type'].length == 1) {
                    schema['type'] = schema['type'][0];
                } else if (prop == 'enum' && schema['enum'].length == 1) {
                    schema['const'] = schema['enum'][0];
                    delete schema['enum'];
                } else if (prop == 'const') {
                    if (schema['const'].length == 1) {
                        schema['const'] = schema['const'][0];
                    } else {
                        schema['enum'] = schema['const'];
                        delete schema['const'];
                    }
                }
                break;
            case 'required':
                if (!schema[prop]) {
                    schema[prop] = schema1[prop];
                } else {
                    schema[prop] = union<string>(<string[]>schema[prop], <string[]>schema1[prop]);
                }
                break;
            case 'maximum':
            case 'exclusiveMaximum':
            case 'maxLength':
            case 'maxItems':
            case 'maxProperties':
                if (schema[prop] > schema1[prop]) {
                    schema[prop] = schema1[prop];
                }
            case 'minimum':
            case 'exclusiveMinimum':
            case 'minLength':
            case 'minItems':
            case 'minProperties':
                if (schema[prop] < schema1[prop]) {
                    schema[prop] = schema1[prop];
                }
            case 'if':
            case 'then':
            case 'else':
            case 'anyOf':
            case 'allOf':
                break;
            default:
                if (schema[prop] && schema[prop] != schema1[prop])
                    return null;
                schema[prop] = schema1[prop];
                break;
        }
    }

    return schema;
}

export function disjoin(schema0: object | null, schema1: object | null ): object | null {
    if (schema0 === null)
        return schema1;
    else if (schema1 === null)
        return schema0;

    let schema = deepCopy(schema0);
    
    for (let prop in schema1) {
        switch (prop) {
            case 'properties':
                let deleteProps = [];
                for (let p in schema['properties']) {
                    let otherProp = schema1?.['properties']?.[p] || null;
                    if (otherProp === null) {
                        deleteProps.push(p);
                    } else {
                        let res = disjoin(schema['properties'][p], otherProp);
                        if (isEmpty(res))
                            throw "Disjoining property " + p + " means it has no definition";
                        schema['properties'][p] = res
                    }
                }
                break;
            case 'items':
                schema['items'] = disjoin(schema['items'], schema1['items']);
                break;
            case 'type':
            case 'enum':
            case 'const':
                let val1 = schema1[prop];
                let val = schema[prop];
                if (!val) {
                    if (prop == 'enum' && schema['const']) {
                        val = schema['const'];
                    } else if (prop == 'const' && schema['enum']) {
                        val = schema['enum'];
                    } else {
                        schema[prop] = schema1[prop];
                        break;
                    }
                }
                    
                if (!Array.isArray(val1)) {
                    val1 = [val1];
                }
                if (!Array.isArray(val)) {
                    val = [ val ];
                }
                schema[prop] = union<string>(<string[]>val1, <string[]>val);
                if (prop == 'type' && schema['type'].length == 1) {
                    schema['type'] = schema['type'][0];
                } else if (prop == 'enum' && schema['enum'].length == 1) {
                    schema['const'] = schema['enum'][0];
                    delete schema['enum'];
                } else if (prop == 'const') {
                    if (schema['const'].length == 1) {
                        schema['const'] = schema['const'][0];
                    } else {
                        schema['enum'] = schema['const'];
                        delete schema['const'];
                    }
                }
                break;
            case 'required':
                if (!schema[prop])
                    schema[prop] = schema1[prop];
                else
                    schema[prop] = intersection<string>(<string[]>schema[prop], <string[]>schema1[prop]);
                break;
            case 'maximum':
            case 'exclusiveMaximum':
            case 'maxLength':
            case 'maxItems':
            case 'maxProperties':
                if (schema[prop] <= schema1[prop]) {
                    schema[prop] = schema1[prop];
                }
            case 'minimum':
            case 'exclusiveMinimum':
            case 'minLength':
            case 'minItems':
            case 'minProperties':
                if (schema[prop] >= schema1[prop]) {
                    schema[prop] = schema1[prop];
                }
            default:
                if (schema[prop] && schema[prop] != schema1[prop])
                    throw "Property " + prop + " has different undisjoinable values";
                schema[prop] = schema1[prop];
                break;
        }
    }

    return schema;
}

export function fieldUnion(baseSchema: object, schema: object | null): object | null {
    schema = expandConditionals(baseSchema, schema);
    if (schema === null) return null;

    if (!schema['type'])
    throw "object not well-formed schema in fieldUnion, no type field";
    let union = {
        '$type': fieldType(schema)
    };
    switch (schema['type']) {
        case "object":
            let props = schema['properties'] || {};
            for (let field in props) {
                union[field] = fieldUnion(baseSchema, props[field]);
            }
            break;
        case "array":
            union['$items'] = fieldUnion(baseSchema, schema['items']);
            break;
    }
    return union;
}

function expandConditionals(baseSchema: object, schema: object | null): object | null {
    if (schema === null) return null;

    let conditionalParts = [];
    if (schema['then']) {
        conditionalParts.push(schema['then']);
    }
    if (schema['else']) {
        conditionalParts.push(schema['else']);
    }
    if (schema['anyOf']) {
        conditionalParts = conditionalParts.concat(schema['anyOf']);
    }
    if (schema['allOf']) {
        conditionalParts = conditionalParts.concat(schema['allOf']);
    }
    for (let subSchema of conditionalParts) {
        schema = conjoin(schema, expandConditionals(baseSchema, subSchema));
    }
    return schema;
}

export function schemaHasConditional(schema: object) {
    return (schema['if'] && (schema['then'] || schema['else']))
        || (schema['anyOf'])
        || (schema['allOf']);
}

export function applyConditional(schema: object, val: object, context: SchemaContext): object | null {
    let result: object | null = null;
    if (schema['if']) {
        let valid = !context.validationErrors(nullOptionalsAllowed(schema['if']), val);
        
        let apply: any = null;
        if (valid && schema['then']) {
            apply = schema['then'];
        } else if (!valid && schema['else']) {
            apply = schema['else'];
        }
        if (apply) {
            // recurse into conditionals of then/else schemas
            apply = applyConditional(apply, val, context) || apply;
            result = conjoin(schema, apply);
        }
    }
    if (schema['anyOf']) {
        // We only select and apply subschemas which when added to the parent schema will
        // validate against the current value
        let disjunction = null;
        for (let subSchema of <object[]>schema['anyOf']) {
            const schemaWithSubSchema = conjoin(_.omit(schema, 'anyOf'), subSchema);
            if (schemaWithSubSchema === null) continue;

            if (!context.validationErrors(nullOptionalsAllowed(schemaWithSubSchema), val)) {
                let apply = applyConditional(subSchema, val, context) || subSchema;
                disjunction = disjoin(disjunction, apply);
            }
        }
        if (disjunction === null)
            throw "Current state of form illegal, no condition in anyOf is true";
        result = conjoin(result || schema, disjunction);
    }
    if (schema['allOf']) {
        let conjunction: object | null = {};
        for (let subSchema of <object[]>schema['allOf']) {
            let apply = applyConditional(subSchema, val, context) || subSchema;
            conjunction = conjoin(conjunction, apply);
        }
        if (conjunction === null)
            throw "Current state of form illegal, a condition in allOf is not true";
        result = conjoin(result || schema, conjunction);
    }

    return result;
}

export function mergeOrders(order0: string[], order1: string[]): string[] {
    const result: string[] = [];
    const ord0 = [ ...order0 ];
    const ord1 = [ ...order1 ];
    while (ord0.length || ord1.length) {
        if (!ord0.length) {
            return result.concat(ord1);
        } else if (!ord1.length) {
            return result.concat(ord0);
        } else if (ord0.indexOf(ord1[0]) > -1) {
            while (ord0.length && ord0[0] !== ord1[0]) {
                result.push(ord0.shift() || '');
            }
            if (ord0[0] === ord1[0]) {
                result.push(ord0.shift() || '');
                ord1.shift();
            }
            while (ord1.length && ord0.indexOf(ord1[0]) < 0) {
                result.push(ord1.shift() || '');
            }
        } else {
            return result.concat(ord0).concat(ord1);
        }
    }

    return result;
}

export function applyOrder<T>(items: T[], selector: (item: T) => string, order: string[]) : T[] {
    const result: T[] = [];
    const itemMap = items.reduce((partMap, item) => ({ ...partMap, [selector(item)]: item }), {});
    for (let itemKey of order) {
        if (itemMap[itemKey]) {
            result.push(itemMap[itemKey]);
            delete itemMap[itemKey];
        }
    }
    for (let key in itemMap) {
        result.push(itemMap[key]);
    }
    return result;
}

export const makeSchemaResolver = (schemas: object[], fallbackResolver?: (address: string) => object) => (address: string) => {
    let resolution;
    if (address.startsWith('#')) {
        resolution = jsonpointer.get(schemas[0], address.substr(1));
    } else if (address.startsWith('http')) {
        resolution = schemas.find(s => s['$id'] && s['$id'] === address);
    } else if (schemas[0]['$id']) {
        const idSegs = schemas[0]['$id'].split('/');
        const domain = [ idSegs.shift(), idSegs.shift() ];
        const addressSegs = address.split('/');
        if (idSegs[0]) {
            idSegs.pop();
            addressSegs.forEach(seg => {
                if (seg === '..') {
                    idSegs.pop();
                } else if (seg !== '.') {
                    idSegs.push(seg);
                }
            });
            const targetAddress = domain.concat(idSegs).join('/');
            resolution = schemas.find(s => s['$id'] && s['$id'] === targetAddress);
        }
    }
    return resolution || (fallbackResolver && fallbackResolver(address));
}

export const deleteSubschemaProperties = (value: any, schema: object): any => {
    const schemaType = schema['type'];
    if (schemaType === 'object' && value && typeof value === 'object') {
        if (schema['properties']) {
            Object.keys(schema['properties']).forEach(prop => {
                const res = deleteSubschemaProperties(value[prop], schema['properties'][prop]);
                if (res === null) delete value[prop];
            });
        }
        return value === {} ? null : value;
    } else if (schemaType === 'array' && Array.isArray(value)) {
        return (value as any[]).map(item => deleteSubschemaProperties(item, schema['items'] || {})).filter((item: any) => item !== null);
    } else {
        return null;
    }
}
    
