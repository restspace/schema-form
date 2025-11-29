import typescript from "rollup-plugin-typescript2";
import commonjs from "@rollup/plugin-commonjs";
import external from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import sass from "rollup-plugin-sass";
import image from "rollup-plugin-img";
import analyze from "rollup-plugin-analyzer";
//import { minify } from "rollup-plugin-esbuild";

export default {
  input: "src/index.tsx",
  output: [
    {
      file: "build/index.js",
      format: "cjs",
      exports: "named",
      sourcemap: true,
    },
    {
      file: "build/index.es.js",
      format: "es",
      exports: "named",
      sourcemap: true,
    },
  ],
  plugins: [
    image({
      limit: 10000,
    }),
    external(),
    commonjs(),
    resolve({
      mainFields: ["module", "browser", "main"],
      extensions: [
        ".mjs",
        ".esm.js",
        "cjs",
        ".js",
        ".ts",
        ".tsx",
        ".json",
        ".jsx",
      ],
    }),
    typescript(),
    json(),
    sass({
      output: true,
    }),
    // analyze({
    //   filter: "lodash-es",
    //   filterSummary: true,
    // }),
  ],
  external: ["react", "react-dom"],
};
