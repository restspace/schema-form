import React, { Component } from "react";
import "./App.css";
import "schema-form/build/index.css";
import SchemaForm from "schema-form";

const schema = {
  type: "object",
  properties: {
    salutation: {
      type: "string",
      enum: ['Mr', 'Mrs', 'Ms', 'Dr']
    },
    firstName: {
      type: "string",
      maxLength: 10
    },
    lastName: {
      type: "string",
      readOnly: true
    },
    canContact: {
      type: "boolean"
    },
    dateOfBirth: {
      type: "string",
      format: "date"
    },
    password: {
      type: "string",
      format: "password"
    },
    comments: {
      type: "string",
      editor: "textarea"
    },
    things: {
      type: "array",
      readOnly: true,
      items: {
        type: "object",
        properties: {
          first: {
            type: "string"
          },
          second: {
            type: "string"
          }
        }
      }
    },
    address: {
      type: "object",
      properties: {
        addressLine: {
          type: "string"
        },
        postcode: {
          type: "string"
        }
      },
      required: [ "postcode" ]
    }
  }
}

const value = {
  salutation: "Dr",
  firstName: "John",
  lastName: "Smith",
  canContact: false,
  password: "abc",
  things: [ { first: "thing1", second: "thing2" } ],
  address: {
    addressLine: "13 Rose St",
    postcode: ""
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { value, errors: [], path: '', focus: '' };
  }

  render() {
    return (
      <>
      <div className="App">
        <SchemaForm schema={schema} value={value}
          onChange={(value, path, errors) =>
            this.setState({ value, errors, path: path.join('.') })}
          onFocus={(path) =>
            this.setState({focus: path.join('.')})} />
      </div>
      <div>
        <div>Value: {JSON.stringify(this.state.value)}</div>
        <div>Errors: {JSON.stringify(this.state.errors)}</div>
        <div>Path: {this.state.path}</div>
        <div>Focus: {this.state.focus}</div>
      </div>
      </>
    );
  }
}

export default App;
