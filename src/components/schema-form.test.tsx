import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
// Import the component directly (not via index, which pulls in a .scss import).
import SchemaForm from "./schema-form";
import { ISchemaComponentProps } from "./schema-form-interfaces";

const objectSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    age: { type: "integer" },
    agree: { type: "boolean" },
  },
};

describe("SchemaForm rendering", () => {
  it("renders an appropriate control for each property type", () => {
    render(<SchemaForm schema={objectSchema} value={{}} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument(); // string
    expect(screen.getByRole("spinbutton")).toBeInTheDocument(); // integer
    expect(screen.getByRole("checkbox")).toBeInTheDocument(); // boolean
  });
});

describe("SchemaForm value changes", () => {
  it("reports string edits through onChange", () => {
    const onChange = jest.fn();
    render(<SchemaForm schema={objectSchema} value={{}} onChange={onChange} />);
    fireEvent.input(screen.getByRole("textbox"), { target: { value: "Alice" } });
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[onChange.mock.calls.length - 1][0]).toEqual({
      name: "Alice",
    });
  });

  it("parses integer fields to numbers", () => {
    const onChange = jest.fn();
    render(<SchemaForm schema={objectSchema} value={{}} onChange={onChange} />);
    fireEvent.input(screen.getByRole("spinbutton"), { target: { value: "42" } });
    const last = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(last.age).toBe(42);
    expect(typeof last.age).toBe("number");
  });

  it("does not mutate the value prop when editing (immutable updates)", () => {
    const value = Object.freeze({ name: "x" });
    render(<SchemaForm schema={objectSchema} value={value} onChange={() => {}} />);
    // Would throw if the reducer mutated the frozen prop.
    fireEvent.input(screen.getByRole("textbox"), { target: { value: "y" } });
    expect(value).toEqual({ name: "x" });
  });
});

describe("SchemaForm array operations", () => {
  const arraySchema = {
    type: "object",
    properties: { list: { type: "array", items: { type: "string" } } },
  };

  it("adds an item when the add button is clicked", () => {
    const onChange = jest.fn();
    render(
      <SchemaForm schema={arraySchema} value={{ list: ["a"] }} onChange={onChange} />
    );
    expect(screen.getAllByRole("textbox")).toHaveLength(1);
    fireEvent.click(screen.getByTitle("Add new"));
    const last = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(last.list).toHaveLength(2);
    expect(last.list[0]).toBe("a");
  });
});

describe("SchemaForm custom components do not leak across instances", () => {
  const Custom = (_props: ISchemaComponentProps) => (
    <div data-testid="custom-string" />
  );
  const stringSchema = {
    type: "object",
    properties: { name: { type: "string" } },
  };

  it("uses a custom component only where supplied, leaving defaults intact", () => {
    const { unmount } = render(
      <SchemaForm
        schema={stringSchema}
        value={{}}
        components={{ string: Custom }}
      />
    );
    expect(screen.getByTestId("custom-string")).toBeInTheDocument();
    unmount();

    // A second form without custom components must still get the default input
    // (regression guard against mutating the shared default component map).
    render(<SchemaForm schema={stringSchema} value={{}} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.queryByTestId("custom-string")).not.toBeInTheDocument();
  });
});
