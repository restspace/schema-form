import React, { useState } from "react";
import { ComponentForType } from "./component-for-type";
import { ErrorItem, ErrorObject } from "../error";
import { fieldCaption } from "../schema/schema";
import { ISchemaContainerProps } from "./schema-form-interfaces";
import { SchemaFormKeys } from "./schema-form-keys";
import { last } from "../utility";

type NestedList = string | NestedListArray;
interface NestedListArray extends Array<NestedList> {}

const flattenErrors = (errObj: ErrorObject): ErrorItem[] => {
  const all: ErrorItem[] = [];
  for (const key in errObj) {
    const child = (errObj as any)[key];
    if (Array.isArray(child)) {
      all.push(...(child as ErrorItem[]));
    } else if (child instanceof ErrorObject) {
      all.push(...flattenErrors(child));
    }
  }
  return all;
};

const firstNestedString = (list: NestedList): [string, number] => {
  if (typeof list === "string") {
    return [list, 0];
  } else {
    const [item, innerDepth] = firstNestedString(list[0]);
    return [item, innerDepth + 1];
  }
};

export function SchemaFormObject({
  schema,
  path,
  value,
  errors,
  onFocus,
  onBlur,
  onEditor,
  context,
  uiSchema,
}: ISchemaContainerProps): React.ReactElement {
  const [collapsed, setCollapsed] = useState(false);
  const pathEl = path.length ? last(path) : "";
  const objectClass = path.length === 0 ? "" : "sf-object sf-" + pathEl;

  function renderSection(
    order: NestedList,
    properties: [string, unknown][],
    requireds?: string[],
    i?: number
  ) {
    if (typeof order === "string") {
      const [key, subSchema] = properties.find(([key, _]) => key === order) || [
        "",
        null,
      ];
      if (key) {
        return (
          <ComponentForType
            schema={subSchema as object}
            path={[...path, key]}
            value={value && (value as any)[key]}
            isRequired={requireds && requireds.indexOf(key) >= 0}
            errors={ErrorObject.forKey(errors, key)}
            onFocus={onFocus}
            onBlur={onBlur}
            onEditor={onEditor}
            key={key}
            context={context}
            uiSchema={uiSchema && uiSchema[key]}
          />
        );
      }
    } else {
      // recurse into a section list
      const [firstKey, depth] = firstNestedString(order);
      // Key sections by their (stable) leading property name rather than array
      // index, so reordering property groups doesn't misreconcile sections.
      return (
        <section key={`group-${depth}-${firstKey}`} className={`group-${depth}-${firstKey}`}>
          {order.map((subOrder, i) =>
            renderSection(subOrder, properties, requireds, i)
          )}
        </section>
      );
    }
    return <></>;
  }

  let topOrder: NestedListArray =
    schema["propertyOrder"] || Object.keys(schema["properties"] || {});
  let properties = Object.entries(schema["properties"] || {});
  let requireds = schema["required"];
  const collapsible = (context.collapsible && path.length > 0) || false;
  const onCollapserClick = () => setCollapsed((collapsed) => !collapsed);
  const collapserClasses =
    "sf-collapser " + (collapsed ? "sf-collapsed" : "sf-open");
  const caption = fieldCaption(schema, path);
  const showTitle = path.length > 0 && (collapsible || caption);
  const baseContainerErrors: ErrorItem[] =
    Array.isArray(errors)
      ? (errors as ErrorItem[])
      : path.length === 0 &&
        errors instanceof ErrorObject &&
        Array.isArray((errors as ErrorObject)[""])
      ? ((errors as ErrorObject)[""] as ErrorItem[])
      : [];
  const isDynamicKeysEditor = schema["properties"] === undefined;

  // If this object has no properties to render but there is a nested
  // ErrorObject subtree, bubble those errors up to the object container.
  // For dynamic-keys objects we keep errors per-key via SchemaFormKeys,
  // so we only flatten when there is truly nothing to render.
  const containerErrors: ErrorItem[] =
    baseContainerErrors.length ||
    properties.length > 0 ||
    isDynamicKeysEditor ||
    !(errors instanceof ErrorObject)
      ? baseContainerErrors
      : flattenErrors(errors as ErrorObject);

  const isError = containerErrors.length > 0;
  const errorField = () => (
    <>
      <label className="sf-caption"></label>
      {containerErrors.map((err, idx) => (
        <span key={idx} className="sf-error">
          {err.message}
        </span>
      ))}
    </>
  );

  const titleId = path.length ? `${path.join(".")}_title` : undefined;

  return (
    <div
      className={objectClass}
      role={showTitle ? "group" : undefined}
      aria-labelledby={showTitle ? titleId : undefined}
    >
      {showTitle && (
        <div className="sf-title" id={titleId}>
          {collapsible && (
            <span
              className={collapserClasses}
              onClick={onCollapserClick}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onCollapserClick();
                }
              }}
              role="button"
              tabIndex={0}
              aria-expanded={!collapsed}
              aria-label={collapsed ? "Expand" : "Collapse"}
            ></span>
          )}
          {fieldCaption(schema, path, value) || "\u00A0"}
        </div>
      )}
      {!collapsed && (
        <div className="sf-object-fieldset fieldset">
          {schema["properties"] !== undefined ? (
            topOrder.map((subOrder) =>
              renderSection(subOrder, properties, requireds)
            )
          ) : (
            <SchemaFormKeys
              schema={schema}
              path={path}
              value={value}
              errors={errors}
              onFocus={onFocus}
              onBlur={onBlur}
              onEditor={onEditor}
              context={context}
            />
          )}
        </div>
      )}
      {isError && (
        <div className="sf-row sf-error-row">
          {errorField()}
        </div>
      )}
    </div>
  );
}
