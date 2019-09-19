import React from 'react';
import _ from "lodash";

export const ValueDispatch = React.createContext<React.Dispatch<ValueAction>>(() => {});

export enum ActionType {
    Create, Delete, Up, Down
}

export enum ValueActionType {
    Replace, Up, Down, Create, Delete, Set
}

export class ValueAction {
    type: ValueActionType;
    path: string[] = [];
    value: any = null;

    static replace(value: any) {
        return { type: ValueActionType.Replace, value } as ValueAction;
    }

    static up(path: string[]) {
        return { type: ValueActionType.Up, path } as ValueAction;
    }

    static down(path: string[]) {
        return { type: ValueActionType.Down, path } as ValueAction;
    }

    static delete(path: string[]) {
        return { type: ValueActionType.Delete, path } as ValueAction;
    }

    static create(path: string[], value: any) {
        return { type: ValueActionType.Create, path, value } as ValueAction;
    }

    static set(path: string[], value: any) {
        return { type: ValueActionType.Set, path, value } as ValueAction;
    }
}

export function valueReducer(oldValue: object, action: ValueAction) {
    if (action.type === ValueActionType.Replace) {
        console.log('VALUE update:');
        console.log(JSON.parse(JSON.stringify(action.value)));
        return _.cloneDeep(action.value);
    }

    let value = _.cloneDeep(oldValue); // unless we clone before we will mutate the value used for matching by memo
    const parentPath = action.path.slice(0, -1);
    const idx = parseInt(_.last(action.path) || '');
    switch (action.type) {
        case ValueActionType.Up: {
            const newValueArray = _.get(value, parentPath);
            if (!isNaN(idx) && idx > 0) {
                const mover = newValueArray[idx];
                newValueArray[idx] = newValueArray[idx - 1];
                newValueArray[idx - 1] = mover;
            }
            _.set(value, parentPath, newValueArray);
            break;
        }
        case ValueActionType.Down: {
            const newValueArray = _.get(value, parentPath);
            if (!isNaN(idx) && idx < newValueArray.length - 1) {
                const mover = newValueArray[idx];
                newValueArray[idx] = newValueArray[idx + 1];
                newValueArray[idx + 1] = mover;
            }
            _.set(value, parentPath, newValueArray);
            break;
        }
        case ValueActionType.Delete: {
            const newValueArray = _.get(value, parentPath);
            if (!isNaN(idx) && idx < newValueArray.length) {
                newValueArray.splice(idx, 1);
            }
            _.set(value, parentPath, newValueArray);
            break;
        }
        case ValueActionType.Create: {
            const newValueArray = _.get(value, action.path) || [];
            _.set(value, action.path, [ ...newValueArray, action.value ]);
            break;
        }
        case ValueActionType.Set: {
            _.set(value, action.path, action.value);
            break;
        }
    }
    console.log('VALUE update:');
    console.log(JSON.parse(JSON.stringify(value)));
    return value;
}