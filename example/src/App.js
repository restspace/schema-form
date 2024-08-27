import React, { Component, useState, useCallback, useMemo } from "react";
import { Router, Link } from "@reach/router";
import "./App.css";
import "@restspace/schema-form/build/index.css";
import SchemaForm, {
  SchemaSubmitForm,
  SchemaPagedForm,
  sendFileAsBody,
} from "@restspace/schema-form";
import { ErrorBoundary } from "./ErrorBoundary";
import { loginSchema } from "./schemas/loginSchema";
import { schema } from "./schemas/testSchema";
import { schemaSelector } from "./schemas/selectorSchema";
import { schemaSelector2 } from "./schemas/selectorSchema2";
import { schemaPaged } from "./schemas/pagedSchema";
import { validationsSchema } from "./schemas/validationsSchema";


const testValue = {
  salutation: "Dr",
  firstName: "John",
  lastName: "Smith",
  password: "abc",
  things: [{ first: "thing1", second: "thing2" }],
  address: {
    addressLine: "13 Rose St",
    postcode: "",
  },
};

const testValuePaged = {
  page0: {
    salutation: "Dr",
    firstName: "John",
    lastName: "Smith",
  },
  page1: {
    abc: "1",
    def: "2",
  },
};

function Playground() {
  let baseSchema = null;
  const baseSchemaInput = localStorage.getItem("schema");
  try {
    baseSchema = JSON.parse(baseSchemaInput);
  } catch (er) {}
  if (!baseSchema) {
    baseSchema = {
      type: "object",
      properties: {
        item1: { type: "string" },
      },
    };
  }

  const [schemaInput, setSchemaInput] = useState(
    JSON.stringify(baseSchema, null, 2)
  );
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
      localStorage.setItem("schema", newSchemaInput);
    } catch (e) {
      setIsValid(false);
    }
  };

  const valueChange = (v) => setValue(v);

  return (
    <div className="container">
      <textarea
        className={"schema-input " + (isValid ? "valid" : "invalid")}
        value={schemaInput}
        onChange={onChange}
      />
      <ErrorBoundary>
        <SchemaForm schema={schema} value={value} onChange={valueChange} />
      </ErrorBoundary>
      <div className="value-output">
        <pre>{JSON.stringify(value, 2)}</pre>
      </div>
    </div>
  );
}

function Form(props) {
  const [value, setValue] = useState(testValue);
  const [valuePaged, setValuePaged] = useState(testValuePaged);
  const [valueSel, setValueSel] = useState({});
  const [valueSubmit, setValueSubmit] = useState({});
  const [valueValidations, setValueValidations] = useState({});
  const [errors, setErrors] = useState([]);
  const [path, setPath] = useState("");
  const [focus, setFocus] = useState("");
  const [page, setPage] = useState(0);

  const componentContext = useMemo(
    () => ({
      getFileUrl: (file, path, schema) =>
        `http://localhost:3100/upload/${file.name}`,
      sendFile: sendFileAsBody,
    }),
    []
  );

  const noSubmitChange = useCallback((v, p, e) => {
    setValue(v);
    setPath(p.join("."));
    setErrors(e);
  }, []);

  const onFocus = useCallback((p) => setFocus(p.join(".")), []);

  const loginOnSubmit = useCallback(async (v) => {
    setValueSubmit(v);
    return true;
  }, []);
  const validationsOnSubmit = useCallback(async (v) => {
    setValueValidations(v);
    return true;
  }, []);

  const loginMakeSubmitLink = useCallback(
    (onClick) => <div onClick={onClick}>Submit</div>,
    []
  );

  const onError = (path, schemaPath, value, schemaValue) => {
    if (
      path.join(".") === "address.postcode" &&
      schemaPath[schemaPath.length - 1] === "required"
    ) {
      return "Please enter a postcode";
    }
  };

  return (
    <>
      <div className="App">
        {props.type === "no submit" && (
          <SchemaForm
            schema={schema}
            value={value}
            onChange={noSubmitChange}
            onFocus={onFocus}
            onError={onError}
            componentContext={componentContext}
          />
        )}
        {[ "selector", "selector2"].includes(props.type) && (
          <SchemaForm
            schema={props.type === "selector" ? schemaSelector2 : schemaSelector}
            value={valueSel}
            onChange={(v, p, e) => {
              setValueSel(v);
              setPath(p.join("."));
              setErrors(e);
            }}
            onFocus={(p) => setFocus(p.join("."))}
            componentContext={componentContext}
          />
        )}
        {[ "submit", "validations" ].includes(props.type) && (
          <SchemaSubmitForm
            schema={props.type === "submit" ? loginSchema : validationsSchema}
            value={props.type === "submit" ? valueSubmit : valueValidations}
            onSubmit={props.type === "submit" ? loginOnSubmit : validationsOnSubmit}
            onFocus={(p) => setFocus(p.join("."))}
            makeSubmitLink={loginMakeSubmitLink}
          />
        )}
        {props.type === "paged" && (
          <SchemaPagedForm
            schema={schemaPaged}
            value={valuePaged}
            page={page}
            onPage={(v, p) => {
              setValuePaged(v);
              setPage(p);
            }}
            onSubmit={(v, p) => {
              setValuePaged(v);
              alert("submitted " + JSON.stringify(v));
            }}
            onFocus={(p) => {
              setFocus(p.join("."));
              console.log("page in set focus " + page);
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
          />
        )}
        {props.type === "playground" && <Playground />}
      </div>
      <div>
        {props.type === "no submit" && (
          <div>Value: {JSON.stringify(value)}</div>
        )}
        {[ "submit", "validations" ].includes(props.type) && (
          <div>Value: {JSON.stringify(valueSubmit)}</div>
        )}
        {["selector", "selector2"].includes(props.type) && (
          <div>Value: {JSON.stringify(valueSel)}</div>
        )}
        {props.type === "paged" && (
          <div>Value: {JSON.stringify(valuePaged)}</div>
        )}
        {(props.type === "no submit" || props.type === "selector") && (
          <div>Errors: {JSON.stringify(errors)}</div>
        )}
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
              <Link to="/selector2">Oneof Selector</Link>
            </li>
            <li>
              <Link to="/validations">Validations</Link>
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
          <Form path="/" type="no submit" />
          <Form path="/selector" type="selector" />
          <Form path="/selector2" type="selector2" />
          <Form path="/validations" type="validations" />
          <Form path="/single-form" type="submit" />
          <Form path="/paged-form" type="paged" />
          <Form path="/playground" type="playground" />
        </Router>
      </div>
    );
  }
}

export default App;
