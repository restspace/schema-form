import React from 'react';
export declare const ValueDispatch: React.Context<React.Dispatch<ValueAction>>;
export declare enum ActionType {
    Create = 0,
    Delete = 1,
    Up = 2,
    Down = 3
}
export declare enum ValueActionType {
    Replace = 0,
    Up = 1,
    Down = 2,
    Create = 3,
    Delete = 4,
    Set = 5,
    Duplicate = 6
}
export declare class ValueAction {
    type: ValueActionType;
    path: string[];
    value: any;
    static replace(value: any): ValueAction;
    static up(path: string[]): ValueAction;
    static down(path: string[]): ValueAction;
    static delete(path: string[]): ValueAction;
    static create(path: string[], value: any): ValueAction;
    static duplicate(path: string[]): ValueAction;
    static set(path: string[], value: any): ValueAction;
}
export declare function valueReducer(oldValue: object, action: ValueAction): any;
