import React, { Component, useState } from "react";
import { Router, Link } from "@reach/router";
import "./App.css";
import "schema-form/build/index.css";
import SchemaForm, { SchemaSubmitForm, SchemaPagedForm } from "schema-form";

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
  },
  order: [ "salutation", "firstName", "lastName", "canContact", "dateOfBirth", "password", "comments", "things", "address" ],
  if: {
    type: "object",
    properties: {
      salutation: {
        type: "string",
        const: "Dr"
      }
    }
  },
  then: {
    type: "object",
    properties: {
      isMedical: {
        type: "boolean",
      }
    },
    order: [ "canContact", "isMedical" ]
  },
}

const schemaPaged = {
  type: "object",
  properties: {
    page0: {
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
        }
      }
    },
    page1: {
      type: "object",
      properties: {
        abc: {
          type: "string"
        },
        def: {
          type: "string"
        }
      }
    }
  }
}

const testValue = {
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

const testValuePaged = {
  page0: {
    salutation: "Dr",
    firstName: "John",
    lastName: "Smith"
  },
  page1: {
    abc: "hello",
    def: "goodbye"
  }
}

function Form(props) {
  const [value, setValue] = useState(testValue);
  const [valuePaged, setValuePaged] = useState(testValuePaged);
  const [errors, setErrors] = useState([]);
  const [path, setPath] = useState('');
  const [focus, setFocus] = useState('');
  const [page, setPage] = useState(0);

  return (
    <>
    <div className="App">
      {props.type === "no submit" && <SchemaForm schema={schema} value={value}
        onChange={(v, p, e) => {
          setValue(v);
          setPath(p.join('.'));
          setErrors(e);
        }}
        onFocus={(p) => setFocus(p.join('.'))} />}
      {props.type === "submit" && <SchemaSubmitForm schema={schema} value={value}
        onSubmit={(v) => {
          setValue(v);
        }}
        onFocus={(p) => setFocus(p.join('.'))}
        makeSubmitLink={(onClick) => (
          <div onClick={onClick}>Submit</div>
        )} />}
      {props.type === "paged" && <SchemaPagedForm schema={schemaPaged} value={valuePaged} page={page}
        onPage={(v, p) => {
          setValuePaged(v);
          setPage(p);
        }}
        onSubmit={(v) => {
          setValuePaged(v);
          alert('submitted ' + JSON.stringify(v));
        }}
        onFocus={(p) => setFocus(p.join('.'))}
        makePreviousLink={(previousPage, onClick) => (
          <div onClick={() => onClick(previousPage)}>Previous</div>
        )}
        makeNextLink={(nextPage, onClick) => (
          <div onClick={() => onClick(nextPage)}>Next</div>
        )}
        makeSubmitLink={(onClick) => (
          <div onClick={() => onClick(0)}>Submit</div>
        )}
        />}
    </div>
    <div>
      {props.type !== "paged" && <div>Value: {JSON.stringify(value)}</div>}
      {props.type === "paged" && <div>Value: {JSON.stringify(valuePaged)}</div>}
      {props.type === "no submit" && <div>Errors: {JSON.stringify(errors)}</div>}
      <div>Path: {path}</div>
      <div>Focus: {focus}</div>
    </div>
    </>
  );
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="lh-panel">
          <ul>
            <li>
              <Link to="/">No Form</Link>
            </li>
            <li>
              <Link to="/single-form">Single Form</Link>
            </li>
            <li>
              <Link to="/paged-form">Paged Form</Link>
            </li>
          </ul>
        </div>
        <Router>
          <Form path="/" type="no submit"/>
          <Form path="/single-form" type="submit"/>
          <Form path="/paged-form" type="paged"/>
        </Router>
      </div>
    )
  }
}

export default App;
