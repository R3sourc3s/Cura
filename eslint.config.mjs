import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // The "fetch on mount + track a loading flag" pattern (React's own
      // documented approach for effects) trips this rule across most of the
      // dashboard's data-loading pages. It flags a real but minor perf nit
      // (one extra synchronous re-render before data arrives), not a
      // correctness bug — downgraded so it stays visible without blocking
      // CI/builds on ~50 pre-existing, intentional call sites.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
