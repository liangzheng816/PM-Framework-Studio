import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * "Design tokens are the only truth" guard.
 *
 * Blocks raw Tailwind color utilities (e.g. `bg-emerald-500`, `text-purple-400`,
 * `border-zinc-900`) anywhere in `app/` and `components/`. All visual color must
 * come from `var(--color-*)` tokens defined in `app/globals.css`.
 *
 * Allowed: `text-white`, `text-black`, `bg-white`, `bg-black` — these are
 * semantic primitives without a numeric ramp and are used legitimately as
 * white-on-accent text (primary buttons, logo badge).
 */
const TAILWIND_COLOR_GUARD = String.raw`/\b(bg|text|border|ring|fill|stroke|from|via|to|placeholder|caret|outline|decoration|accent|divide|shadow)-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-\d/`;

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // API compiled output
    "api/dist/**",
  ]),
  {
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: `Literal[value=${TAILWIND_COLOR_GUARD}]`,
          message:
            "Use a design token (var(--color-*)) instead of a raw Tailwind color utility. See app/globals.css and the 'Design tokens are the only truth' section in CLAUDE.md.",
        },
        {
          selector: `TemplateElement[value.raw=${TAILWIND_COLOR_GUARD}]`,
          message:
            "Use a design token (var(--color-*)) instead of a raw Tailwind color utility. See app/globals.css and the 'Design tokens are the only truth' section in CLAUDE.md.",
        },
      ],
    },
  },
]);

export default eslintConfig;
