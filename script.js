
// /Users/ian/Documents/bangla/minimal-pairs/script.js

let currentPair = null;
let correctWord = null;
let score = 0;
let totalAttempts = 0;
let isPlaying = false; // Flag to indicate if speech synthesis is currently active
let userSelectedWord = null; // Stores the pure word the user has selected
let userSelectedButton = null; // Stores the button element the user has selected
let gameHistory = []; // Array to store game history
let currentFilteredPairs = []; // Stores pairs of the selected type

// Settings variables
let playGuessOnClick = true; // Corresponds to the toggle
let autoPlayNextWord = true; // New setting
let autoPlayDelay = 100;     // New setting (in ms)
let bengaliAccent = 'bn-IN'; // Default to Kolkata style
let speechRate = 1.0;        // Default speech rate
let speechPitch = 1.0;       // Default speech pitch

// Emojis for playback status
const playingEmoji = '🔊'; // Speaker with sound waves
const stoppedEmoji = '🔈'; // Speaker without sound waves
const settingsEmoji = '⚙️'; // Gear emoji for settings button
const historyEmoji = '📚'; // Books emoji for history button
const skipEmoji = '⏭️';    // Skip track emoji
const resetEmoji = '🔄';   // Reset emoji

// Get DOM elements
const playButton = document.getElementById('playButton');
const word1Button = document.getElementById('word1Button');
const word2Button = document.getElementById('word2Button');
const feedbackDiv = document.getElementById('feedback');
const nextButton = document.getElementById('nextButton');
const resetButton = document.getElementById('resetButton');
const scoreSpan = document.getElementById('score');
const totalAttemptsSpan = document.getElementById('totalAttempts');
const playingStatusDiv = document.getElementById('playingStatus');
const submitGuessButton = document.getElementById('submitGuessButton');
const settingsButton = document.getElementById('settingsButton');
const historyButton = document.getElementById('historyButton');
const typeSelectElement = document.getElementById('typeSelect');

// Modal elements
const settingsModal = document.getElementById('settingsModal');
const closeSettingsModalButton = document.getElementById('closeSettingsModal');
const modalPlayGuessToggle = document.getElementById('modalPlayGuessToggle');
const modalAutoPlayNextWordToggle = document.getElementById('modalAutoPlayNextWordToggle');
const modalAutoPlayDelay = document.getElementById('modalAutoPlayDelay');
const cancelSettingsButton = document.getElementById('cancelSettings');
const modalSpeechRate = document.getElementById('modalSpeechRate');
const modalSpeechPitch = document.getElementById('modalSpeechPitch');
const saveSettingsButton = document.getElementById('saveSettings');
const accentKolkataRadio = document.getElementById('accentKolkata');
const accentBangladeshRadio = document.getElementById('accentBangladesh');

const historyModal = document.getElementById('historyModal');
const closeHistoryModalButton = document.getElementById('closeHistoryModal');
const historyListDiv = document.getElementById('historyList');
const clearHistoryButton = document.getElementById('clearHistoryButton');
const okHistoryButton = document.getElementById('okHistoryButton');


/**
 * Sets the content of a button, ensuring original text is preserved for data-original-text.
 * @param {HTMLElement} button - The button element to update.
 * @param {string} emoji - The emoji to display (or empty string if none).
 */
function setButtonContent(button, emoji) {
    // Get the original text from data-original-text if available, otherwise from textContent directly
    // Regex to remove any existing emojis before setting new content
    const originalText = button.dataset.originalText || button.textContent.replace(/[\u{1F50A}\u{1F509}\u{2699}\u{FE0F}\u{1F4DA}]/gu, '').trim();
    if (emoji) { // Only add emoji if one is provided
        button.innerHTML = `${originalText} ${emoji}`;
    } else {
        button.innerHTML = originalText; // Otherwise, just the text
    }
}

/**
 * Resets the color classes of a button to its base state.
 * @param {HTMLElement} button - The button element to reset.
 */
function resetButtonColors(button) {
    button.classList.remove('bg-green-500-custom', 'bg-red-500-custom');
    button.classList.add('bg-base-color'); // Re-add the base color class
    button.classList.remove('selected'); // Ensure selected class is also removed
    button.style.borderColor = ''; // Clear inline border style if any
    button.style.color = ''; // Clear inline text color style if any
}

/**
 * Applies the emoji state to the word buttons based on the 'playGuessOnClick' setting.
 */
function applyWordButtonEmojis() {
    if (playGuessOnClick) {
        setButtonContent(word1Button, stoppedEmoji);
        setButtonContent(word2Button, stoppedEmoji);
    } else {
        setButtonContent(word1Button, ''); // Remove emoji
        setButtonContent(word2Button, ''); // Remove emoji
    }
}

function disableGameControls(message = "No pairs available for this selection.") {
    playButton.disabled = true;
    word1Button.disabled = true;
    word2Button.disabled = true;
    submitGuessButton.disabled = true;
    word1Button.textContent = '-';
    word2Button.textContent = '-';
    feedbackDiv.textContent = message;
}

/**
 * Initializes a new round of the game.
 * Selects a random minimal pair and sets up the word choice buttons.
 */
function startNewRound() {
    // Clear previous feedback and reset button states
    feedbackDiv.textContent = ''; // Clear feedback text
    feedbackDiv.className = 'text-xl mt-4'; // Reset feedback div classes
    playingStatusDiv.classList.add('hidden'); // Ensure text indicator is hidden
    // nextButton (Skip Pair) will be enabled, submitGuessButton will be disabled.
    submitGuessButton.disabled = true;
    playButton.disabled = false;
    isPlaying = false;
    userSelectedWord = null;
    userSelectedButton = null;

    if (currentFilteredPairs.length === 0) {
        // Ensure "Skip Pair" button is also handled in this case
        nextButton.disabled = true;
        nextButton.textContent = "Skip Pair"; // Reset text
        setButtonContent(nextButton, skipEmoji); // Ensure emoji is present
        submitGuessButton.textContent = "Submit Guess"; // Reset text
        const selectedType = typeSelectElement.options[typeSelectElement.selectedIndex]?.text || "selected type";
        disableGameControls(`No minimal pairs available for "${selectedType}". Please select another type or "All Types".`);
        return;
    }

    // Remove 'selected' class from previous choices and reset colors
    resetButtonColors(word1Button);
    resetButtonColors(word2Button);

    // Disable word choice buttons initially (until word is played)
    word1Button.disabled = true;
    word2Button.disabled = true;

    // Configure buttons for a new round
    submitGuessButton.textContent = "Submit Guess";
    submitGuessButton.disabled = true;
    // nextButton is the "Skip Pair" button
    nextButton.dataset.originalText = "Skip Pair"; // Set original text for emoji handling
    setButtonContent(nextButton, skipEmoji);
    nextButton.disabled = false; // "Skip Pair" should be enabled
    playButton.disabled = false; // Ensure play button is enabled if pairs are available

    // Select a random minimal pair from the filtered list
    const randomIndex = Math.floor(Math.random() * currentFilteredPairs.length);
    currentPair = currentFilteredPairs[randomIndex];

    // Randomly assign words to buttons
    const shuffledWords = [...currentPair].sort(() => Math.random() - 0.5); // currentPair is now the array of words
    word1Button.textContent = shuffledWords[0];
    word2Button.textContent = shuffledWords[1];

    // Store original text for buttons (important for emoji toggling)
    word1Button.dataset.originalText = shuffledWords[0];
    word2Button.dataset.originalText = shuffledWords[1];
    playButton.dataset.originalText = 'Play Word'; 
    resetButton.dataset.originalText = 'Reset Game'; // For reset button emoji
    setButtonContent(resetButton, resetEmoji);

    // Set initial button contents with or without emoji based on toggle state
    setButtonContent(playButton, ''); // Play button never starts with emoji
    applyWordButtonEmojis(); // Apply emojis based on current playGuessOnClick setting

    // Randomly choose which word will be "played" as the correct answer
    correctWord = currentPair[Math.floor(Math.random() * currentPair.length)]; // currentPair is the array of words

    console.log('New round started. Correct word:', correctWord); // For debugging
}

/**
 * Plays the audio for a given word using the Web Speech API.
 * Updates the emoji on the originator button during playback.
 * @param {string} word - The pure Bengali word to be spoken.
 * @param {HTMLElement} originatorButton - The button element that initiated the playback.
 * @param {function} onEndCallback - Callback function to execute after speech ends.
 */
function speakWord(word, originatorButton, onEndCallback) {
    // Always cancel any ongoing speech before starting a new one
    window.speechSynthesis.cancel();

    isPlaying = true;

    // Only disable word choice and submit buttons if a guess hasn't been submitted yet
    // The playButton itself should always be clickable to replay.
    if (nextButton.disabled) { // If in selection phase (guess not submitted)
        word1Button.disabled = true;
        word2Button.disabled = true;
        submitGuessButton.disabled = true;

        // If the originator is a word button and playGuessOnClick is true,
        // re-enable it immediately so it remains interactive for its sound and visual selection.
        if (originatorButton.id === 'word1Button' || originatorButton.id === 'word2Button') {
            originatorButton.disabled = false;
        }
    }

    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word); // Use the pure word passed in
        utterance.lang = bengaliAccent; // Use the selected accent
        utterance.rate = speechRate;   // Apply custom rate
        utterance.pitch = speechPitch; // Apply custom pitch

        const voices = window.speechSynthesis.getVoices();
        // Prioritize finding a voice that matches the selected accent
        const selectedVoice = voices.find(voice => voice.lang === bengaliAccent);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        } else {
            console.warn(`Voice for ${bengaliAccent} not found. Attempting to find any Bengali voice.`);
            const anyBengaliVoice = voices.find(voice => voice.lang.startsWith('bn'));
            if (anyBengaliVoice) {
                utterance.voice = anyBengaliVoice;
            } else {
                console.warn('No Bengali voice found. Using default voice.');
            }
        }

        utterance.onstart = () => {
            // Update the button's innerHTML with the playing emoji if applicable
            if (originatorButton.id === 'playButton' || playGuessOnClick) {
                setButtonContent(originatorButton, playingEmoji);
            }
            playingStatusDiv.classList.add('hidden'); // Ensure text indicator is hidden
        };

        utterance.onend = () => {
            isPlaying = false;
            // Revert button's innerHTML to original text with stopped emoji if applicable
            if (originatorButton.id === 'playButton') {
                setButtonContent(originatorButton, ''); // Play button goes back to just text
            } else if (playGuessOnClick) {
                setButtonContent(originatorButton, stoppedEmoji);
            } else {
                setButtonContent(originatorButton, ''); // No emoji if toggle is off
            }


            if (onEndCallback) {
                onEndCallback();
            }

            // Re-enable buttons based on game state
            // All buttons are re-enabled after speech finishes to allow for replaying or selection
            word1Button.disabled = false;
            word2Button.disabled = false;

            // Re-enable submit button only if a word is selected and not yet submitted
            if (userSelectedWord && nextButton.disabled) {
                submitGuessButton.disabled = false;
            }
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
            playingStatusDiv.textContent = 'Error playing word. Please try again.';
            playingStatusDiv.classList.remove('hidden');
            isPlaying = false;
            // Re-enable all buttons on error
            playButton.disabled = false; // Ensure play button is also re-enabled
            word1Button.disabled = false;
            word2Button.disabled = false;
            if (userSelectedWord && nextButton.disabled) {
                submitGuessButton.disabled = false;
            }
            // Revert button text on error
            if (originatorButton.id === 'playButton') {
                setButtonContent(originatorButton, '');
            } else if (playGuessOnClick) {
                setButtonContent(originatorButton, stoppedEmoji);
            } else {
                setButtonContent(originatorButton, '');
            }
        };

        window.speechSynthesis.speak(utterance);
    } else {
        // Fallback for browsers that do not support Web Speech API
        playingStatusDiv.textContent = `Text-to-Speech not supported. Playing: ${word} ... (Simulated)`;
        playingStatusDiv.classList.remove('hidden');
        if (originatorButton.id === 'playButton' || playGuessOnClick) {
            setButtonContent(originatorButton, playingEmoji); // Show emoji for simulation
        }
        setTimeout(() => {
            isPlaying = false;
            if (originatorButton.id === 'playButton') {
                setButtonContent(originatorButton, '');
            } else if (playGuessOnClick) {
                setButtonContent(originatorButton, stoppedEmoji);
            } else {
                setButtonContent(originatorButton, '');
            }
            if (onEndCallback) {
                onEndCallback();
            }
            // Re-enable all buttons after simulation
            playButton.disabled = false; // Ensure play button is also re-enabled
            word1Button.disabled = false;
            word2Button.disabled = false;
            if (userSelectedWord && nextButton.disabled) {
                submitGuessButton.disabled = false;
            }
            playingStatusDiv.classList.add('hidden'); // Hide fallback text indicator
        }, 1500);
    }
}

/**
 * Initiates playing the correct word for the round.
 */
function playCorrectWord() {
    speakWord(correctWord, playButton, () => {
        // After playing the correct word, all buttons are re-enabled by speakWord's onEnd.
        // No specific action needed here beyond what onEnd already does.
    });
}

/**
 * Processes the user's guess after potential word playback.
 * This function is called by submitGuess().
 * @param {string} chosenWord - The word selected by the user.
 * @param {HTMLElement} chosenButton - The button element selected by the user.
 */
function processGuess(chosenWord, chosenButton) {
    totalAttempts++;
    submitGuessButton.disabled = true; // Disable submit button after processing

    let isCorrect = false;

    // Apply color feedback
    if (chosenWord === correctWord) {
        feedbackDiv.textContent = 'Correct! 🎉';
        feedbackDiv.className = 'feedback-correct text-xl mt-4';
        chosenButton.classList.remove('bg-base-color');
        chosenButton.classList.add('bg-green-500-custom');
        score++; // Increment score only if correct
        isCorrect = true;
    } else {
        feedbackDiv.textContent = `Incorrect. The word was "${correctWord}".`;
        feedbackDiv.className = 'feedback-incorrect text-xl mt-4';
        chosenButton.classList.remove('bg-base-color');
        chosenButton.classList.add('bg-red-500-custom');

        // Find the correct word button and highlight it green
        const correctButton = (word1Button.dataset.originalText === correctWord) ? word1Button : word2Button;
        correctButton.classList.remove('bg-base-color');
        correctButton.classList.add('bg-green-500-custom');
        isCorrect = false;
    }
    updateScoreDisplay(); // Update display after score is potentially incremented

    // Add to history
    gameHistory.push({
        pair: [...currentPair], // Store the actual pair from currentPair
        correct: correctWord,
        guessed: chosenWord,
        isCorrect: isCorrect
    });
    console.log('Game History:', gameHistory); // For debugging history

    // After processing, ensure all buttons are re-enabled for replaying sounds
    playButton.disabled = false;
    word1Button.disabled = false;
    word2Button.disabled = false;

    // Reset emojis on all buttons to stopped state after guess is processed
    setButtonContent(playButton, ''); // Play button goes back to just text
    applyWordButtonEmojis(); // Reapply emojis based on current playGuessOnClick setting

    // Change "Submit Guess" button to "Next Pair"
    submitGuessButton.textContent = "Next Pair";
    submitGuessButton.disabled = false; // Enable it for "Next Pair" action
    setButtonContent(nextButton, skipEmoji); // Ensure skip emoji is still there, even if disabled
    nextButton.disabled = true; // Disable "Skip Pair" button now
}

/**
 * Handles the user's selection of a word button.
 * Marks the selection and enables the submit button.
 * @param {string} chosenWordTextContent - The textContent of the button (may include emoji).
 * @param {HTMLElement} chosenButton - The button element selected by the user.
 */
function handleChoice(chosenWordTextContent, chosenButton) {
    // If a guess has already been submitted (nextButton is enabled),
    // this click is purely for replaying the sound.
    // We check if submitGuessButton is "Next Pair" to know if guess was submitted
    if (submitGuessButton.textContent.includes("Next Pair")) {
        speakWord(chosenButton.dataset.originalText, chosenButton, null); // Use originalText for replay
        return;
    }

    // If we are still in the selection phase (guess not submitted yet)
    // Prevent interaction if the initial word is still playing
    if (isPlaying) {
        return;
    }

    // Handle visual selection
    if (userSelectedButton && userSelectedButton !== chosenButton) {
        userSelectedButton.classList.remove('selected');
        userSelectedButton.classList.add('bg-base-color'); // Re-add base color to previously selected
    }
    userSelectedWord = chosenButton.dataset.originalText; // Store the pure word from dataset
    userSelectedButton = chosenButton;
    userSelectedButton.classList.add('selected'); // Apply the selected class here
    userSelectedButton.classList.remove('bg-base-color'); // Remove base color from the newly selected

    // Enable the submit guess button
    submitGuessButton.disabled = false;

    // Play the sound of the selected guess if the toggle is checked
    if (playGuessOnClick) {
        speakWord(chosenButton.dataset.originalText, chosenButton, null); // Use originalText for playing guess
    }
}

/**
 * Updates the score display on the UI.
 */
function updateScoreDisplay() {
    scoreSpan.textContent = score;
    totalAttemptsSpan.textContent = totalAttempts;
    console.log('Score updated:', score, '/', totalAttempts); // Debugging score update
}

/**
 * Resets the game to its initial state.
 */
function resetGame() {
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    score = 0;
    totalAttempts = 0;
    gameHistory = []; // Clear history on reset
    updateScoreDisplay();
    startNewRound();
}

// --- Type Selection Logic ---

/**
 * Populates the type selection dropdown menu.
 */
function populateTypeDropdown() {
    typeSelectElement.innerHTML = ''; // Clear existing options

    const allOption = document.createElement('option');
    allOption.value = 'All';
    allOption.textContent = 'All Types';
    typeSelectElement.appendChild(allOption);

    // Get types from the keys of the allMinimalPairsData object
    const types = Object.keys(allMinimalPairsData).sort();

    types.forEach(type => {
        // Only add the type to dropdown if it has pairs
        if (allMinimalPairsData[type] && allMinimalPairsData[type].length > 0) {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            typeSelectElement.appendChild(option);
        }
    });
    typeSelectElement.value = 'All'; // Default to "All"
}

/**
 * Handles the change event when a new minimal pair type is selected.
 */
function handleTypeChange() {
    const selectedType = typeSelectElement.value;
    if (selectedType === 'All') {
        // Flatten all arrays of pairs from all types
        currentFilteredPairs = Object.values(allMinimalPairsData).flat();
    } else {
        // Get pairs for the specific type, or an empty array if the type doesn't exist (should not happen with populated dropdown)
        currentFilteredPairs = allMinimalPairsData[selectedType] || [];
    }
    resetGame(); // Reset score and start a new round with the filtered pairs
}

// --- Modal Logic ---

/**
 * Opens the settings modal and populates it with current settings.
 */
function openSettingsModal() {
    modalPlayGuessToggle.checked = playGuessOnClick;
    modalAutoPlayNextWordToggle.checked = autoPlayNextWord;
    modalAutoPlayDelay.value = autoPlayDelay;
    modalSpeechRate.value = speechRate;
    modalSpeechPitch.value = speechPitch;
    modalAutoPlayDelay.disabled = !autoPlayNextWord; // Disable delay if auto-play is off

    // Set radio button based on current accent
    if (bengaliAccent === 'bn-IN') {
        accentKolkataRadio.checked = true;
    } else if (bengaliAccent === 'bn-BD') {
        accentBangladeshRadio.checked = true;
    }

    settingsModal.classList.add('show');
}

/**
 * Closes the settings modal without saving changes.
 */
function closeSettingsModal() {
    settingsModal.classList.remove('show');
}

/**
 * Saves the settings from the modal to the main application state.
 */
function saveSettings() {
    playGuessOnClick = modalPlayGuessToggle.checked;
    autoPlayNextWord = modalAutoPlayNextWordToggle.checked;
    autoPlayDelay = parseInt(modalAutoPlayDelay.value, 10);
    speechRate = parseFloat(modalSpeechRate.value);
    speechPitch = parseFloat(modalSpeechPitch.value);

    // Get selected accent
    if (accentKolkataRadio.checked) {
        bengaliAccent = 'bn-IN';
    } else if (accentBangladeshRadio.checked) {
        bengaliAccent = 'bn-BD';
    }

    // Ensure delay is not negative
    if (isNaN(autoPlayDelay) || autoPlayDelay < 0) {
        autoPlayDelay = 0;
        modalAutoPlayDelay.value = 0;
    }

    // Validate and clamp speechRate (0.1 to 10)
    if (isNaN(speechRate) || speechRate < 0.1) speechRate = 0.1;
    if (speechRate > 10) speechRate = 10;
    modalSpeechRate.value = speechRate;

    // Validate and clamp speechPitch (0 to 2)
    if (isNaN(speechPitch) || speechPitch < 0) speechPitch = 0;
    if (speechPitch > 2) speechPitch = 2;
    modalSpeechPitch.value = speechPitch;

    // Apply changes to button emojis immediately
    applyWordButtonEmojis();

    closeSettingsModal();
}

/**
 * Opens the history modal and populates it with game history.
 */
function openHistoryModal() {
    historyListDiv.innerHTML = ''; // Clear previous history
    if (gameHistory.length === 0) {
        historyListDiv.innerHTML = '<p class="text-gray-500 text-center">No guesses yet.</p>';
    } else {
        gameHistory.forEach((entry, index) => {
            const historyItem = document.createElement('div');
            historyItem.classList.add('history-item');
            const statusClass = entry.isCorrect ? 'correct-answer' : 'wrong-answer';
            const statusText = entry.isCorrect ? 'Correct' : 'Incorrect';
            const statusEmoji = entry.isCorrect ? '✅' : '❌';

            historyItem.innerHTML = `
                <strong>${index + 1}.</strong> Pair: ${entry.pair.join(' / ')}<br>
                Guessed: <span class="${statusClass}">${entry.guessed}</span> ${statusEmoji}<br>
                Correct: <span class="correct-answer">${entry.correct}</span>
            `;
            historyListDiv.appendChild(historyItem);
        });
    }
    historyModal.classList.add('show');
}

/**
 * Closes the history modal.
 */
function closeHistoryModal() {
    historyModal.classList.remove('show');
}

/**
 * Clears the game history.
 */
function clearHistory() {
    gameHistory = [];
    openHistoryModal(); // Refresh the modal to show it's empty
}

// --- Combined Event Handler for Submit/Next ---
/**
 * Handles click on the button that is either "Submit Guess" or "Next Pair".
 */
function handleSubmitGuessOrNext() {
    if (submitGuessButton.textContent.includes("Submit Guess")) {
        if (!userSelectedWord || !userSelectedButton) {
            console.warn("No word selected to submit.");
            return;
        }
        // Disable button during processing, re-enabled by processGuess or if error
        submitGuessButton.disabled = true;
        word1Button.disabled = true; // Temporarily disable choices
        word2Button.disabled = true;
        processGuess(userSelectedWord, userSelectedButton);
    } else { // Button is "Next Pair"
        window.speechSynthesis.cancel();
        // Logic for starting the next round (same as original nextButton)
        if (autoPlayNextWord) {
            setTimeout(() => { startNewRound(); playCorrectWord(); }, autoPlayDelay);
        } else {
            startNewRound();
        }
    }
}

// Event Listeners
playButton.addEventListener('click', playCorrectWord);

word1Button.addEventListener('click', () => {
    handleChoice(word1Button.textContent, word1Button);
});

word2Button.addEventListener('click', () => {
    handleChoice(word2Button.textContent, word2Button);
});

submitGuessButton.addEventListener('click', handleSubmitGuessOrNext);

nextButton.addEventListener('click', () => { // This is now the "Skip Pair" button
    window.speechSynthesis.cancel(); 
    // No need to change text or emoji here, it's always "Skip Pair" + emoji
    // Its disabled state is handled by startNewRound and processGuess
    if (autoPlayNextWord) {
        // Add a small delay before starting the new round and playing the word
        setTimeout(() => {
            startNewRound();
            playCorrectWord();
        }, autoPlayDelay);
    } else {
        startNewRound(); // Just start a new round, user will click Play Word
    }
});

resetButton.addEventListener('click', () => {
    setButtonContent(resetButton, resetEmoji); // Ensure emoji is reapplied if it was somehow removed
    resetGame();
});
settingsButton.addEventListener('click', openSettingsModal);
historyButton.addEventListener('click', openHistoryModal); // New history button listener

closeSettingsModalButton.addEventListener('click', closeSettingsModal);
cancelSettingsButton.addEventListener('click', closeSettingsModal);
saveSettingsButton.addEventListener('click', saveSettings);

closeHistoryModalButton.addEventListener('click', closeHistoryModal); // New history modal close
okHistoryButton.addEventListener('click', closeHistoryModal); // New history modal OK button
clearHistoryButton.addEventListener('click', clearHistory); // New clear history button

// Listener for auto-play toggle in modal to enable/disable delay input
modalAutoPlayNextWordToggle.addEventListener('change', () => {
    modalAutoPlayDelay.disabled = !modalAutoPlayNextWordToggle.checked;
});

typeSelectElement.addEventListener('change', handleTypeChange);

// Initial setup when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check if there are any pairs in any type
    const hasAnyPairs = Object.values(allMinimalPairsData).some(typeArray => typeArray.length > 0);

    if (!hasAnyPairs) {
        disableGameControls("No minimal pairs loaded. Please check the data source.");
    } else {
        populateTypeDropdown(); // Populate dropdown first
        handleTypeChange();     // Then handle initial type selection (which calls resetGame -> startNewRound)
        // Set initial emojis for buttons that have them permanently
        settingsButton.dataset.originalText = "Settings";
        setButtonContent(settingsButton, settingsEmoji);
        historyButton.dataset.originalText = "History";
        setButtonContent(historyButton, historyEmoji);
    }
});

// This event fires when the list of SpeechSynthesisVoice objects has changed.
// It's important for ensuring voices are loaded before attempting to use them.
window.speechSynthesis.onvoiceschanged = () => {
    console.log('Voices changed. Available voices:', window.speechSynthesis.getVoices());
    // No direct action needed here, as speakWord will fetch voices when called.
};
