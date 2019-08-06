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
      type: "string"
    },
    canContact: {
      type: "boolean"
    },
    dateOfBirth: {
      type: "string",
      format: "date"
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
  address: {
    addressLine: "13 Rose St",
    postcode: ""
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { value, errors: [] };
  }

  render() {
    return (
      <>
      <div className="App">
        <SchemaForm schema={schema} value={value} onChange={(value, errors) => this.setState({ value, errors })} />
      </div>
      <div>
        Value: {JSON.stringify(this.state.value)}
        Errors: {JSON.stringify(this.state.errors)}
      </div>
      </>
    );
  }
}

export default App;
