# React JSON Schema Form Generator
This tool is designed to drastically reduce the effort needed to create complex forms in React. It uses JSON schema as a description language for the form you want to create.
## JSON schema
JSON Schema is a (provisional) web standard defining a system for describing validity conditions on a JSON object. It is described here: [https://json-schema.org/](https://json-schema.org/).

The schema-form library provides several components which take an arbitrary JSON schema and render it to a form suitable for entering data for Javascript objects which satisfy that schema. The schema can then also be used for validation.

JSON schema is an extremely powerful descriptive language and this library while not yet implementing every feature of JSON schema includes the most powerful ones:
- list of different fields of all standard form field types plus others
- forms with arbitrary nested subsections
- forms with arbitrary nested lists (with ability to create, delete and reorder items)
- powerful conditionality system allowing for fields or sections to appear conditional on other values, lists of different kinds of subsections etc.
- complex validation rules

## Form generation features
The form components manage the entered data as a single JSON object. The initial value of this object can be passed in as a prop and the form can be 'controlled' in the React sense by setting the value prop using the onChange event prop.

Form generation features include the following:
- components for a basic form, a one-page form with a submit button, or a multi-page form.
- built in form types include radio buttons group and multi-select buttons, also an editor which allows for file upload.
- custom components can be used in the form via a custom 'editor' field in the schema, to manage individual values or groups of values.
- field order can be specified along with grouping of fields into html containers which can be styled as desired.

## Supported JSON Schema features
| Keyword | Implementation |
|---------|----------------|
| type: string | Generally implemented as an input type="text" |
| type: number | By default a text input field type="number" |
| type: boolean | By default a checkbox input |
| type: object | The top level field will generally be an object: below this an object is a subsection on the form and a subobject in the Javascript object value |
| type: array | An array is shown as a user-manageable list of fields or subsections in the form, and corresponds to a Javascript array in the object value |
| type: null | This field won't be shown on the form |
| type: [ multiple types ] | This is not supported |
### Type specific keywords
| Keyword | Implementation |
|---------|----------------|
| string: length | Implemented only as validation |
| string: pattern | Implemented only as validation |
| string: format | Supported formats are described below |
| number: multipleOf | Implemented only as validation |
| number: minimum | Implemented only as validation |
| number: exclusiveMinimum | Implemented only as validation |
| number: maximum | Implemented only as validation |
| number: exclusiveMaximum | Implemented only as validation |
| object: properties | Every property is rendered as a field or form subsection |