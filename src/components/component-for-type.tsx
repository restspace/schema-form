import React from "react"
import { fieldType, fieldCaption, containerType, applyConditional } from "schema/schema"
import Ajv from "ajv"
import { ISchemaContainerProps, ISchemaComponentProps } from "components/schema-form-interfaces"
import _ from 'lodash';

function ComponentForTypeInner(props: ISchemaContainerProps): React.ReactElement {
    let { schema, value, context } = props;

    // resolve a $ref
    if (schema['$ref']) schema = context.schemaContext.resolver(schema['$ref']);
    if (!schema) return <></>;

    const container: React.FC<ISchemaContainerProps> = props.context.containers[containerType(schema)];


    let condSchema = null;
    try {
        condSchema = applyConditional(schema, value, context.schemaContext);
    } catch (er) {
        console.log(er);
    }
    let mergedSchema = condSchema || schema;

    if (container) {
        return container({ ...props, schema: mergedSchema }) || (<></>)
    } else {
        return (<SchemaFormComponentGeneric {...props } schema={mergedSchema} />);
    }
}

// Memoize on the basis of full equality
export const ComponentForType = React.memo(ComponentForTypeInner, isEqual);

function isEqual(p0: ISchemaContainerProps, p1: ISchemaContainerProps) {
    const equ =  _.isEqual(p0.value, p1.value)
    && _.isEqual(p0.errors, p1.errors)
    && p0.schema === p1.schema
    && (p0.isRequired || false) === (p1.isRequired || false)
    && p0.onBlur === p1.onBlur
    && p0.onFocus === p1.onFocus
    && p0.onEditor === p1.onEditor;
    return equ;
}

function SchemaFormComponentGenericInner({
    schema, path, value, isRequired, errors, onFocus, onBlur, onEditor, context
}: ISchemaContainerProps): React.ReactElement {

    const componentProps: ISchemaComponentProps = {
        schema, path, value, isRequired, onFocus, onBlur, onEditor,
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
        console.log("Can't find editor for field type: " + fieldType(schema));
        return (<></>)
    }
}

// Memoize on the basis of full equality
export const SchemaFormComponentGeneric = React.memo(SchemaFormComponentGenericInner, isEqual);

