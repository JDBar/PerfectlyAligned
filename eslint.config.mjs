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
		},

		settings: {
			componentWrapperFunctions: ["observer"],
		},
	},
];

export default eslintConfig;
