import { gameState, getPlayerTokenTotal } from './state.js';
import { TOKEN_TYPES, AVATAR_BASE_PATH, ALIGNMENT_EXAMPLES_MAP, ALIGNMENT_FULL_NAME_MAP } from './constants.js';
import { handleTokenChoiceClick, handleStealPointClick, confirmSteal, handleWinnerButtonClick } from './game.js'; // Import necessary handlers
import { playSound } from './audio.js';
import { stopTimer, resetTimer, showStealModal } from './game.js'; // Import timer functions and steal modal function

// --- DOM Element References ---
const elements = {
    playerTokenAwardArea: document.getElementById('player-token-award-area'),
    roundActionsSection: document.getElementById('round-actions-section'),
    winnerButtonContainer: document.getElementById('winner-button-container'),
    awardButton: document.getElementById('award-button'),
    winnerArea: document.getElementById('winner-area'),
    winnerNameSpan: document.getElementById('winner-name'),
    playAgainButton: document.getElementById('play-again-button'),
    setupArea: document.getElementById('setup-area'),
    playerCountInput: document.getElementById('player-count'),
    setPlayersButton: document.getElementById('set-players-button'),
    playerNamesInputArea: document.getElementById('player-setup-area'),
    startGameButton: document.getElementById('start-game-button'),
    gameArea: document.getElementById('game-area'),
    judgeNameSpan: document.getElementById('judge-name'),
    judgeAvatarDisplay: document.getElementById('judge-avatar-display'),
    rollButton: document.getElementById('roll-button'),
    scoreboardList: document.getElementById('scoreboard-list'),
    drawPromptsButton: document.getElementById('draw-prompts-button'),
    rerollPromptsButton: document.getElementById('redraw-prompts-button'), // Updated ID
    promptDisplayArea: document.getElementById('prompt-display-area'),
    promptListClickable: document.getElementById('prompt-list-clickable'),
    alignmentChartGrid: document.getElementById('alignment-chart-grid'),
    alignmentSection: document.getElementById('alignment-section'), // Add this line
    dieDisplay: document.getElementById('die-display'),
    alignmentExamplesArea: document.getElementById('alignment-examples'),
    sketchInstructionArea: document.getElementById('sketch-instruction-area'),
    sketchInstructionText: document.getElementById('sketch-instruction-text'),
    timerSlider: document.getElementById('timer-slider'),
    timerDisplay: document.getElementById('timer-display'),
    startTimerButton: document.getElementById('start-timer-button'),
    stopTimerButton: document.getElementById('stop-timer-button'),
    resetTimerButton: document.getElementById('reset-timer-button'),
    tutorialOverlay: document.getElementById('tutorial-overlay'),
    tutorialBox: document.getElementById('tutorial-box'),
    tutorialPrevButton: document.getElementById('tutorial-prev'),
    tutorialNextButton: document.getElementById('tutorial-next'),
    tutorialSkipButton: document.getElementById('tutorial-skip'),
    showTutorialButton: document.getElementById('show-tutorial-button'),
    tutorialStepIndicator: document.getElementById('tutorial-step-indicator'),
    tutorialTitle: document.getElementById('tutorial-title'),
    tutorialText: document.getElementById('tutorial-text'),
    playerCountError: document.getElementById('player-count-error'),
    playerNamesError: document.getElementById('player-names-error'),
    targetScoreDisplay: document.getElementById('target-score-display'),
    deckSelectionArea: document.getElementById('deck-selection-area'),
    alignmentCells: () => document.querySelectorAll('.alignment-cell'), // Use function to get live list
    playerNameInputs: () => document.querySelectorAll('.player-name-input'),
    avatarSelects: () => document.querySelectorAll('.avatar-select'),
    selectedDeckLabels: () => document.querySelectorAll('#deck-selection-area .deck-label:not(.deselected)'),
    promptChoiceItems: () => document.querySelectorAll('.prompt-choice'),
    winnerButtons: () => document.querySelectorAll('.winner-button'),
    selectedTokenSpans: () => elements.playerTokenAwardArea ? elements.playerTokenAwardArea.querySelectorAll('.token-award-choice.selected') : [],
    stealTargetAreas: () => document.querySelectorAll('.steal-target-area'),

    // Steal Modal Elements
    stealModalOverlay: document.getElementById('steal-modal-overlay'),
    stealModalBox: document.getElementById('steal-modal-box'),
    stealModalCloseButton: document.getElementById('steal-modal-close'),
    stealModalTitle: document.getElementById('steal-modal-title'),
    stealModalInstruction: document.getElementById('steal-modal-instruction'),
    stealModalTargetsContainer: document.getElementById('steal-modal-targets'),
    stealModalCancelButton: document.getElementById('steal-modal-cancel'),
    initiateStealButton: document.getElementById('initiate-steal-button'), // Added steal button
};

// --- UI Update Functions ---

function updateJudgeDisplay() {
    const judge = gameState.players[gameState.currentPlayerIndex];
    const canStealInfo = { canSteal: false, targets: [] };

    if (judge) {
        if (elements.judgeNameSpan) elements.judgeNameSpan.textContent = judge.name;
        if (elements.judgeAvatarDisplay) {
            elements.judgeAvatarDisplay.style.backgroundImage = `url('${judge.avatar}')`;
            elements.judgeAvatarDisplay.style.display = 'block'; // Ensure it's visible
            elements.judgeAvatarDisplay.title = judge.name;
        }

        // Check steal conditions (assuming steal cost is 3 tokens)
        const judgeTotalTokens = getPlayerTokenTotal(judge); // Pass playerId
        if (judgeTotalTokens >= 3 && gameState.players.length > 1) {
            gameState.players.forEach((targetPlayer, targetIndex) => {
                // Check if target is not the judge and has points
                if (targetPlayer !== judge && targetPlayer.score > 0) {
                    canStealInfo.canSteal = true;
                    canStealInfo.targets.push(targetPlayer.name);
                }
            });
        }
    } else {
        if (elements.judgeNameSpan) elements.judgeNameSpan.textContent = "Waiting...";
        if (elements.judgeAvatarDisplay) {
            elements.judgeAvatarDisplay.style.backgroundImage = 'none';
            elements.judgeAvatarDisplay.style.display = 'none'; // Hide if no judge
        }
    }

    // Update Initiate Steal Button
    if (elements.initiateStealButton) {
        // Assuming the button should only be visible to the judge.
        // In a real multiplayer setup, you'd check if the current user IS the judge.
        // For this single-player helper, we just show it if the judge *can* steal.
        const isJudgeTurn = true; // Placeholder - replace with actual check if needed

        if (isJudgeTurn && canStealInfo.canSteal) {
            elements.initiateStealButton.style.display = 'block';
            elements.initiateStealButton.disabled = false;
            let targetText = canStealInfo.targets.join(', ');
            if (targetText.length > 20) { // Truncate if too long
                targetText = canStealInfo.targets.length + " targets";
            }
            elements.initiateStealButton.textContent = `${judge.name} steal? (3 tokens)`;
            elements.initiateStealButton.title = `Steal 1 point from: ${canStealInfo.targets.join(', ')}`;
        } else {
            elements.initiateStealButton.style.display = 'none'; // Hide if cannot steal or not judge's turn
            elements.initiateStealButton.disabled = true;
            elements.initiateStealButton.textContent = 'Steal Point'; // Reset text
            elements.initiateStealButton.title = ''; // Clear title
        }
    }

    updateRerollButtonState(); // Keep this call
}

function updateScoreboard() {
    if (!elements.scoreboardList) return;
    elements.scoreboardList.innerHTML = '';
    gameState.players.forEach((player, index) => {
        const listItem = document.createElement('li');
        listItem.dataset.playerIndex = index;
        listItem.dataset.playerId = player.playerId; // Add player ID for easier reference

        // Avatar Display
        const avatarSpan = document.createElement('span');
        avatarSpan.className = 'avatar-display-small';
        avatarSpan.style.backgroundImage = `url('${player.avatar}')`;
        avatarSpan.title = player.name;
        listItem.appendChild(avatarSpan);

        // Name and Score
        const nameScoreSpan = document.createElement('span'); // Changed variable name for clarity
        nameScoreSpan.className = 'player-name-display'; // Added class for styling
        nameScoreSpan.textContent = ` ${player.name}: ${player.score}`;
        listItem.appendChild(nameScoreSpan);

        // Token Display - Refactored to use TOKEN_TYPES
        const tokenSpan = document.createElement('span');
        tokenSpan.className = 'token-display';
        let hasTokens = false;
        Object.entries(player.tokens || {}).forEach(([key, count]) => {
            if (count > 0) {
                hasTokens = true;
                const tokenIconSpan = document.createElement('span');
                tokenIconSpan.className = `token-icon token-${key}`; // Use key for class
                tokenIconSpan.title = TOKEN_TYPES[key] || key; // Use description from constants as title
                tokenIconSpan.textContent = count; // Display count inside
                tokenSpan.appendChild(tokenIconSpan);
                tokenSpan.appendChild(document.createTextNode(' ')); // Add space between icons
            }
        });

        if (!hasTokens) {
            tokenSpan.textContent = '(No tokens)';
            tokenSpan.classList.add('no-tokens');
        }
        listItem.appendChild(tokenSpan);


        // Steal Button Logic (using getPlayerTokenTotal)
        const totalTokens = getPlayerTokenTotal(player);
        let canSteal = false;
        if (totalTokens >= 3 && gameState.players.length > 1) {
            const hasValidTarget = gameState.players.some((targetPlayer) => {
                // Ensure targetPlayer exists and has score property before accessing it
                return targetPlayer && targetPlayer.playerId !== player.playerId && targetPlayer.score > 0;
            });
            if (hasValidTarget) {
                canSteal = true;
            }
        }


        // Steal Button Area (placeholder for button or message)
        const stealButtonArea = document.createElement('div');
        stealButtonArea.className = 'steal-button-area';
        listItem.appendChild(stealButtonArea); // Add area even if button isn't shown yet

        // Steal Target Area (placeholder)
        const stealTargetArea = document.createElement('div');
        stealTargetArea.className = 'steal-target-area';
        stealTargetArea.style.display = 'none'; // Initially hidden
        listItem.appendChild(stealTargetArea);

        elements.scoreboardList.appendChild(listItem);
    });

    if (elements.targetScoreDisplay) {
        elements.targetScoreDisplay.textContent = gameState.targetScore;
    }
    // After updating the list, update the steal buttons within it
    updateStealButtonsUI();
}


// NEW Helper function to update steal buttons after scoreboard redraw
function updateStealButtonsUI() {
    if (!elements.scoreboardList) return;

    const listItems = elements.scoreboardList.querySelectorAll('li');
    listItems.forEach(listItem => {
        const playerIndex = parseInt(listItem.dataset.playerIndex);
        const player = gameState.players[playerIndex];
        const stealButtonArea = listItem.querySelector('.steal-button-area');

        if (!player || !stealButtonArea) return;

        // Clear previous button/content
        stealButtonArea.innerHTML = '';

        const totalTokens = getPlayerTokenTotal(player);
        let canSteal = false;
        if (totalTokens >= 3 && gameState.players.length > 1) {
            const hasValidTarget = gameState.players.some((targetPlayer) => {
                return targetPlayer && targetPlayer.playerId !== player.playerId && targetPlayer.score > 0;
            });
            if (hasValidTarget) {
                canSteal = true;
            }
        }

        if (canSteal) {
            const stealButton = document.createElement('button');
            stealButton.textContent = 'Steal (3)'; // Shortened text
            stealButton.className = 'steal-button';
            stealButton.title = 'Steal 1 point (costs 3 tokens)';
            stealButton.onclick = (event) => {
                 event.stopPropagation(); // Prevent potential parent clicks
                 handleStealPointClick(player.playerId); // Pass player ID
            };
            stealButtonArea.appendChild(stealButton);
        }
    });
}

function populateWinnerButtons() {
    if (!elements.winnerButtonContainer) return;
    elements.winnerButtonContainer.innerHTML = '';

    if (gameState.players.length <= 1) {
        elements.winnerButtonContainer.innerHTML = '<p><em>Not enough players to select a winner.</em></p>';
        return;
    }

    let buttonsAdded = 0;
    gameState.players.forEach((player, index) => {
        if (index !== gameState.currentPlayerIndex) {
            const button = document.createElement('button');
            button.className = 'winner-button';
            button.dataset.playerIndex = index;
            button.textContent = player.name;
            button.onclick = handleWinnerButtonClick; // Defined in game.js
            elements.winnerButtonContainer.appendChild(button);
            buttonsAdded++;
        }
    });

    if (buttonsAdded === 0) {
         elements.winnerButtonContainer.innerHTML = '<p><em>Error: Could not find players to select.</em></p>';
    }
}

function populateTokenAwardUI() {
    if (!elements.playerTokenAwardArea) return;
    elements.playerTokenAwardArea.innerHTML = ''; // Clear previous content
    const heading = document.createElement('h5');
    heading.textContent = "Award Achievement Tokens (Optional):";
    elements.playerTokenAwardArea.appendChild(heading);

    let playersEligible = false; // Flag to check if any players are shown

    gameState.players.forEach((player, playerIndex) => {
        // Skip the current judge
        if (player.playerId === gameState.players[gameState.currentPlayerIndex]?.playerId) return;

        playersEligible = true; // At least one non-judge player exists

        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-token-row';
        playerDiv.dataset.playerId = player.playerId; // Store player ID

        const nameSpan = document.createElement('span');
        nameSpan.className = 'player-token-name';
        nameSpan.textContent = player.name;
        playerDiv.appendChild(nameSpan);

        const choicesContainer = document.createElement('div');
        choicesContainer.className = 'token-choices-container';

        // Use TOKEN_TYPES from constants.js
        Object.entries(TOKEN_TYPES).forEach(([tokenKey, tokenDesc]) => {
            const choiceSpan = document.createElement('span');
            choiceSpan.className = 'token-award-choice deselected'; // Start as deselected
            choiceSpan.dataset.playerId = player.playerId; // Store player ID on the choice itself
            choiceSpan.dataset.tokenType = tokenKey; // Sets data-token-type="perfectlyAligned"
            choiceSpan.tabIndex = 0; // Make focusable

            // Display Text (e.g., "Art Bro")
            const labelText = tokenDesc.split('(')[0].trim(); // Get text before parenthesis if exists
            choiceSpan.appendChild(document.createTextNode(labelText));

            // Tooltip (e.g., "(Judge's favorite sketch...)")
            const tooltipSpan = document.createElement('span');
            tooltipSpan.className = 'token-tooltip';
            // Extract description from TOKEN_TYPES if needed, or use the full string
            tooltipSpan.textContent = ` (${tokenDesc})`; // Use full description as tooltip
            choiceSpan.appendChild(tooltipSpan);

            choiceSpan.onclick = handleTokenChoiceClick; // Attach handler
            choicesContainer.appendChild(choiceSpan);
        });
        playerDiv.appendChild(choicesContainer);
        elements.playerTokenAwardArea.appendChild(playerDiv);
    });

     // If no players were eligible (e.g., only 1 player in game), show a message
    if (!playersEligible) {
        const noPlayersMsg = document.createElement('p');
        noPlayersMsg.textContent = 'No other players to award tokens to.';
        noPlayersMsg.style.fontStyle = 'italic';
        elements.playerTokenAwardArea.appendChild(noPlayersMsg);
    }

    // Initial update of token availability after populating
    updateTokenAvailability();
}

// Manage the re-roll button's visibility and enabled state
function updateRerollButtonState() {
    if (!elements.rerollPromptsButton || gameState.players.length === 0) return;
    const judge = gameState.players[gameState.currentPlayerIndex];
    // Ensure judge exists before checking tokens
    const judgeHasTokens = judge && getPlayerTokenTotal(judge.playerId) > 0; // Pass playerId
    const promptsDrawn = gameState.currentlyDisplayedPrompts.length > 0;
    const promptChosen = !!gameState.chosenPromptForRound;

    // Show the button if prompts are drawn AND a prompt hasn't been chosen yet
    elements.rerollPromptsButton.style.display = (promptsDrawn && !promptChosen) ? 'inline-block' : 'none';
    // Enable the button only if the judge has tokens, prompts are drawn, and a prompt hasn't been chosen
    elements.rerollPromptsButton.disabled = !(judgeHasTokens && promptsDrawn && !promptChosen);
}

function showWinner(winnerName) {
    if(elements.gameArea) elements.gameArea.style.display = 'none';
    if(elements.winnerNameSpan) elements.winnerNameSpan.textContent = winnerName;
    if(elements.winnerArea) elements.winnerArea.style.display = 'block';
}

function resetUIForNewRound() {
    if(elements.dieDisplay) elements.dieDisplay.textContent = '?';
    elements.alignmentCells().forEach(cell => cell.classList.remove('highlighted', 'flicker', 'flicker-blue'));
    if (elements.alignmentChartGrid) elements.alignmentChartGrid.classList.remove('judge-choice-highlight');
    if (elements.alignmentExamplesArea) {
         elements.alignmentExamplesArea.style.display = 'none';
         const examplesP = elements.alignmentExamplesArea.querySelector('p');
         if (examplesP) {
             examplesP.innerHTML = '<em>Hover over grid or wait for roll...</em>';
         }
    }
    if (elements.promptListClickable) elements.promptListClickable.innerHTML = '';
    const promptInstruction = elements.promptDisplayArea ? elements.promptDisplayArea.querySelector('p') : null;
    if(promptInstruction) promptInstruction.textContent = 'Judge: Click "Draw Prompts"';

    elements.winnerButtons().forEach(btn => btn.classList.remove('selected'));
    if(elements.rollButton) elements.rollButton.disabled = false; // Re-enable roll button
    if(elements.drawPromptsButton) elements.drawPromptsButton.disabled = true; // Start with draw disabled
    if(elements.awardButton) elements.awardButton.disabled = true; // Ensure award is disabled
    if(elements.rerollPromptsButton) {
        elements.rerollPromptsButton.style.display = 'none'; // Hide reroll button
        elements.rerollPromptsButton.disabled = true;
    }
    elements.stealTargetAreas().forEach(area => {
        area.style.display = 'none';
        area.innerHTML = '';
    });
    if (elements.sketchInstructionArea) elements.sketchInstructionArea.style.display = 'none';
    stopTimer(); // Assumes stopTimer is imported or defined here
    resetTimer(); // Assumes resetTimer is imported or defined here
    if (elements.timerSlider) elements.timerSlider.disabled = false; // Re-enable slider
    // Reset timer buttons to initial state (start enabled, stop/reset disabled/enabled appropriately)
    if (elements.startTimerButton) elements.startTimerButton.disabled = true; // Timer should start disabled until prompt chosen
    if (elements.stopTimerButton) elements.stopTimerButton.disabled = true;
    if (elements.resetTimerButton) elements.resetTimerButton.disabled = false; // Reset is usually available
    if (elements.timerSlider) elements.timerSlider.disabled = false; // Re-enable slider

    window.scrollTo(0, 0);
    // Clear winner selection
    if (elements.winnerButtonContainer) elements.winnerButtonContainer.innerHTML = '<p><em>Waiting for sketches...</em></p>';
    // Clear token award area
    if (elements.playerTokenAwardArea) elements.playerTokenAwardArea.innerHTML = '';
    // Hide sketch instructions
    if (elements.sketchInstructionArea) elements.sketchInstructionArea.style.display = 'none';
    // Reset alignment display
    if (elements.alignmentChartGrid) {
        elements.alignmentChartGrid.classList.remove('alignment-chart-zoomed', 'judge-choice-highlight');
        elements.alignmentCells.forEach(cell => cell.classList.remove('highlighted', 'flicker-blue'));
    }
    if (elements.alignmentSection) elements.alignmentSection.classList.remove('chart-is-zoomed');
    if (elements.dieDisplay) elements.dieDisplay.textContent = '?';
    if (elements.alignmentExamplesArea) {
        const examplesP = elements.alignmentExamplesArea.querySelector('p');
        if (examplesP) examplesP.innerHTML = '<em>Hover over grid or wait for roll...</em>';
        elements.alignmentExamplesArea.style.display = 'none'; // Hide examples area
    }
    // Clear prompt display
    if (elements.promptDisplayArea) {
         const instructionP = elements.promptDisplayArea.querySelector('p');
         if (instructionP) instructionP.textContent = "Judge: Roll for alignment!";
         if (elements.promptListClickable) elements.promptListClickable.innerHTML = ''; // Clear prompt list
    }
    if (elements.playerTokenAwardArea) {
        elements.playerTokenAwardArea.innerHTML = '';
    }
}

function resetUIForNewGame() {
     if(elements.setupArea) elements.setupArea.style.display = 'block';
     if(elements.gameArea) elements.gameArea.style.display = 'none';
     if(elements.winnerArea) elements.winnerArea.style.display = 'none';
     if(elements.playerCountInput) elements.playerCountInput.value = '3';
     if(elements.playerNamesInputArea) elements.playerNamesInputArea.innerHTML = '<p><em>Hit \'Enter Player Names\' to summon the name & avatar fields...</em></p>';
     if(elements.startGameButton) elements.startGameButton.disabled = true;
     if(elements.playerCountError) elements.playerCountError.textContent = '';
     if(elements.playerNamesError) elements.playerNamesError.textContent = '';
     // Reset deck selections to default (all selected)
     document.querySelectorAll('#deck-selection-area .deck-label').forEach(label => {
         label.classList.remove('deselected');
         label.classList.add('selected'); // Ensure selected class is present if that's the default
     });
     resetUIForNewRound(); // Also reset round-specific UI
     // Clear player setup area
     if(elements.playerSetupArea) elements.playerSetupArea.innerHTML = '<p><em>Click "Enter Player Names" to summon the name & avatar fields...</em></p>';
     if(elements.partyCountDisplay) elements.partyCountDisplay.textContent = '3'; // Reset count display
     // Reset deck selection visually (assuming default is selected)
     document.querySelectorAll('.deck-label').forEach(label => {
         // Example: Reset to default selected state based on initial HTML or logic
         const isDefaultSelected = label.dataset.deckKey === 'core_white' || label.dataset.deckKey === 'creative_cyan' || label.dataset.deckKey === 'hypothetical_magenta';
         label.classList.toggle('selected', isDefaultSelected);
         label.classList.toggle('deselected', !isDefaultSelected);
     });
     // ... existing resets ...
     resetUIForNewRound(); // Also reset round-specific UI including button states
}

// --- Specific UI Update Helpers ---

function displayAlignmentResult(alignment, shouldZoom = true) { // Add shouldZoom parameter
    if (!elements.dieDisplay || !elements.alignmentExamplesArea || !elements.alignmentChartGrid || !elements.alignmentSection) return;

    elements.dieDisplay.textContent = alignment;
    elements.dieDisplay.classList.remove('rolling');

    const exampleText = ALIGNMENT_EXAMPLES_MAP[alignment] || "Unknown Alignment";
    const examplesP = elements.alignmentExamplesArea.querySelector('p');
    if (examplesP) {
        examplesP.innerHTML = exampleText;
    }
    elements.alignmentExamplesArea.style.display = 'block';

    elements.alignmentCells().forEach(cell => {
        cell.classList.remove('highlighted', 'flicker', 'flicker-blue');
        if (cell.dataset.alignment === alignment) {
            cell.classList.add('highlighted');
        }
    });

    // Toggle zoom class based on shouldZoom parameter
    elements.alignmentChartGrid.classList.toggle('alignment-chart-zoomed', shouldZoom);
    elements.alignmentSection.classList.toggle('chart-is-zoomed', shouldZoom); // Toggle parent class

    if (alignment === 'U') {
        elements.alignmentChartGrid.classList.add('judge-choice-highlight');
    } else {
        elements.alignmentChartGrid.classList.remove('judge-choice-highlight');
    }
}

function showSketchInstructions() {
    if (elements.sketchInstructionArea && elements.sketchInstructionText && gameState.currentRolledAlignment && gameState.chosenPromptForRound) {
        const fullAlignmentName = ALIGNMENT_FULL_NAME_MAP[gameState.currentRolledAlignment] || gameState.currentRolledAlignment;
        elements.sketchInstructionText.innerHTML = `<strong style="font-size: 1.2em;">Players, sketch: ${fullAlignmentName} - \"${gameState.chosenPromptForRound}\"</strong>`;
        elements.sketchInstructionArea.style.display = 'block';
        resetTimer(); // Reset timer when instructions are shown
    } else {
        console.warn("Could not display sketch instructions. Missing elements, alignment, or prompt.");
        if (!gameState.currentRolledAlignment) console.warn(" -> Alignment roll result missing.");
        if (!gameState.chosenPromptForRound) console.warn(" -> Chosen prompt missing.");
    }
}
