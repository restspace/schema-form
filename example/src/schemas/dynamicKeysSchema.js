export const dynamicKeysSchema = {
  type: "object",
  title: "Dynamic Keys Example",
  properties: {
    config: {
      type: "object",
      title: "Config properties",
      description:
        "Add arbitrary config properties; each property will have a type and optional custom editor.",
      // No 'properties' here on purpose: this triggers the SchemaFormKeys dynamic-keys editor
    },
  },
};
