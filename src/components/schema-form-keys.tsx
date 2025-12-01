import React, { useContext, useMemo, useState, useEffect } from "react";
import { ISchemaContainerProps } from "./schema-form-interfaces";
import { ValueDispatch, ValueAction } from "./schema-form-value-context";
import { fieldCaption } from "../schema/schema";
import { ErrorItem, ErrorObject } from "../error";
import { ComponentForType } from "./component-for-type";

interface DraftState {
  originalKey: string | null; // null for new properties
  name: string;
  type: "string" | "number" | "array" | "object";
  editor: string;
}

interface FieldSpec {
  type: DraftState["type"]; // inferred or chosen type for the value at this key
  editor?: string; // optional custom editor (not persisted in value)
}

export function SchemaFormKeys(
  props: ISchemaContainerProps
): React.ReactElement {
  const { schema, path, value, errors, onFocus, onBlur, onEditor, context } = props;
  const dispatch = useContext(ValueDispatch);

  const objectValue: Record<string, any> =
    value && typeof value === "object" ? (value as Record<string, any>) : {};
  const keys = Object.keys(objectValue);
  const readOnly = schema["readOnly"] || false;

  const [draft, setDraft] = useState<DraftState | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [fieldSpecs, setFieldSpecs] = useState<Record<string, FieldSpec>>({});

  const additionalTemplate: any = useMemo(() => {
    return schema && typeof schema["additionalProperties"] === "object"
      ? { ...(schema["additionalProperties"] as object) }
      : {};
  }, [schema]);

  const availableEditors = useMemo(() => {
    const componentEditors = Object.keys(context.components || {});
    const containerEditors = Object.keys(context.containers || {});
    // De-duplicate while preserving order: components first, then containers.
    const seen = new Set<string>();
    const all: string[] = [];
    [...componentEditors, ...containerEditors].forEach((key) => {
      if (!seen.has(key)) {
        seen.add(key);
        all.push(key);
      }
    });
    return all;
  }, [context.components, context.containers]);

  const inferSpecFromValue = (val: any): FieldSpec => {
    if (Array.isArray(val)) return { type: "array" };
    if (val && typeof val === "object") return { type: "object" };
    if (typeof val === "number") return { type: "number" };
    return { type: "string" };
  };

  const initialValueForType = (t: DraftState["type"]): any => {
    switch (t) {
      case "object":
        return {};
      case "array":
        return [];
      case "number":
        return null;
      default:
        return "";
    }
  };

  useEffect(() => {
    // Ensure we have a FieldSpec for each existing key based on current values,
    // but do not persist this metadata into the external value tree.
    setFieldSpecs((prev) => {
      const next: Record<string, FieldSpec> = { ...prev };
      keys.forEach((k) => {
        if (!next[k]) {
          const val = objectValue[k];
          next[k] = inferSpecFromValue(val);
        }
      });
      // Remove specs for keys that no longer exist
      Object.keys(next).forEach((k) => {
        if (!Object.prototype.hasOwnProperty.call(objectValue, k)) {
          delete next[k];
        }
      });
      return next;
    });
  }, [keys.join("|")]);

  const schemaForKey = (key: string): object => {
    const spec = fieldSpecs[key] || inferSpecFromValue(objectValue[key]);
    const base: any = { type: spec.type };
    if (spec.editor) base.editor = spec.editor;
    if (spec.type === "array") {
      // Default array items to strings if not otherwise specified.
      base.items = { type: "string" };
    }
    return base;
  };

  function beginNewProperty() {
    if (readOnly) return;
    setLocalError(null);
    setDraft({
      originalKey: null,
      name: "",
      type: "string",
      editor: "",
    });
  }

  function beginEditProperty(key: string) {
    if (readOnly) return;
    const spec = fieldSpecs[key] || inferSpecFromValue(objectValue[key]);
    setLocalError(null);
    setDraft({
      originalKey: key,
      name: key,
      type: spec.type,
      editor: spec.editor || "",
    });
  }

  function cancelEdit() {
    setDraft(null);
    setLocalError(null);
  }

  function handleNameChange(ev: React.ChangeEvent<HTMLInputElement>) {
    if (!draft) return;
    setDraft({ ...draft, name: ev.target.value });
  }

  function handleTypeChange(ev: React.ChangeEvent<HTMLInputElement>) {
    if (!draft) return;
    setDraft({ ...draft, type: ev.target.value as DraftState["type"] });
  }

  function handleEditorChange(ev: React.ChangeEvent<HTMLSelectElement>) {
    if (!draft) return;
    setDraft({ ...draft, editor: ev.target.value });
  }

  function validateDraft(): boolean {
    if (!draft) return false;
    const trimmed = draft.name.trim();
    if (!trimmed) {
      setLocalError("Please enter a property name");
      return false;
    }
    const existingKeys = new Set(keys);
    if (draft.originalKey && draft.originalKey !== trimmed) {
      existingKeys.delete(draft.originalKey);
    }
    if (existingKeys.has(trimmed)) {
      setLocalError("A property with this name already exists");
      return false;
    }
    setLocalError(null);
    return true;
  }

  function saveDraft() {
    if (!draft || readOnly) return;
    if (!validateDraft()) return;

    const newKey = draft.name.trim();
    const newSpec: FieldSpec = {
      type: draft.type,
      editor: draft.editor || undefined,
    };

    // Update in-memory metadata for this key (not persisted in the value tree)
    setFieldSpecs((prev) => {
      const next = { ...prev };
      if (draft.originalKey && draft.originalKey !== newKey) {
        delete next[draft.originalKey];
      }
      next[newKey] = newSpec;
      return next;
    });

    // Update the actual value held in SchemaForm's state.
    if (draft.originalKey && draft.originalKey !== newKey) {
      const oldVal =
        value && (value as any)[draft.originalKey] !== undefined
          ? (value as any)[draft.originalKey]
          : initialValueForType(draft.type);
      dispatch(ValueAction.set([...path, newKey], oldVal));
      dispatch(ValueAction.deleteProperties(path, [draft.originalKey]));
    } else if (!draft.originalKey) {
      // New key: create an initial value based on the chosen type.
      dispatch(
        ValueAction.set([...path, newKey], initialValueForType(draft.type))
      );
    }

    setDraft(null);
    setLocalError(null);
  }

  function deleteProperty(key: string) {
    if (readOnly) return;
    dispatch(ValueAction.deleteProperties(path, [key]));
  }

  function renderErrorsForKey(key: string) {
    const keyErrors = ErrorObject.forKey(errors, key);
    if (!Array.isArray(keyErrors) || keyErrors.length === 0) return null;

    return (
      <div className="sf-row sf-error-row">
        <label className="sf-caption"></label>
        {(keyErrors as ErrorItem[]).map((err, idx) => (
          <span key={idx} className="sf-error">
            {err.message}
          </span>
        ))}
      </div>
    );
  }

  function handleFocus() {
    onFocus(path);
  }

  function handleBlur() {
    onBlur(path);
  }

  function typeRadio(name: string, checkedType: DraftState["type"]) {
    const options: DraftState["type"][] = [
      "string",
      "number",
      "array",
      "object",
    ];
    return (
      <div className="sf-control sf-radio-buttons">
        {options.map((opt) => (
          <span className="sf-radio" key={opt}>
            <input
              id={`${name}_type_${opt}`}
              type="radio"
              name={`${name}_type`}
              value={opt}
              checked={checkedType === opt}
              onChange={handleTypeChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              readOnly={readOnly}
            />
            <label htmlFor={`${name}_type_${opt}`}>{opt}</label>
          </span>
        ))}
      </div>
    );
  }

  function renderEditorSelect(name: string, selected: string) {
    if (!availableEditors.length) return null;
    return (
      <div className="sf-row">
        <label className="sf-caption">Editor</label>
        <select
          className="sf-control sf-enum"
          id={`${name}_editor`}
          name={`${name}_editor`}
          value={selected}
          onChange={handleEditorChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={readOnly}
        >
          <option value="">(default)</option>
          {availableEditors.map((ed) => (
            <option key={ed} value={ed}>
              {ed}
            </option>
          ))}
        </select>
      </div>
    );
  }

  function renderCollapsedRow(key: string) {
    const spec = fieldSpecs[key] || inferSpecFromValue(objectValue[key]);
    const caption = fieldCaption({}, [...path, key]);
    const labelText = caption || key;
    const typeText = spec.type;
    const editorText = spec.editor || "";

    return (
      <>
        <div className="sf-row">
          <label className="sf-caption">
            {labelText}
            <span className="sf-key-name-deemphasised">({key})</span>
          </label>
          <div className="sf-control">
            <span>
              {typeText}
              {editorText ? `, editor: ${editorText}` : ""}
            </span>
          </div>
          {!readOnly && (
            <>
              <span
                className="sf-control-button sf-edit-button"
                title="Edit property"
                onClick={() => beginEditProperty(key)}
              >
                E
              </span>
              <span
                className="sf-control-button sf-delete-button"
                title="Delete property"
                onClick={() => deleteProperty(key)}
              >
                x
              </span>
            </>
          )}
        </div>
        <ComponentForType
          schema={schemaForKey(key) as object}
          path={[...path, key]}
          value={value && (value as any)[key]}
          errors={ErrorObject.forKey(errors, key)}
          onFocus={onFocus}
          onBlur={onBlur}
          onEditor={onEditor}
          context={context}
        />
      </>
    );
  }

  function renderEditingRow() {
    if (!draft) return null;
    const isNew = !draft.originalKey;
    const rowKey = draft.originalKey || "__new__";
    const nameBase = path.concat(rowKey).join(".");

    return (
      <>
        <div className="sf-row">
          <label className="sf-caption">Property</label>
          <div className="sf-control">
            <input
              id={`${nameBase}_name`}
              type="text"
              className="sf-control sf-string"
              value={draft.name}
              onChange={handleNameChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              readOnly={readOnly}
            />
          </div>
        </div>
        <div className="sf-row">
          <label className="sf-caption">Type</label>
          {typeRadio(nameBase, draft.type)}
        </div>
        {renderEditorSelect(nameBase, draft.editor)}
        {localError && (
          <div className="sf-row sf-error-row">
            <label className="sf-caption"></label>
            <span className="sf-error">{localError}</span>
          </div>
        )}
        <div className="sf-row">
          <label className="sf-caption"></label>
          <div className="sf-inline-buttons">
            {!readOnly && (
              <>
                <span
                  className="sf-control-button sf-save-button"
                  title="Save property"
                  onClick={saveDraft}
                >
                  Save
                </span>
                <span
                  className="sf-control-button"
                  title="Cancel edit"
                  onClick={cancelEdit}
                >
                  Cancel
                </span>
              </>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {keys.map((key) =>
        draft && draft.originalKey === key ? (
          <React.Fragment key={key}>{renderEditingRow()}</React.Fragment>
        ) : (
          <React.Fragment key={key}>{renderCollapsedRow(key)}</React.Fragment>
        )
      )}
      {draft && !draft.originalKey && renderEditingRow()}
      {!readOnly && !draft && (
        <span
          className="sf-control-button sf-add-button"
          title="Add property"
          onClick={beginNewProperty}
        >
          +
        </span>
      )}
    </>
  );
}
