import type { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
  clearMocks: true,
  // moduleFileExtensions: ["js", "ts"],
  extensionsToTreatAsEsm: [".ts"],
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  // testRunner: "jest-circus/runner",
  preset: "ts-jest/presets/default-esm",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { useESM: true }],
  },
  testPathIgnorePatterns: ["./dist"],
  verbose: true,
};

export default config;
