<template>
    <div class="container">
        <h1 class="text-3xl font-bold text-gray-800 mb-4">Bengali Minimal Pairs Practice</h1>

        <div class="mb-6">
            <label for="typeSelect" class="block text-lg font-medium text-gray-700 mb-2">Select Minimal Pair Type:</label>
            <select id="typeSelect" v-model="selectedType" @change="handleTypeChange" class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-white">
                <option value="All">All Types</option>
                <option v-for="type in availableTypes" :key="type" :value="type">{{ type }}</option>
            </select>
        </div>

        <div class="flex flex-col items-center gap-4">
            <p class="text-lg text-gray-600">Click "Play Word" to hear one of the words, then choose which one you heard.</p>
            <div id="playingStatus" class="playing-indicator" :class="{ 'hidden': !playingStatusText }">{{ playingStatusText }}</div>
            <button id="playButton" ref="playButtonRef" @click="playCorrectWord" :disabled="!canPlay" class="button-primary w-full max-w-xs">
                Play Word <span :style="{ visibility: (isPlayingAudio && currentPlayback.originatorButton === playButtonRef) ? 'visible' : 'hidden' }">{{ playingEmoji }}</span>
            </button>
        </div>

        <div id="wordChoices" class="grid grid-cols-2 md:grid-cols-2 gap-4 mt-6">
            <button id="word1Button" @click="handleChoice(word1, $event.target)" :disabled="!canSelectWord" 
                    :class="getWordButtonClass(word1)" class="word-button">
                {{ word1?.[0] }} {{ wordButtonEmoji(word1) }}
            </button>
            <button id="word2Button" @click="handleChoice(word2, $event.target)" :disabled="!canSelectWord" 
                    :class="getWordButtonClass(word2)" class="word-button">
                {{ word2?.[0] }} {{ wordButtonEmoji(word2) }}
            </button>
        </div>

        <div id="feedback" class="text-xl mt-4" :class="feedbackClass">{{ feedbackText }}</div>

        <div class="flex flex-col md:flex-row justify-center gap-4 mt-6">
            <button id="submitGuessButton" @click="handleSubmitGuessOrNext" :disabled="!canSubmitGuess && !isNextPairState" class="button-primary w-full md:w-auto">
                {{ submitButtonText }}
            </button>
            <button id="nextButton" @click="skipPair" :disabled="!canSkip" class="button-secondary w-full md:w-auto">
                Skip Pair {{ skipEmoji }}
            </button>
        </div>

        <div class="text-lg text-gray-700 mt-4">
            Score: <span id="score">{{ score }}</span> / <span id="totalAttempts">{{ totalAttempts }}</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 mx-auto w-full max-w-md">
            <button id="resetButton" @click="resetGame" class="button-secondary flex items-center justify-center gap-2">
                Reset Game {{ resetEmoji }}
            </button>
            <button id="settingsButton" @click="showSettingsModal = true" class="button-secondary flex-1 flex items-center justify-center gap-2">
                Settings {{ settingsEmoji }}
            </button>
            <button id="historyButton" @click="showHistoryModal = true" class="button-secondary flex-1 flex items-center justify-center gap-2">
                History {{ historyEmoji }}
            </button>
        </div>
    </div>

    <!-- Settings Modal -->
    <div v-if="showSettingsModal" id="settingsModal" class="modal-overlay show">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Settings</h2>
                <button class="modal-close-button" @click="showSettingsModal = false">&times;</button>
            </div>
            <div class="modal-body">
                <div class="modal-setting-item toggle-switch">
                    <label for="modalPlayGuessToggle">Play guess on click</label>
                    <input type="checkbox" id="modalPlayGuessToggle" v-model="settings.playGuessOnClick">
                </div>
                <div class="modal-setting-item toggle-switch">
                    <label for="modalAutoPlayNextWordToggle">Auto-play next word</label>
                    <input type="checkbox" id="modalAutoPlayNextWordToggle" v-model="settings.autoPlayNextWord">
                </div>
                <div class="modal-setting-item">
                    <label for="modalAutoPlayDelay">Auto-play delay (ms)</label>
                    <input type="number" id="modalAutoPlayDelay" ref="modalAutoPlayDelayInputRef" min="0" v-model.number="settings.autoPlayDelay" :disabled="!settings.autoPlayNextWord">
                </div>
                <div class="modal-setting-item">
                    <label for="modalSpeechRate">Speech Rate (0.1-10)</label>
                    <input type="number" id="modalSpeechRate" min="0.1" max="10" step="0.1" v-model.number="settings.speechRate">
                </div>
                <div class="modal-setting-item">
                    <label for="modalSpeechPitch">Speech Pitch (0-2)</label>
                    <input type="number" id="modalSpeechPitch" min="0" max="2" step="0.1" v-model.number="settings.speechPitch">
                </div>
                <div class="radio-group">
                    <label class="text-base text-gray-700">Bengali Accent:</label>
                    <div>
                        <input type="radio" id="accentKolkata" name="bengaliAccent" value="bn-IN" v-model="settings.bengaliAccent">
                        <label for="accentKolkata">Kolkata Style (India)</label>
                    </div>
                    <div>
                        <input type="radio" id="accentBangladesh" name="bengaliAccent" value="bn-BD" v-model="settings.bengaliAccent">
                        <label for="accentBangladesh">Bangladesh Style</label>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="button-secondary" @click="showSettingsModal = false">Cancel</button>
                <button class="button-primary" @click="saveSettings">Save</button>
            </div>
        </div>
    </div>

    <!-- History Modal -->
    <div v-if="showHistoryModal" id="historyModal" class="modal-overlay show">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Game History</h2>
                <button class="modal-close-button" @click="showHistoryModal = false">&times;</button>
            </div>
            <div class="modal-body">
                <div id="historyList" class="history-list w-full">
                    <p v-if="gameHistory.length === 0" class="text-gray-500 text-center">No guesses yet.</p>
                    <div v-for="(entry, index) in gameHistory" :key="index" class="history-item">
                        <strong>{{ index + 1 }}.</strong> Pair: {{ entry.pair.join(' / ') }}<br>
                        Guessed: <span :class="entry.isCorrect ? 'correct-answer' : 'wrong-answer'">{{ entry.guessed }}</span> {{ entry.isCorrect ? '✅' : '❌' }}<br>
                        Correct: <span class="correct-answer">{{ entry.correct }}</span>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="button-secondary" @click="clearHistory">Clear History</button>
                <button class="button-primary" @click="showHistoryModal = false">OK</button>
            </div>
        </div>
    </div>

    <!-- Data Error Modal -->
    <div v-if="showDataError" id="dataErrorModal" class="modal-overlay show">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Data Loading Error</h2>
            </div>
            <div class="modal-body">
                <p id="dataErrorModalMessage" class="text-gray-700 text-left">{{ dataErrorMessage }}</p>
            </div>
            <div class="modal-footer">
                <button class="button-primary" @click="showDataError = false">OK</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { allMinimalPairsData } from '../minimal_pairs_data.js'; // Adjust path if you move it

const DEFAULT_AUDIO_BASE_PATH = 'audio/aligned';

// Emojis
const playingEmoji = '🔊';
const stoppedEmoji = '🔈';
const settingsEmoji = '⚙️';
const historyEmoji = '📚';
const skipEmoji = '⏭️';
const resetEmoji = '🔄';

// Reactive State
const currentPair = ref(null); // [[word1Text, audio1Base], [word2Text, audio2Base]]
const correctWord = ref(null); // [wordText, audioBase]
const score = ref(0);
const totalAttempts = ref(0);
const currentPairAudioBasePath = ref(DEFAULT_AUDIO_BASE_PATH);
const isPlayingAudio = ref(false); // Renamed from isPlaying to avoid conflict with Vue's isPlaying
const userSelectedWord = ref(null); // [wordText, audioBase]
const userSelectedButtonElement = ref(null); // DOM element
const gameHistory = ref([]);
const currentFilteredPairs = ref([]);

const settings = reactive({
    playGuessOnClick: true,
    autoPlayNextWord: true,
    autoPlayDelay: 100,
    bengaliAccent: 'bn-IN',
    speechRate: 1.0,
    speechPitch: 1.0,
});

const selectedType = ref('All');
const availableTypes = ref([]);

const feedbackText = ref('');
const feedbackClass = ref('text-xl mt-4');
const playingStatusText = ref('');

const showSettingsModal = ref(false);
const showHistoryModal = ref(false);
const showDataError = ref(false);
const dataErrorMessage = ref('');

// Template Refs
const playButtonRef = ref(null);
const modalAutoPlayDelayInputRef = ref(null);

let audioPlayer;
let currentPlayback = reactive({
    originatorButton: null, // DOM element
    onEndCallback: null,
    wordObject: null, // [text, audioFilenameBase]
    isMP3: false
});

// Word display on buttons
const word1 = computed(() => currentPair.value ? currentPair.value.find(p => p[0] === shuffledWords.value[0]?.[0]) : null);
const word2 = computed(() => currentPair.value ? currentPair.value.find(p => p[0] === shuffledWords.value[1]?.[0]) : null);
const shuffledWords = ref([]); // To store the [word, audioBase] for button1 and button2

// --- Computed Properties for UI Logic ---
const canPlay = computed(() => currentFilteredPairs.value.length > 0 && !isPlayingAudio.value);
const canSelectWord = computed(() => currentFilteredPairs.value.length > 0 && !isPlayingAudio.value);
const canSubmitGuess = computed(() => userSelectedWord.value !== null && submitButtonText.value === "Submit Guess");
const isNextPairState = computed(() => submitButtonText.value === "Next Pair");
const canSkip = computed(() => currentFilteredPairs.value.length > 0 && !isNextPairState.value);

const submitButtonText = ref("Submit Guess");

function wordButtonEmoji(wordObj) {
    if (!settings.playGuessOnClick || !wordObj) return '';
    // Show playing emoji only if this specific word button initiated the sound.
    // If the main "Play Word" button initiated it, word choice buttons should show stoppedEmoji.
    if (isPlayingAudio.value && currentPlayback.wordObject?.[0] === wordObj[0] && currentPlayback.originatorButton !== playButtonRef.value) {
        return playingEmoji;
    }
    return stoppedEmoji;
}

function getWordButtonClass(wordObj) {
    const classes = ['word-button'];

    if (isNextPairState.value) {
        // After submission:
        // Correct word is always green
        if (wordObj?.[0] === correctWord.value?.[0]) {
            classes.push('bg-green-500-custom');
        // User's incorrect choice is red
        } else if (userSelectedWord.value && wordObj?.[0] === userSelectedWord.value?.[0]) {
            classes.push('bg-red-500-custom');
        }
        // The other button (not chosen, not correct) will just have 'word-button' class.
    } else {
        // Before submission:
        if (userSelectedWord.value && userSelectedWord.value[0] === wordObj?.[0]) {
            classes.push('selected'); // Applies styles from style.css for .word-button.selected
        }
        // If not selected, it just has 'word-button' class for default appearance.
    }
    return classes.join(' ');
}
// --- Methods ---

function populateTypeDropdown() {
    const types = Object.keys(allMinimalPairsData).sort();
    availableTypes.value = types.filter(type => {
        const typeData = allMinimalPairsData[type];
        return typeData && typeData.pairs && typeData.pairs.length > 0;
    });
    selectedType.value = 'All';
}

function handleTypeChange() {
    currentFilteredPairs.value = [];
    const type = selectedType.value;

    if (type === 'All') {
        Object.values(allMinimalPairsData).forEach(typeData => {
            if (typeData && typeData.pairs) {
                const basePath = typeData.path || DEFAULT_AUDIO_BASE_PATH;
                typeData.pairs.forEach(pair => {
                    currentFilteredPairs.value.push({ pair: pair, audioBasePath: basePath });
                });
            }
        });
    } else {
        const typeData = allMinimalPairsData[type];
        if (typeData && typeData.pairs) {
            const basePath = typeData.path || DEFAULT_AUDIO_BASE_PATH;
            typeData.pairs.forEach(pair => {
                currentFilteredPairs.value.push({ pair: pair, audioBasePath: basePath });
            });
        }
    }
    resetGame();
}

function startNewRound() {
    feedbackText.value = '';
    feedbackClass.value = 'text-xl mt-4';
    playingStatusText.value = '';
    submitButtonText.value = "Submit Guess";
    isPlayingAudio.value = false;
    userSelectedWord.value = null;
    userSelectedButtonElement.value = null;

    if (currentFilteredPairs.value.length === 0) {
        const currentTypeDisplay = selectedType.value === 'All' ? "All Types" : selectedType.value;
        feedbackText.value = `No minimal pairs available for "${currentTypeDisplay}". Please select another type.`;
        currentPair.value = null;
        correctWord.value = null;
        shuffledWords.value = [];
        return;
    }

    const randomIndex = Math.floor(Math.random() * currentFilteredPairs.value.length);
    const pairItem = currentFilteredPairs.value[randomIndex];
    currentPair.value = pairItem.pair;
    currentPairAudioBasePath.value = pairItem.audioBasePath;

    // Shuffle words for buttons
    const tempShuffled = [...currentPair.value].sort(() => Math.random() - 0.5);
    shuffledWords.value = tempShuffled;

    correctWord.value = currentPair.value[Math.floor(Math.random() * currentPair.value.length)];
    console.log('New round. Correct word:', correctWord.value);
}

function speakWord(wordObject, originatorButton, onEndCallback) {
    window.speechSynthesis.cancel();
    if (audioPlayer && !audioPlayer.paused) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
    }

    currentPlayback.originatorButton = originatorButton; // This is a DOM element ref
    currentPlayback.onEndCallback = onEndCallback;
    currentPlayback.wordObject = wordObject;

    isPlayingAudio.value = true;
    playingStatusText.value = '';

    if (!Array.isArray(wordObject) || typeof wordObject[0] === 'undefined') {
        console.error("speakWord: invalid wordObject", wordObject);
        finalizePlayback(false);
        return;
    }

    const audioFilenameBase = wordObject[1];
    if (audioFilenameBase && audioPlayer) {
        const audioPath = `${currentPairAudioBasePath.value}/${audioFilenameBase}.mp3`;
        console.log(`Attempting MP3: ${audioPath} for ${wordObject[0]}`);
        currentPlayback.isMP3 = true;
        audioPlayer.src = audioPath;
        audioPlayer.play().catch(e => {
            console.error("MP3 play() catch:", e);
            handleAudioPlayerError();
        });
    } else {
        console.log(`No MP3 for ${wordObject[0]}, using TTS.`);
        currentPlayback.isMP3 = false;
        speakWordTTS(wordObject[0], originatorButton, onEndCallback);
    }
}

function speakWordTTS(wordText, originatorButton, onEndCallback) {
    if (!('speechSynthesis' in window)) {
        console.error("Speech synthesis not supported.");
        playingStatusText.value = 'Text-to-Speech not supported.';
        finalizePlayback(false);
        return;
    }

    const utterance = new SpeechSynthesisUtterance(wordText);
    utterance.lang = settings.bengaliAccent;
    utterance.rate = settings.speechRate;
    utterance.pitch = settings.speechPitch;

    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(voice => voice.lang === settings.bengaliAccent) || voices.find(voice => voice.lang.startsWith('bn'));
    if (selectedVoice) utterance.voice = selectedVoice;

    utterance.onstart = () => {
        playingStatusText.value = ''; // Clear any error
    };
    utterance.onend = () => finalizePlayback(true);
    utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        finalizePlayback(false);
    };
    window.speechSynthesis.speak(utterance);
}

function finalizePlayback(success) {
    isPlayingAudio.value = false;
    const { onEndCallback, isMP3, wordObject } = currentPlayback;

    if (!success) {
        const errorType = isMP3 ? "MP3 Audio" : "Speech Synthesis";
        console.error(`Error during ${errorType} playback of "${wordObject?.[0]}".`);
        playingStatusText.value = `Error playing word. (${errorType})`;
    } else {
        playingStatusText.value = '';
    }

    if (onEndCallback) {
        // Clear before calling to prevent re-entrancy
        currentPlayback.originatorButton = null;
        currentPlayback.onEndCallback = null;
        currentPlayback.wordObject = null;
        currentPlayback.isMP3 = false;
        onEndCallback();
    } else {
        currentPlayback.originatorButton = null;
        currentPlayback.onEndCallback = null;
        currentPlayback.wordObject = null;
        currentPlayback.isMP3 = false;
    }
}

function playCorrectWord() {
    if (correctWord.value) {
        // Use template ref for the play button
        speakWord(correctWord.value, playButtonRef.value, null);
    }
}

function handleChoice(chosenWordObj, buttonElement) { // chosenWordObj is [text, audioBase]
    if (isNextPairState.value) { // Guess already submitted, just replay
        if (chosenWordObj) speakWord(chosenWordObj, buttonElement, null);
        return;
    }
    if (isPlayingAudio.value) return;

    userSelectedWord.value = chosenWordObj;
    userSelectedButtonElement.value = buttonElement; // Store the actual DOM element for styling if needed

    if (settings.playGuessOnClick && chosenWordObj) {
        speakWord(chosenWordObj, buttonElement, null);
    }
}

function processGuess() {
    if (!userSelectedWord.value) return;

    totalAttempts.value++;
    let isCorrect = false;

    if (userSelectedWord.value[0] === correctWord.value[0]) {
        feedbackText.value = 'Correct! 🎉';
        feedbackClass.value = 'feedback-correct text-xl mt-4';
        score.value++;
        isCorrect = true;
    } else {
        feedbackText.value = `Incorrect. The word was "${correctWord.value[0]}".`;
        feedbackClass.value = 'feedback-incorrect text-xl mt-4';
        isCorrect = false;
    }
    updateScoreDisplay();

    gameHistory.value.push({
        pair: currentPair.value.map(p => p[0]),
        correct: correctWord.value[0],
        guessed: userSelectedWord.value[0],
        isCorrect: isCorrect
    });

    submitButtonText.value = "Next Pair";
}

function handleSubmitGuessOrNext() {
    if (submitButtonText.value === "Submit Guess") {
        if (!userSelectedWord.value) return;
        processGuess();
    } else { // "Next Pair"
        window.speechSynthesis.cancel();
        if (settings.autoPlayNextWord) {
            setTimeout(() => {
                startNewRound();
                if (currentFilteredPairs.value.length > 0) playCorrectWord();
            }, settings.autoPlayDelay);
        } else {
            startNewRound();
        }
    }
}

function skipPair() {
    window.speechSynthesis.cancel();
    if (settings.autoPlayNextWord) {
        setTimeout(() => {
            startNewRound();
            if (currentFilteredPairs.value.length > 0) playCorrectWord();
        }, settings.autoPlayDelay);
    } else {
        startNewRound();
    }
}

function updateScoreDisplay() {
    // Score is already reactive, so UI updates automatically. This function is mostly for console logging if needed.
    console.log('Score updated:', score.value, '/', totalAttempts.value);
}

function resetGame() {
    window.speechSynthesis.cancel();
    score.value = 0;
    totalAttempts.value = 0;
    gameHistory.value = [];
    startNewRound();
}

function saveSettings() {
    // Settings are already bound with v-model. This function is for any validation or post-save actions.
    if (isNaN(settings.autoPlayDelay) || settings.autoPlayDelay < 0) settings.autoPlayDelay = 0;
    if (isNaN(settings.speechRate) || settings.speechRate < 0.1) settings.speechRate = 0.1;
    if (settings.speechRate > 10) settings.speechRate = 10;
    if (isNaN(settings.speechPitch) || settings.speechPitch < 0) settings.speechPitch = 0;
    if (settings.speechPitch > 2) settings.speechPitch = 2;
    showSettingsModal.value = false;
}

function clearHistory() {
    gameHistory.value = [];
    // Modal will auto-update due to reactivity
}

// Audio Player Event Handlers
function handleAudioPlayerEnded() {
    finalizePlayback(true);
}

function handleAudioPlayerError() {
    if (!currentPlayback.isMP3 || !isPlayingAudio.value) {
        console.warn("handleAudioPlayerError: Guarded", { isMP3: currentPlayback.isMP3, isPlayingAudio: isPlayingAudio.value });
        return;
    }
    console.error("MP3 playback error for:", currentPlayback.wordObject?.[1]);
    currentPlayback.isMP3 = false; // Mark for TTS attempt

    const wordToSpeak = currentPlayback.wordObject;
    const originator = currentPlayback.originatorButton; // This is a DOM element
    const originalCallback = currentPlayback.onEndCallback;

    if (wordToSpeak && typeof wordToSpeak[0] === 'string' && originator) {
        console.warn("Attempting TTS fallback for:", wordToSpeak[0]);
        speakWordTTS(wordToSpeak[0], originator, originalCallback);
    } else {
        console.error("handleAudioPlayerError: Missing info for TTS fallback.", { wordObj: wordToSpeak, originator });
        finalizePlayback(false);
    }
}


onMounted(() => {
    audioPlayer = new Audio();
    audioPlayer.addEventListener('ended', handleAudioPlayerEnded);
    audioPlayer.addEventListener('error', handleAudioPlayerError);

    let hasAnyPairs = false;
    if (typeof allMinimalPairsData === 'object' && allMinimalPairsData !== null) {
        hasAnyPairs = Object.values(allMinimalPairsData).some(
            typeData => typeof typeData === 'object' && typeData !== null && Array.isArray(typeData.pairs) && typeData.pairs.length > 0
        );
    }

    if (!hasAnyPairs) {
        dataErrorMessage.value = "No minimal pairs data found, data is empty, or data is not in the expected format. Please check data file and refresh.";
        showDataError.value = true;
        // Disable game controls (visual feedback through computed properties like `canPlay`)
        currentPair.value = null; 
        correctWord.value = null;
    } else {
        populateTypeDropdown();
        handleTypeChange(); // This calls resetGame -> startNewRound
    }

    // Ensure voices are loaded for TTS
    if ('speechSynthesis' in window && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
            console.log('Voices loaded/changed:', window.speechSynthesis.getVoices());
        };
    }
     // Trigger voice loading if needed (some browsers require this)
    window.speechSynthesis.getVoices();
});

// Watch for changes in autoPlayNextWord to enable/disable delay input
watch(() => settings.autoPlayNextWord, (newValue) => {
    if (modalAutoPlayDelayInputRef.value) { // Check if the ref is available and the element exists
        modalAutoPlayDelayInputRef.value.disabled = !newValue;
    }
});

</script>

<style>
/* Your existing style.css content can go here or be linked globally.
   For brevity, I'm not including all of it.
   Ensure your modal styles, button styles, etc., are available.
*/

.modal-overlay.show {
    display: flex; /* Or your preferred display method for showing modals */
}

.playing-indicator.hidden {
    display: none;
}

/* Add any Vue-specific styles or overrides here */
.word-button.selected {
    border-color: #3b82f6; /* Example: blue-500 */
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
}
.feedback-correct {
    color: #16a34a; /* Example: green-600 */
}
.feedback-incorrect {
    color: #dc2626; /* Example: red-600 */
}
.bg-green-500-custom {
    background-color: #22c55e !important; /* Tailwind green-500 */
    color: white !important;
}
.bg-red-500-custom {
    background-color: #ef4444 !important; /* Tailwind red-500 */
    color: white !important;
}
.history-item {
    padding: 8px;
    border-bottom: 1px solid #eee;
}
.history-item:last-child {
    border-bottom: none;
}
.correct-answer {
    color: #16a34a; /* green-600 */
    font-weight: bold;
}
.wrong-answer {
    color: #dc2626; /* red-600 */
    font-weight: bold;
}

</style>