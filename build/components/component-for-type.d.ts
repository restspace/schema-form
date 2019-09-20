import React from "react";
import { ISchemaContainerProps } from "components/schema-form-interfaces";
declare function ComponentForTypeInner(props: ISchemaContainerProps): React.ReactElement;
export declare const ComponentForType: React.MemoExoticComponent<typeof ComponentForTypeInner>;
declare function SchemaFormComponentGenericInner({ schema, path, value, errors, onFocus, onBlur, onEditor, context }: ISchemaContainerProps): React.ReactElement;
export declare const SchemaFormComponentGeneric: React.MemoExoticComponent<typeof SchemaFormComponentGenericInner>;
export {};
