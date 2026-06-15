import React, { useState, useEffect, useCallback, useRef } from "react";
import SchemaForm from "./schema-form";
import { ISchemaFormProps } from "./schema-form";
import { ErrorObject, validate } from "../error";
import { isEmpty, deepCopy } from "../utility";
import { emptyValue } from "../schema/schema";
import isEqual from "lodash-es/isEqual";
import { SchemaContext } from "../schema/schemaContext";
import { JSONSchema } from "./schema-form-interfaces";

export interface ISchemaPagedFormProps extends ISchemaFormProps {
  onSubmit?(value: object, page: number): void;
  onSubmitError?(value: object, page: number, errors: ErrorObject): void;
  onPage?(value: object, page: number, previousPage: number): void;
  makeNextLink(
    nextPage: number,
    onClick: (page: number) => void
  ): React.ReactNode;
  makePreviousLink(
    previousPage: number,
    onClick: (page: number) => void
  ): React.ReactNode;
  makeSubmitLink(onClick: () => void): React.ReactNode;
  page: number;
}

export default function SchemaPagedForm(props: ISchemaPagedFormProps) {
  // The paged form always works with a single object schema (pages live under
  // its `properties`); narrow it once for typed keyword access.
  const schemaObj = props.schema as JSONSchema;
  const propsValue = props.value as { [key: string]: any };
  const pageSchema = schemaObj["properties"]["page" + props.page];
  const [value, setValue] = useState(props.value);
  const refLastPropsValue = useRef(props.value);
  const refValue = useRef(value);
  const [pageValue, setPageValue] = useState(
    propsValue["page" + props.page] || {}
  );
  const [entered, setEntered] = useState(false);

  // feed value into state when props change
  useEffect(() => {
    if (!isEqual(props.value, refLastPropsValue.current)) {
      const pageKey = "page" + props.page;
      // Don't mutate the parent-owned props object; derive a local copy that
      // guarantees the current page bucket exists.
      const nextValue: { [key: string]: any } = propsValue[pageKey]
        ? props.value
        : { ...props.value, [pageKey]: {} };
      setValue(nextValue);
      refValue.current = nextValue;
      setPageValue(nextValue[pageKey]);
    }
    refLastPropsValue.current = props.value;
  }, [props.value, refLastPropsValue, props.page]);

  useEffect(() => {
    setEntered(false);
    const pageKey = "page" + props.page;
    setPageValue(propsValue[pageKey] || {});
  }, [props.page]);

  // if (!pageSchema) return (
  //     <></>
  // );

  const onChange = useCallback(
    (newPageValue: object, path: string[], errors: ErrorObject) => {
      const rValue = deepCopy(refValue.current);
      const newValue = { ...rValue, ["page" + props.page]: newPageValue };
      setValue(newValue);
      setPageValue(newPageValue);
      if (props.onChange) props.onChange(deepCopy(newValue), path, errors);
      refValue.current = newValue;
    },
    [props.onChange, props.page, refValue]
  );

  function onPage(page: number) {
    setEntered(true);
    const pageKey = "page" + props.page;
    const errors = validate(
      schemaObj["properties"][pageKey],
      (value as { [key: string]: any })[pageKey],
      new SchemaContext(props.schema)
    );
    if (props.onPage && isEmpty(errors)) props.onPage(value, page, props.page);
  }

  function onSubmit() {
    setEntered(true);
    const errors = validate(
      props.schema,
      value,
      new SchemaContext(props.schema)
    );
    if (props.onSubmit && isEmpty(errors)) {
      props.onSubmit(value, props.page);
    } else if (!isEmpty(errors) && props.onSubmitError) {
      props.onSubmitError(value, props.page, errors);
    }
  }

  const pageLast = Object.keys(schemaObj["properties"]).reduce(
    (currCount, key) => {
      let val = 0;
      if (key.substr(0, 4) === "page") val = parseInt(key.substr(4));
      return val > currCount ? val : currCount;
    },
    0
  );

  const hasLeft = props.page > 0;
  const hasRight = props.page < pageLast;

  return (
    <form className="sf-submit-form">
      <SchemaForm
        {...props}
        value={pageValue}
        schema={pageSchema}
        onChange={onChange}
        showErrors={entered}
      />
      <div className="sf-buttons">
        <div
          className={
            hasLeft ? "sf-pager sf-left-pager" : "sf-pager sf-no-button"
          }
        >
          {hasLeft && props.makePreviousLink(props.page - 1, onPage)}
        </div>
        <div
          className={
            hasRight ? "sf-pager sf-right-pager" : "sf-pager sf-submit-pager"
          }
        >
          {hasRight && props.makeNextLink(props.page + 1, onPage)}
          {!hasRight && props.makeSubmitLink(onSubmit)}
        </div>
      </div>
    </form>
  );
}
