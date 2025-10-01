import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // ✅ Allow "any"
      "@typescript-eslint/no-explicit-any": "off",

      // ✅ Enforce using @ts-expect-error instead of @ts-ignore
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-ignore": "ban",        // ❌ forbid @ts-ignore
          "ts-expect-error": "allow",// ✅ allow @ts-expect-error
          "ts-nocheck": "allow",     // optional, you can "ban" if you want
          "ts-check": "allow"
        }
      ],
    },
  },
];

export default eslintConfig;
