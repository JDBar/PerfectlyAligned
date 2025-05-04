import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import pluginMobx from "eslint-plugin-mobx";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

const eslintConfig = [
	...compat.extends("next/core-web-vitals", "next/typescript"),

	// Add MobX recommended config
	pluginMobx.flatConfigs.recommended,

	// Optional: Override specific MobX rules if needed
	{
		rules: {
			// Ensure React components using MobX state are wrapped with observer
			"mobx/missing-observer": "warn",

			// Make sure makeObservable annotates all fields in classes
			"mobx/exhaustive-make-observable": "warn",

			// Display name is required for React components
			"react/display-name": "warn",

			// Allow unused variables if they start with underscore
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
					caughtErrorsIgnorePattern: "^_",
				},
			],
		},

		// This allows the "react/display-name" rule to work for MobX components wrapped with `observer`.
		settings: {
			componentWrapperFunctions: ["observer"],
		},
	},

	// Override for Next.js-specific files to disable MobX rules
	{
		files: [
			"**/app/**/page.tsx",
			"**/app/**/layout.tsx",
			"**/app/**/loading.tsx",
			"**/app/**/error.tsx",
			"**/app/**/not-found.tsx",
			"**/app/**/route.ts",
			"**/pages/**/*.tsx",
		],
		rules: {
			// Disable MobX-specific rules for Next.js files
			"mobx/missing-observer": "off",
			"mobx/exhaustive-make-observable": "off",
		},
	},
];

export default eslintConfig;
