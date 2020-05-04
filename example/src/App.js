import React, { Component, useState, useCallback, useMemo } from "react";
import { Router, Link } from "@reach/router";
import "./App.css";
import "schema-form/build/index.css";
import SchemaForm, { SchemaSubmitForm, SchemaPagedForm, sendFileAsBody } from "schema-form";
import { ErrorBoundary } from "./ErrorBoundary";

const loginSchema = {
  type: "object",
  title: "Log In",
  properties: {
      email_x: {
          type: "string"
      },
      password_x: {
          type: "string"
      }
  },
  required: [ "email_x", "password_x" ]
}

const schema = {
  type: "object",
  properties: {
    salutation: { type: "string", enum: ['Mr', 'Mrs', 'Ms', 'Dr'] },
    firstName: { type: "string", maxLength: 10 },
    lastName: { type: "string", readOnly: true },
    canContact: { type: "string", enum: [ "yes", "no" ], editor: "radioButtons", description: "Whether can contact" },
    preferredContact: { type: "array", items: {
        type: "string", enum: [ "phone", "email", "text" ]
      },
      editor: "multiCheck"
    },
    dateOfBirth: { type: "string", format: "date" },
    password: { type: "string", format: "password" },
    comments: { type: "string", editor: "textarea" },
    files: { type: "string", editor: "upload" },
    things: { type: "array", items: {
      type: "object", properties: {
        first: { type: "string" },
        second: { type: "string" }
      } }
    },
    address: { type: "object", properties: {
        addressLine: { type: "string" },
        postcode: { type: "string" }
      },
      required: [ "postcode" ]
    }
  },
  order: [ "salutation", [ "firstName", "lastName" ], "canContact", "preferredContact", "dateOfBirth", "password", "comments", "files", "things", "address" ],
  if: {
    type: "object", properties: {
      salutation: { type: "string", const: "Dr" }
    }
  },
  then: {
    type: "object", properties: {
      isMedical: { type: "boolean" }
    },
    order: [ "canContact", "isMedical" ]
  }
}

const schemaSelector = {
  type: "object",
  properties: {
    selector: {
      type: "string",
      enum: [ "text", "checkbox", "nothing" ]
    }
  },
  anyOf: [
    {
      type: "object",
      properties: {
        selector: { type: "string", const: "text" },
        textInput: { type: "string" }
      }
    },{
      type: "object",
      properties: {
        selector: { type: "string", const: "checkbox" },
        checkboxInput: { type: "boolean" }
      }
    },{
      type: "object",
      properties: {
        selector: { type: "string", const: "nothing" }
      }
    }
  ]
}

const schemaSelector2 = {
  type: "object",
  anyOf: [
    {
      type: "object",
      properties: {
        number: { type: "string", pattern: "[0-9]+" },
        sign: { type: "boolean" }
      },
      required: [ "number" ]
    },{
      type: "object",
      properties: {
        number: { type: "string", not: { pattern: "[0-9]+" } }
      }
    }
  ]
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
          type: "number"
        },
        def: {
          type: "number"
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
    abc: "1",
    def: "2"
  }
}

function Playground() {
  let baseSchema = null;
  const baseSchemaInput = localStorage.getItem('schema');
  try {
    baseSchema = JSON.parse(baseSchemaInput);
  } catch (er) { }
  if (!baseSchema) {
    baseSchema = {
      type: "object",
      properties: {
        item1: { type: "string" }
      }
    };
  }

  const [schemaInput, setSchemaInput] = useState(JSON.stringify(baseSchema, null, 2)); 
  const [schema, setSchema] = useState(baseSchema);
  const [value, setValue] = useState({});
  const [isValid, setIsValid] = useState(true);

  const onChange = (e) => {
    const newSchemaInput = e.target.value;
    setSchemaInput(newSchemaInput);
    try {
      const newSchema = JSON.parse(newSchemaInput);
      setSchema(newSchema);
      setIsValid(true);
      localStorage.setItem('schema', newSchemaInput);
    } catch(e) {
      setIsValid(false);
    }
  }

  const valueChange = (v) => setValue(v);

  return (
    <div className='container'>
      <textarea className={'schema-input ' + (isValid ? 'valid' : 'invalid')} value={schemaInput} onChange={onChange} />
      <ErrorBoundary>
        <SchemaForm schema={schema} value={value}
          onChange={valueChange} />
      </ErrorBoundary>
      <div className='value-output'>
        <pre>
        {JSON.stringify(value, 2)}
        </pre>
      </div>
    </div>
  )
}

function Form(props) {
  const [value, setValue] = useState(testValue);
  const [valuePaged, setValuePaged] = useState(testValuePaged);
  const [valueSel, setValueSel] = useState({});
  const [valueSubmit, setValueSubmit] = useState({});
  const [errors, setErrors] = useState([]);
  const [path, setPath] = useState('');
  const [focus, setFocus] = useState('');
  const [page, setPage] = useState(0);

  const componentContext = useMemo(() => ({
    getFileUrl: (file, path, schema) => `http://localhost:3100/upload/${file.name}`,
    sendFile: sendFileAsBody
  }), []);

  const noSubmitChange = useCallback((v, p, e) => {
    setValue(v);
    setPath(p.join('.'));
    setErrors(e);
  }, []);

  const onFocus = useCallback((p) => setFocus(p.join('.')), []);

  const loginOnSubmit = useCallback(async (v) => {
    setValueSubmit(v);
    return true;
  }, []);

  const loginMakeSubmitLink = useCallback((onClick) => (
    <div onClick={onClick}>Submit</div>
  ), []);

  return (
    <>
    <div className="App">
      {props.type === "no submit" && <SchemaForm schema={schema} value={value}
        onChange={noSubmitChange}
        onFocus={onFocus}
        componentContext={componentContext} />}
      {props.type === "selector" && <SchemaForm schema={schemaSelector2} value={valueSel}
        onChange={(v, p, e) => {
          setValueSel(v);
          setPath(p.join('.'));
          setErrors(e);
        }}
        onFocus={(p) => setFocus(p.join('.'))}
        componentContext={componentContext} />}
      {props.type === "submit" && <SchemaSubmitForm schema={loginSchema} value={valueSubmit}
        onSubmit={loginOnSubmit}
        onFocus={(p) => setFocus(p.join('.'))}
        makeSubmitLink={loginMakeSubmitLink} />}
      {props.type === "paged" && <SchemaPagedForm schema={schemaPaged} value={valuePaged} page={page}
        onPage={(v, p) => {
          setValuePaged(v);
          setPage(p);
        }}
        onSubmit={(v, p) => {
          setValuePaged(v);
          alert('submitted ' + JSON.stringify(v));
        }}
        onFocus={(p) => {
          setFocus(p.join('.'));
          console.log('page in set focus ' + page);
        }}
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
      {props.type === "playground" && <Playground/>}
    </div>
    <div>
      {(props.type === "no submit") && <div>Value: {JSON.stringify(value)}</div>}
      {(props.type === "submit") && <div>Value: {JSON.stringify(valueSubmit)}</div>}
      {props.type === "selector" && <div>Value: {JSON.stringify(valueSel)}</div>}
      {props.type === "paged" && <div>Value: {JSON.stringify(valuePaged)}</div>}
      {(props.type === "no submit" || props.type === "selector") && <div>Errors: {JSON.stringify(errors)}</div>}
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
              <Link to="/selector">Selector</Link>
            </li>
            <li>
              <Link to="/single-form">Single Form</Link>
            </li>
            <li>
              <Link to="/paged-form">Paged Form</Link>
            </li>
            <li>
              <Link to="/playground">Playground</Link>
            </li>
          </ul>
        </div>
        <Router>
          <Form path="/" type="no submit"/>
          <Form path="/selector" type="selector"/>
          <Form path="/single-form" type="submit"/>
          <Form path="/paged-form" type="paged"/>
          <Form path="/playground" type="playground"/>
        </Router>
      </div>
    )
  }
}

export default App;
