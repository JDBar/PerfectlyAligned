# AI Master Guide: Perfectly Aligned 🎲🖌️

This document clearly explains the structure, architecture, and design principles of the "Perfectly Aligned" game. It's crafted specifically for AI agents (Cursor Agent, VS Code Agent) and human contributors with minimal coding knowledge to easily understand, maintain, and improve the project.

---

## 📖 Project Overview

"Perfectly Aligned" is a creative, drawing-based party game. Players take turns being the judge, who selects a D&D alignment (e.g., "Chaotic Good") and a random prompt. Other players sketch according to the prompt and alignment, and the judge awards points and special tokens.

This project is intentionally structured as a zero-build, static web application—just drag and drop to run in a modern browser.

---

## 📁 Project Structure

```
perfectly-aligned/
├── index.html
├── AI_MASTER_GUIDE.md (this file)
├── AI_TASKS.md (AI agent refactoring tasks)
├── README.md (general user instructions)
├── FUTURE.md (future ideas, document-only)
├── modules/
│   ├── gameState.js
│   ├── deck.js
│   ├── timer.js
│   ├── tokens.js
│   ├── audio.js
│   ├── logger.js
│   └── components/
│       ├── alignment-grid.js
│       ├── player-setup.js
│       ├── prompt-card.js
│       ├── scoreboard.js
│       ├── winner-modal.js
│       └── sketch-timer.js
├── data/
│   ├── decks.json
│   ├── avatars.json
│   └── sounds.json
├── css/
│   ├── base.css
│   ├── theme.css
│   └── layout.css
└── assets/
    ├── images/
    └── audio/
```

---

## 🛠️ Architecture & Design Principles

### ✅ Modularity via ES Modules

- **Purpose**: Clear boundaries for easier maintainability and AI navigation.
- **Structure**: Each JavaScript file is a focused ES module with clearly documented responsibilities.

### ✅ Web Components

- **Purpose**: Encapsulate UI logic clearly and simply without build tools.
- **Design**: Each UI element (alignment grid, prompt cards, etc.) is a standalone Web Component, leveraging Shadow DOM for scoped CSS.

### ✅ External Data Storage

- **Purpose**: Keep large prompt decks, avatar data, and audio paths external, making changes simple.
- **Structure**: Data stored as JSON files loaded at runtime with fetch.

### ✅ Comprehensive Documentation (JSDoc)

- All functions, modules, and important state variables must have clear, descriptive JSDoc comments.

```javascript
/**
 * Rolls a random alignment for the round.
 * @returns {string} Rolled alignment (e.g., "LG", "CN").
 */
export function rollAlignment() { ... }
```

### ✅ No Build Steps

- Everything should run directly in a modern browser without any bundlers, compilers, or package managers.

---

## 🧩 Module Responsibilities (in `/lib`)

- **gameState.js**
  - Centralized game state management (scores, players, rounds).

- **deck.js**
  - Loading and managing prompt decks.

- **timer.js**
  - Manages the sketch timer functionality and UI synchronization.

- **tokens.js**
  - Manages tokens: awarding, deducting, checking player token balances.

- **audio.js**
  - Handles playing audio safely with error checking.

- **logger.js**
  - Simple error logging and reporting.

### Web Components (in `/components`)

- **alignment-grid.js**: Rolls and displays alignments.
- **player-setup.js**: Handles player name input and avatar selection.
- **prompt-card.js**: Displays random prompts and manages selection.
- **scoreboard.js**: Shows current player scores and tokens.
- **winner-modal.js**: Shows the winner after each round.
- **sketch-timer.js**: UI and logic for the sketch countdown timer.

---

## 🎨 CSS Approach

- **base.css**: General resets, typography, global styles.
- **layout.css**: Flexbox/Grid layouts for responsiveness.
- **theme.css**: Colors, fonts, and visual theme variables.

Keep CSS simple, clear, and easy to modify.

---

## 🚨 Error Handling

Use simple, human-readable console logs:

```javascript
if (!element) logError("Couldn't find #element!");
```

---

## 🤖 Instructions for AI Agents

When contributing to this repository:

1. **Review this document (AI_MASTER_GUIDE.md)** thoroughly first.
2. **Always update JSDoc comments** to match your code changes.
3. **Ensure any added components or modules follow the modular ES Module & Web Component architecture described.**
4. Keep all interactions explicit—avoid complicated indirection.

---

## 🌟 Instructions for Human Contributors

As a human contributor without deep programming experience, use this document along with the general README.md:

- To **add new prompts**: Modify `data/decks.json`.
- To **add new avatars**: Modify `data/avatars.json` and put images into `/assets/images`.
- To **add sounds**: Add to `data/sounds.json` and upload audio files into `/assets/audio`.

You should not need to edit the JavaScript directly unless doing significant changes. When you do, clearly structured JSDoc comments will guide you.

---

## 📌 Future Considerations

If eventually considering multiplayer or game saving, **do not introduce these features** into the current implementation, keeping complexity manageable.

---

This guide ensures AI agents and human collaborators can effectively navigate and improve the project—maintaining clarity, simplicity, and fun! 🎉

