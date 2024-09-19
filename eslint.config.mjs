// @ts-check

import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import jestConfig from "eslint-plugin-jest";
import eslintPluginNode from "eslint-plugin-n";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  eslintPluginNode.configs["flat/recommended"],
  jestConfig.configs["flat/recommended"],
  ...tseslint.configs.recommended,
  ...tseslint.configs.strict,
  {
    rules: {
      "n/no-unsupported-features/es-syntax": 0,
      "n/no-unsupported-features/es-builtins": 0,
      "n/no-missing-import": [
        "error",
        {
          allowModules: [],
          resolvePaths: ["src/"],
        },
      ],
      "n/no-extraneous-import": [
        "error",
        {
          allowModules: ["@jest/globals"],
        },
      ],
    },
  },
  eslintConfigPrettier,
);
