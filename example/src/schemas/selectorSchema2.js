export const schemaSelector2 = {
    type: "object",
    anyOf: [
      {
        type: "object",
        properties: {
          number: { type: "string", pattern: "[0-9]+" },
          sign: { type: "boolean" },
        },
        required: ["number"],
      },
      {
        type: "object",
        properties: {
          number: { type: "string", not: { pattern: "[0-9]+" } },
        },
      },
    ],
  };