import { JSONSchema } from "../components/schema-form-interfaces";

// Maps node-level uiSchema keys onto the in-schema keywords the renderer already
// understands. Nested entries (property names, and `ui:items` for arrays) are not
// listed here — they are threaded down to each child node by the containers, so
// that hints applied here run *after* a $ref has been resolved.
const UI_KEY_MAP: { [uiKey: string]: string } = {
  "ui:editor": "editor",
  "ui:hidden": "hidden",
  "ui:order": "propertyOrder",
  "ui:className": "className",
  "ui:readonly": "readOnly",
  "ui:title": "title",
  "ui:description": "description",
};

// Overlay the node-level `ui:*` hints from `uiSchema` onto `schema`, returning a
// shallow copy only when a hint actually applies (otherwise the original schema,
// so memoization / reference equality is preserved for the common no-uiSchema case).
export function applyUiHints(
  schema: JSONSchema,
  uiSchema: any
): JSONSchema {
  if (!uiSchema || typeof uiSchema !== "object") return schema;

  let out = schema;
  for (const uiKey in uiSchema) {
    const target = UI_KEY_MAP[uiKey];
    if (!target) continue; // property name or ui:items — handled by threading
    if (out === schema) out = { ...schema };
    out[target] = uiSchema[uiKey];
  }
  return out;
}
