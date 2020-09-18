/**
 * This configuration is based on the content of cz-config.js
 * Check it out first before modifying this file
 */

const { types, scopes, scopeOverrides, allowCustomScopes, upperCaseSubject } = require(__dirname + "/cz-config.js");

/**
 * Types
 */

// Determine if types should be sentence-case based on wether the first type is
const upperCaseType = types[0].value.charAt(0).toUpperCase() === types[0].value.charAt(0);

// Determine valid types
const validTypes = types.map((type) => type.value);

/**
 * Scopes
 */

// Valid scopes are any of scopes and scopes overrides
let validScopes = scopes.map((scope) => scope.name);
Object.keys(scopeOverrides).forEach((k) => Array.prototype.push.apply(validScopes, scopeOverrides[k]));

// If custom scopes are not allowed, throw an error
// Otherwise only warn if the commit contains a custom scope
const scopeValidationLevel = allowCustomScopes ? 1 : 2;

module.exports = {
  extends: ["@commitlint/config-conventional"],

  // Add your own rules. See https://commitlint.js.org/#/reference-rules
  rules: {
    "scope-enum": [scopeValidationLevel, "always", validScopes],
    "type-enum": [2, "always", validTypes],
    "subject-case": upperCaseSubject ? [1, "always", ["sentence-case"]] : undefined,
    "type-case": upperCaseType ? [1, "always", ["sentence-case"]] : undefined,
  },
};
