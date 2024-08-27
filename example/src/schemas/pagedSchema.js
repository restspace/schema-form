export const schemaPaged = {
    type: "object",
    properties: {
      page0: {
        type: "object",
        properties: {
          salutation: {
            type: "string",
            enum: ["Mr", "Mrs", "Ms", "Dr"],
          },
          firstName: {
            type: "string",
            maxLength: 10,
          },
          lastName: {
            type: "string",
            readOnly: true,
          },
        },
      },
      page1: {
        type: "object",
        properties: {
          abc: {
            type: "number",
          },
          def: {
            type: "number",
          },
        },
      },
    },
  };