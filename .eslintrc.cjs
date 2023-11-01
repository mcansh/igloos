/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "prefer-let"],
  rules: {
    "prefer-const": "off",
    "prefer-let/prefer-let": "error",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "import/order": [
      "error",
      {
        alphabetize: { caseInsensitive: true, order: "asc" },
        groups: ["builtin", "external", "internal", "parent", "sibling"],
        "newlines-between": "always",
      },
    ],
  },

  // Report unused `eslint-disable` comments.
  reportUnusedDisableDirectives: true,
  // Tell ESLint not to ignore dot-files, which are ignored by default.
  ignorePatterns: ["!.*.js", "!.*.mjs", "!.*.cjs"],

  env: {
    node: true,
    browser: true,
  },

  settings: {
    "import/resolver": {
      typescript: { alwaysTryTypes: true },
    },
  },
};