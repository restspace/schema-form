export const loginSchema = {
    type: "object",
    title: "Log In",
    properties: {
      email_x: {
        type: "string",
      },
      password_x: {
        type: "string",
      },
      opts: {
        type: "string",
        enum: ["a", "b", "c"],
        editor: "radioButtons"
      }
    },
    required: ["email_x", "password_x", "opts"],
  };