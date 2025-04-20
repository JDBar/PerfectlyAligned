// --- Gobal Game State Variables ---
let players = []; // Array to hold player objects { name: "...", score: 0, tokens: {...}, avatar: "..." }
let currentPlayerIndex = 0;
let targetScore = 5;
let availableCards = [];
let currentlyDisplayedPrompts = [];
let chosenPromptForRound = null; // Stores the text of the clicked prompt
let selectedWinnerIndexForRound = null;
let recentAlignments = []; // Store the last 3 alignment results (abbreviations)
let currentRolledAlignment = null;
let timerInterval = null;
let timerTotalSeconds = 0;
let currentPartySize = 3; // NEW: State variable for player count

// Example usage (uncomment and define cardElement appropriately if needed):
// cardElement.classList.add('selected');   // when judge clicks a prompt
// cardElement.classList.remove('selected');
// cardElement.classList.add('disabled');   // when prompt is spent
// cardElement.classList.remove('disabled'); // when prompt is available again

// --- NEW: Audio ---
const sounds = {
    point_gain: new Audio('assets/audio/point_gain.wav'),
    roll: new Audio('assets/audio/roll.wav'),
    steal: new Audio('assets/audio/steal.wav'),
    timer_end: new Audio('assets/audio/timer_end.wav'),
    token_gain: new Audio('assets/audio/token_gain.wav'),
    win: new Audio('assets/audio/win.wav'),
    draw_prompts: new Audio('assets/audio/draw_prompts.wav') // Added draw prompts sound
};

function playSound(soundName) {
    if (sounds[soundName]) {
        sounds[soundName].currentTime = 0; // Rewind to start
        sounds[soundName].play().catch(e => console.warn(`Audio play failed for ${soundName}:`, e));
    } else {
        console.warn(`Sound not found: ${soundName}`);
    }
}

// --- NEW: Available Avatars ---
const availableAvatars = [
    'alienlady_avatar.png',
    'dadskeletonts_avatar.png', // Corrected typo
    'horse_avatar.png',
    'lizard_avatar.png',
    'ninjatp_avatar.png', // Corrected filename
    'robotp_avatar.png', // Corrected filename
    'glitchkitty_avatar.png',
    'mushgun.png',
    'pirateghost2_avatar.png',
    'vampiregirl_avatar.png'
    // Add others as needed, ensure they exist in constants.js and the assets folder
];
const defaultAvatar = availableAvatars[0]; // Default if needed
const avatarBasePath = '/assets/images/avatars/';

// --- Card Deck Data ---
const themedDecks = {
    core_white: [ // General Scenarios & Concepts
        "Ways to react to finding a wallet", "Ways to impress your partner's parents", "Ways to respond to a customer complaint",
        "Ways to decide what movie to watch", "Ways to cope with being stuck in traffic", "Ways to react to receiving a terrible gift",
        "Ways to handle a power outage", "Ways to react to your pet talking", "Ways to explore a secret passage",
        "Ways to run for local office", "Ways to give back to the community", "Types of home workouts", "Ways to beat the heat",
        "Ways to bond with your child", "Ways to get a baby to sleep", "Ways to get Stronger",
        "Ways to get that Beach Bod", "Ways to lose weight", "Ways to make C-Span more entertaining",
        "Ways to solve world hunger", "Types of Life Hacks", "Types of ideal living situations", "Ways to put on pants",
        "Types of roommate etiquette rules", "Ways to react to a roommate leaving dirty dishes", "Ways to sit",
        "Types of sleeping positions", "Ways to use a toilet", "Ways to wash your hands", "Types of water sports",
        "Ways to die", "Ways to dispose of garbage", "Ways to dump someone", "Ways to kiss someone",
        "Ways to listen to music", "Ways to propose", "Ways to rebel against authority",
        "Ways to use a 30-acre family estate you inherited",
        "Types of Phobias", "Types of excuses for being late", "Ways to stay motivated", "Types of bad habits",
        "Ways to impress your boss", "Types of last words", "Ways to manage time", "Ways to organize your home",
        "Types of negotiation strategies", "Ways to manage anger", "Ways to relax after a stressful day",
        "Types of love languages", "Ways to relieve stress", "Ways to make a first impression", "Types of travel experiences",
        "Ways to be environmentally conscious", "Ways to make new friends", "Types of fashion styles",
        "Reasons to go vegan", "Ways to survive the zombie apocalypse", "Ways to quit your 9-5 job",
        "Ways to act at a high school reunion", "Ways to handle being Freaky Friday'd", "Ways to describe a near-death experience",
        "Ways to attract someone out of your league", "Ways to make Ravioli", "Types of plants", "Types of animals",
        "Types of Sports", "Ways to eat a banana", "Types of Music Genres", "Types of get-rich-quick schemes"
    ],
    dilemmas_green: [ // Everyday Moral Quandaries
        "Ways to handle a minor fender-bender you caused", "Ways to react to a friend's bad haircut",
        "Ways to react to getting extra change from a cashier", "Ways to share snacks at work/school",
        "Ways to react to seeing someone shoplift essentials",
        "Ways to respond to an unethical request from your boss", "Ways to cheat on a test",
        "Ways to defend yourself", "Ways to end conflict with a spider", "Types of killing methods",
        "Ways to die", // Can fit here too
        "Reasons for not eating something (Fill in: \"I don't eat ____ because ____.\")",
        "Ways to respond to 'You're not a cop, right?'",
        "Ways to react to getting life in prison for a crime you didn't commit",
        "Types of Trolley Problem solutions"
    ],
    popculture_purple: [ // Media, Entertainment, Internet
        "Ways to direct the next big superhero movie", "Ways to win a reality TV show", "Ways to become a viral internet meme",
        "Ways to act at the Met Gala", "Ways to write the finale of a beloved TV series", "Types of Cereal Mascots",
        "Ways to make C-Span more entertaining", // Fits here too
        "Responses to 'Name a more iconic duo'",
        "Dishes to prepare for Gordon Ramsay ('What have you prepared?')",
        "Types of porn categories", // Definitely fits 17+ Taboo as well
        "Things that could be in the box ('Seven')"
    ],
    historical_brown: [ // Past Events & Figures
        "Ways to advise a historical leader", "Ways to react to witnessing a major historical event",
        "Ways to handle inventing something before its time", "Ways to react during the Y2K panic",
        "Types of prehistoric activities", "Types of ancient building techniques", "Types of world leaders", "Types of presidents"
    ],
    taboo_red: [ // 17+ Adult/Controversial
        "Ways to handle a morally gray scenario (17+)", "Ways to handle an awkward romantic encounter (17+)",
        "Ways to deal with a controversial social issue (17+)", "Types of 'Yo Mama' insults",
        "Types of tattoos and where to put them", "Types of drugs", "Types of porn categories",
        "Ways to respond to 'Stepbrother! I'm stuck in the dryer!'",
        "Ways to react to your SO leaving you for your ____ (Fill in blank)",
        "Ways to answer 'Does this outfit make me look ugly?'"
    ],
    local_blue: [ // Customizable / Regional
        "Ways to deal with [Local Town Issue/Mascot Name]", "Ways to act at [Local Festival/Event]",
        "Ways to explain [Local Slang Term] to an outsider", "Ways to react to [Local Landmark] disappearing"
        // Add more local ideas if applicable
    ],
    creative_cyan: [ // Creative Construction / Lists
        "Types of children's toys", "Types of fruit", "Types of themed weddings", "Types of hats", "Types of cars", "Types of school functions",
        "Types of pets", "Types of inter-species hybrids", "Types of nicknames for a daughter", "Types of pirate accessories",
        "Types of vanity plates", "Types of imaginary friends", "Types of animals", "Types of things to steal from a house",
        "Types of things to order at a coffee shop", "Types of kids on the School Bus", "Types of monsters",
        "Types of fictional professions", "Types of aquatic vehicles", "Ways to combine a taco, burger, and pizza", "Ways to eat a hotdog",
        "Types of facial hair", "Types of shoes", "Types of holiday traditions", "Types of unlikely explosives",
        "Types of things you can get in a can", "Types of Masks", "Types of kitchen utensils", "Types of anxiety dreams",
        "Types of nicknames for the sea", "Types of college electives", "Types of dietary restrictions",
        "Ways to hide things on your person discretely", "Types of personal usernames", "Types of epitaphs for tombstones",
        "Types of superpowers", "Types of synonyms for 'Yes'", "Types of donuts", "Types of world records to break",
        "Types of instruments of torture", "Types of euphemisms for death", "Types of childhood snacks", "Types of cryptids",
        "Types of things in space", "Types of clouds", "Types of alcoholic beverages", "Types of artistic mediums",
        "Types of educational strategies", "Types of book genres", "Types of Hot Drinks", "Types of nicknames for sons"
    ],
    hypothetical_magenta: [ // "What If" Scenarios / Roleplay Prompts
        "Ways to bring someone back from the dead", "Ways to approach an alien race", "Ways to be a wingman",
        "Ways to end malaria", "Ways to end the world",
        "Ways to pick someone up (romantically)", "Ways to reveal your child's gender",
        "Ways to stop a bank robbery", "Ways to tame a wild animal",
        "Ways to survive falling into the chimpanzee enclosure", "Ways to use a time machine",
        "First actions after waking from a 10-year coma",
        "Things a billionaire might leave their wealth to (Fill in: \"...to ____.\")",
        "Ways to explain pet death to a child ('Where did doggy go?')",
        "First things to enlarge with an Embiggening Ray",
        "Ways to respond to 'Spare some change?'",
        "Things hidden in Area 51's newest wing (Fill in: \"...home to ____?\"",
        "First things to shrink with a Shrink Ray",
        "Ways to answer 'What is your greatest strength?'",
        "Reasons to call off a wedding ('Why is the wedding off?')",
        "Advice to give if you became the richest person in the world",
        "Excuses for carrying a heavy, suspicious sack ('Need a hand?')",
        "Ways to handle taking two dates to prom",
        "Ways to react when surrounded by police ('Drop your weapon!')",
        "Ways to react to someone breaking into your car",
        "Ways to answer 'Do you know why I pulled you over?'",
        "First actions as the last person on Earth",
        "Ways to use an antigravity device", "Ways to use an invisibility cloak", "Ways to use teleportation",
        "Ways to deal with having a doppelgänger", "Ways to cope with being turned into a snail",
        "Ways to use mind-reading abilities", "Ways to use shapeshifting abilities",
        "Ways to react to having two weeks to live",
        "Ways to respond to your mechanic about replacing an air filter",
        "Ways to react to your spouse having amnesia ('Who are you?')",
        "Ways to respond to being asked to throw a match ('Rocky...')",
        "Reasons to object to a wedding union ('Does anyone object?')",
        "Ways to deal with an imminent city-destroying bomb",
        "Types of billionaires",
        "Ways to explain where babies come from",
        "Ways to answer 'What is your greatest weakness?'",
        "Things to order at [Judge's Choice Location] ('May I take your order?')",
        "Excuses for where you were last night ('Dad: Where were you?')"
    ]
};

// --- Alignment Examples Data ---
const alignmentExamplesMap = {
    LG: "<strong>Lawful Good:</strong> Superman, Captain America, Brienne of Tarth",
    NG: "<strong>Neutral Good:</strong> Spider-Man, Wonder Woman, Luke Skywalker (early)",
    CG: "<strong>Chaotic Good:</strong> Robin Hood, Han Solo (later), The Doctor (Doctor Who)",
    LN: "<strong>Lawful Neutral:</strong> Judge Dredd, James Bond (often), A typical soldier",
    TN: "<strong>True Neutral:</strong> The Watcher (Marvel), Tom Bombadil, Druids (often)",
    CN: "<strong>Chaotic Neutral:</strong> Jack Sparrow, Deadpool, Loki (sometimes)",
    LE: "<strong>Lawful Evil:</strong> Darth Vader, Dolores Umbridge, A corrupt politician",
    NE: "<strong>Neutral Evil:</strong> Lord Voldemort, Sauron, A purely self-serving mercenary",
    CE: "<strong>Chaotic Evil:</strong> The Joker, Cthulhu, Carnage (Marvel)",
    U:  "<strong>Judge's Choice:</strong> The Judge picks the alignment!"
};

// --- Declare references to HTML elements (will be assigned later) ---
let playerTokenAwardArea = null;
let roundActionsSection = null;
let winnerButtonContainer = null;
let awardButton = null;
let winnerArea = null;
let winnerNameSpan = null;
let playAgainButton = null;
let setupArea = null;
let playerCountDisplay = null;
let decrementPlayerCountButton = null;
let incrementPlayerCountButton = null;
let setPlayersButton = null;
let playerNamesInputArea = null;
let startGameButton = null;
let gameArea = null;
let judgeNameSpan = null;
let judgeAvatarDisplay = null;
let rollButton = null;
let scoreboardList = null;
let drawPromptsButton = null;
let rerollPromptsButton = null;
let promptDisplayArea = null;
let promptListClickable = null;
let alignmentChartGrid = null;
let dieDisplay = null;
let alignmentExamplesArea = null;
let sketchInstructionArea = null;
let sketchInstructionText = null;
let timerSlider = null;
let timerDisplay = null;
let startTimerButton = null;
let stopTimerButton = null;
let resetTimerButton = null;
let tutorialOverlay = null;
let tutorialBox = null;
let tutorialPrevButton = null;
let tutorialNextButton = null;
let tutorialSkipButton = null;
let showTutorialButton = null;
let tutorialStepIndicator = null;
let tutorialTitle = null;
let tutorialText = null;
let stealModalOverlay = null;
let stealModalBox = null;
let stealModalTitle = null;
let stealModalInfo = null;
let stealModalTargets = null;
let stealModalCancel = null;
let deckSelectionArea = null;
let initiateStealButton = null; // NEW: Reference for the new steal button

// --- Tutorial State Variables ---
let currentTutorialStep = 0;
const tutorialSteps = [
    {
        title: "Welcome to Perfectly Aligned!",
        text: "Get ready for a hilarious party game of quick thinking, wild creativity, and unexpected twists! In Perfectly Aligned, you'll compete to match prompts to alignments, outwit your friends, and win the Judge's favor. Let’s see who can be the most perfectly (or imperfectly) aligned!"
    },
    {
        title: "Set Up Your Crew",
        text: "Pick your party size (3–8 players), enter everyone’s name, and choose a unique avatar for each player—no duplicates! Next, select which decks of prompts you want to play with. The more decks, the wilder the game!"
    },
    {
        title: "How Each Round Works",
        text: "Each round, a new Judge is chosen. The Judge rolls the Alignment Die to reveal a random alignment (like Lawful Good or Chaotic Evil), then draws three prompts and picks their favorite for the round. The suspense begins!"
    },
    {
        title: "Draw, Doodle, or Describe!",
        text: "All non-Judge players have a limited time to sketch, doodle, or describe how the chosen prompt fits the rolled alignment. Be clever, be funny, be bold—whatever it takes to win the Judge’s vote!"
    },
    {
        title: "Judging & Special Tokens",
        text: "The Judge reviews all submissions and picks a winner, who scores a point! The Judge can also award special tokens for creativity, skill, or brilliant twists. Tokens can be spent to re-roll prompts or even steal points from rivals—use them wisely!"
    },
    {
        title: "Victory Awaits!",
        text: "The first player to reach the target score wins the game and eternal bragging rights! Ready to play? Click Skip or close this tutorial to start your perfectly aligned adventure!"
    }
];

// --- Functions ---

// Helper: Calculate total tokens for a player
function getPlayerTokenTotal(player) {
    return Object.values(player.tokens).reduce((sum, count) => sum + count, 0);
}

// Helper: Deduct a specific number of tokens from a player
function deductTokens(player, count) {
    let totalTokens = getPlayerTokenTotal(player);
    if (totalTokens < count) {
        console.log(`deductTokens: Player ${player.name} has ${totalTokens}, needs ${count}. Failed.`);
        return false; // Not enough tokens
    }
    let tokensToDeduct = count;
    const tokenTypes = Object.keys(player.tokens);
    for (const type of tokenTypes) {
        if (tokensToDeduct === 0) break;
        const available = player.tokens[type];
        const deductAmount = Math.min(tokensToDeduct, available);
        if (deductAmount > 0) {
            player.tokens[type] -= deductAmount;
            tokensToDeduct -= deductAmount; // Decrement remaining tokens to deduct
            console.log(`deductTokens: Deducted ${deductAmount} of type ${type} from ${player.name}. Remaining to deduct: ${tokensToDeduct}`);
        }
    }
    console.log(`deductTokens: Deduction finished for ${player.name}. Success.`);
    return true; // Deduction successful
}

function populateTokenAwardUI() {
    if (!playerTokenAwardArea) return;
    playerTokenAwardArea.innerHTML = '';
    const heading = document.createElement('h5');
    heading.textContent = "Award Achievement Tokens (Optional):";
    playerTokenAwardArea.appendChild(heading);
    const tokenTypes = {
        mindReader: "Close match to Judge's thought.",
        artBro: "Exceptional artistic skill.", // Changed key from "art bro"
        "perfectly aligned (tm)": "Brilliant alignment capture.",
        psychopath: "Surprising/unexpected interpretation."
    };

    players.forEach((player, playerIndex) => {
        if (playerIndex === currentPlayerIndex) return; // Skip Judge

        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-token-row';
        const nameSpan = document.createElement('span');
        nameSpan.className = 'player-token-name';
        nameSpan.textContent = player.name;
        playerDiv.appendChild(nameSpan);

        const choicesContainer = document.createElement('div');
        choicesContainer.className = 'token-choices-container';

        Object.keys(tokenTypes).forEach(tokenKey => {
            const tokenDesc = tokenTypes[tokenKey];
            const choiceSpan = document.createElement('span');
            choiceSpan.className = 'token-award-choice deselected';
            choiceSpan.dataset.playerIndex = playerIndex;
            choiceSpan.dataset.tokenType = tokenKey;
            const labelText = tokenKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            choiceSpan.appendChild(document.createTextNode(labelText));
            const tooltipSpan = document.createElement('span');
            tooltipSpan.className = 'token-tooltip';
            tooltipSpan.textContent = ` (${tokenDesc})`;
            choiceSpan.appendChild(tooltipSpan);
            choiceSpan.onclick = handleTokenChoiceClick;
            choicesContainer.appendChild(choiceSpan);
        });
        playerDiv.appendChild(choicesContainer);
        playerTokenAwardArea.appendChild(playerDiv);
    });
}
function updateTokenAvailability () {
    const awarded = new Set(
        [...document.querySelectorAll('.token-award-choice.selected')]
            .map(span => span.dataset.tokenType)
    );

    document.querySelectorAll('.token-award-choice').forEach(span => {
        const selected   = span.classList.contains('selected');
        const shouldDisable = awarded.has(span.dataset.tokenType) && !selected;

        span.classList.toggle('disabled-by-award', shouldDisable);
        span.tabIndex = shouldDisable ? -1 : 0;
    });
}


// Handler for clicking token choices
function handleTokenChoiceClick(event) {
    const choice = event.currentTarget;

    // Prevent interaction if disabled by award
    if (choice.classList.contains('disabled-by-award')) {
        return;
    }

    const isSelected = choice.classList.contains('selected');
    const playerRow = choice.closest('.player-token-row');

    if (isSelected) {
        // Deselecting the current choice
        choice.classList.remove('selected');
        choice.classList.add('deselected');
    } else {
        // Selecting a new choice for this player

        // Deselect any other choice currently selected *for this player*
        if (playerRow) {
            const currentlySelected = playerRow.querySelector('.token-award-choice.selected');
            if (currentlySelected) {
                currentlySelected.classList.remove('selected');
                currentlySelected.classList.add('deselected');
            }
        }
        // Select the new choice
        choice.classList.add('selected');
        choice.classList.remove('deselected');
        playSound('token_gain'); // Play sound when a token choice is selected
    }

    // Update availability of all tokens based on current selections
    updateTokenAvailability();
}

// Helper: Manage avatar selections to prevent duplicates
let selectedAvatars = {}; // Stores { selectId: avatarFile }

function updateAvatarOptions(changedSelectId = null) {
    const allSelects = document.querySelectorAll('.avatar-select');
    const currentSelections = {};
    allSelects.forEach(sel => {
        currentSelections[sel.id] = sel.value;
    });

    allSelects.forEach(sel => {
        const currentVal = sel.value;
        for (let option of sel.options) {
            const avatarFile = option.value;
            let isTaken = false;
            // Check if this avatar is taken by *another* select
            for (const [selectId, takenAvatar] of Object.entries(currentSelections)) {
                if (selectId !== sel.id && takenAvatar === avatarFile) {
                    isTaken = true;
                    break;
                }
            }
            option.disabled = isTaken;
            // Ensure the currently selected option for *this* select is never disabled
            if (avatarFile === currentVal) {
                option.disabled = false;
            }
        }
    });
}

function handleAvatarSelectionChange(event) {
    // This function might need adjustment or removal depending on how selection is handled without the select element.
    // For now, let's assume it's triggered manually after changing the avatar via buttons.
    const selectElement = event.target; // This will be the hidden select or the preview div
    const selectedAvatarFile = selectElement.value || selectElement.dataset.avatarFile; // Get value differently
    const previewElement = document.getElementById(selectElement.dataset.previewId);

    if (previewElement) {
        previewElement.style.backgroundImage = `url('${avatarBasePath}${selectedAvatarFile}')`;
        previewElement.dataset.avatarFile = selectedAvatarFile; // Store selection on preview
    }

    // Update the global state and potentially disable options if needed (though less relevant without visible selects)
    // selectedAvatars[selectElement.id] = selectedAvatarFile;
    // updateAvatarOptions(selectElement.id); // This function might become obsolete
    validateAvatarUniqueness(); // Add a new function to check uniqueness visually if needed
}

// NEW function to handle avatar cycling
function cycleAvatar(buttonElement, direction) {
    const avatarArea = buttonElement.closest('.avatar-selection-area');
    if (!avatarArea) return;

    const previewElement = avatarArea.querySelector('.avatar-preview');
    if (!previewElement) return;

    const currentAvatar = previewElement.dataset.avatarFile;
    let currentIndex = availableAvatars.indexOf(currentAvatar);

    if (currentIndex === -1) currentIndex = 0; // Default to first if not found

    let nextIndex = currentIndex + direction;

    if (nextIndex >= availableAvatars.length) {
        nextIndex = 0; // Wrap around to the start
    } else if (nextIndex < 0) {
        nextIndex = availableAvatars.length - 1; // Wrap around to the end
    }

    const nextAvatar = availableAvatars[nextIndex];

    // Update preview and store selection
    previewElement.style.backgroundImage = `url('${avatarBasePath}${nextAvatar}')`;
    previewElement.dataset.avatarFile = nextAvatar;

    // Optional: Visually indicate if the chosen avatar is taken by another player
    validateAvatarUniqueness();
}

// NEW or Modified function to check for uniqueness visually (optional)
function validateAvatarUniqueness() {
    const allPreviews = document.querySelectorAll('.avatar-preview');
    const selections = {};
    let duplicatesExist = false;

    allPreviews.forEach(preview => {
        const avatarFile = preview.dataset.avatarFile;
        if (avatarFile) {
            if (selections[avatarFile]) {
                selections[avatarFile]++;
                duplicatesExist = true;
            } else {
                selections[avatarFile] = 1;
            }
        }
    });

    allPreviews.forEach(preview => {
        const avatarFile = preview.dataset.avatarFile;
        if (avatarFile && selections[avatarFile] > 1) {
            preview.classList.add('avatar-taken'); // Add a class for visual feedback
        } else {
            preview.classList.remove('avatar-taken');
        }
    });

    // Optionally disable start button if duplicates exist
    if (startGameButton) {
         // Combine with name check
         const nameInputs = playerNamesInputArea.querySelectorAll('.player-name-input');
         let allNamesFilled = true;
         nameInputs.forEach(input => {
             if (input.value.trim() === '') allNamesFilled = false;
         });
         startGameButton.disabled = duplicatesExist || !allNamesFilled;

         // Update error message
         const errorSpan = document.getElementById('player-names-error');
         if (errorSpan) {
             let errorMsg = "";
             if (!allNamesFilled) errorMsg += "All player names must be filled in. ";
             if (duplicatesExist) errorMsg += "Each player must have a unique avatar.";
             errorSpan.textContent = errorMsg.trim();
         }
    }
}

function createNameInputs() {
    const count = currentPartySize; // Use the state variable

    playerNamesInputArea.innerHTML = ''; // Clear previous inputs
    selectedAvatars = {}; // Reset selected avatars

    for (let i = 0; i < count; i++) {
        const playerId = `player-${i}`;
        const defaultName = `Player ${i + 1}`;
        // Assign unique default avatars
        const defaultAvatarIndex = i % availableAvatars.length;
        const playerDefaultAvatar = availableAvatars[defaultAvatarIndex];

        const entryDiv = document.createElement('div');
        entryDiv.className = 'player-name-entry';

        // Name Input
        const nameLabel = document.createElement('label');
        nameLabel.htmlFor = `${playerId}-name`;
        nameLabel.textContent = `Player ${i + 1} Name:`;
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.id = `${playerId}-name`;
        nameInput.name = `${playerId}-name`;
        nameInput.placeholder = `Enter name for Player ${i + 1}`;
        nameInput.value = defaultName;
        nameInput.className = 'player-name-input';
        nameInput.required = true;
        nameInput.addEventListener('input', validateAvatarUniqueness); // Also check avatars on name input

        // Avatar Selection Area
        const avatarArea = document.createElement('div');
        avatarArea.className = 'avatar-selection-area';

        const avatarPreview = document.createElement('div');
        avatarPreview.id = `${playerId}-avatar-preview`;
        avatarPreview.className = 'avatar-preview';
        avatarPreview.style.backgroundImage = `url('${avatarBasePath}${playerDefaultAvatar}')`; // Set unique default preview
        avatarPreview.dataset.avatarFile = playerDefaultAvatar; // Store initial avatar filename

        // ADDED Cycling Buttons
        const prevButton = document.createElement('button');
        prevButton.type = 'button';
        prevButton.textContent = '<';
        prevButton.className = 'avatar-cycle-button prev';
        prevButton.onclick = (e) => cycleAvatar(e.target, -1);

        const nextButton = document.createElement('button');
        nextButton.type = 'button';
        nextButton.textContent = '>';
        nextButton.className = 'avatar-cycle-button next';
        nextButton.onclick = (e) => cycleAvatar(e.target, 1);

        // Append elements
        avatarArea.appendChild(prevButton); // Add prev button
        avatarArea.appendChild(avatarPreview);
        avatarArea.appendChild(nextButton); // Add next button

        entryDiv.appendChild(nameLabel);
        entryDiv.appendChild(nameInput);
        entryDiv.appendChild(avatarArea); // Add modified avatar section

        // Append each entryDiv directly to playerNamesInputArea (which is already the flex container)
        playerNamesInputArea.appendChild(entryDiv);
    }

    // Initial validation check
    validateAvatarUniqueness();

    // Show the name input area and start button
    if (playerNamesInputArea) playerNamesInputArea.style.display = 'block';
    if (startGameButton) startGameButton.style.display = 'inline-block'; // Or 'block'
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function updateJudgeDisplay() {
    if (judgeNameSpan && judgeAvatarDisplay) {
        if (players.length > 0 && players[currentPlayerIndex]) {
            const judge = players[currentPlayerIndex];
            judgeNameSpan.textContent = judge.name;
            judgeAvatarDisplay.style.backgroundImage = `url('${judge.avatar}')`;
            judgeAvatarDisplay.title = judge.name; // Tooltip for avatar
        } else {
            judgeNameSpan.textContent = "Waiting...";
            judgeAvatarDisplay.style.backgroundImage = 'none';
        }
    }
    updateRerollButtonState();
}

// Manage the re-roll button's visibility and enabled state
function updateRerollButtonState() {
    if (!rerollPromptsButton || players.length === 0) return;
    const judge = players[currentPlayerIndex];
    // Check if judge exists and has tokens
    const judgeHasTokens = judge && Object.values(judge.tokens).some(count => count > 0);
    const promptsDrawn = currentlyDisplayedPrompts.length > 0;
    const promptChosen = !!chosenPromptForRound;

    // Show the button if prompts are drawn AND a prompt hasn't been chosen yet
    rerollPromptsButton.style.display = (promptsDrawn && !promptChosen) ? 'inline-block' : 'none';
    // Enable the button only if the judge has tokens, prompts are drawn, and a prompt hasn't been chosen
    rerollPromptsButton.disabled = !(judgeHasTokens && promptsDrawn && !promptChosen);
}

function startGame() {
    console.log("Starting game...");
    players = [];
    const nameInputs = document.querySelectorAll('.player-name-input');
    // MODIFIED: Get avatar from preview data attribute
    const avatarPreviews = document.querySelectorAll('.avatar-preview');
    let allNamesEntered = true;
    let uniqueAvatars = true;
    const usedAvatars = new Set();

    // Use currentPartySize instead of counting inputs
    if (nameInputs.length !== currentPartySize || avatarPreviews.length !== currentPartySize) {
        console.error("Mismatch between expected player count and input/avatar elements!");
        alert("Setup error: Player count mismatch. Please try setting players again.");
        return;
    }

    nameInputs.forEach((input, index) => {
        const name = input.value.trim();
        // Get avatar from the preview's data attribute
        const avatarFile = avatarPreviews[index] ? avatarPreviews[index].dataset.avatarFile : defaultAvatar;

        if (name === "") {
            allNamesEntered = false;
        }
        if (usedAvatars.has(avatarFile)) {
            uniqueAvatars = false;
        }
        usedAvatars.add(avatarFile);

        players.push({
            name: name || `Player ${index + 1}`,
            score: 0,
            tokens: { mindReader: 0, artBro: 0, "perfectly aligned (tm)": 0, psychopath: 0 }, // Changed key from "art bro"
            avatar: `${avatarBasePath}${avatarFile}` // Store the full path
        });
    });

    // Update validation messages based on checks
    const errorSpan = document.getElementById('player-names-error');
    let errorMsg = "";
    if (!allNamesEntered) errorMsg += "Please enter names for all players. ";
    if (!uniqueAvatars) errorMsg += "Each player must have a unique avatar.";
    if (errorSpan) errorSpan.textContent = errorMsg.trim();

    if (!allNamesEntered || !uniqueAvatars) {
        players = []; // Clear partially created players if validation fails
        return;
    }

    targetScore = players.length >= 6 ? 3 : 5;
    currentPlayerIndex = 0;

    availableCards = [];
    const selectedDeckLabels = document.querySelectorAll('#deck-selection-area .deck-label:not(.deselected)');
    if (selectedDeckLabels.length === 0) {
        alert("Please select at least one deck!");
        return;
    }
    selectedDeckLabels.forEach(label => {
        const deckKey = label.dataset.deckKey;
        if (themedDecks.hasOwnProperty(deckKey)) {
            availableCards = availableCards.concat(themedDecks[deckKey]);
        }
    });
    if (availableCards.length < 3) {
        alert("Warning: Fewer than 3 cards available from selected decks! Game might end early.");
        console.warn(`Game started with only ${availableCards.length} cards.`);
    }
    shuffleArray(availableCards);
    currentlyDisplayedPrompts = [];
    chosenPromptForRound = null;
    selectedWinnerIndexForRound = null;
    recentAlignments = [];

    if(setupArea) setupArea.style.display = 'none';
    if(gameArea) gameArea.style.display = 'block';
    if(winnerArea) winnerArea.style.display = 'none';
    updateJudgeDisplay();
    updateScoreboard();
    populateWinnerButtons();
    populateTokenAwardUI();

    // Reset round elements
    if (dieDisplay) dieDisplay.textContent = '?';
    document.querySelectorAll('.alignment-cell').forEach(cell => cell.classList.remove('highlighted', 'flicker'));
    if (alignmentChartGrid) alignmentChartGrid.classList.remove('judge-choice-highlight');
    if (alignmentExamplesArea) alignmentExamplesArea.style.display = 'none';
    if (promptListClickable) promptListClickable.innerHTML = '';
    const promptInstruction = promptDisplayArea ? promptDisplayArea.querySelector('p') : null;
    if(promptInstruction) promptInstruction.textContent = 'Judge: Click "Draw Prompts"';
    if(rollButton) rollButton.disabled = false;
    if(drawPromptsButton) drawPromptsButton.disabled = false;
    if(awardButton) awardButton.disabled = true;
    if(rerollPromptsButton) {
        rerollPromptsButton.style.display = 'none'; // Ensure hidden at start
        rerollPromptsButton.disabled = true; // Ensure disabled at start
    }
    currentRolledAlignment = null;
    if (sketchInstructionArea) sketchInstructionArea.style.display = 'none';
    stopTimer();
    if (timerSlider) timerSlider.disabled = false;
}

function drawAndDisplayPrompts() {
    if (!promptListClickable) return;
    promptListClickable.innerHTML = '';
    currentlyDisplayedPrompts = [];

    // Play sound effect
    playSound('draw_prompts');

    if (availableCards.length < 3) {
        alert("Not enough cards left in the deck to draw 3!");
        if(promptDisplayArea) {
             const instruction = promptDisplayArea.querySelector('p');
             if (instruction) instruction.textContent = 'Not enough cards left!';
        }
        if(drawPromptsButton) drawPromptsButton.disabled = true;
        if(awardButton) awardButton.disabled = true;
        if(rerollPromptsButton) rerollPromptsButton.style.display = 'none'; // Ensure it's hidden if not enough cards
        return;
    }

    const selectedIndices = [];
    while (selectedIndices.length < 3) {
        const randomIndex = Math.floor(Math.random() * availableCards.length);
        if (!selectedIndices.includes(randomIndex)) selectedIndices.push(randomIndex);
    }

    currentlyDisplayedPrompts = [
        availableCards[selectedIndices[0]], availableCards[selectedIndices[1]], availableCards[selectedIndices[2]]
    ];

    currentlyDisplayedPrompts.forEach((promptText, index) => {
        const listItem = document.createElement('li');
        listItem.classList.add('prompt-choice', 'deal-animation');
        listItem.dataset.promptIndex = index;
        listItem.textContent = promptText;
        listItem.onclick = handlePromptClick; // Attach click handler
        promptListClickable.appendChild(listItem);
    });

    chosenPromptForRound = null;
    if(awardButton) awardButton.disabled = true;
    if(drawPromptsButton) drawPromptsButton.disabled = true;
    // Keep roll button enabled until prompt is CHOSEN
    // if(rollButton) rollButton.disabled = true;
    const promptInstruction = promptDisplayArea ? promptDisplayArea.querySelector('p') : null;
    if(promptInstruction) promptInstruction.textContent = 'Judge: Click one prompt below to select it for the round.';
    // Show and update the reroll button state AFTER drawing prompts
    updateRerollButtonState();
}

function handlePromptClick(event) {
    const selectedLi = event.currentTarget;
    const newPromptText = selectedLi.textContent;

    // If clicking the already selected card, do nothing (or could deselect, but let's stick to swapping)
    if (chosenPromptForRound === newPromptText) return;

    // Deselect previously selected card, if any
    const previouslySelected = promptListClickable.querySelector('.prompt-choice.selected');
    if (previouslySelected) {
        previouslySelected.classList.remove('selected');
        previouslySelected.classList.remove('disabled'); // Re-enable it visually
        // No need to re-attach onclick, it should still be there
    }

    // Select the new card
    chosenPromptForRound = newPromptText;
    selectedLi.classList.add('selected');

    // Visually disable other cards (but keep clickable for swapping)
    document.querySelectorAll('.prompt-choice').forEach(item => {
        if (item !== selectedLi) {
            item.classList.add('disabled'); // Keep the visual cue
            item.classList.remove('selected'); // Ensure no others are selected
        }
    });

    // Disable re-roll button once a choice is made
    if(rerollPromptsButton) {
        rerollPromptsButton.disabled = true;
        rerollPromptsButton.style.display = 'none';
    }

    // Show Sketch Instructions & Timer
    if (sketchInstructionArea && sketchInstructionText && currentRolledAlignment) {
        const alignmentFullNameMap = {
            LG: "Lawful Good", NG: "Neutral Good", CG: "Chaotic Good",
            LN: "Lawful Neutral", TN: "True Neutral", CN: "Chaotic Neutral",
            LE: "Lawful Evil", NE: "Neutral Evil", CE: "Chaotic Evil",
            U:  "Judge's Choice"
        };
        const fullAlignmentName = alignmentFullNameMap[currentRolledAlignment] || currentRolledAlignment;
        sketchInstructionText.innerHTML = `<strong style="font-size: 1.2em;">Players, sketch: ${fullAlignmentName} - \"${chosenPromptForRound}\"</strong>`;
        sketchInstructionArea.style.display = 'block';
        resetTimer(); // Reset timer whenever a prompt is chosen/changed
    } else {
        console.warn("Could not display sketch instructions. Area, text, or alignment missing.");
        if (!currentRolledAlignment) console.warn(" -> Alignment roll result missing.");
        // Don't hide sketch area if alignment is missing but prompt is chosen
        if (sketchInstructionArea) sketchInstructionArea.style.display = 'none';
    }
}

// Handle the re-roll click
function handlePromptReRoll() {
    const judge = players[currentPlayerIndex];
    const tokenTypes = Object.keys(judge.tokens);
    let tokenSpent = false;

    for (const tokenType of tokenTypes) {
        if (judge.tokens[tokenType] > 0) {
            judge.tokens[tokenType]--;
            tokenSpent = true;
            break;
        }
    }

    if (tokenSpent) {
        updateScoreboard();
        if(rerollPromptsButton) rerollPromptsButton.disabled = true; // Disable immediately after use
        drawAndDisplayPrompts();
    } else {
        console.warn("Re-roll attempted, but Judge has no tokens.");
        alert("You don't have any tokens to spend on a re-roll!");
        updateRerollButtonState();
    }
}

function populateWinnerButtons() {
    if (!winnerButtonContainer) return;
    winnerButtonContainer.innerHTML = '';

    if (players.length <= 1) {
        winnerButtonContainer.innerHTML = '<p><em>Not enough players to select a winner.</em></p>';
        return;
    }

    let buttonsAdded = 0;
    players.forEach((player, index) => {
        if (index !== currentPlayerIndex) {
            const button = document.createElement('button');
            // ADDED class for wrapping
            button.className = 'winner-button player-name-display';
            button.dataset.playerIndex = index;
            button.textContent = player.name;
            button.onclick = handleWinnerButtonClick;
            winnerButtonContainer.appendChild(button);
            buttonsAdded++;
        }
    });

    if (buttonsAdded === 0) {
         winnerButtonContainer.innerHTML = '<p><em>Error: Could not find players to select.</em></p>';
    }
}

// Handler for winner button clicks
function handleWinnerButtonClick(event) {
    const selectedButton = event.currentTarget;
    const winnerIndex = parseInt(selectedButton.dataset.playerIndex);

    if (isNaN(winnerIndex)) {
        console.error("Invalid player index on winner button:", selectedButton.dataset.playerIndex);
        alert("Error selecting winner. Please try again.");
        return;
    }
    if (!chosenPromptForRound) {
        alert("Please select a prompt for the round before choosing a winner.");
        return;
    }
    selectedWinnerIndexForRound = winnerIndex;
    playSound('point_gain'); // Play point gain sound immediately on winner selection
    document.querySelectorAll('.winner-button').forEach(btn => btn.classList.remove('selected'));
    selectedButton.classList.add('selected');
    if (awardButton) awardButton.disabled = false;
}

// Award point and tokens, then advance
function awardPointAndAdvance() {
    const winnerIndex = selectedWinnerIndexForRound;

    if (winnerIndex === undefined || winnerIndex === null || isNaN(winnerIndex) || !players[winnerIndex]) {
        alert("Error: No winner selected or invalid winner.");
        console.error("awardPointAndAdvance called with invalid or missing selectedWinnerIndexForRound:", winnerIndex);
        if(awardButton) awardButton.disabled = true;
        return;
    }
    if (!chosenPromptForRound) {
        alert("Error: Prompt not selected.");
        if(awardButton) awardButton.disabled = true;
        return;
    }

    const chosenPromptText = chosenPromptForRound;
    players[winnerIndex].score += 1;
    // playSound('point_gain'); // REMOVED: Moved to handleWinnerButtonClick

    // Award tokens
    const awardedTokenDetails = [];
    const selectedTokenSpans = playerTokenAwardArea ? playerTokenAwardArea.querySelectorAll('.token-award-choice.selected') : [];
    selectedTokenSpans.forEach(span => {
        const playerIndex = parseInt(span.dataset.playerIndex);
        const tokenType = span.dataset.tokenType;
        if (!isNaN(playerIndex) && players[playerIndex] && tokenType) {
            if (!players[playerIndex].tokens[tokenType]) {
                players[playerIndex].tokens[tokenType] = 0;
            }
            players[playerIndex].tokens[tokenType]++;
            awardedTokenDetails.push(`${players[playerIndex].name} gets ${tokenType}`);
        }
    });

    // Remove used card
    const cardIndexToRemove = availableCards.indexOf(chosenPromptText);
    if (cardIndexToRemove > -1) {
        availableCards.splice(cardIndexToRemove, 1);
    } else { console.error(`Could not find prompt "${chosenPromptText}" in availableCards!`); }

    updateScoreboard();

    // Check win condition
    if (players[winnerIndex].score >= targetScore) {
        console.log(`${players[winnerIndex].name} wins the game!`);
        playSound('win'); // Play win sound
        showWinner(players[winnerIndex].name);
        return; // Stop execution if game is won
    }
    advanceToNextRound();
}

function advanceToNextRound() {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    updateJudgeDisplay();
    populateWinnerButtons();
    populateTokenAwardUI();

    // Reset UI elements
    if(dieDisplay) dieDisplay.textContent = '?';
    document.querySelectorAll('.alignment-cell').forEach(cell => cell.classList.remove('highlighted', 'flicker'));
    if (alignmentChartGrid) alignmentChartGrid.classList.remove('judge-choice-highlight');
    if (alignmentExamplesArea) {
         alignmentExamplesArea.style.display = 'none';
         const examplesP = alignmentExamplesArea.querySelector('p');
         if (examplesP) {
             examplesP.innerHTML = '<em>Hover over grid or wait for roll...</em>';
         }
    }
    if (promptListClickable) promptListClickable.innerHTML = '';
    const promptInstruction = promptDisplayArea ? promptDisplayArea.querySelector('p') : null;
    if(promptInstruction) promptInstruction.textContent = 'Judge: Click "Draw Prompts"';
    chosenPromptForRound = null;
    selectedWinnerIndexForRound = null;
    currentRolledAlignment = null;
    document.querySelectorAll('.winner-button.selected').forEach(btn => btn.classList.remove('selected'));
    if(rollButton) rollButton.disabled = false;
    if(drawPromptsButton) drawPromptsButton.disabled = false;
    if(awardButton) awardButton.disabled = true;
    if(rerollPromptsButton) {
        rerollPromptsButton.style.display = 'none';
        rerollPromptsButton.disabled = true;
    }
    document.querySelectorAll('.steal-target-area').forEach(area => {
        area.style.display = 'none';
        area.innerHTML = '';
    });
    if (sketchInstructionArea) sketchInstructionArea.style.display = 'none';
    stopTimer();
    if (timerSlider) timerSlider.disabled = false;

    // Ensure zoom class is removed if round advances unexpectedly mid-roll
    if (alignmentChartGrid) alignmentChartGrid.classList.remove('alignment-chart-zoomed');
    clearTimeout(zoomTimeout); // Clear any pending zoom removal
    clearInterval(flickerInterval); // Clear flicker interval

    window.scrollTo(0, 0);
}

function showWinner(winnerName) {
    if(gameArea) gameArea.style.display = 'none';
    if(winnerNameSpan) winnerNameSpan.textContent = winnerName;
    if(winnerArea) winnerArea.style.display = 'block';
}

function resetGame() {
    window.location.reload(); // Simple way to reset everything
}

function updateScoreboard() {
    if (!scoreboardList) return;
    console.log("updateScoreboard: Rebuilding scoreboard..."); // LOGGING
    scoreboardList.innerHTML = '';
    players.forEach((player, index) => {
        const listItem = document.createElement('li');
        listItem.dataset.playerIndex = index;

        // Avatar Display
        const avatarSpan = document.createElement('span');
        avatarSpan.className = 'avatar-display-small';
        avatarSpan.style.backgroundImage = `url('${player.avatar}')`;
        avatarSpan.title = player.name; // Tooltip
        listItem.appendChild(avatarSpan);

        // Name and Score
        const scoreSpan = document.createElement('span');
        // ADDED class for wrapping
        scoreSpan.className = 'player-name-display';
        scoreSpan.textContent = ` ${player.name}: ${player.score}`;
        listItem.appendChild(scoreSpan);

        // Token Display
        const tokenSpan = document.createElement('span');
        tokenSpan.className = 'token-display';
        let tokenString = '';
        const tokens = player.tokens;
        const totalTokens = getPlayerTokenTotal(player);
        const tokenOrder = ['mindReader', 'artBro', 'perfectly aligned (tm)', 'psychopath']; // Define order, changed "art bro"

        tokenOrder.forEach(tokenType => {
            if (tokens[tokenType] > 0) {
                // Simple representation: M=MindReader, T=Technical, A=Alignment, P=PlotTwist
                const initial = tokenType.charAt(0).toUpperCase();
                tokenString += `<span class="token-icon token-${tokenType}" title="${tokenType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} (${tokens[tokenType]})">${initial}${tokens[tokenType] > 1 ? `x${tokens[tokenType]}` : ''}</span> `;
            }
        });

        tokenSpan.innerHTML = tokenString.trim() === '' ? ' (No tokens)' : tokenString.trim();
        if (tokenString.trim() === '') {
            tokenSpan.classList.add('no-tokens');
        }
        listItem.appendChild(tokenSpan);

        // Steal Button Area
        const stealButtonArea = document.createElement('span');
        stealButtonArea.className = 'steal-button-area';

        // Check if there's at least one valid target to steal from
        let canSteal = false;
        if (totalTokens >= 3 && players.length > 1) {
            canSteal = players.some((p, i) => i !== index && p.score > 0);
        }
        console.log(`updateScoreboard: Player ${index} (${player.name}) - Tokens: ${totalTokens}, Can Steal: ${canSteal}`); // LOGGING

        // Add Steal Point Button if conditions are met
        if (canSteal) {
            const stealButton = document.createElement('button');
            stealButton.textContent = 'Steal (3)';
            stealButton.className = 'steal-button';
            stealButton.title = 'Spend 3 tokens to steal 1 point';
            console.log(`updateScoreboard: Adding steal button listener for player index ${index}`); // LOGGING
            stealButton.onclick = () => initiateSteal(index);
            stealButtonArea.appendChild(stealButton);
            console.log(`Steal button clicked for player index: ${index}`); // LOGGING
        }

        listItem.appendChild(stealButtonArea);

        scoreboardList.appendChild(listItem);
    });

    const targetScoreDisplay = document.getElementById('target-score-display');
    if (targetScoreDisplay) {
        targetScoreDisplay.textContent = `First to ${targetScore} points wins!`;
    }
    console.log("updateScoreboard: Finished rebuilding."); // LOGGING

}

// NEW: Function to show the steal modal
function showStealModal() {
    if (stealModalOverlay) {
        console.log("showStealModal: Overlay element found:", stealModalOverlay); // LOGGING
        stealModalOverlay.classList.add('visible');
        console.log("showStealModal: Added 'visible' class."); // LOGGING
    } else {
        console.error("showStealModal: stealModalOverlay element not found!"); // LOGGING
    }

    }

// NEW: Function to hide the steal modal
function hideStealModal() {
    if (stealModalOverlay) {
        stealModalOverlay.classList.remove('visible');
        // Clear targets when hiding
        if (stealModalTargets) stealModalTargets.innerHTML = '';
        console.log("hideStealModal: Removed 'visible' class and cleared targets."); // LOGGING
    } else {
        console.error("hideStealModal: stealModalOverlay element not found!"); // LOGGING
    }
    }

// NEW: Function to initiate the steal process by showing the modal
function initiateSteal(stealingPlayerIndex) {
    const judge = players[currentPlayerIndex];
    const stealingPlayer = players[stealingPlayerIndex];
    if (!stealingPlayer || getPlayerTokenTotal(stealingPlayer) < 3) {
        console.warn("Steal initiated by player with insufficient tokens.");
        alert("You need at least 3 tokens to steal!"); // Should be prevented by button logic, but double-check
        return;
    }

    if (!stealModalTargets || !stealModalTitle || !stealModalInfo) {
        console.error("Steal modal elements not found!");
        return;
    }

    stealModalTargets.innerHTML = ''; // Clear previous targets
    stealModalTitle.textContent = `${judge.name}: steal from…`;
    stealModalInfo.textContent = `Choose a player to steal 1 point from (costs 3 tokens):`;

    let potentialTargets = 0;
    players.forEach((targetPlayer, targetIndex) => {
        if (targetIndex !== stealingPlayerIndex && targetPlayer.score > 0) {
            const targetButton = document.createElement('button');
            // Use a standard button class if you have one
            targetButton.className = 'steal-target-button ui-button';
            targetButton.textContent = `${targetPlayer.name} (${targetPlayer.score} points)`;
            targetButton.onclick = () => confirmSteal(stealingPlayerIndex, targetIndex);
            stealModalTargets.appendChild(targetButton);
            potentialTargets++;
        }
    });

    if (potentialTargets > 0) {
        console.log(`initiateSteal: Showing steal modal for player ${stealingPlayer.name} with ${potentialTargets} targets.`);
        showStealModal(); // Show the populated modal
    } else {
        // Should not happen if steal button was shown correctly, but handle defensively
        console.warn("Steal initiated, but no valid targets found.");
        alert("There are no players with points to steal from right now.");
    }
}

// Confirm and execute the steal action
function confirmSteal(stealingPlayerIndex, targetPlayerIndex) {
    const stealingPlayer = players[stealingPlayerIndex];
    const targetPlayer = players[targetPlayerIndex];

    if (!stealingPlayer || !targetPlayer) {
        console.error("Invalid player index for steal action.");
        return;
    }

    if (getPlayerTokenTotal(stealingPlayer) < 3) {
        alert(`${stealingPlayer.name} does not have enough tokens (needs 3).`);
        console.warn(`confirmSteal: ${stealingPlayer.name} tried to steal without enough tokens.`);
        return;
    }
    if (targetPlayer.score <= 0) {
        alert(`${targetPlayer.name} has no points to steal.`);
        console.warn(`confirmSteal: Target ${targetPlayer.name} has no points.`);
        return;
    }

    // Deduct tokens first
    const deductionSuccessful = deductTokens(stealingPlayer, 3);

    if (deductionSuccessful) {
        stealingPlayer.score++;
        targetPlayer.score--;
        playSound('steal'); // Play steal sound
        console.log(`${stealingPlayer.name} stole a point from ${targetPlayer.name}`);
        updateScoreboard(); // Update display immediately

        // Hide the target selection area after successful steal
        const listItem = scoreboardList.querySelector(`li[data-player-index="${stealingPlayerIndex}"]`);
        if (listItem) {
            const stealTargetArea = listItem.querySelector('.steal-target-area');
            if (stealTargetArea) {
                stealTargetArea.style.display = 'none';
                stealTargetArea.innerHTML = '';
            }
        }

        // Hide the modal after successful steal
        hideStealModal();
        console.log("confirmSteal: Steal modal hidden after successful steal.");

        // Check win condition for the stealing player
        if (stealingPlayer.score >= targetScore) {
            console.log(`${stealingPlayer.name} wins the game by stealing!`);
            playSound('win');
            showWinner(stealingPlayer.name);
        }
    } else {
        // This case should ideally be prevented by the initial check, but handle defensively
        console.error("Token deduction failed unexpectedly during steal.");
        alert("An error occurred while trying to deduct tokens.");
    }
}


let flickerInterval = null;
let zoomTimeout = null; // Keep track of zoom timeout

function handleRollClick() {
    if (!rollButton || !dieDisplay || !alignmentExamplesArea || !alignmentChartGrid) {
        console.error("Required elements for roll not found!");
        return;
    }
    rollButton.disabled = true;
    dieDisplay.textContent = '?';
    dieDisplay.classList.add('rolling');
    playSound('roll'); // Play roll sound
    alignmentExamplesArea.style.display = 'none';
    alignmentChartGrid.classList.remove('judge-choice-highlight');
    const alignmentCells = document.querySelectorAll('.alignment-cell');
    alignmentCells.forEach(cell => {
        cell.classList.remove('highlighted', 'flicker', 'flicker-blue');
    });

    // --- NEW: Add zoom class ---
    alignmentChartGrid.classList.add('alignment-chart-zoomed');
    // Clear any previous zoom removal timeout
    clearTimeout(zoomTimeout);


    flickerInterval = setInterval(() => {
        alignmentCells.forEach(cell => cell.classList.remove('flicker', 'flicker-blue')); // Remove blue class too
        const randomIndex = Math.floor(Math.random() * alignmentCells.length);
        // Ensure flicker only happens if zoomed class is present
        if (alignmentChartGrid.classList.contains('alignment-chart-zoomed')) {
             alignmentCells[randomIndex].classList.add('flicker', 'flicker-blue'); // Add blue class
        }
    }, 100);

    setTimeout(() => {
        clearInterval(flickerInterval);
        flickerInterval = null; // Clear the interval ID

        // --- Roll Logic ---
        const alignments = ["LG", "NG", "CG", "LN", "TN", "CN", "LE", "NE", "CE", "U"];
        const rollIndex = Math.floor(Math.random() * alignments.length);
        currentRolledAlignment = alignments[rollIndex];

        dieDisplay.textContent = currentRolledAlignment;
        dieDisplay.classList.remove('rolling');

        // Highlight the final result
        alignmentCells.forEach(cell => {
            cell.classList.remove('flicker', 'flicker-blue'); // Clear flicker from all
            if (cell.dataset.alignment === currentRolledAlignment) {
                cell.classList.add('highlighted');
            } else {
                cell.classList.remove('highlighted');
            }
        });

        // Special handling for Judge's Choice
        if (currentRolledAlignment === 'U') {
            alignmentChartGrid.classList.add('judge-choice-highlight');
        } else {
            alignmentChartGrid.classList.remove('judge-choice-highlight');
        }

        // Display examples for the rolled alignment
        if (alignmentExamplesArea) {
            const examplesP = alignmentExamplesArea.querySelector('p');
            if (examplesP && alignmentExamplesMap[currentRolledAlignment]) {
                examplesP.innerHTML = alignmentExamplesMap[currentRolledAlignment];
            } else if (examplesP) {
                examplesP.innerHTML = "<em>Examples not available for this alignment.</em>";
            }
            // Keep examples hidden until zoom out? Or show them small below zoomed grid?
            // For now, let's delay showing examples until after zoom out.
            // alignmentExamplesArea.style.display = 'block';
        }

        // Enable drawing prompts
        if (drawPromptsButton) drawPromptsButton.disabled = false;
        const promptInstruction = promptDisplayArea ? promptDisplayArea.querySelector('p') : null;
        if(promptInstruction) promptInstruction.textContent = 'Judge: Click "Draw Prompts"';
        updateRerollButtonState(); // Check if reroll should be enabled now

        // --- NEW: Remove zoom class after a delay ---
        // Wait a bit longer after result shown before shrinking
        zoomTimeout = setTimeout(() => {
            alignmentChartGrid.classList.remove('alignment-chart-zoomed');
            // Show examples *after* zoom out
             if (alignmentExamplesArea) {
                 alignmentExamplesArea.style.display = 'block';
             }
        }, 1000); // Wait 1 second after result before shrinking


    }, 1500); // Original duration for roll effect
}

// --- Timer Functions ---
function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// NEW: Function to update the timer display element
function updateTimerDisplay(secondsToDisplay) {
    if (timerDisplay) {
        timerDisplay.textContent = formatTime(secondsToDisplay);
    }
}

// Update display based on slider value
function updateTimerDisplayFromSlider() {
    if (timerSlider && timerDisplay) {
        timerTotalSeconds = parseInt(timerSlider.value);
        timerDisplay.textContent = formatTime(timerTotalSeconds);
    }
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval); // Clear existing interval if any

    const durationText = timerDisplay.textContent;
    const parts = durationText.split(':');
    if (parts.length !== 2) {
        console.error("Invalid timer display format:", durationText);
        return; // Exit if format is wrong
    }
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);

    if (isNaN(minutes) || isNaN(seconds)) {
         console.error("Invalid time values parsed:", minutes, seconds);
         return; // Exit if parsing failed
    }

    timerTotalSeconds = (minutes * 60) + seconds;
    let remainingSeconds = timerTotalSeconds;

    if (remainingSeconds <= 0) {
        console.warn("Timer started with 0 or negative duration.");
        updateTimerDisplay(0); // Ensure display shows 0
        return; // Don't start interval if duration is zero or less
    }

    // Disable start button, enable stop button
    if(startTimerButton) startTimerButton.disabled = true;
    if(stopTimerButton) stopTimerButton.disabled = false;
    if(timerSlider) timerSlider.disabled = true; // Disable slider while running
    if(sketchInstructionArea) sketchInstructionArea.classList.add('timer-active'); // Add glow class

    updateTimerDisplay(remainingSeconds); // Initial display update

    timerInterval = setInterval(() => {
        remainingSeconds--;
        updateTimerDisplay(remainingSeconds); // Ensure this uses the new function

        if (remainingSeconds <= 0) {
            playSound('timer_end'); // Play sound EXACTLY when timer hits 0
            clearInterval(timerInterval);
            timerInterval = null;
            if(startTimerButton) startTimerButton.disabled = true; // Keep start disabled
            if(stopTimerButton) stopTimerButton.disabled = true; // Disable stop
            if(timerSlider) timerSlider.disabled = false; // Re-enable slider
            if(sketchInstructionArea) sketchInstructionArea.classList.remove('timer-active'); // Remove glow class
            // Optionally show an alert or message AFTER sound plays and interval cleared
            alert("Time's up! Present your drawings!"); // Added alert
            console.log("Timer finished.");
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        console.log("Timer stopped manually.");
    }
    // Reset button states
    if(startTimerButton) startTimerButton.disabled = false;
    if(stopTimerButton) stopTimerButton.disabled = true;
    if(timerSlider) timerSlider.disabled = false; // Re-enable slider
    if(sketchInstructionArea) sketchInstructionArea.classList.remove('timer-active'); // Remove glow class
}

function resetTimer() {
    stopTimer(); // stopTimer now also removes the class
    updateTimerDisplayFromSlider();
    if(timerSlider) timerSlider.disabled = false;
    if(startTimerButton) startTimerButton.disabled = false;
    if(stopTimerButton) stopTimerButton.disabled = true;
    // No need to explicitly remove class here, stopTimer handles it
}

// --- NEW: Tutorial Functions ---
function updateTutorialStep() {
    if (!tutorialBox || !tutorialTitle || !tutorialText || !tutorialStepIndicator || !tutorialPrevButton || !tutorialNextButton) return;

    const step = tutorialSteps[currentTutorialStep];
    tutorialTitle.textContent = step.title;
    tutorialText.innerHTML = step.text; // Use innerHTML if steps contain formatting
    tutorialStepIndicator.textContent = `Step ${currentTutorialStep + 1} of ${tutorialSteps.length}`;

    tutorialPrevButton.disabled = currentTutorialStep === 0;
    tutorialNextButton.disabled = currentTutorialStep === tutorialSteps.length - 1;

    // Optional: Highlight relevant element based on step (more complex)
    // Example: if (currentTutorialStep === 1) document.getElementById('player-count')?.focus();
}

function nextTutorialStep() {
    if (currentTutorialStep < tutorialSteps.length - 1) {
        currentTutorialStep++;
        updateTutorialStep();
    }
}

function prevTutorialStep() {
    if (currentTutorialStep > 0) {
        currentTutorialStep--;
        updateTutorialStep();
    }
}

function showTutorial() {
    if (tutorialOverlay) {
        currentTutorialStep = 0; // Start from the beginning
        updateTutorialStep();
        tutorialOverlay.style.display = 'flex';
     }
}

function hideTutorial() {
    if (tutorialOverlay) {
        tutorialOverlay.style.display = 'none';
     }
}

// --- NEW: Function to update player count display and button states ---
function updatePlayerCountDisplay() {
    // Check if elements exist (they should after DOMContentLoaded)
    if (playerCountDisplay) {
        playerCountDisplay.textContent = currentPartySize;
    }
    if (decrementPlayerCountButton) {
        decrementPlayerCountButton.disabled = (currentPartySize <= 3);
    }
    if (incrementPlayerCountButton) {
        incrementPlayerCountButton.disabled = (currentPartySize >= 8);
    }
    // Clear any previous count-specific errors when count changes
    const errorSpan = document.getElementById('player-count-error');
    if (errorSpan) errorSpan.textContent = "";
}

// --- Attach Event Listeners (Moved inside DOMContentLoaded) ---

document.addEventListener('DOMContentLoaded', () => {
    // --- Assign DOM Elements AFTER DOM is ready ---
    playerTokenAwardArea = document.getElementById('player-token-award-area');
    roundActionsSection = document.getElementById('round-actions-section');
    winnerButtonContainer = document.getElementById('winner-button-container');
    awardButton = document.getElementById('award-button');
    winnerArea = document.getElementById('winner-area');
    winnerNameSpan = document.getElementById('winner-name');
    playAgainButton = document.getElementById('play-again-button');
    setupArea = document.getElementById('setup-area');
    playerCountDisplay = document.getElementById('party-count-display'); // Corrected ID
    decrementPlayerCountButton = document.getElementById('decrement-player-count');
    incrementPlayerCountButton = document.getElementById('increment-player-count');
    setPlayersButton = document.getElementById('set-players-button');
    playerNamesInputArea = document.getElementById('player-setup-area'); // Corrected ID
    startGameButton = document.getElementById('start-game-button');
    gameArea = document.getElementById('game-area');
    judgeNameSpan = document.getElementById('judge-name');
    judgeAvatarDisplay = document.getElementById('judge-avatar-display');
    rollButton = document.getElementById('roll-button');
    scoreboardList = document.getElementById('scoreboard-list');
    drawPromptsButton = document.getElementById('draw-prompts-button');
    rerollPromptsButton = document.getElementById('redraw-prompts-button'); // Updated ID
    promptDisplayArea = document.getElementById('prompt-display-area');
    promptListClickable = document.getElementById('prompt-list-clickable');
    alignmentChartGrid = document.getElementById('alignment-chart-grid');
    dieDisplay = document.getElementById('die-display');
    alignmentExamplesArea = document.getElementById('alignment-examples');
    sketchInstructionArea = document.getElementById('sketch-instruction-area');
    sketchInstructionText = document.getElementById('sketch-instruction-text');
    timerSlider = document.getElementById('timer-slider');
    timerDisplay = document.getElementById('timer-display');
    startTimerButton = document.getElementById('start-timer-button');
    stopTimerButton = document.getElementById('stop-timer-button');
    resetTimerButton = document.getElementById('reset-timer-button');
    tutorialOverlay = document.getElementById('tutorial-overlay');
    tutorialBox = document.getElementById('tutorial-box');
    tutorialPrevButton = document.getElementById('tutorial-prev');
    tutorialNextButton = document.getElementById('tutorial-next');
    tutorialSkipButton = document.getElementById('tutorial-skip');
    showTutorialButton = document.getElementById('show-tutorial-button');
    tutorialStepIndicator = document.getElementById('tutorial-step-indicator');
    tutorialTitle = document.getElementById('tutorial-title');
    tutorialText = document.getElementById('tutorial-text');
    stealModalOverlay = document.getElementById('steal-modal-overlay');
    stealModalBox = document.getElementById('steal-modal-box');
    stealModalTitle = document.getElementById('steal-modal-title');
    stealModalInfo = document.getElementById('steal-modal-info');
    stealModalTargets = document.getElementById('steal-modal-targets');
    stealModalCancel = document.getElementById('steal-modal-cancel');
    deckSelectionArea = document.getElementById('deck-selection-area');
    initiateStealButton = document.getElementById('initiate-steal-button'); // NEW: Assign the new steal button


    // --- Attach ALL Event Listeners ---

    // Player Count Buttons
    if (decrementPlayerCountButton) {
        decrementPlayerCountButton.addEventListener('click', () => {
            if (currentPartySize > 3) {
                currentPartySize--;
                updatePlayerCountDisplay();
            }
        });
    }
    if (incrementPlayerCountButton) {
        incrementPlayerCountButton.addEventListener('click', () => {
            if (currentPartySize < 8) {
                currentPartySize++;
                updatePlayerCountDisplay();
            }
        });
    }

    // Setup Buttons
    if(setPlayersButton) setPlayersButton.addEventListener('click', createNameInputs);
    if(startGameButton) startGameButton.addEventListener('click', startGame);

    // Game Action Buttons
    if(rollButton) rollButton.addEventListener('click', handleRollClick);
    if(drawPromptsButton) drawPromptsButton.addEventListener('click', drawAndDisplayPrompts);
    if(rerollPromptsButton) rerollPromptsButton.addEventListener('click', handlePromptReRoll);
    if(awardButton) awardButton.addEventListener('click', awardPointAndAdvance);
    if(playAgainButton) playAgainButton.addEventListener('click', resetGame);
    if(initiateStealButton) initiateStealButton.addEventListener('click', showStealModal); // NEW: Attach listener for the new steal button

    // Timer Buttons & Slider
    if(startTimerButton) startTimerButton.addEventListener('click', startTimer);
    if(stopTimerButton) stopTimerButton.addEventListener('click', stopTimer);
    if(resetTimerButton) resetTimerButton.addEventListener('click', resetTimer);
    if(timerSlider) timerSlider.addEventListener('input', updateTimerDisplayFromSlider);

    // Tutorial Buttons
    if (showTutorialButton) {
        showTutorialButton.addEventListener('click', showTutorial);
    }
    if (tutorialSkipButton) tutorialSkipButton.addEventListener('click', hideTutorial);
    if (tutorialNextButton) tutorialNextButton.addEventListener('click', nextTutorialStep);
    if (tutorialPrevButton) tutorialPrevButton.addEventListener('click', prevTutorialStep);

    // Deck Selection
    if (deckSelectionArea) {
        deckSelectionArea.addEventListener('click', (event) => {
            if (event.target.classList.contains('deck-label')) {
                event.target.classList.toggle('deselected');
                event.target.classList.toggle('selected', !event.target.classList.contains('deselected'));
            }
        });
    }

    // --- Modal Logic ---
    if (stealModalCancel) {
        stealModalCancel.addEventListener('click', hideStealModal);
    }
    if (stealModalOverlay) {
        stealModalOverlay.addEventListener('click', (event) => {
            if (event.target === stealModalOverlay && stealModalBox && !stealModalBox.contains(event.target)) {
                hideStealModal();
            }
        });
    }
    hideStealModal(); // Ensure hidden initially

    // --- Initial UI Updates ---
    updateTimerDisplayFromSlider();
    updatePlayerCountDisplay();

    // --- Initial State Hiding ---
    if(gameArea) gameArea.style.display = 'none';
    if(setupArea) setupArea.style.display = 'block';
    if(awardButton) awardButton.disabled = true;
    if(drawPromptsButton) drawPromptsButton.disabled = false;
    if(rollButton) rollButton.disabled = false;
    if(rerollPromptsButton) rerollPromptsButton.style.display = 'none';
    if (sketchInstructionArea) sketchInstructionArea.style.display = 'none';
    if (timerSlider) timerSlider.disabled = false;
    if (stopTimerButton) stopTimerButton.disabled = true;
    if (playerNamesInputArea) playerNamesInputArea.style.display = 'none';
    if (startGameButton) startGameButton.style.display = 'none';
    if (tutorialOverlay) tutorialOverlay.style.display = 'none';

});

// --- Initial Script Load (Code that runs immediately, BEFORE DOM is ready) ---
// Minimal code here, mostly handled in DOMContentLoaded now

function handleAlignmentHoverEnd(event) {
    const target = event.target.closest('.alignment-cell');
    const grid = elements.alignmentChartGrid;
    const section = elements.alignmentSection;

    // Don't hide if the grid is zoomed or if a result is already displayed
    if (!target || !elements.alignmentExamplesArea || (grid && grid.classList.contains('alignment-chart-zoomed')) || gameState.currentRolledAlignment) {
        return;
    }

    // Only hide if not currently showing a rolled result
    if (!gameState.currentRolledAlignment) {
        const examplesP = elements.alignmentExamplesArea.querySelector('p');
        if (examplesP) {
            examplesP.innerHTML = '<em>Hover over grid or wait for roll...</em>';
        }
        // Keep the area visible but with the default text, or hide it:
        // elements.alignmentExamplesArea.style.display = 'none';
    }
}

function handleAlignmentClick(event) {
    const target = event.target.closest('.alignment-cell');
    const grid = elements.alignmentChartGrid;
    const section = elements.alignmentSection;

    // Only allow click if alignment is 'U' (Judge's Choice) and grid is highlighted
    if (!target || !grid || gameState.currentRolledAlignment !== 'U' || !grid.classList.contains('judge-choice-highlight')) {
        return;
    }

    const chosenAlignment = target.dataset.alignment;
    console.log(`Judge chose alignment: ${chosenAlignment}`);
    playSound('ui_confirm');

    // Update UI immediately to show the choice
    displayAlignmentResult(chosenAlignment, false); // Pass false to prevent re-zooming

    // Disable further clicks on the grid and remove zoom
    grid.classList.remove('judge-choice-highlight');
    grid.classList.remove('alignment-chart-zoomed');
    if (section) {
        section.classList.remove('chart-is-zoomed'); // Remove parent class too
    }

    // Potentially re-enable prompt drawing if that's the flow
    // if (elements.drawPromptsButton) elements.drawPromptsButton.disabled = false;
}