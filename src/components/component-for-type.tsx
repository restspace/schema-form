import React from "react"
import { fieldType, fieldCaption } from "schema/schema"
import Ajv from "ajv"
import { ISchemaContainerProps, ISchemaComponentProps } from "components/schema-form-interfaces"

export function ComponentForType(props: ISchemaContainerProps): React.ReactElement {
    const container: React.FC<ISchemaContainerProps> = props.context.containers[props.schema['type']];
    
    if (container) {
        return container(props) || (<></>)
    } else {
        return (<SchemaFormComponentWrapper {...props} />);
    }
}

function SchemaFormComponentWrapper({
    schema, path, value, errors, onChange, onFocus, onBlur, context
}: ISchemaContainerProps): React.ReactElement {
    const componentProps: ISchemaComponentProps = {
        schema, path, value, onChange, onFocus, onBlur,
        errors: (errors || []) as Ajv.ErrorObject[],
        caption: fieldCaption(schema, path)
    }

    const component: React.FC<ISchemaComponentProps> = context.components[fieldType(schema)];
    
    if (component) {
        return component(componentProps) || (<></>)
    } else {
        return (<></>)
    }
}