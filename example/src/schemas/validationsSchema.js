export const validationsSchema = {
    type: "object",
    properties: {
      email: {
        type: "string",
        format: "email",
      },
      password: {
        type: "string",
        minLength: 8,
      },
      confirmPassword: {
        type: "string",
        const: { $data: "1/password" },
      },
      patternAllCaps: {
        type: "string",
        pattern: "^[A-Z]+$",
      },
      list: {
        type: "array",
        items: {
          type: "string",
          pattern: "^[A-Z]+$",
        },
        minItems: 2,
      },
    },
    required: ["email", "password", "confirmPassword"],
}