# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Common commands

### Install dependencies
- From the repo root: `npm install`
- For the demo app in `example/`: `cd example && npm install`

### Build the library
- Main build (Rollup, writes logs to `rollup-output.txt`):
  - `npm run build`
- Plain Rollup build without redirecting stderr:
  - `npm run build-plain`
- Compile SCSS to CSS used by the library:
  - `npm run sass`

### Run tests
- Run the full Jest test suite from the root:
  - `npm test`
- Run a single test file (Jest 24):
  - `npm test -- src/schema/schema.test.ts`
  - or by pattern: `npm test -- schema.test.ts`

### Work with the example app
- Link the local library into the example (from `README` in `example/`):
  - `npm link` (from the repo root, once)
  - `cd example`
  - `npm install`
  - `npm link @restspace/schema-form`
  - `cd ..`
  - `npm install`
- Start the example app (Create React App):
  - `cd example && npm start`
- Run example app tests:
  - `cd example && npm test`
- Build the example app:
  - `cd example && npm run build`

## High-level architecture

### Overview
- This repo contains the TypeScript React library `@restspace/schema-form`, a JSON Schema–driven form generator, plus a Create React App demo under `example/`.
- Build artifacts live in `build/` (CJS and ES modules). The source of truth is `src/`.
- `rollup.config.mjs` bundles from `src/index.tsx` to `build/index.js` (CJS) and `build/index.es.js` (ES module), using `rollup-plugin-typescript2`, `@rollup/plugin-node-resolve`, `@rollup/plugin-commonjs`, `@rollup/plugin-json`, `rollup-plugin-sass`, and `rollup-plugin-img`.
- `tsconfig.json` compiles to `build/` with strict type-checking, JSX `react`, and declaration output.

### Public API surface (`src/index.tsx`)
- Entry point: re-exports the main components and utilities used by consumers:
  - Default export: `SchemaForm` (core controlled form component).
  - Named exports include:
    - `SchemaSubmitForm`, `SchemaPagedForm` and their prop types.
    - `SchemaFormComponentWrapper`, `SchemaFormComponent`, `ComponentForType`.
    - Type-level props interfaces (`ISchemaFormProps`, `ISchemaComponentProps`, `ISchemaContainerProps`).
    - `ValueDispatch`, `ValueAction` for consumer-side interaction with the value context.
    - `IUploadEditorContext`, `sendFileAsBody` for file upload integration.
    - `getByPath`, `emptyValue`, `fieldCaption`, and `ErrorObject`.
- When adding new top-level capabilities intended for external use, ensure they are exported here so library consumers and the example app can access them.

### Rendering pipeline and state flow (`src/components`)
- **`schema-form.tsx` (core form component)**
  - Accepts a JSON Schema (or schema array) and a controlled `value` object.
  - Builds an `ISchemaFormContext` containing:
    - `components`: a map from field type string (e.g. `string`, `date-time`, `currency`, `upload`, `radioButtons`) to React components.
    - `containers`: a map from container type string (e.g. `array`, `object`, `multiCheck`, `oneOfRadio`) to React components.
    - `schemaContext`: an instance of `SchemaContext` (see below) which wraps JSON Schema validation/resolution.
    - `componentContext`: arbitrary user data for custom editors (also used internally for things like currency symbol and grid layout mode).
    - `collapsible` and a flag `outerPropsChange` used by container editors to react differently to external vs internal changes.
  - Tracks `currentValue` with `useReducer(valueReducer, value)` where `valueReducer` comes from `schema-form-value-context.ts`.
  - Exposes a `ValueDispatch` context that editors use to issue `ValueAction`s (e.g. `Set`, `Create`, `Delete`, `Up`, `Down`, `Duplicate`).
  - On value change, recomputes validation errors via `validate(schema, currentValue, context.schemaContext)` and forwards `(newValue, path, errors, actionType)` to the `onChange` callback when appropriate.
  - Supports `changeOnBlur`, `showErrors`, `onFocus`, `onBlur`, `onEditor`, `onError`, `collapsible`, `gridMode`, and custom `schemaResolver`.

- **`schema-submit-form.tsx`**
  - Wraps `SchemaForm` with submit semantics and dirty tracking:
    - Accepts `onSubmit(value) => Promise<boolean>`, `onSubmitError(value, ErrorObject)`, `onDirty(isDirty)` and `makeSubmitLink(onClick)`.
    - Maintains its own internal `currentValue`, `currentErrors`, `submitted`, and `dirty` state.
    - Runs validation on submit via `validate(schema, currentValue, new SchemaContext(schema))` and only calls `onSubmit` when errors are empty; if `onSubmit` resolves `true`, resets dirty state.
    - Controls when field-level errors are displayed by toggling `showErrors` on the inner `SchemaForm`.

- **`schema-paged-form.tsx`**
  - Adds pagination semantics on top of `SchemaForm` using a multi-page schema:
    - Expects a schema whose top-level `properties` include `page0`, `page1`, …; `props.page` holds the current page index.
    - Maintains overall `value` where each `pageN` key holds that page's sub-object while rendering only the current page's sub-schema and value.
    - On `onPage(nextPage)` and `onSubmit()`, validates against the appropriate sub-schema or full schema via `validate` and `SchemaContext` and then calls `onPage(value, newPage, previousPage)` or `onSubmit(value, page)` / `onSubmitError(value, page, errors)`.
    - Uses `makePreviousLink`, `makeNextLink`, and `makeSubmitLink` render props for navigation controls.

- **`component-for-type.tsx` and container components**
  - `ComponentForType` is the central dispatcher for rendering either a container or a leaf field:
    - Resolves `$ref` via `context.schemaContext.resolver`.
    - Applies JSON Schema conditionals (`if`/`then`/`else`, `anyOf`, `allOf`) through `applyConditional` to derive an effective `mergedSchema` per value.
    - Chooses a container implementation from `context.containers[containerType(schema)]` when the schema describes an `array`/`object` or a custom container editor.
    - Falls back to `SchemaFormComponentGeneric` which renders a leaf editor based on `fieldType(schema)` and the `context.components` map.
  - `SchemaFormArray` and `SchemaFormObject` implement the default container behaviour:
    - `SchemaFormArray` supports add, delete, reordering, duplicate, and collapse/expand, and uses `fieldCaption` for labeling and `ErrorObject.forKey` to scope errors per element.
    - `SchemaFormObject` drives layout from `schema.propertyOrder` (including nested grouping via nested arrays) and falls back to the plain `properties` order if no `propertyOrder` is present.
    - Both respect `context.collapsible` and set up collapsible fieldsets based on path depth.
  - `schema-form-value-context.ts` provides:
    - `ValueDispatch` React context.
    - `ValueAction` factories (`replace`, `set`, `create`, `delete`, `duplicate`, `up`, `down`, `deleteProperties`).
    - `valueReducer` that applies these operations immutably, using `lodash-es/get` and `lodash-es/set` for deep paths; this ensures React memoization (via `React.memo`) continues to work.

### JSON Schema engine (`src/schema`)
- **`schema.ts`**
  - Core helpers for interpreting JSON Schema and adapting it to UI:
    - `fieldType(schema)` and `containerType(schema)` normalize the schema's `type`, `format`, `enum`, `hidden`, and custom `editor` properties into editor selection keys.
    - `emptyValue(schema)` produces default "empty" values for `object` (`{}`) and `array` (`[]`), and `null` otherwise.
    - `fieldCaption(schema, path, value?)` provides field labels based on `title`, `objectTitle` within `value`, array indices (via `##` substitution), or a humanized version of the last path segment via `camelToTitle`.
    - `jsonPointerToPath(pointer)` converts JSON Pointer strings (including `#/...` and absolute `http...#/...` references) into a dotted/bracketed path representation compatible with `getByPath`.
  - Schema transformation and combination utilities:
    - `nullOptionalsAllowed(schema)` recursively updates a schema so any optional property can also accept `null`, and extends `oneOf` arrays in array item schemas to include a `null` option when missing.
    - `conjoin(schema0, schema1)` merges constraints of two schemas (used for `allOf`, `if`/`then`/`else` branches, and conditionals), handling `properties`, `propertyOrder`, `items`, types/enums/consts, `required`, and numeric bounds.
    - `disjoin(schema0, schema1)` merges schemas in a way suitable for `anyOf` disjunctions.
    - `fieldUnion(baseSchema, schema)` expands nested structures (objects, arrays) into a summarized representation with `$type` and `$items` fields for use by other components.
    - `expandConditionals` is an internal helper to flatten `then`/`else`, `anyOf`, and `allOf` into a single schema.
  - Conditionals and ordering:
    - `schemaHasConditional` detects whether a schema includes `if`/`then`/`else`, `anyOf`, or `allOf`.
    - `applyConditional(schema, val, context)` evaluates conditionals against the current value using `SchemaContext.validationErrors`, joining subschemas that currently validate.
    - `mergeOrders(order0, order1)` and `applyOrder(items, selector, order)` implement the custom `propertyOrder` merge logic when multiple schemas contribute ordering metadata.
  - Reference resolution and subschema cleanup:
    - `makeSchemaResolver(schemas, fallbackResolver?)` builds a function that can resolve:
      - Local JSON Pointers (`#/...`) against the first schema.
      - Full `$id` references or relative references based on the `$id` of the root schema.
    - `deleteSubschemaProperties(value, schema)` is used by editors (notably `OneOfRadioEditor`) to strip fields from a value that are no longer part of the active `oneOf` subschema.
- **`schemaContext.ts` (`SchemaContext` class)**
  - Wraps the `@exodus/schemasafe` `validator` and manages schema id handling:
    - Accepts a base schema or array of schemas, normalizes them (ensuring the root schema has a `$id`), and exposes `resolver` and `rootSchema`.
    - `validatorFor(schema, schemas?)` builds a `schemasafe` validator with `includeErrors`, `allErrors`, `allowUnusedKeywords`, and a custom `password` format.
    - `validationErrors(schema, value)` handles subschema validation by basing internal `$ref`s on the root's `$id` when necessary.
    - `baseRefsOnRoot(schema)` and its helper `baseRefsOnRootInner` clone a subschema and rewrite local `"$ref": "#..."` references to absolute URLs anchored at the root schema's `$id`.

### Error mapping (`src/error.ts`)
- Defines:
  - `ErrorItem` `{ path: string[]; message: string }` used throughout components.
  - `ErrorObject`, an object map where each key is a path segment and the value is either another `ErrorObject` or a list of `ErrorItem`s. `ErrorObject.forKey(errors, key)` extracts errors for a specific field or array index.
- `validate(schema, value, context)` is the main validation function:
  - Calls `context.validationErrors(nullOptionalsAllowed(schema), withoutNoValueProperties(value))` to get raw `schemasafe` errors.
  - Maps each error through `errorMapper`, which:
    - Converts JSON Pointer `keywordLocation` and `instanceLocation` into path arrays using `jsonPointerToPath`.
    - Optionally delegates to `onError(path, schemaPath, value, schemaValue)` for custom messages when provided.
    - Otherwise, produces user-friendly messages for common keywords (`required`, `minimum`, `maximum`, `minLength`, `maxLength`, `minItems`, `maxItems`, `pattern`, `format`, `const`).
  - Aggregates `ErrorItem`s into an `ErrorObject` via `errorPathsToObject` and `attachError`.

### Editors and custom components (`src/editors`)
- Editors are specialized renderers plugged into the `components` or `containers` maps in `schema-form.tsx` and are responsible for calling `ValueDispatch` actions when the user edits their value.
- **`radio-buttons-editor.tsx`**
  - Leaf editor for `enum`-backed string fields rendered as mutually-exclusive radio buttons.
  - Expects an `enum` array on the schema; throws if missing to surface misconfiguration.
- **`multi-select-buttons-editor.tsx`**
  - Container-style editor for `type: "array"` with `items.enum` where each enum value becomes a checkbox.
  - Maintains a string[] value, adding or removing enum values based on checked state.
- **`oneOf-radio-editor.tsx`**
  - Container editor for schemas with a top-level `oneOf` array.
  - Renders a set of radio buttons for choosing the active subschema and then delegates to `ComponentForType` to render that subschema inline.
  - On outer prop changes (`context.outerPropsChange === true`), infers the active option by validating the current value against each subschema.
  - When switching options, uses `deleteSubschemaProperties` to strip properties that no longer belong to the selected `oneOf` branch.
- **`upload-editor.tsx`**
  - Editor for single or multi-file upload fields (`editor: "upload"` or `"uploadMulti"`).
  - Integrates with `react-dropzone-esm` for drag-and-drop and file selection.
  - Drives uploads via `IUploadEditorContext` provided in `componentContext.uploadEditor` with:
    - `getFileUrl(file, path, schema): string` — where to PUT/POST the file.
    - `sendFile(url, file, progress): Promise<void>` — performs the upload and reports progress.
    - Optional `deleteFile(url): Promise<void>` — to clean up previous uploads when replacing a file.
    - `saveSiteRelative: boolean` — whether to store site-relative paths instead of absolute URLs.
  - Stores one or more URLs as a `"|"`-delimited string in the underlying value.
  - Can toggle between a visual upload/dropzone UI and a raw URL text field for power users.

### Utilities and environment detection (`src/utility.ts`)
- Generic helpers used across the library:
  - Array set operations: `intersection`, `union`.
  - `isEmpty` for object emptiness checks, `deepCopy` for simple deep cloning, `copySetPath` and `withoutNoValueProperties` for value manipulation.
  - String helpers for parsing dotted / path-like identifiers: `camelToTitle`, `upTo`, `upToLast`, `after`, `afterLast`.
  - Path navigation: `getByPath(value, path)` where `path` may include array-like segments (`"[0]"`), used heavily by validation and error mapping.
  - `parseUrl(url)` to extract scheme, domain, path, queryString, fragment, resourceName, and resourceExtension (used by the upload editor).
  - `browserInfo` and related environment detection logic for differentiating between browsers when needed.
- Tests for these helpers live in `src/utility.test.ts`.

### Styling
- SCSS sources live under `src/scss/` and are compiled to CSS in `src/css/` via `npm run sass` and the Rollup Sass plugin.
- Library consumers typically import the built CSS once, e.g. from the example app: `import "@restspace/schema-form/build/index.css";`.
- Layout classes follow a `sf-*` naming convention (e.g. `sf-form`, `sf-object`, `sf-array`, `sf-error`, `sf-upload`), so when creating new components or containers inside this repo, prefer reusing or extending that naming scheme.

### Example app (`example/`)
- A Create React App project that demonstrates typical usage patterns:
  - Basic uncontrolled and controlled forms (`SchemaForm`).
  - Submit forms with `SchemaSubmitForm` (including `onSubmit`, `onSubmitError`, and `onDirty`).
  - Paged forms with `SchemaPagedForm` and page navigation.
  - Conditional schemas, `oneOf` selectors, and custom error messages via the `onError` callback.
  - File uploads wired to `sendFileAsBody` and custom `getFileUrl`.
  - A JSON Schema playground that reads/writes schema JSON from `localStorage` and renders a live form via `SchemaForm`.
- Look at `example/src/App.js` for end-to-end examples of how the public API fits together and how to configure `componentContext` for uploads.
