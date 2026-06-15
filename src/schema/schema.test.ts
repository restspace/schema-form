import { nullOptionalsAllowed, conjoin, disjoin, mergeOrders, applyOrder } from './schema';

it('nullOptionals simple', () => {
    let nopts = nullOptionalsAllowed({
    type: 'string'
    });
    expect(nopts['type']).toEqual([ 'string', 'null' ]);
});
it('nullOptionals properties', () => {
    let nopts = nullOptionalsAllowed({
        type: 'object',
        properties: {
            'propA': {
                'type': 'string'
            },
            'propB': {
                'type': ['date', 'boolean']
            }
        }
    });
    expect(nopts['properties']['propA']['type']).toEqual(['string', 'null']);
    expect(nopts['properties']['propB']['type']).toEqual(['date', 'boolean', 'null']);
})

it('conjoin minimal', () => {
    let simple0 = {
        properties: {
            propA: {
                type: 'string'
            }
        }
    };
    let simple1 = {
        properties: {
            propB: {
                type: 'string'
            }
        }
    };
    let conj = conjoin(simple0, simple1) || {};
    expect(conj['properties']['propA']['type']).toBe('string');
    expect(conj['properties']['propB']['type']).toBe('string');
});

it('conjoin maximal', () => {
    let maxl0 = {
        properties: {
            propA: {
                properties: {
                    propAA: {
                        type: 'number'
                    }
                }
            },
            propB: {
                type: 'string'
            },
            propArr: {
                type: 'array',
                items: {
                    properties: {
                        propArrA: {
                            type: 'string'
                        }
                    }
                }
            }
        }
    };
    let maxl1 = {
        properties: {
            propA: {
                properties: {
                    propAB: {
                        type: 'string'
                    }
                }
            },
            propB: {
                format: 'email'
            },
            propArr: {
                type: 'array',
                items: {
                    properties: {
                        propArrA: {
                            type: 'string'
                        }
                    }
                }
            }
        }
    };
    let conj = conjoin(maxl0, maxl1) || {};
    expect(conj['properties']['propB']['type']).toBe('string');
    expect(conj['properties']['propB']['format']).toBe('email');
    expect(conj['properties']['propA']['properties']['propAA']['type']).toBe('number');
    expect(conj['properties']['propA']['properties']['propAB']['type']).toBe('string');
    expect(conj['properties']['propArr']['items']['properties']['propArrA']['type']).toBe('string');
})

it("merge orders", () => {
    let merged = mergeOrders([ "one", "two", "three" ], [ "two", "two and a half" ]);
    expect(merged[2]).toBe('two and a half');
    merged = mergeOrders([ "one", "two", "three", "four", "five" ], [ "two", "two and a third", "two and 2 thirds", "four", "four and a half" ]);
    expect(merged[3]).toBe("two and 2 thirds");
    expect(merged[6]).toBe("four and a half");
});

it("apply order", () => {
    let ordered = applyOrder([[ "x", 1 ], [ "y", 2 ], [ "z", 3 ]], ([key, _]) => key.toString(), [ "z", "y" ]);
    expect(ordered).toEqual([[ "z", 3], [ "y", 2], [ "x", 1 ]]);
});

describe("conjoin bound merging (intersection)", () => {
    it("takes the tighter (smaller) maximum", () => {
        expect(conjoin({ type: "number", maximum: 5 }, { maximum: 10 })!["maximum"]).toBe(5);
        expect(conjoin({ type: "number", maximum: 10 }, { maximum: 5 })!["maximum"]).toBe(5);
    });
    it("takes the tighter (larger) minimum", () => {
        expect(conjoin({ type: "number", minimum: 5 }, { minimum: 2 })!["minimum"]).toBe(5);
        expect(conjoin({ type: "number", minimum: 2 }, { minimum: 5 })!["minimum"]).toBe(5);
    });
    it("does not let a maximum leak into the minimum (fall-through regression)", () => {
        const merged = conjoin({ type: "number", maximum: 5 }, { maximum: 10 })!;
        expect(merged["minimum"]).toBeUndefined();
    });
});

describe("disjoin bound merging (union)", () => {
    it("takes the looser (larger) maximum", () => {
        expect(disjoin({ type: "number", maximum: 5 }, { maximum: 10 })!["maximum"]).toBe(10);
        expect(disjoin({ type: "number", maximum: 10 }, { maximum: 5 })!["maximum"]).toBe(10);
    });
    it("takes the looser (smaller) minimum", () => {
        expect(disjoin({ type: "number", minimum: 5 }, { minimum: 2 })!["minimum"]).toBe(2);
        expect(disjoin({ type: "number", minimum: 2 }, { minimum: 5 })!["minimum"]).toBe(2);
    });
});

