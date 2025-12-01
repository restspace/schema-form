import React, { useContext, useState } from "react";
import { ComponentForType } from "./component-for-type";
import { ISchemaContainerProps } from "./schema-form-interfaces";
import { ErrorItem, ErrorObject } from "../error";
import { fieldCaption, emptyValue } from "../schema/schema";
import { ValueDispatch, ValueAction } from "./schema-form-value-context";
import { last } from "../utility";

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

export function SchemaFormArray({
  schema,
  path,
  value,
  errors,
  onFocus,
  onBlur,
  onEditor,
  context,
}: ISchemaContainerProps): React.ReactElement {
  const dispatch = useContext(ValueDispatch);
  const [collapsed, setCollapsed] = useState(false);
  const itemSchema = schema["items"] || {};
  const valueArray = Array.isArray(value) ? (value as any[]) : [];
  const pathEl = path.length ? last(path) : "";
  const arrayClass = path.length === 0 ? "" : "sf-array sf-" + pathEl;
  const count = valueArray.length;
  const updatable = !(schema["readOnly"] || false);
  const gridMode = context && context['gridMode'];
  let containerErrors: ErrorItem[] =
    Array.isArray(errors)
      ? (errors as ErrorItem[])
      : path.length === 0 &&
        errors instanceof ErrorObject &&
        Array.isArray((errors as ErrorObject)[""])
      ? ((errors as ErrorObject)[""] as ErrorItem[])
      : [];

  // If there are no rendered children (empty array) but there is a nested
  // ErrorObject subtree, bubble those errors up to the container so they are
  // not stranded on non-existent items.
  if (!containerErrors.length && valueArray.length === 0 && errors instanceof ErrorObject) {
    containerErrors = flattenErrors(errors as ErrorObject);
  }

  const handleDelete = (path: string[]) => () =>
    dispatch(ValueAction.delete(path));
  const handleUp = (path: string[]) => () => dispatch(ValueAction.up(path));
  const handleDown = (path: string[]) => () => dispatch(ValueAction.down(path));
  const handleDuplicate = (path: string[]) => () =>
    dispatch(ValueAction.duplicate(path));
  const handleAdd = () =>
    dispatch(ValueAction.create(path, emptyValue(itemSchema)));

  function arrayElement(v: object, i: number) {
    const newPath = [...path, `${i}`];
    const newErrors = ErrorObject.forKey(errors, `[${i}]`);

    return (
      <div className="sf-element">
        <ComponentForType
          schema={itemSchema as object}
          path={newPath}
          value={v}
          errors={newErrors}
          onFocus={onFocus}
          onBlur={onBlur}
          onEditor={onEditor}
          context={context}
        />
        {updatable && (
          <div className="sf-array-buttons">
            <span
              className="sf-control-button sf-delete-button oi"
              onClick={handleDelete(newPath)}
              title="Delete"
            >
              x
            </span>
            {i > 0 && (
              <span
                className="sf-control-button sf-up-button oi"
                onClick={handleUp(newPath)}
                title="Move up"
              >
                ^
              </span>
            )}
            {i < count - 1 && (
              <span
                className="sf-control-button sf-down-button oi"
                onClick={handleDown(newPath)}
                title="Move down"
              >
                v
              </span>
            )}
            <span
              className="sf-control-button sf-duplication-button oi"
              onClick={handleDuplicate(newPath)}
              title="Duplicate"
            >
              +
            </span>
          </div>
        )}
      </div>
    );
  }

  const errorField = () => (
    <>
      {containerErrors.map((err, idx) => (
        <span key={idx} className="sf-error">{err.message}</span>
      ))}
    </>
  );

  const collapsible = (context.collapsible && path.length > 0) || false;
  const onCollapserClick = () => setCollapsed((collapsed) => !collapsed);
  const collapserClasses =
    "sf-collapser " + (collapsed ? "sf-collapsed" : "sf-open");
  const caption = fieldCaption(schema, path);
  const showTitle = path.length > 0 && (collapsible || caption);
  const isError = containerErrors.length > 0;

  return (
    <div className={arrayClass}>
      {showTitle && (
        <div className="sf-title">
          {collapsible && (
            <span
              className={collapserClasses}
              onClick={onCollapserClick}
            ></span>
          )}
          {fieldCaption(schema, path) || "\u00A0"}
        </div>
      )}
      {!collapsed && (
        <div className="sf-array-fieldset fieldset">
          {valueArray.map((v, i) => (
            <React.Fragment key={i}>{arrayElement(v, i)}</React.Fragment>
          ))}
        </div>
      )}
      {updatable && (
        <span
          className="sf-control-button sf-add-button"
          onClick={handleAdd}
          title="Add new"
        >
          +
        </span>
      )}
      {isError && (gridMode
            ? errorField()
            : <div className="sf-row sf-error-row">
                {errorField()}
            </div>
        )}
    </div>
  );
}
