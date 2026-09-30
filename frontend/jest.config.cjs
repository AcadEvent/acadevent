/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          esModuleInterop: true,
          strict: true,
          module: "commonjs",
          moduleResolution: "node",
          target: "ES2022",
          jsx: "react-jsx",
          baseUrl: ".",
          paths: {
            "@/*": ["src/*"],
          },
          types: ["jest", "node"],
        },
      },
    ],
  },
};
