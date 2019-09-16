import React from "react"
import { fieldType, fieldCaption, containerType, applyConditional } from "schema/schema"
import Ajv from "ajv"
import { ISchemaContainerProps, ISchemaComponentProps } from "components/schema-form-interfaces"
import _ from 'lodash';

function ComponentForTypeInner(props: ISchemaContainerProps): React.ReactElement {
    const { schema, value } = props;
    const container: React.FC<ISchemaContainerProps> = props.context.containers[containerType(schema)];

    let condSchema = applyConditional(schema, value);
    let mergedSchema = condSchema || schema;

    if (container) {
        return container({ ...props, schema: mergedSchema }) || (<></>)
    } else {
        return (<SchemaFormComponentWrapper {...props } schema={mergedSchema} />);
    }
}

// Memoize on the basis of full equality
export const ComponentForType = React.memo(ComponentForTypeInner, isEqual);

function isEqual(p0: ISchemaContainerProps, p1: ISchemaContainerProps) {
    const equ =  _.isEqual(p0.value, p1.value)
    && _.isEqual(p0.errors, p1.errors)
    && p0.schema === p1.schema
    && p0.onBlur === p1.onBlur
    && p0.onFocus === p1.onFocus
    && p0.onEditor === p1.onEditor;
    return equ;
}

function SchemaFormComponentWrapperInner({
    schema, path, value, errors, onFocus, onBlur, onEditor, context
}: ISchemaContainerProps): React.ReactElement {

    const componentProps: ISchemaComponentProps = {
        schema, path, value, onFocus, onBlur, onEditor,
        errors: (errors || []) as Ajv.ErrorObject[],
        caption: fieldCaption(schema, path),
        context: context.componentContext
    }

    const component: React.FC<ISchemaComponentProps> = context.components[fieldType(schema)];

    
    console.log('> rendering ' + schema['type'] + ' at ' + path.join('.'));
    
    if (component) {
        // memoize on the basis of full depth equality of props
        return component(componentProps) || (<></>)
    } else {
        return (<></>)
    }
}

// Memoize on the basis of full equality
export const SchemaFormComponentWrapper = React.memo(SchemaFormComponentWrapperInner, isEqual);

