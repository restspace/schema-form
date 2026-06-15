import { valueReducer, ValueAction } from "./schema-form-value-context";

describe("valueReducer immutability / structural sharing", () => {
  it("Set updates a nested leaf without mutating the original", () => {
    const before = { a: { x: 1 }, b: { y: 2 } };
    const after: any = valueReducer(before, ValueAction.set(["a", "x"], 5));
    expect(after).not.toBe(before);
    expect(after.a.x).toBe(5);
    expect(before.a.x).toBe(1); // original untouched
  });

  it("shares the references of untouched subtrees", () => {
    const before = { a: { x: 1 }, b: { y: 2 } };
    const after: any = valueReducer(before, ValueAction.set(["a", "x"], 5));
    expect(after.b).toBe(before.b); // off the edited path -> same reference
    expect(after.a).not.toBe(before.a); // on the edited path -> cloned
  });

  it("creates missing intermediate structure", () => {
    const after: any = valueReducer({}, ValueAction.set(["a", "b"], 7));
    expect(after.a.b).toBe(7);
  });
});

describe("valueReducer array operations", () => {
  const base = () => ({ list: ["a", "b", "c"] });

  it("Up swaps an item with its predecessor", () => {
    const before = base();
    const after: any = valueReducer(before, ValueAction.up(["list", "1"]));
    expect(after.list).toEqual(["b", "a", "c"]);
    expect(before.list).toEqual(["a", "b", "c"]); // not mutated
  });

  it("Down swaps an item with its successor", () => {
    const after: any = valueReducer(base(), ValueAction.down(["list", "1"]));
    expect(after.list).toEqual(["a", "c", "b"]);
  });

  it("Delete removes the item at the index", () => {
    const after: any = valueReducer(base(), ValueAction.delete(["list", "1"]));
    expect(after.list).toEqual(["a", "c"]);
  });

  it("Duplicate inserts a copy after the index", () => {
    const after: any = valueReducer(base(), ValueAction.duplicate(["list", "1"]));
    expect(after.list).toEqual(["a", "b", "b", "c"]);
  });

  it("Create appends to the array", () => {
    const after: any = valueReducer(base(), ValueAction.create(["list"], "d"));
    expect(after.list).toEqual(["a", "b", "c", "d"]);
  });
});

describe("valueReducer other actions", () => {
  it("DeleteProperties removes the named root properties", () => {
    const after: any = valueReducer(
      { a: 1, b: 2, c: 3 },
      ValueAction.deleteProperties([], ["b"])
    );
    expect(after).toEqual({ a: 1, c: 3 });
  });

  it("Replace returns a copy decoupled from the supplied value", () => {
    const incoming = { b: 2 };
    const after: any = valueReducer({ a: 1 }, ValueAction.replace(incoming));
    expect(after).toEqual({ b: 2 });
    expect(after).not.toBe(incoming); // deep-copied, not aliased
  });
});
