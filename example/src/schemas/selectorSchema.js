export const schemaSelector = {
    type: "object",
    oneOf: [
      {
        type: "object",
        title: "Individual",
        properties: {
          selector: { type: "string", const: "individual", editor: "hidden" },
          salutation: { type: "string", enum: ["Mr", "Mrs", "Dr"] },
          firstName: { type: "string" },
          lastName: { type: "string" },
        },
        required: ["salutation", "lastName"]
      },
      {
        type: "object",
        title: "Company",
        properties: {
          selector: { type: "string", const: "company", editor: "hidden" },
          companyName: { type: "string" }
        },
      }
    ],
    "editor": "oneOfRadio"
  };