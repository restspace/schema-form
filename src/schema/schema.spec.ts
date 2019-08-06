// import { Schema } from './schema';

// describe('schema null optionals allowed', () => {
//     it('simple', () => {
//         let nopts = new Schema({
//         type: 'string'
//         }).nullOptionalsAllowed();
//         expect(nopts['type']).toEqual([ 'string', 'null' ]);
//     });
//     it('properties', () => {
//         let nopts = new Schema({
//             type: 'object',
//             properties: {
//                 'propA': {
//                     'type': 'string'
//                 },
//                 'propB': {
//                     'type': ['date', 'boolean']
//                 }
//             }
//         }).nullOptionalsAllowed();
//         expect(nopts['properties']['propA']['type']).toEqual(['string', 'null']);
//         expect(nopts['properties']['propB']['type']).toEqual(['date', 'boolean', 'null']);
//     })
// });

// describe('schema conjoin', () => {
//     it('minimal', () => {
//         let simple0 = new Schema ({
//             properties: {
//                 propA: {
//                     type: 'string'
//                 }
//             }
//         });
//         let simple1 = new Schema ({
//             properties: {
//                 propB: {
//                     type: 'string'
//                 }
//             }
//         });
//         let conj = simple0.conjoin(simple1);
//         expect(conj['properties']['propA']['type']).toBe('string');
//         expect(conj['properties']['propB']['type']).toBe('string');
//     });
    
//     it('maximal', () => {
//         let maxl0 = new Schema ({
//             properties: {
//                 propA: {
//                     properties: {
//                         propAA: {
//                             type: 'number'
//                         }
//                     }
//                 },
//                 propB: {
//                     type: 'string'
//                 },
//                 propArr: {
//                     type: 'array',
//                     items: {
//                         properties: {
//                             propArrA: {
//                                 type: 'string'
//                             }
//                         }
//                     }
//                 }
//             }
//         });
//         let maxl1 = new Schema ({
//             properties: {
//                 propA: {
//                     properties: {
//                         propAB: {
//                             type: 'string'
//                         }
//                     }
//                 },
//                 propB: {
//                     format: 'email'
//                 },
//                 propArr: {
//                     type: 'array',
//                     items: {
//                         properties: {
//                             propArrA: {
//                                 type: 'string'
//                             }
//                         }
//                     }
//                 }
//             }
//         });
//         let conj = maxl0.conjoin(maxl1);
//         expect(conj['properties']['propB']['type']).toBe('string');
//         expect(conj['properties']['propB']['format']).toBe('email');
//         expect(conj['properties']['propA']['properties']['propAA']['type']).toBe('number');
//         expect(conj['properties']['propA']['properties']['propAB']['type']).toBe('string');
//         expect(conj['properties']['propArr']['items']['properties']['propArrA']['type']).toBe('string');
//     })
// });

// describe("asFieldMap", () => {
//     it("minimal", () => {
//         let schema = {
//             type: 'string'
//         };
//         let fm = new Schema(schema).asFieldMap();
//         expect(fm['$type']).toBe('string');
//     });
//     it("maximal", () => {
//         let schema = {
//             type: 'object',
//             properties: {
//                 a: {
//                     type: 'string'
//                 },
//                 b: {
//                     type: 'object',
//                     properties: {
//                         a1: {
//                             type: 'number'
//                         },
//                     },
//                     if: {},
//                     then: {
//                         type: 'object',
//                         properties: {
//                             a1: {
//                                 type: 'number'
//                             },
//                             ax: {
//                                 type: 'string'
//                             }
//                         }
//                     }
//                 },
//                 c: {
//                     type: 'array',
//                     items: {
//                         type: 'object',
//                         properties: {
//                             c1: {
//                                 type: 'string',
//                                 format: 'datetime'
//                             }
//                         },
//                         allOf: [
//                             {
//                                 type: 'object',
//                                 properties: {
//                                     c2x: {
//                                         type: 'number'
//                                     }
//                                 }
//                             },
//                             {
//                                 type: 'object',
//                                 properties: {
//                                     c3x: {
//                                         type: 'string'
//                                     },
//                                     c4x: {
//                                         type: 'string'
//                                     }
//                                 },
//                                 if: {},
//                                 else: {
//                                     type: 'object',
//                                     properties: {
//                                         c5x: {
//                                             type: 'string'
//                                         }
//                                     }
//                                 }
//                             }
//                         ]
//                     }
//                 }
//             }
//         };
//         let fm = new Schema(schema).asFieldMap();
//         expect(fm['$type']).toBe('object');
//         expect(fm['a']['$type']).toBe('string');
//         expect(fm['c']['$type']).toBe('array');
//         let fmB = fm['b'];
//         expect(fmB['ax']['$type']).toBe('string');
//         let fmC = fm['c']['$items'];
//         let fmCiProps = [];
//         for (let prop in fmC) {
//             fmCiProps.push(prop);
//         }
//         expect(fmCiProps.length).toBe(6);
//     })
// });
