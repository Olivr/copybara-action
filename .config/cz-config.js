/**
 * Configuration file for commitizen customizable preset
 * https://github.com/leonardoanalista/cz-customizable#options
 * https://github.com/leonardoanalista/cz-customizable/blob/master/cz-config-EXAMPLE.js
 */

// Import your custom convention configuration
const convention = require(__dirname + '/commit-convention.json')

// Enforce convention's sentence case settings
const sentenceCase = (str, sentenceCase = true) =>
  str.replace(/^./, sentenceCase ? str[0].toUpperCase() : str[0].toLowerCase())

// Types
const types = convention.types.map(({ name, description }) => ({
  value: sentenceCase(name, convention.sentenceCase.type),
  name: sentenceCase(description, convention.sentenceCase.type),
}))

// Scopes
const scopes = convention.scopes.map((name) => ({
  name: sentenceCase(name, convention.sentenceCase.scope),
}))

const scopeOverrides = {}
const allowBreakingChanges = []

convention.types.forEach(({ name, scopeOverrides, allowBreakingChange }) => {
  // Types that can contain breaking changes
  if (allowBreakingChange === true) allowBreakingChanges.push(name)

  // Types with scopes overrides
  if (Array.isArray(scopeOverrides))
    scopeOverrides[name] = scopeOverrides.map((scope) =>
      sentenceCase(scope, convention.sentenceCase.scope)
    )
})

module.exports = {
  types,
  scopes,
  scopeOverrides,
  allowBreakingChanges,
  allowCustomScopes: convention.enable.customScopes,
  skipQuestions: [convention.enable.scopes ? '' : 'scope'],
  upperCaseSubject: convention.sentenceCase.subject,
}
