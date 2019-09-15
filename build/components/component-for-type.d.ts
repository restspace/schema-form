import React from "react";
import { ISchemaContainerProps } from "components/schema-form-interfaces";
declare function ComponentForTypeInner(props: ISchemaContainerProps): React.ReactElement;
export declare const ComponentForType: React.MemoExoticComponent<typeof ComponentForTypeInner>;
declare function SchemaFormComponentWrapperInner({ schema, path, value, errors, onFocus, onBlur, onEditor, context }: ISchemaContainerProps): React.ReactElement;
export declare const SchemaFormComponentWrapper: React.MemoExoticComponent<typeof SchemaFormComponentWrapperInner>;
export {};
