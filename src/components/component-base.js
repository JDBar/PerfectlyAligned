/**
 * Base Component Class
 *
 * A base class for web components that handles template loading,
 * CSS loading, and common functionality.
 *
 * @module components/component-base
 */

import { logError } from "../lib/logger.js";

/**
 * Base class for web components
 * @abstract
 */
export class ComponentBase extends HTMLElement {
	// Static resource cache
	static #resourceCache = new Map();

	// Resource types
	static RESOURCE_TYPE = Object.freeze({
		TEMPLATE: "template",
		STYLE: "style",
	});

	// Private fields
	#templatePath;
	#stylePath;
	#templateContent = null;
	#styleElement = null;
	#templateLoaded = false;
	#styleLoaded = false;
	#renderPending = false;

	/**
	 * Create a new component
	 * @param {string} templatePath - Path to the HTML template
	 * @param {string} stylePath - Path to the CSS file
	 */
	constructor(templatePath, stylePath) {
		super();

		// Create shadow DOM
		this.attachShadow({ mode: "open" });

		// Store paths
		this.#templatePath = templatePath;
		this.#stylePath = stylePath;
	}

	/**
	 * Called when the element is added to the DOM
	 */
	connectedCallback() {
		// Load template and styles
		this.#loadResources();
	}

	/**
	 * Load HTML template and CSS styles
	 * @private
	 */
	async #loadResources() {
		try {
			// Load template and styles in parallel
			await Promise.all([this.#loadTemplate(), this.#loadStyles()]);

			// Call render once both are loaded
			this.render();

			// Dispatch connected event
			this.dispatchEvent(
				new CustomEvent(`${this.tagName.toLowerCase()}-connected`)
			);
		} catch (error) {
			logError(`Error loading component resources: ${error.message}`);
		}
	}

	/**
	 * Generic resource loader with caching
	 * @param {string} resourcePath - Path to the resource
	 * @param {string} resourceType - Type of resource from RESOURCE_TYPE
	 * @returns {Promise<DocumentFragment|HTMLStyleElement|null>} - The loaded resource
	 * @private
	 */
	async #loadResourceWithCache(resourcePath, resourceType) {
		if (!resourcePath) {
			return null;
		}

		try {
			// Check if resource is already in cache
			const cacheKey = `${resourceType}:${resourcePath}`;
			if (ComponentBase.#resourceCache.has(cacheKey)) {
				// Return a clone of the cached resource
				return ComponentBase.#resourceCache.get(cacheKey).cloneNode(true);
			}

			// Fetch the resource
			const response = await fetch(resourcePath);
			if (!response.ok) {
				throw new Error(
					`Failed to load ${resourceType}: ${response.status} ${response.statusText}`
				);
			}

			const content = await response.text();
			let element;

			// Create the appropriate element based on resource type
			if (resourceType === ComponentBase.RESOURCE_TYPE.TEMPLATE) {
				const template = document.createElement("template");
				template.innerHTML = content;
				element = template.content;
			} else if (resourceType === ComponentBase.RESOURCE_TYPE.STYLE) {
				element = document.createElement("style");
				element.textContent = content;
			}

			// Store in cache
			ComponentBase.#resourceCache.set(cacheKey, element);

			// Return a clone of the element
			return element.cloneNode(true);
		} catch (error) {
			logError(`Error loading ${resourceType}: ${error.message}`);
			return null;
		}
	}

	/**
	 * Load HTML template
	 * @private
	 */
	async #loadTemplate() {
		const templateContent = await this.#loadResourceWithCache(
			this.#templatePath,
			ComponentBase.RESOURCE_TYPE.TEMPLATE
		);
		this.#templateContent = templateContent;
		this.#templateLoaded = true;

		// If styles are already loaded, render
		if (this.#styleLoaded && this.#renderPending) {
			this.render();
		}
	}

	/**
	 * Load CSS styles
	 * @private
	 */
	async #loadStyles() {
		const styleElement = await this.#loadResourceWithCache(
			this.#stylePath,
			ComponentBase.RESOURCE_TYPE.STYLE
		);
		this.#styleElement = styleElement;
		this.#styleLoaded = true;

		// If template is already loaded, render
		if (this.#templateLoaded && this.#renderPending) {
			this.render();
		}
	}

	/**
	 * Render the component
	 * This should be overridden by subclasses if they need custom rendering
	 */
	render() {
		// If resources are still loading, mark as pending
		if (!this.#templateLoaded || !this.#styleLoaded) {
			this.#renderPending = true;
			return;
		}

		// Clear current content
		this.shadowRoot.innerHTML = "";

		// Add style if available
		if (this.#styleElement) {
			this.shadowRoot.appendChild(this.#styleElement.cloneNode(true));
		}

		// Add template content if available
		if (this.#templateContent) {
			this.shadowRoot.appendChild(this.#templateContent.cloneNode(true));
		}

		// Component-specific initialization
		this.afterRender();
	}

	/**
	 * Called after rendering is complete
	 * This should be overridden by subclasses for post-render initialization
	 */
	afterRender() {
		// Override in subclasses
	}
}
