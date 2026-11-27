import { fileURLToPath } from "node:url";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import obsidianmd from "eslint-plugin-obsidianmd";

export default defineConfig([
	globalIgnores([
		"node_modules",
		"dist",
		"main.js",
		"esbuild.config.mjs",
		"version-bump.mjs",
	]),
	...obsidianmd.configs.recommendedWithLocalesEn,
	{
		files: ["**/*.ts"],
		extends: [
			tseslint.configs.strictTypeChecked,
			tseslint.configs.stylisticTypeChecked,
		],
		rules: {
			// strictTypeChecked turns these back on; obsidianmd replaces/handles them
			"@typescript-eslint/no-misused-promises": "off",
			"@typescript-eslint/no-require-imports": "off",
			// Preserve obsidianmd's allowance for display() while minAppVersion < 1.13.0
			"@typescript-eslint/no-deprecated": [
				"warn",
				{
					allow: [
						"caretRangeFromPoint",
						{ from: "package", package: "obsidian", name: "display" },
						{ from: "file", name: "display" },
					],
				},
			],

			// Obsidian UI copy guidelines (off by default since 0.5.0)
			"obsidianmd/ui/sentence-case": ["warn", { enforceCamelCaseLower: true }],

			// Core ESLint best-practice rules
			"curly": ["error", "all"],
			"eqeqeq": ["error", "always"],
			"no-var": "error",
			"prefer-const": "error",
			"object-shorthand": "warn",
			"prefer-template": "warn",
			"no-else-return": "warn",
			"no-lonely-if": "warn",
			"no-nested-ternary": "warn",
		},
	},
	{
		languageOptions: {
			parserOptions: {
				projectService: {
					allowDefaultProject: ["eslint.config.*"],
				},
				tsconfigRootDir: fileURLToPath(new URL(".", import.meta.url)),
			},
		},
	},
]);
