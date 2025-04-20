// filepath: c:\Users\Jacob\Desktop\perfectlyalignedhelper\constants.js

const AVAILABLE_AVATARS = [
    'alienlady_avatar.png',
    'buddy_avatar.png', // Added
    'chessqueen_avatar.png', // Added
    'dadskeletonts_avatar.png',
    'glitchkitty_avatar.png',
    'horse_avatar.png',
    'lizard_avatar.png',
    'mantis_avatar.png', // Added
    'mushgun.png',
    'ninjatp_avatar.png',
    'pirateghost2_avatar.png',
    'plaguedoc_avatar.png', // Added
    'robotp_avatar.png',
    'vampiregirl_avatar.png'
];
const DEFAULT_AVATAR = AVAILABLE_AVATARS[0];
const AVATAR_BASE_PATH = 'assets/images/avatars/';

// --- NEW: Token Types ---
const TOKEN_TYPES = {
    mindReader: "Mind Reader", // Guessed the Judge's alignment
    technicalMerit: "Technical Merit", // Reverted name
    perfectAlignment: "Perfect Alignment", // Reverted name
    plotTwist: "Plot Twist" // Reverted name
};

// --- Alignment Data ---
export const ALIGNMENTS = ["LG", "NG", "CG", "LN", "TN", "CN", "LE", "NE", "CE"];

export const THEMED_DECKS = {
    core_white: [ // General Scenarios, Concepts, Dilemmas, Historical, Local
        // Original Core
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
        "Types of Sports", "Ways to eat a banana", "Types of Music Genres", "Types of get-rich-quick schemes",
        // From Dilemmas
        "Ways to handle a minor fender-bender you caused", "Ways to react to a friend's bad haircut",
        "Ways to react to getting extra change from a cashier", "Ways to share snacks at work/school",
        "Ways to react to seeing someone shoplift essentials",
        "Ways to respond to an unethical request from your boss", "Ways to cheat on a test",
        "Ways to defend yourself", "Ways to end conflict with a spider", "Types of killing methods",
        // "Ways to die", // Duplicate
        "Reasons for not eating something (Fill in: \"I don't eat ____ because ____.\")",
        "Ways to respond to 'You're not a cop, right?'",
        "Ways to react to getting life in prison for a crime you didn't commit",
        "Types of Trolley Problem solutions",
        // From Historical
        "Ways to advise a historical leader", "Ways to react to witnessing a major historical event",
        "Ways to handle inventing something before its time", "Ways to react during the Y2K panic",
        "Types of prehistoric activities", "Types of ancient building techniques", "Types of world leaders", "Types of presidents",
        // From Local
        "Ways to deal with [Local Town Issue/Mascot Name]", "Ways to act at [Local Festival/Event]",
        "Ways to explain [Local Slang Term] to an outsider", "Ways to react to [Local Landmark] disappearing"
    ],
    creative_cyan: [ // Creative Construction, Lists, Pop Culture
        // Original Creative
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
        "Types of educational strategies", "Types of book genres", "Types of Hot Drinks", "Types of nicknames for sons",
        // From Pop Culture
        "Ways to direct the next big superhero movie", "Ways to win a reality TV show", "Ways to become a viral internet meme",
        "Ways to act at the Met Gala", "Ways to write the finale of a beloved TV series", "Types of Cereal Mascots",
        // "Ways to make C-Span more entertaining", // Duplicate in Core
        "Responses to 'Name a more iconic duo'",
        "Dishes to prepare for Gordon Ramsay ('What have you prepared?')",
        // "Types of porn categories", // Moved to Hypothetical/Taboo
        "Things that could be in the box ('Seven')"
    ],
    hypothetical_magenta: [ // "What If" Scenarios, Roleplay Prompts, Taboo
        // Original Hypothetical
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
        "Things hidden in Area 51's newest wing (Fill in: \"...home to ____?\")",
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
        "Excuses for where you were last night ('Dad: Where were you?')",
        // From Taboo (17+)
        "Ways to handle a morally gray scenario (17+)", "Ways to handle an awkward romantic encounter (17+)",
        "Ways to deal with a controversial social issue (17+)", "Types of 'Yo Mama' insults",
        "Types of tattoos and where to put them", "Types of drugs", "Types of porn categories",
        "Ways to respond to 'Stepbrother! I'm stuck in the dryer!'",
        "Ways to react to your SO leaving you for your ____ (Fill in blank)",
        "Ways to answer 'Does this outfit make me look ugly?'"
    ]
};

export const ALIGNMENT_EXAMPLES_MAP = {
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

export const ALIGNMENT_FULL_NAME_MAP = {
    LG: "Lawful Good", NG: "Neutral Good", CG: "Chaotic Good",
    LN: "Lawful Neutral", TN: "True Neutral", CN: "Chaotic Neutral",
    LE: "Lawful Evil", NE: "Neutral Evil", CE: "Chaotic Evil",
    U:  "Judge's Choice"
};

export const TUTORIAL_STEPS = [
    { title: "Welcome!", text: "Welcome to Perfectly Aligned! This quick tutorial will guide you through the game setup and flow.", elementId: null },
    { title: "Setup: Player Count", text: "First, enter the number of players (3-8) and click 'Set Players'.", elementId: 'player-count' },
    { title: "Setup: Names & Avatars", text: "Next, enter each player's name. You can also click the arrows to choose a unique avatar for each player.", elementId: 'player-setup-area' },
    { title: "Setup: Decks", text: "Select the prompt card decks you want to include in the game. 'Core White' is recommended for the first game. Click 'Start Game' when ready!", elementId: 'deck-selection-area' },
    { title: "Game: The Judge", text: "Each round, one player is the Judge (indicated at the top). The Judge doesn't sketch this round.", elementId: 'judge-name' },
    { title: "Game: Roll Alignment", text: "The Judge clicks 'Roll Alignment' to get the target alignment for the round (e.g., Lawful Good, Chaotic Neutral, or Judge's Choice).", elementId: 'roll-button' },
    { title: "Game: Draw Prompts", text: "The Judge then clicks 'Draw Prompts' to reveal three scenario cards.", elementId: 'draw-prompts-button' },
    { title: "Game: Choose Prompt", text: "The Judge reads the prompts aloud and clicks one to select it for the round.", elementId: 'prompt-list-clickable' },
    { title: "Game: Sketch!", text: "Now, all *other* players sketch their interpretation of the chosen prompt combined with the rolled alignment! Use the timer if you like.", elementId: 'sketch-instruction-area' },
    { title: "Game: Judging", text: "Once sketching is done, players reveal their masterpieces. The Judge chooses the sketch that best captures the alignment and prompt, clicking the winner's name.", elementId: 'winner-button-container' },
    { title: "Game: Awarding", text: "The Judge can optionally award bonus 'Achievement Tokens' for specific merits before clicking 'Award Point & Advance'.", elementId: 'player-token-award-area' },
    { title: "Game: Tokens & Stealing", text: "Tokens can be spent! 1 token lets the Judge re-roll prompts. 3 tokens let *any* player steal a point from someone else (click the 'Steal' button on the scoreboard).", elementId: 'scoreboard-list' }, // Highlight the whole list or a steal button if visible
    { title: "Game: Winning", text: "The first player to reach the target score (usually 3 or 5 points) wins! Good luck and have fun!", elementId: 'scoreboard-section' }
];
