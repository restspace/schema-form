import React from "react";
import { last, deepCopy, cloneAlongPath } from "../utility";
import get from "lodash-es/get";
import set from "lodash-es/set";

export const ValueDispatch = React.createContext<React.Dispatch<ValueAction>>(
  () => {}
);

export enum ActionType {
  Create,
  Delete,
  Up,
  Down,
}

export enum ValueActionType {
  Replace,
  Up,
  Down,
  Create,
  Delete,
  Set,
  Duplicate,
  DeleteProperties,
}

export class ValueAction {
  type: ValueActionType;
  path: string[] = [];
  properties: string[] = [];
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

  static deleteProperties(path: string[], properties: string[]) {
    return {
      type: ValueActionType.DeleteProperties,
      path,
      properties,
    } as ValueAction;
  }

  static create(path: string[], value: any) {
    return { type: ValueActionType.Create, path, value } as ValueAction;
  }

  static duplicate(path: string[]) {
    return { type: ValueActionType.Duplicate, path } as ValueAction;
  }

  static set(path: string[], value: any) {
    return { type: ValueActionType.Set, path, value } as ValueAction;
  }
}

export function valueReducer(oldValue: object, action: ValueAction) {
  if (action.type === ValueActionType.Replace) {
    return deepCopy(action.value);
  }

  // Structural-sharing clone of just the spine touched by this action, so
  // untouched subtrees keep their references (cheaper than a full deep copy
  // on every keystroke, and preserves identity for memoization / list keys).
  // The subsequent get/set/splice calls only ever mutate this cloned spine.
  let value = cloneAlongPath(oldValue, action.path);
  const parentPath = action.path.slice(0, -1);
  const idx = parseInt(last(action.path) || "");
  switch (action.type) {
    case ValueActionType.Up: {
      const newValueArray = get(value, parentPath);
      if (!isNaN(idx) && idx > 0) {
        const mover = newValueArray[idx];
        newValueArray[idx] = newValueArray[idx - 1];
        newValueArray[idx - 1] = mover;
      }
      set(value, parentPath, newValueArray);
      break;
    }
    case ValueActionType.Down: {
      const newValueArray = get(value, parentPath);
      if (!isNaN(idx) && idx < newValueArray.length - 1) {
        const mover = newValueArray[idx];
        newValueArray[idx] = newValueArray[idx + 1];
        newValueArray[idx + 1] = mover;
      }
      set(value, parentPath, newValueArray);
      break;
    }
    case ValueActionType.Delete: {
      const newValueArray = get(value, parentPath);
      if (!isNaN(idx) && idx < newValueArray.length) {
        newValueArray.splice(idx, 1);
      }
      set(value, parentPath, newValueArray);
      break;
    }
    case ValueActionType.Create: {
      const newValueArray = get(value, action.path) || [];
      set(value, action.path, [...newValueArray, action.value]);
      break;
    }
    case ValueActionType.Duplicate: {
      const newValueArray = get(value, parentPath);
      if (!isNaN(idx) && idx < newValueArray.length) {
        newValueArray.splice(idx, 0, deepCopy(newValueArray[idx]));
      }
      set(value, parentPath, newValueArray);
      break;
    }
    case ValueActionType.Set: {
      set(value, action.path, action.value);
      break;
    }
    case ValueActionType.DeleteProperties: {
      const obj = action.path.length ? get(value, action.path) : value;
      if (obj) {
        action.properties.forEach((prop) => delete obj[prop]);
      }
    }
  }
  return value;
}
