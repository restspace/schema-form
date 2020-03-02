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
### Types
| Type | Implementation |
|---------|----------------|
| type: string | Generally implemented as an input type="text" |
| type: number | By default a text input field type="number" |
| type: boolean | By default a checkbox input |
| type: object | The top level field will generally be an object: below this an object is a subsection on the form and a subobject in the Javascript object value |
| type: array | An array is by default shown as a user-manageable list of fields or subsections in the form, and corresponds to a Javascript array in the object value |
| type: null | This field won't be shown on the form |
| type: [ multiple types ] | This is not supported |
### Type specific keywords
| Type: Keyword | Implementation |
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
| object: required | Implemented as validation |
| object: propertyNames | Implemented as validation |
| object: minProperties | Implemented as validation |
| object: maxProperties | Implemented as validation |
| object: dependencies | Not supported |
| object: patternProperties | Not supported |
| object: order | NON-STANDARD. This custom keyword should be followed by a list of property names as strings or sublists of the same. It has no effect on validation. It allows specification of the order in which properties are displayed in the data entry form. See below for how orders are merged with combined schemas. Sublists are rendered contained within an outer div to allow more control over layout. |
| object: currencySymbol | NON-STANDARD. This custom keyword can only be present on the top-level schema object. It determines the string used as a currency prefix for the currency editor. |
| object: additionalProperties | Assumed to be true when validating, and false when constructing a UI. See below for more. This means that additionalProperties: false in a schema is not supported. |
| array: items | This schema is used to render each subsection of the array. Tuple validation (where items is a list of schemas) is not supported. |
| array: contains | Not supported except for validation |
| array: additionalItems | Not supported |
| array: length | Implemented only as validation |
| array: uniqueItems | Implemented as validation |
| generic: title | The label of a field uses title for preference, otherwise it defaults to convering camel case into separated words e.g. initialRepeatingCost -> Initial repeating cost |
| generic: description | Description is rendered as part of the label and can be styled differently |
| generic: default | Not supported. Normally a default would be set on the initial value object passed to the form. |
| generic: enum | A string-typed schema with an enum property will be rendered by default as a drop-down list i.e. an HTML select |
| generic: const | Only implemented as validation: for use in conditionals only. |
| generic: editor | NON-STANDARD. This custom keyword which has no effect on validation allows definition of an editor to be used to render this schema. See Built-in editors below for a list of possibilities. |
| combiner: allOf | A conjoin (see below) is done between the list of subschemas given and the main schema. Validation is also applied |
| combiner: anyOf | A disjoin (see below) is done between the list of subschemas given filtered to those which when conjoined to the parent schema validate against the current entered values. This is then conjoined with the main schema. Validation is also applied |
| combiner: oneOf | Not supported |
| combiner: not | Only supported as validation |
| conditional: if then else | Supported by validating the current values against the 'if' schema, then conjoining the main schema with the 'then' clause if the validate, or else the 'else' clause if they don't |
| references: $ref | Not yet supported |
| references: $id | Not yet supported |

### Rendering based on combiners and conditionals
Combiners and conditionals are a powerful means for creating conditional forms,
however it is conceptually difficult to understand how they should be used to build a UI.

Schema-form's rationale for how it renders a data entry UI for a JSON schema is based on providing a UI that can be used to enter AT LEAST all the possible allowed values the JSON schema might validate. With arrays and primitives, it is pretty clear what these allowed values are. With an object, there is an ambiguity about the semantics of the properties. This is expressed by the 'additionalProperties' keyword, which says whether it is allowed for properties not listed to validate or whether they are forbidden.

'additionalProperties' is assumed to be true when validating. Otherwise there is no way a conditional schema could add properties to the base schema. Given this, conjoining two sets of properties results in a properties object containing the union of the properties, and where the property exists in both sets, the subschema of that property is the conjunction of the subschemas in the two sets.

'additionalProperties' is however taken as if it were false when constructing a UI, i.e. it is assumed that the user will not be able to add data for any additional properties.

This inconsistency is required to cross the bridge between a constraint validation language where each element in the language restricts the output to a UI language where each element of the UI extends the output.

The result of adding an 'allOf' property to a schema is straightforward according to this method, you simply conjoin all the schema constraints with the parent schema and render the UI which results.

However for the 'anyOf' property a problem arises as you have now created a number of disjoint possibilities where you may have a property in one and not in another. This requires the UI to take on different states corresponding to the 'anyOf' subschemas. To choose which state(s) to use, schema-form looks at the current value and uses it to rule out any subschemas which do not currently validate. If used carefully, 'anyOf' can then be used to produce a usable conditional form: however it is easy to create a situation where the form contains current values which mean it cannot be transitioned to allow data entry which would validate to another 'anyOf' subschema.

Similarly, the 'if', 'then', 'else' keywords are used on the basis that the UI to be shown is the one conjoining the subschema on the 'then' keyword if the 'if' subschema currently validates, or the 'else' keyword if not. This is a little less likely to result in an unusable form and works better for conditional form generation than 'anyOf'. Indeed an ideal structure for a form with many conditional elements is 'allOf' with a number if 'if' 'then' 'else' subschemas.

We may include an optional feature where the 'anyOf' property gives rise to a UI element allowing manual selection of which 'anyOf' clause the user wishes to satisfy. This UI element would have no effect on the output value.

## Built-in and Custom editors
### Built-in editors
schema-form has default editors for all schemas it supports. However a number of obvious alternatives are included as built-in options that can be made use of via the custom 'editor' schema property.

Here are the built-in editors:
| Keyword | Valid for Type | Description |
|---------|----------------|-------------|
| textarea | string | Renders a textarea HTML tag rather than an input for text entry |
| currency | number | Renders a text entry box with an automatic currency label (set with the currencySymbol property on the top-level schema object). Supplies a decimal number to the output value. |
| hidden | string | Renders a type='hidden' text box |
| multicheck | array of enums | Renders a multi-select set of check boxes which supplies an array of values of an enum whose values correspond to the check box labels |
| upload | string | Renders a file upload. The behaviour of the file upload is determined by two functions set up on the componentContext prop which (see below) is an object containing customisation for components. The functions are:





