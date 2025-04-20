import { gameState, players, currentPlayerIndex, targetScore, currentlyDisplayedPrompts, chosenPromptForRound, currentRolledAlignment, addPlayer, setPlayerCount, setPlayerName, setPlayerAvatar, assignPoints, assignToken, resetGameState, nextRound, setTargetScore, setChosenPrompt, setRolledAlignment, spendTokenForReroll, spendTokensForSteal, getPlayerById, getPlayerTokenTotal, getJudgePlayer } from './state.js';
import { elements, updateJudgeDisplay, updateScoreboard, populateWinnerButtons, populateTokenAwardUI, resetUIForNewRound, displayAlignmentResult, showSketchInstructions, updateRerollButtonState, validateAvatarUniqueness } from './ui.js';

// --- Event Handlers --- (Moved from script.js or integrated)

function handleTokenChoiceClick(event) {
    const choice = event.currentTarget;
    console.log(`[handleTokenChoiceClick] Clicked: ${choice.dataset.tokenType} for player ${choice.dataset.playerIndex}. Has disabled class? ${choice.classList.contains('disabled-by-award')}`);

    if (choice.classList.contains('disabled-by-award')) {
        console.log(`[handleTokenChoiceClick] Aborting: Token is disabled.`);
        return;
    }

    const isSelected = choice.classList.contains('selected');
    const playerRow = choice.closest('.player-token-row');
    console.log(`[handleTokenChoiceClick] Is currently selected? ${isSelected}`);

    if (isSelected) {
        console.log(`[handleTokenChoiceClick] Deselecting.`);
        choice.classList.remove('selected');
        choice.classList.add('deselected');
    } else {
        console.log(`[handleTokenChoiceClick] Selecting.`);

        if (playerRow) {
            const currentlySelected = playerRow.querySelector('.token-award-choice.selected');
            if (currentlySelected) {
                console.log(`[handleTokenChoiceClick] Deselecting previous choice for this player: ${currentlySelected.dataset.tokenType}`);
                currentlySelected.classList.remove('selected');
                currentlySelected.classList.add('deselected');
            }
        }
        choice.classList.add('selected');
        choice.classList.remove('deselected');
        playSound('token_gain');
    }

    console.log(`[handleTokenChoiceClick] Calling updateTokenAvailability.`);
    updateTokenAvailability();
}

function updateTokenAvailability() {
    console.log(`[updateTokenAvailability] Running...`);
    const tokenArea = elements.playerTokenAwardArea;
    if (!tokenArea) {
        console.error("[updateTokenAvailability] Error: playerTokenAwardArea element not found.");
        return;
    }
    const allTokenChoices = tokenArea.querySelectorAll('.token-award-choice');
    if (allTokenChoices.length === 0) {
        console.log(`[updateTokenAvailability] No token choices found in the UI.`);
        return;
    }

    const awardedTokenTypes = new Set();

    allTokenChoices.forEach(choice => {
        if (choice.classList.contains('selected')) {
            awardedTokenTypes.add(choice.dataset.tokenType);
        }
    });
    console.log(`[updateTokenAvailability] Awarded types found:`, Array.from(awardedTokenTypes));

    allTokenChoices.forEach(choice => {
        const tokenType = choice.dataset.tokenType;
        const isSelected = choice.classList.contains('selected');
        const isDisabledByAward = choice.classList.contains('disabled-by-award');

        if (awardedTokenTypes.has(tokenType) && !isSelected) {
            if (!isDisabledByAward) {
                 console.log(`[updateTokenAvailability] Disabling: ${tokenType} for player ${choice.dataset.playerIndex}`);
            }
            choice.classList.add('disabled-by-award');
            choice.classList.remove('selected');
            choice.classList.add('deselected');
            choice.tabIndex = -1;
        } else {
            if (isDisabledByAward) {
                console.log(`[updateTokenAvailability] Enabling: ${tokenType} for player ${choice.dataset.playerIndex}`);
            }
            choice.classList.remove('disabled-by-award');
            choice.tabIndex = 0;
            if (!isSelected) {
                 choice.classList.add('deselected');
            }
        }
    });
     console.log(`[updateTokenAvailability] Finished.`);
}

// --- Steal Modal Logic ---

function populateStealModal() {
    if (!elements.stealModalTargetsContainer || !players || !getJudgePlayer) return;

    const judge = getJudgePlayer();
    if (!judge) {
        console.error("Cannot populate steal modal: No judge found.");
        return;
    }
    const judgeId = judge.playerId;
    elements.stealModalTargetsContainer.innerHTML = '';

    const potentialTargets = players.filter(p => p.playerId !== judgeId && p.currentScore > 0);

    if (potentialTargets.length === 0) {
        elements.stealModalInstruction.textContent = "No players eligible to steal from!";
    } else {
        elements.stealModalInstruction.textContent = "Choose a player to steal 1 point from:";
        potentialTargets.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'steal-target-player';
            playerDiv.dataset.playerId = player.playerId;

            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'steal-target-avatar';
            avatarDiv.style.backgroundImage = `url('${player.avatarUrl || 'assets/avatars/default.png'}')`;

            const nameSpan = document.createElement('span');
            nameSpan.className = 'steal-target-name';
            nameSpan.textContent = player.playerName;

            playerDiv.appendChild(avatarDiv);
            playerDiv.appendChild(nameSpan);

            playerDiv.addEventListener('click', handleStealPlayerClick);

            elements.stealModalTargetsContainer.appendChild(playerDiv);
        });
    }
}

function showStealModal() {
    const judge = getJudgePlayer();
    if (!elements.stealModalOverlay || !judge) return;

    // Double check token cost before showing
    if (getPlayerTokenTotal(judge) < 3) {
        alert("You need 3 tokens to steal a point!");
        return;
    }

    populateStealModal(); // Populate with current players before showing
    elements.stealModalOverlay.classList.add('visible');
    playSound('steal'); // Use steal sound effect
}

function hideStealModal() {
    if (!elements.stealModalOverlay) return;
    elements.stealModalOverlay.classList.remove('visible');
    // Remove dynamically added listeners to prevent memory leaks
    const targets = elements.stealModalTargetsContainer.querySelectorAll('.steal-target-player');
    targets.forEach(target => target.removeEventListener('click', handleStealPlayerClick));
}

function handleStealPlayerClick(event) {
    const targetPlayerDiv = event.currentTarget;
    const targetPlayerId = targetPlayerDiv.dataset.playerId;
    const judge = getJudgePlayer();

    if (!targetPlayerId || !judge) {
        console.error("Steal failed: Missing target player ID or judge.");
        hideStealModal();
        return;
    }

    // Attempt to spend tokens FIRST
    if (!spendTokensForSteal(judge.playerId)) {
        console.error("Steal failed: Could not spend tokens (should have been checked before modal).");
        alert("Error: Could not spend tokens for steal.");
        hideStealModal();
        return;
    }

    console.log(`Judge ${judge.playerName} stealing from player ID ${targetPlayerId}`);
    playSound('point_gain'); // Play point gain sound for judge

    // --- Game State Update ---
    // Decrease target player's score
    assignPoints(targetPlayerId, -1); // Assuming assignPoints adds the value
    // Increase judge's score
    assignPoints(judge.playerId, 1);
    // -------------------------

    // Update UI
    updateScoreboard(); // Refresh the main scoreboard
    updateJudgeDisplay(); // Update judge display (steal button might disable/hide)

    hideStealModal(); // Close the modal
}

// ... rest of game.js ...

function handleWinnerButtonClick(event) {
    const target = event.target.closest('button.winner-button');
    if (!target) return; // Ignore clicks not on a winner button

    // Remove 'selected' from all buttons first
    elements.winnerButtons().forEach(btn => btn.classList.remove('selected'));

    // Add 'selected' to the clicked button
    target.classList.add('selected');
    playSound('ui_select'); // Selection sound

    // Enable the award button
    if (elements.awardButton) {
        elements.awardButton.disabled = false;
    }
    console.log(`Winner button selected: ${target.textContent}`);
}

function handleAwardButtonClick() {
    console.log("Award Point & Advance button clicked");
    if (!elements.awardButton || elements.awardButton.disabled) return;

    const selectedWinnerButton = elements.winnerButtonContainer ? elements.winnerButtonContainer.querySelector('.winner-button.selected') : null;
    if (!selectedWinnerButton) {
        console.error("Award button clicked, but no winner selected!");
        alert("Please select a winner first.");
        return;
    }

    const winnerPlayerId = selectedWinnerButton.dataset.playerId; // Get winner's ID directly

    if (!winnerPlayerId) {
         console.error("Could not find winner player ID from button dataset");
         return;
    }

    console.log(`Awarding point to player ID ${winnerPlayerId}`);
    assignPoints(winnerPlayerId, 1); // Award point to winner
    playSound("point_gain");

    // Award selected tokens
    const selectedTokens = elements.selectedTokenSpans(); // Use dynamic selector
    console.log(`Found ${selectedTokens.length} selected tokens to award.`);
    selectedTokens.forEach(tokenSpan => {
        const targetPlayerId = tokenSpan.dataset.playerId; // Get target player's ID
        const tokenType = tokenSpan.dataset.tokenType;

        if (targetPlayerId && tokenType) {
            console.log(`Awarding token '${tokenType}' to player ID ${targetPlayerId}`);
            assignToken(targetPlayerId, tokenType); // Award token
        } else {
             console.warn(`Could not award token: Invalid playerId (${targetPlayerId}) or tokenType (${tokenType})`);
        }
    });
    if (selectedTokens.length > 0) {
        playSound("token_gain"); // Play sound once if any tokens were awarded
    }

    // Disable award button immediately after awarding
    elements.awardButton.disabled = true;

    // Check for game win condition
    const winner = gameState.players.find(p => p.score >= gameState.targetScore);
    if (winner) {
        console.log(`Game Over! Winner: ${winner.name}`);
        playSound("win");
        showWinner(winner.name); // Update UI to show winner screen
    } else {
        // Advance to the next round
        console.log("Advancing to next round...");
        advanceToNextRound(); // This should update state (judge, etc.) and call UI resets
    }
}

function advanceToNextRound() {
    nextRound(); // Update state (judge index, clear round state)
    resetUIForNewRound(); // Resets button states among other things
    updateJudgeDisplay(); // Update judge info (including steal button state)
    updateScoreboard(); // Refresh scoreboard
    console.log(`Advanced to round ${gameState.roundNumber}. Judge: ${getJudgePlayer()?.name}`);
}

// --- Timer Functions ---

// Need to declare remainingSeconds if it's not declared globally elsewhere
let remainingSeconds = 90; // Or get initial value from slider/state

function updateTimerDisplayFromSlider() {
    if (!elements.timerSlider) return;
    const totalSeconds = parseInt(elements.timerSlider.value);
    updateTimerDisplay(totalSeconds);
}

function updateTimerDisplay(seconds) {
    if (!elements.timerDisplay) return;
    const minutes = Math.floor(seconds / 60);
    const displaySeconds = seconds % 60;
    elements.timerDisplay.textContent = `${minutes}:${displaySeconds < 10 ? '0' : ''}${displaySeconds}`;
}

function startTimer() {
    if (timerInterval) return; // Already running

    remainingSeconds = parseInt(elements.timerSlider.value);
    console.log(`Start Timer clicked. Duration: ${remainingSeconds}s`);

    if (remainingSeconds <= 0) {
        console.log("Timer duration is zero or less, not starting.");
        if(elements.startTimerButton) elements.startTimerButton.disabled = false; // Re-enable start if not started
        return;
    }

    // Disable start button, enable stop button
    if(elements.startTimerButton) elements.startTimerButton.disabled = true;
    if(elements.stopTimerButton) elements.stopTimerButton.disabled = false;
    if(elements.resetTimerButton) elements.resetTimerButton.disabled = true; // Disable reset while running
    if(elements.timerSlider) elements.timerSlider.disabled = true;
    if(elements.sketchInstructionArea) elements.sketchInstructionArea.classList.add('timer-active');

    updateTimerDisplay(remainingSeconds); // Initial display

    timerInterval = setInterval(() => {
        remainingSeconds--;
        updateTimerDisplay(remainingSeconds);

        if (remainingSeconds <= 0) {
            stopTimer(true); // Pass true to indicate timer finished naturally
            playSound("timer_end");
            // Optionally auto-advance or show winner selection area
            populateWinnerButtons(); // Show winner buttons after timer ends
            if(elements.winnerSelectionArea) elements.winnerSelectionArea.style.display = 'block';
            if(elements.playerTokenAwardArea) elements.playerTokenAwardArea.style.display = 'block'; // Show token area too
        }
    }, 1000);
}

function stopTimer(finishedNaturally = false) {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    // Reset button states
    if(elements.startTimerButton) elements.startTimerButton.disabled = false; // Allow restarting
    if(elements.stopTimerButton) elements.stopTimerButton.disabled = true;
    if(elements.resetTimerButton) elements.resetTimerButton.disabled = false; // Allow reset
    if(elements.timerSlider) elements.timerSlider.disabled = false;
    if(elements.sketchInstructionArea) elements.sketchInstructionArea.classList.remove('timer-active');

    if (!finishedNaturally) {
        console.log("Timer stopped manually.");
        // If stopped manually, maybe don't show winner buttons yet? Or maybe do? Decide flow.
        // For now, let's assume stopping manually still leads to judging
        populateWinnerButtons();
        if(elements.winnerSelectionArea) elements.winnerSelectionArea.style.display = 'block';
        if(elements.playerTokenAwardArea) elements.playerTokenAwardArea.style.display = 'block';
    } else {
        console.log("Timer finished.");
    }
}

function resetTimer() {
    stopTimer(); // Stops timer and resets button states
    remainingSeconds = parseInt(elements.timerSlider.value); // Reset remaining seconds from slider
    updateTimerDisplay(remainingSeconds); // Update display based on slider
    // Ensure correct initial state (start enabled, stop disabled)
    if(elements.startTimerButton) elements.startTimerButton.disabled = false; // Should be enabled if prompt chosen, disabled otherwise - handled elsewhere
    if(elements.stopTimerButton) elements.stopTimerButton.disabled = true;
    if(elements.resetTimerButton) elements.resetTimerButton.disabled = false;
    if(elements.timerSlider) elements.timerSlider.disabled = false;
    console.log("Timer reset.");
}

// --- Setup Phase Functions ---

function handlePlayerCountChange(change) {
    // ... existing code ...
    validateAvatarUniqueness(); // Validate start button state after count change
}

function handleSetPlayers() {
    // ... existing code ...
    validateAvatarUniqueness(); // Validate start button state after creating inputs
}

// Added handler for avatar cycle clicks (delegated from script.js)
function handleAvatarCycleClick(event) {
    const button = event.target;
    const playerEntryDiv = button.closest('.player-name-entry');
    if (!playerEntryDiv) return;

    const playerIndex = parseInt(playerEntryDiv.dataset.playerIndex);
    const direction = button.classList.contains('next') ? 1 : -1;

    cycleAvatar(playerIndex, direction);
}

function cycleAvatar(playerIndex, direction) {
    // ... existing code ...
    validateAvatarUniqueness(); // Re-validate after change
}

// Added handler for player name input (delegated from script.js)
function handlePlayerNameInput(event) {
    const input = event.target;
    const playerIndex = parseInt(input.dataset.playerIndex);
    setPlayerName(playerIndex, input.value.trim()); // Update state, trim whitespace
    validateAvatarUniqueness(); // Re-validate on every input
}

function handleDeckSelection(event) {
    const targetLabel = event.target.closest('.deck-label');
    if (!targetLabel) return;

    const deckKey = targetLabel.dataset.deckKey;
    if (!deckKey) return;

    targetLabel.classList.toggle('deselected');
    targetLabel.classList.toggle('selected', !targetLabel.classList.contains('deselected'));

    // Update state (if necessary, e.g., store selected deck keys)
    // Example: updateSelectedDecksState();

    playSound('ui_click');
    // Re-validate start button state after deck selection changes
    validateAvatarUniqueness();
}

function startGame() {
    // Validation is implicitly handled by the button's disabled state
    console.log("Start Game button clicked");

    // Finalize player setup in state (names/avatars already set by input handlers)
    // Set target score (example: default or from an input)
    setTargetScore(10); // Example target score

    // Hide Setup, Show Game
    if (elements.setupArea) elements.setupArea.style.display = "none";
    if (elements.gameArea) elements.gameArea.style.display = "block";

    advanceToNextRound(); // Start the first round
    console.log("Game started, first round initialized.");
}

// --- Game Phase Functions ---

function handleRollClick() {
    console.log("Roll button clicked");
    if (!elements.rollButton || elements.rollButton.disabled) return;

    playSound("roll");
    if(elements.rollButton) elements.rollButton.disabled = true; // Disable roll button immediately
    if(elements.drawPromptsButton) elements.drawPromptsButton.disabled = true; // Disable draw until roll finishes
    if (elements.dieDisplay) elements.dieDisplay.classList.add('rolling'); // Add rolling animation class

    // Short delay for animation effect
    setTimeout(() => {
        const alignment = rollAlignment(); // Update state & get result
        displayAlignmentResult(alignment); // Update UI based on state (this now enables draw button in ui.js)
        if (elements.dieDisplay) elements.dieDisplay.classList.remove('rolling'); // Remove animation class
        // Reroll button state is handled by updateJudgeDisplay called in advanceToNextRound
        console.log(`Alignment rolled: ${alignment}`);
    }, 500); // Adjust delay as needed (match CSS animation if possible)
}

function drawAndDisplayPrompts() {
    console.log("Draw Prompts button clicked");
    if (!elements.drawPromptsButton || elements.drawPromptsButton.disabled) return;

    playSound("draw_prompts");
    if(elements.drawPromptsButton) elements.drawPromptsButton.disabled = true; // Disable after drawing
    if(elements.rollButton) elements.rollButton.disabled = true; // Ensure roll stays disabled

    const selectedDeckKeys = getSelectedDecks(); // Get selected decks from state
    const prompts = drawPrompts(selectedDeckKeys); // Update state with new prompts

    // Update UI to show prompts
    if (elements.promptListClickable && elements.promptDisplayArea) {
        elements.promptListClickable.innerHTML = ''; // Clear previous
        const instructionP = elements.promptDisplayArea.querySelector('p');
        if (instructionP) instructionP.textContent = "Judge: Choose a prompt!";

        prompts.forEach((prompt, index) => {
            const li = document.createElement('li');
            li.className = 'prompt-choice';
            li.dataset.promptIndex = index; // Store index for selection
            li.textContent = prompt;
            li.setAttribute('role', 'option'); // Accessibility
            li.tabIndex = 0; // Make focusable
            // Add animation class
            li.classList.add('deal-animation');
            li.style.animationDelay = `${index * 0.1}s`; // Stagger animation

            elements.promptListClickable.appendChild(li);

            // Remove animation class after animation ends
            li.addEventListener('animationend', () => {
                li.classList.remove('deal-animation');
            }, { once: true });
        });
    }
    updateRerollButtonState(); // Update reroll state AFTER drawing
    console.log(`Prompts drawn: ${prompts.join(', ')}`);
}

function handlePromptReRoll() {
    console.log("Reroll Prompts button clicked");
    const judge = getJudgePlayer();
    if (!elements.rerollPromptsButton || elements.rerollPromptsButton.disabled || !judge) return;

    if (spendTokenForReroll(judge.playerId)) { // Check and spend token in state
        console.log("Rerolling prompts...");
        playSound("ui_click"); // Or a specific reroll sound
        updateScoreboard(); // Update scoreboard to show token spent
        // Re-enable draw button and disable reroll button temporarily
        if (elements.drawPromptsButton) elements.drawPromptsButton.disabled = false; // Allow drawing again
        if (elements.rerollPromptsButton) {
            elements.rerollPromptsButton.disabled = true;
            // Keep it visible until new prompts are drawn
        }
        // Clear current prompts visually before drawing new ones
        if (elements.promptListClickable) elements.promptListClickable.innerHTML = '<p><em>Drawing new prompts...</em></p>';
        // Add a small delay before drawing again for effect
        setTimeout(() => {
            drawAndDisplayPrompts(); // Trigger draw again
        }, 300);
    } else {
        console.log("Not enough tokens to reroll.");
        // Optionally show a message to the user
        alert("You need at least 1 token to re-draw prompts!");
    }
}

function handlePromptClick(event) {
    const target = event.target.closest('.prompt-choice'); // Find the list item
    if (!target || target.classList.contains('selected') || target.classList.contains('disabled')) return; // Ignore if not a valid target or already handled

    console.log("Prompt selected:", target.textContent);
    playSound("ui_confirm"); // Confirmation sound

    const selectedIndex = parseInt(target.dataset.promptIndex);
    const selectedPrompt = gameState.currentlyDisplayedPrompts[selectedIndex];
    setChosenPrompt(selectedPrompt); // Update state

    // Update UI: Highlight selected, disable others
    elements.promptChoiceItems().forEach(item => {
        item.classList.remove('selected'); // Remove selected from all first
        item.classList.add('disabled'); // Disable all
        item.removeAttribute('aria-selected');
        item.tabIndex = -1; // Remove from tab order
    });
    target.classList.add('selected');
    target.classList.remove('disabled'); // Re-enable the selected one visually
    target.setAttribute('aria-selected', 'true');

    // Disable draw/reroll buttons after selection
    if (elements.drawPromptsButton) elements.drawPromptsButton.disabled = true;
    if (elements.rerollPromptsButton) {
        elements.rerollPromptsButton.disabled = true;
        // Keep it visible but disabled
    }

    showSketchInstructions(); // Show the sketch instructions and timer area
    // Enable the start timer button now that a prompt is chosen
    if (elements.startTimerButton) elements.startTimerButton.disabled = false;
    console.log(`Chosen prompt set in state: ${gameState.chosenPromptForRound}`);
}

// --- Reset Game ---
function resetGame() {
    resetGameState(); // Reset all game state
    resetUIForNewGame(); // Reset UI to initial setup screen
    playSound("ui_confirm"); // Or a specific reset sound
}
