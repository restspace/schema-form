import React from "react"
import { fieldType, fieldCaption, applyConditional } from "schema/schema"
import Ajv from "ajv"
import { ISchemaContainerProps, ISchemaComponentProps } from "components/schema-form-interfaces"

export function ComponentForType(props: ISchemaContainerProps): React.ReactElement {
    const { schema, value } = props;
    const container: React.FC<ISchemaContainerProps> = props.context.containers[schema['type']];

    let condSchema = applyConditional(schema, value);
    let mergedSchema = condSchema || schema;
    
    if (container) {
        return container({ ...props, schema: mergedSchema }) || (<></>)
    } else {
        return (<SchemaFormComponentWrapper {...props } schema={mergedSchema} />);
    }
}

function SchemaFormComponentWrapper({
    schema, path, value, errors, onChange, onFocus, onBlur, context
}: ISchemaContainerProps): React.ReactElement {
    const componentProps: ISchemaComponentProps = {
        schema, path, value, onChange, onFocus, onBlur,
        errors: (errors || []) as Ajv.ErrorObject[],
        caption: fieldCaption(schema, path),
        context: context.componentContext
    }

    const component: React.FC<ISchemaComponentProps> = context.components[fieldType(schema)];
    
    if (component) {
        return component(componentProps) || (<></>)
    } else {
        return (<></>)
    }
}