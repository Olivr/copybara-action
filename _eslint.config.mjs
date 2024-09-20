import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import jest from "eslint-plugin-jest";
import node from "eslint-plugin-node";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: ["dist/", "lib/", "node_modules/"],
  },
  ...fixupConfigRules(
    compat.extends(
      "eslint:recommended",
      "plugin:import/errors",
      "plugin:import/warnings",
      "plugin:import/typescript",
      "plugin:node/recommended",
      "plugin:jest/recommended",
      "plugin:jest/style",
      "plugin:@typescript-eslint/recommended",
      "plugin:prettier/recommended",
      "prettier",
      "prettier/@typescript-eslint",
    ),
  ),
  {
    plugins: {
      node: fixupPluginRules(node),
      jest: fixupPluginRules(jest),
      "@typescript-eslint": fixupPluginRules(typescriptEslint),
    },

    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },

      parser: tsParser,
      ecmaVersion: 9,
      sourceType: "module",

      parserOptions: {
        project: "./tsconfig.json",
      },
    },

    settings: {
      node: {
        tryExtensions: [".js", ".json", ".node", ".ts"],
      },
    },

    rules: {
      "node/no-unsupported-features/es-syntax": 0,
      "node/no-unsupported-features/es-builtins": 0,

      "node/no-extraneous-import": [
        "error",
        {
          allowModules: ["@jest/globals"],
        },
      ],
    },
  },
];
