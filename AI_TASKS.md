# AI Tasks: Refactor Plan for Perfectly Aligned 🛠️🤖

This document lists the concrete, linear tasks an AI coding agent (e.g., Cursor Agent, VS Code Agent) must execute to refactor and prepare the "Perfectly Aligned" project as described in `AI_MASTER_GUIDE.md`.

Each task should be fully completed and validated before moving on to the next.

---

## ✅ Initial Setup & Data Externalization

1. **Create Data Folder & JSON files**
   - Move prompt decks from `script.js` to `data/decks.json`.
   - Move avatar data to `data/avatars.json`.
   - Move sound data to `data/sounds.json`.

2. **Load JSON Data Dynamically**
   - Update `gameState.js` to fetch JSON data at runtime.

---

## ✅ Modularize JavaScript into ES Modules

3. **Split Global JavaScript into Modules**
   - Extract global state (`players`, `rounds`, `scores`) into `modules/gameState.js`.
   - Extract deck management logic into `modules/deck.js`.
   - Extract timer logic into `modules/timer.js`.
   - Extract token economy logic into `modules/tokens.js`.
   - Extract audio handling logic into `modules/audio.js`.
   - Extract logging and error handling logic into `modules/logger.js`.

4. **Update HTML to Load Modules**
   - Modify `index.html` to import JavaScript files using `<script type="module">` tags.

---

## ✅ Web Components Refactor

5. **Create Web Components Directory**
   - Add `modules/components` directory.

6. **Refactor Alignment Grid into Web Component**
   - Implement `alignment-grid.js` as a custom element.

7. **Refactor Player Setup into Web Component**
   - Implement `player-setup.js`.

8. **Refactor Prompt Cards into Web Component**
   - Implement `prompt-card.js`.

9. **Refactor Scoreboard into Web Component**
   - Implement `scoreboard.js`.

10. **Refactor Winner Modal into Web Component**
    - Implement `winner-modal.js`.

11. **Refactor Sketch Timer into Web Component**
    - Implement `sketch-timer.js`.

12. **Update index.html**
    - Replace old HTML segments with new Web Component tags.

---

## ✅ Comprehensive JSDoc Documentation

13. **Document Each ES Module and Function**
    - Clearly write JSDoc comments for all modules and functions.

14. **Document All Web Components**
    - Add clear JSDoc explanations for component logic, properties, and methods.

---

## ✅ CSS Refactor

15. **Create Organized CSS Structure**
    - Split `style.css` into:
      - `base.css`
      - `layout.css`
      - `theme.css`

16. **Remove Unused or Duplicate CSS**
    - Clean up CSS rules and remove unnecessary duplication.

17. **Add Scoped CSS to Web Components**
    - Move relevant CSS directly into each Web Component's Shadow DOM.

---

## ✅ Final Validation & Cleanup

18. **Ensure Consistent Naming and Comments**
    - Check all IDs, class names, and comments for consistency and clarity.

19. **Test Each Component Thoroughly**
    - Verify all interactions and state transitions function as expected.

20. **Finalize README and Documentation**
    - Update the general README.md clearly describing how to run, use, and modify the game.

---

After completing these tasks, the project will be in a clean, maintainable state—optimal for human and AI collaboration. 🎯🚀

