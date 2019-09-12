import React from "react";
import { ISchemaContainerProps } from "components/schema-form-interfaces";
export declare function ComponentForType(props: ISchemaContainerProps): React.ReactElement;
declare function SchemaFormComponentWrapperInner({ schema, path, value, errors, onChange, onFocus, onBlur, onEditor, context }: ISchemaContainerProps): React.ReactElement;
export declare const SchemaFormComponentWrapper: React.MemoExoticComponent<typeof SchemaFormComponentWrapperInner>;
export {};
