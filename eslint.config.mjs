import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      parser: tsparser,
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      "@typescript-eslint/no-var-requires": "off",
    },
  },
  {
    files: ["src/migrations/*.js", "src/config/sequelize.config.js"],
    languageOptions: {
      sourceType: "commonjs",
    },
    rules: {
      "no-undef": "off",
      "@typescript-eslint/no-var-requires": "off",
    },
  },
];
