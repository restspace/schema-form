import React from "react";
import {
  fieldType,
  fieldCaption,
  containerType,
  applyConditional,
} from "../schema/schema";
import { applyUiHints } from "../schema/ui-schema";
import {
  ISchemaContainerProps,
  ISchemaComponentProps,
} from "../components/schema-form-interfaces";
import _isEqual from "lodash-es/isEqual";
import { ErrorItem } from "../error";

function ComponentForTypeInner(
  props: ISchemaContainerProps
): React.ReactElement {
  let { schema, value, context } = props;

  if (!schema) return <></>;

  // resolve a $ref
  if (schema["$ref"]) schema = context.schemaContext.resolver(schema["$ref"]);

  // overlay node-level uiSchema hints — done after $ref resolution so they apply
  // to the resolved schema, and before widget selection so ui:editor can pick it.
  schema = applyUiHints(schema, props.uiSchema);

  const container: React.FC<ISchemaContainerProps> =
    props.context.containers[containerType(schema)];

  let condSchema = null;
  try {
    condSchema = applyConditional(schema, value, context.schemaContext);
  } catch (er) {
    // A thrown conditional means the current value satisfies no branch yet
    // (a normal transient state while the form is being filled in). Fall back
    // to the unmodified schema; the validator still surfaces any real errors
    // through the error channel.
  }
  let mergedSchema = condSchema || schema;

  if (container) {
    return (
      React.createElement(container, { ...props, schema: mergedSchema }) || (
        <></>
      )
    );
  } else {
    return <SchemaFormComponentGeneric {...props} schema={mergedSchema} />;
  }
}

// Memoize on the basis of full equality
export const ComponentForType = React.memo(ComponentForTypeInner, isEqual);

function isEqual(p0: ISchemaContainerProps, p1: ISchemaContainerProps) {
  // Cheap reference / primitive comparisons first; only fall back to a deep
  // compare of value/errors when the references actually differ. The reducer
  // structurally shares untouched subtrees, so an unchanged field's value is
  // reference-equal and skips the expensive deep equality entirely.
  return (
    p0.schema === p1.schema &&
    p0.uiSchema === p1.uiSchema &&
    (p0.isRequired || false) === (p1.isRequired || false) &&
    p0.onBlur === p1.onBlur &&
    p0.onFocus === p1.onFocus &&
    p0.onEditor === p1.onEditor &&
    (p0.value === p1.value || _isEqual(p0.value, p1.value)) &&
    (p0.errors === p1.errors || _isEqual(p0.errors, p1.errors))
  );
}

function SchemaFormComponentGenericInner({
  schema,
  path,
  value,
  isRequired,
  errors,
  onFocus,
  onBlur,
  onEditor,
  context,
}: ISchemaContainerProps): React.ReactElement {
  const componentProps: ISchemaComponentProps = {
    schema,
    path,
    value,
    isRequired,
    onFocus,
    onBlur,
    onEditor,
    errors: (errors || []) as ErrorItem[],
    caption: fieldCaption(schema, path),
    context: context.componentContext,
  };

  const component: React.FC<ISchemaComponentProps> =
    context.components[fieldType(schema)];

  if (component) {
    // memoize on the basis of full depth equality of props
    return React.createElement(component, componentProps) || <></>;
  } else {
    console.warn("Can't find editor for field type: " + fieldType(schema));
    return <></>;
  }
}

// Memoize on the basis of full equality
export const SchemaFormComponentGeneric = React.memo(
  SchemaFormComponentGenericInner,
  isEqual
);
