import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

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
          "ts-ignore": true,             // ❌ disallow @ts-ignore
          "ts-expect-error": false,      // ✅ allowed
          "ts-nocheck": false,           // allowed (set to true to ban)
          "ts-check": false,             // allowed
          // Optional: require description for expect-error
          // "ts-expect-error": "allow-with-description",
          // minimumDescriptionLength: 5,

        }
      ],
    },
  },
];

export default eslintConfig;
