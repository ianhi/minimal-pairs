<template>
    <div class="container">
        <h1 class="text-3xl font-bold text-gray-800 mb-4 text-center">{{ pageTitle }}</h1>
        <div class="mb-6">
            <label for="typeSelect" class="block text-lg font-medium text-gray-700 mb-2">Select Minimal Pair
                Type:</label>
            <select id="typeSelect" v-model="selectedType" @change="handleTypeChange"
                class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-white">
                <option value="All">All Types</option>
                <option v-for="type in availableTypes" :key="type" :value="type">{{ type }}</option>
            </select>
        </div>

        <div class="flex flex-col items-center gap-4">
            <p class="text-lg text-gray-600">Click "Play Word" to hear one of the words, then choose which one you
                heard.</p>
            <button id="playButton" ref="playButtonRef" @click="playCorrectWord" :disabled="!canPlay"
                class="button-primary w-full max-w-xs">
                Play Word <span
                    :style="{ visibility: (isPlayingAudio && currentPlayback.originatorButton === playButtonRef) ? 'visible' : 'hidden' }">{{
                    playingEmoji }}</span>
            </button>
        </div>

        <div id="wordChoices" class="grid grid-cols-2 md:grid-cols-2 gap-4 mt-6 w-full">
            <button id="word1Button" @click="handleChoice(word1, $event.target)" :disabled="!canSelectWord"
                :class="getWordButtonClass(word1)" class="word-button">
                {{ word1?.[0] }} {{ wordButtonEmoji(word1) }}
            </button>
            <button id="word2Button" @click="handleChoice(word2, $event.target)" :disabled="!canSelectWord"
                :class="getWordButtonClass(word2)" class="word-button">
                {{ word2?.[0] }} {{ wordButtonEmoji(word2) }}
            </button>
        </div>

        <div id="feedback" class="text-xl mt-4 text-center" :class="feedbackClass">{{ feedbackText }}</div>

        <div class="flex flex-col md:flex-row justify-center gap-4 mt-6">
            <button id="submitGuessButton" @click="handleSubmitGuessOrNext"
                :disabled="!canSubmitGuess && !isNextPairState" class="button-primary w-full md:w-auto">
                {{ submitButtonText }}
            </button>
            <button id="nextButton" @click="skipPair" :disabled="!canSkip" class="button-secondary w-full md:w-auto">
                Skip Pair {{ skipEmoji }}
            </button>
        </div>

        <div class="text-lg text-gray-700 mt-4 text-center">
            Score: <span id="score">{{ score }}</span> / <span id="totalAttempts">{{ totalAttempts }}</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8 mx-auto w-full max-w-2xl">
            <button id="resetButton" @click="resetGame" class="button-secondary flex items-center justify-center gap-2">
                Reset {{ resetEmoji }}
            </button>
            <button id="settingsButton" @click="showSettingsModal = true"
                class="button-secondary flex items-center justify-center gap-2">
                Settings {{ settingsEmoji }}
            </button>
            <button id="historyButton" @click="showHistoryModal = true"
                class="button-secondary flex items-center justify-center gap-2">
                History {{ historyEmoji }}
            </button>
            <router-link to="/" class="button-secondary flex items-center justify-center gap-2 text-center min-w-0">Home
                🏠</router-link>
        </div>
    </div>

    <SettingsModal :show="showSettingsModal" :current-settings="settings" @update:show="showSettingsModal = $event"
        @save-settings="handleSaveSettings" />

    <HistoryModal :show="showHistoryModal" :history="gameHistory" @update:show="showHistoryModal = $event"
        @clear-history="clearHistory" />

    <DataErrorModal :show="showDataError" :message="dataErrorMessage" @update:show="showDataError = $event" />

    <!-- Debug Audio Modal (Dev Only) -->
    <div v-if="isDevelopment && showDebugModal" 
         class="fixed z-50 bg-blue-50 border border-blue-300 rounded-lg shadow-lg p-4"
         :style="{ top: debugModalPosition.y + 'px', left: debugModalPosition.x + 'px', cursor: isDragging ? 'grabbing' : 'grab' }"
         @mousedown="startDragging"
         @touchstart="startDragging">
        <div class="flex justify-between items-start mb-2">
            <h3 class="font-semibold text-blue-900">Audio Debug Info</h3>
            <button @click="showDebugModal = false" class="text-blue-600 hover:text-blue-800 ml-4">
                ✕
            </button>
        </div>
        <div class="text-sm font-mono text-blue-800 whitespace-pre-wrap max-w-md overflow-auto max-h-64">
            {{ playingStatusText }}
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
// import { useRoute } from 'vue-router'; // No longer needed if langCode is a prop
import SettingsModal from '../components/SettingsModal.vue'; // Adjusted path
import HistoryModal from '../components/HistoryModal.vue';   // Adjusted path
import DataErrorModal from '../components/DataErrorModal.vue'; // Adjusted path

const props = defineProps({
    langCode: String
});

// Emojis
const playingEmoji = '🔊';
const stoppedEmoji = '🔈';
const settingsEmoji = '⚙️';
const historyEmoji = '📚';
const skipEmoji = '⏭️';
const resetEmoji = '🔄';

// Language specific data - to be populated based on route param
const activeMinimalPairsData = ref(null);
const allLanguagesData = ref(null); // To store the entire fetched JSON
const pageTitle = ref("Minimal Pairs Practice");

// Reactive State (from original App.vue)
const currentPair = ref(null);
const correctWord = ref(null);
const score = ref(0);
const languageSpecificDefaultAudioPath = ref(''); // To store e.g., 'audio/bn-IN/aligned'
const totalAttempts = ref(0);
const currentPairAudioBasePath = ref(''); // Initialize as empty, will be set in startNewRound
const isPlayingAudio = ref(false);
const userSelectedWord = ref(null);
const userSelectedButtonElement = ref(null);
const gameHistory = ref([]);
const currentFilteredPairs = ref([]);
const nextPairToPrefetch = ref(null); // Stores the {pair, audioBasePath} for the *next* round
const audioBasePath = ref(''); // Base path for all audio files for current language


const settings = reactive({
    playGuessOnClick: true,
    autoPlayNextWord: true,
    autoPlayDelay: 10,
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

// Debug modal state
const isDevelopment = ref(import.meta.env.DEV);
const showDebugModal = ref(false);
const debugModalPosition = ref({ x: 20, y: 20 });
const isDragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });

const playButtonRef = ref(null);

let audioPlayer;
let currentPlayback = reactive({
    originatorButton: null,
    onEndCallback: null,
    wordObject: null,
    isMP3: false
});

// Refs for managing prefetch link elements
const prefetchLinkWord1 = ref(null);
const prefetchLinkWord2 = ref(null);

// Cache for discovered audio files per word
const audioCache = ref({});

// Audio manifest loaded from JSON
const audioManifest = ref(null);

const word1 = computed(() => currentPair.value ? currentPair.value.find(p => p[0] === shuffledWords.value[0]?.[0]) : null);
const word2 = computed(() => currentPair.value ? currentPair.value.find(p => p[0] === shuffledWords.value[1]?.[0]) : null);
const shuffledWords = ref([]);
// Track which voice to use for each word (target vs. choice)
const wordVoiceSelections = ref({
    target: null, // Voice name to use for target word
    choice1: null, // Voice name to use for first choice
    choice2: null  // Voice name to use for second choice
});

// Track available voices for current words
const availableVoices = ref({});

const canPlay = computed(() => currentFilteredPairs.value.length > 0 && !isPlayingAudio.value);
const canSelectWord = computed(() => currentFilteredPairs.value.length > 0 && !isPlayingAudio.value);
const canSubmitGuess = computed(() => userSelectedWord.value !== null && submitButtonText.value === "Submit Guess");
const isNextPairState = computed(() => submitButtonText.value === "Next Pair");
const canSkip = computed(() => currentFilteredPairs.value.length > 0 && !isNextPairState.value);

const submitButtonText = ref("Submit Guess");

async function fetchMinimalPairsData() {
    try {
        const response = await fetch(`${import.meta.env.BASE_URL}/audio/minimal_pairs_db.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allLanguagesData.value = await response.json();
        return true;
    } catch (error) {
        console.error("Failed to fetch minimal pairs data:", error);
        dataErrorMessage.value = "Could not load language data. Please try refreshing the page.";
        showDataError.value = true;
        return false;
    }
}

function initializeGameForLanguage(langCode) {
    if (!allLanguagesData.value || !allLanguagesData.value[langCode]) {
        activeMinimalPairsData.value = null;
        pageTitle.value = "Language Not Supported";
        dataErrorMessage.value = `Minimal pairs data for language code "${langCode}" is not available.`;
        showDataError.value = true;
        currentFilteredPairs.value = [];
        languageSpecificDefaultAudioPath.value = '';
        audioBasePath.value = '';
        currentPair.value = null;
        correctWord.value = null;
        availableTypes.value = [];
        return;
    }

    const langData = allLanguagesData.value[langCode];
    activeMinimalPairsData.value = langData.types;
    pageTitle.value = langData.languageName ? `${langData.languageName} Minimal Pairs` : "Minimal Pairs Practice";
    languageSpecificDefaultAudioPath.value = langData.defaultAudioBasePath || `audio/${langCode}/aligned`;
    audioBasePath.value = langData.audioBasePath || `audio/${langCode}`;

    showDataError.value = false;
    dataErrorMessage.value = '';
    populateTypeDropdown();

    // Set default type if specified for the language (optional)
    if (langData.defaultType && availableTypes.value.includes(langData.defaultType)) {
        selectedType.value = langData.defaultType;
    } else if (langCode === 'bn-IN') { // Fallback for existing bn-IN default
        const defaultBengaliType = "Dental ত vs. Retroflex ট";
        if (availableTypes.value.includes(defaultBengaliType)) {
            selectedType.value = defaultBengaliType;
        }
    }
    handleTypeChange();
}

watch(() => props.langCode, (newLangCode) => {
    if (newLangCode) {
        initializeGameForLanguage(newLangCode);
    }
}, { immediate: true });


function wordButtonEmoji(wordObj) {
    if (!settings.playGuessOnClick || !wordObj) return '';
    if (isPlayingAudio.value && currentPlayback.wordObject?.[0] === wordObj[0] && currentPlayback.originatorButton !== playButtonRef.value) {
        return playingEmoji;
    }
    return stoppedEmoji;
}

function getWordButtonClass(wordObj) {
    const classes = ['word-button'];
    if (isNextPairState.value) {
        if (wordObj?.[0] === correctWord.value?.[0]) {
            classes.push('bg-green-500-custom');
        } else if (userSelectedWord.value && wordObj?.[0] === userSelectedWord.value?.[0]) {
            classes.push('bg-red-500-custom');
        }
    } else {
        if (userSelectedWord.value && userSelectedWord.value[0] === wordObj?.[0]) {
            classes.push('selected');
        }
    }
    return classes.join(' ');
}

function populateTypeDropdown() {
    if (!activeMinimalPairsData.value) return;
    const types = Object.keys(activeMinimalPairsData.value).sort();
    availableTypes.value = types.filter(type => {
        const typeData = activeMinimalPairsData.value[type];
        return typeData && typeData.pairs && typeData.pairs.length > 0;
    });
    selectedType.value = 'All';
}

function handleTypeChange() {
    if (!activeMinimalPairsData.value) return;
    currentFilteredPairs.value = [];
    nextPairToPrefetch.value = null; // Clear pre-selected next pair
    updateAudioPrefetchLinks(null, null, null); // Clear prefetch links
    const type = selectedType.value;

    if (type === 'All') {
        Object.values(activeMinimalPairsData.value).forEach(typeData => {
            if (typeData && typeData.pairs && typeData.pairs.length > 0) {
                typeData.pairs.forEach(pair => {
                    currentFilteredPairs.value.push({ pair: pair, audioBasePath: audioBasePath.value });
                });
            }
        });
    } else {
        const typeData = activeMinimalPairsData.value[type];
        if (typeData && typeData.pairs && typeData.pairs.length > 0) {
            typeData.pairs.forEach(pair => {
                currentFilteredPairs.value.push({ pair: pair, audioBasePath: audioBasePath.value });
            });
        } else {
            // console.warn(`No pairs found for type: ${type} or typeData is missing.`);
            // currentFilteredPairs.value will remain empty or be emptied by resetGame
        }
    }
    resetGame();
}

function updateAudioPrefetchLinks(word1Obj, word2Obj, audioBasePath) {
    // Remove existing prefetch links managed by this component
    if (prefetchLinkWord1.value && prefetchLinkWord1.value.parentNode) {
        document.head.removeChild(prefetchLinkWord1.value);
        prefetchLinkWord1.value = null;
    }
    if (prefetchLinkWord2.value && prefetchLinkWord2.value.parentNode) {
        document.head.removeChild(prefetchLinkWord2.value);
        prefetchLinkWord2.value = null;
    }

    const baseAppUrl = import.meta.env.BASE_URL || '/'; // Ensure base URL ends with a slash if not root

    // Prefetch for word1 if audio is available
    if (word1Obj && word1Obj[1] && audioBasePath) { // word1Obj[1] is the transliteration
        const transliteration = word1Obj[1];
        const voiceData = availableVoices.value[transliteration];
        if (voiceData && voiceData.voices.length > 0) {
            const voiceName = voiceData.voices[0]; // Use first available voice for prefetch
            const extension = voiceData.extension;
            const audioFilename = `${transliteration}_${voiceName}`;
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = `${baseAppUrl}${audioBasePath}/${transliteration}/${audioFilename}.${extension}`.replace(/\/\//g, '/');
            link.as = 'audio';
            document.head.appendChild(link);
            prefetchLinkWord1.value = link;
            // console.log('Vue: Prefetching audio:', link.href);
        }
    }

    // Prefetch for word2 if audio is available
    if (word2Obj && word2Obj[1] && audioBasePath) { // word2Obj[1] is the transliteration
        const transliteration = word2Obj[1];
        const voiceData = availableVoices.value[transliteration];
        if (voiceData && voiceData.voices.length > 0) {
            const voiceName = voiceData.voices[0]; // Use first available voice for prefetch
            const extension = voiceData.extension;
            const audioFilename = `${transliteration}_${voiceName}`;
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = `${baseAppUrl}${audioBasePath}/${transliteration}/${audioFilename}.${extension}`.replace(/\/\//g, '/');
            link.as = 'audio';
            document.head.appendChild(link);
            prefetchLinkWord2.value = link;
            // console.log('Vue: Prefetching audio:', link.href);
        }
    }
}
async function startNewRound() {
    feedbackText.value = '';
    feedbackClass.value = 'text-xl mt-4';
    playingStatusText.value = '';
    submitButtonText.value = "Submit Guess";
    isPlayingAudio.value = false;
    userSelectedWord.value = null;
    userSelectedButtonElement.value = null;

    if (currentFilteredPairs.value.length === 0) {
        if (activeMinimalPairsData.value) { // Only show this if data was expected
            const currentTypeDisplay = selectedType.value === 'All' ? "All Types" : selectedType.value;
            feedbackText.value = `No minimal pairs available for "${currentTypeDisplay}". Please select another type.`;
        }
        nextPairToPrefetch.value = null; // No next pair if no current pairs
        updateAudioPrefetchLinks(null, null, null); // Clear any existing prefetch links
        currentPair.value = null;
        correctWord.value = null;
        shuffledWords.value = [];
        return;
    }

    let pairItem;
    // Check if nextPairToPrefetch is valid and still in currentFilteredPairs
    const isNextPairValid = nextPairToPrefetch.value &&
        currentFilteredPairs.value.some(pItem =>
            pItem.pair === nextPairToPrefetch.value.pair &&
            pItem.audioBasePath === nextPairToPrefetch.value.audioBasePath
        );

    if (isNextPairValid) {
        pairItem = nextPairToPrefetch.value;
        // console.log("Vue: Using pre-selected nextPairForRound:", pairItem.pair.map(p => p[0]));
        nextPairToPrefetch.value = null; // Clear it as it's now being used
    } else {
        const randomIndex = Math.floor(Math.random() * currentFilteredPairs.value.length);
        pairItem = currentFilteredPairs.value[randomIndex];
        // console.log("Vue: Randomly selected current pair:", pairItem.pair.map(p => p[0]));
    }

    currentPair.value = pairItem.pair;
    currentPairAudioBasePath.value = pairItem.audioBasePath;

    const tempShuffled = [...currentPair.value].sort(() => Math.random() - 0.5);
    shuffledWords.value = tempShuffled;
    correctWord.value = currentPair.value[Math.floor(Math.random() * currentPair.value.length)];

    // Discover available voices for each word in the current pair
    availableVoices.value = {};
    for (const word of currentPair.value) {
        const transliteration = word[1];
        const voiceData = await discoverAvailableRecordings(transliteration);
        availableVoices.value[transliteration] = voiceData;
    }

    // Function to select voices ensuring different voices for target vs choices
    const selectVoices = () => {
        const selections = {};
        
        // For each unique word, create a pool of available voices
        const wordPools = {};
        for (const word of currentPair.value) {
            const transliteration = word[1];
            const voiceData = availableVoices.value[transliteration];
            if (!wordPools[transliteration]) {
                wordPools[transliteration] = [...(voiceData?.voices || ['chirp3-hd-aoede'])];
            }
        }
        
        // Select voice for target word
        const targetWord = correctWord.value[1];
        const targetPool = wordPools[targetWord];
        const targetVoice = targetPool[Math.floor(Math.random() * targetPool.length)];
        selections.target = targetVoice;
        
        // Remove the target voice from ALL word pools to ensure choices never use it
        for (const transliteration in wordPools) {
            const pool = wordPools[transliteration];
            const voiceIndex = pool.indexOf(targetVoice);
            if (voiceIndex > -1) {
                pool.splice(voiceIndex, 1);
            }
        }
        
        // Select voices for choice words
        const choice1Word = shuffledWords.value[0][1];
        const choice2Word = shuffledWords.value[1][1];
        
        // Choice 1
        const choice1Pool = wordPools[choice1Word];
        const choice1Voice = choice1Pool.length > 0 
            ? choice1Pool[Math.floor(Math.random() * choice1Pool.length)]
            : availableVoices.value[choice1Word]?.voices?.find(v => v !== targetVoice) || 'chirp3-hd-aoede';
        selections.choice1 = choice1Voice;
        
        // Remove selected voice from ALL pools
        for (const transliteration in wordPools) {
            const pool = wordPools[transliteration];
            const voiceIndex = pool.indexOf(choice1Voice);
            if (voiceIndex > -1) {
                pool.splice(voiceIndex, 1);
            }
        }
        
        // Choice 2
        const choice2Pool = wordPools[choice2Word];
        const choice2Voice = choice2Pool.length > 0 
            ? choice2Pool[Math.floor(Math.random() * choice2Pool.length)]
            : availableVoices.value[choice2Word]?.voices?.find(v => v !== targetVoice && v !== choice1Voice) || 'chirp3-hd-aoede';
        selections.choice2 = choice2Voice;
        
        return selections;
    };
    
    wordVoiceSelections.value = selectVoices();
    
    // DEBUG: Log the current pair and voice selections
    console.log("=== NEW ROUND ===");
    console.log("Correct word:", correctWord.value?.[0]);
    console.log("Word 1:", word1.value?.[0]);
    console.log("Word 2:", word2.value?.[0]);
    console.log("Available voices:", availableVoices.value);
    console.log("Voice selections:", wordVoiceSelections.value);
    console.log(`Target voice: ${correctWord.value?.[1]}_${wordVoiceSelections.value.target}`);
    console.log(`Choice 1 voice: ${word1.value?.[1]}_${wordVoiceSelections.value.choice1}`);
    console.log(`Choice 2 voice: ${word2.value?.[1]}_${wordVoiceSelections.value.choice2}`);

    // --- Determine and store the *new* next pair for the *subsequent* round, then prefetch it ---
    if (currentFilteredPairs.value.length > 1) {
        let potentialNextItem = null;
        let attempts = 0;
        const maxAttempts = currentFilteredPairs.value.length * 2;

        do {
            const nextRandomIndex = Math.floor(Math.random() * currentFilteredPairs.value.length);
            potentialNextItem = currentFilteredPairs.value[nextRandomIndex];
            attempts++;
        } while (potentialNextItem.pair === currentPair.value && attempts < maxAttempts);

        if (potentialNextItem.pair === currentPair.value) { // Still the same after attempts
            potentialNextItem = currentFilteredPairs.value.find(p => p.pair !== currentPair.value) || null;
        }
        nextPairToPrefetch.value = potentialNextItem;
    } else {
        nextPairToPrefetch.value = null;
    }

    if (nextPairToPrefetch.value) {
        // console.log("Vue: Next pair for prefetch determined:", nextPairToPrefetch.value.pair.map(p => p[0]));
        updateAudioPrefetchLinks(nextPairToPrefetch.value.pair[0], nextPairToPrefetch.value.pair[1], nextPairToPrefetch.value.audioBasePath);
    } else {
        updateAudioPrefetchLinks(null, null, null);
    }
    // console.log('Vue: New round. Correct word:', correctWord.value?.[0]);
}

function speakWord(wordObject, originatorButton, onEndCallback) {
    window.speechSynthesis.cancel();
    if (audioPlayer && !audioPlayer.paused) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
    }

    currentPlayback.originatorButton = originatorButton;
    currentPlayback.onEndCallback = onEndCallback;
    currentPlayback.wordObject = wordObject;

    isPlayingAudio.value = true;
    playingStatusText.value = '';

    if (!Array.isArray(wordObject) || typeof wordObject[0] === 'undefined') {
        console.error("speakWord: invalid wordObject", wordObject);
        finalizePlayback(false);
        return;
    }

    // Determine which voice to use based on whether this is the target word or a choice
    let voiceName = 'chirp3-hd-aoede'; // Default voice
    let buttonType = "unknown";
    
    const audioFilenameBase = wordObject[1]; // transliteration
    const voiceData = availableVoices.value[audioFilenameBase];
    const availableVoicesForWord = voiceData?.voices || ['chirp3-hd-aoede'];
    
    // If this is the target word (played from the play button)
    if (originatorButton === playButtonRef.value) {
        voiceName = wordVoiceSelections.value.target;
        buttonType = "target";
    } 
    // If this is a choice word (played when clicking on a word option)
    // Randomly select a new voice each time for variety, but exclude target voice
    else if (wordObject[0] === word1.value?.[0]) {
        const targetVoice = wordVoiceSelections.value.target;
        const availableChoices = availableVoicesForWord.filter(v => v !== targetVoice);
        voiceName = availableChoices.length > 0 
            ? availableChoices[Math.floor(Math.random() * availableChoices.length)]
            : availableVoicesForWord[0]; // Fallback to any voice if filtering leaves none
        buttonType = "choice1";
    } 
    else if (wordObject[0] === word2.value?.[0]) {
        const targetVoice = wordVoiceSelections.value.target;
        const availableChoices = availableVoicesForWord.filter(v => v !== targetVoice);
        voiceName = availableChoices.length > 0 
            ? availableChoices[Math.floor(Math.random() * availableChoices.length)]
            : availableVoicesForWord[0]; // Fallback to any voice if filtering leaves none
        buttonType = "choice2";
    }

    const audioFilename = `${audioFilenameBase}_${voiceName}`;
    
    if (audioFilenameBase && audioPlayer) {
        // Get the correct file extension for this word
        const extension = voiceData?.extension || 'wav';
        
        // Construct path using tree structure: audioBasePath/word/word_voicename.extension
        // import.meta.env.BASE_URL will be like '/' or '/minimal-pairs/'
        const audioPath = `${import.meta.env.BASE_URL}${currentPairAudioBasePath.value}/${audioFilenameBase}/${audioFilename}.${extension}`;

        // DEBUG: Show which file is being played
        const debugInfo = `Playing: ${audioFilename}.${extension}
Word: ${wordObject[0]}
Button: ${buttonType}
Voice: ${voiceName} of ${availableVoices.value[audioFilenameBase]?.voices?.length || 'unknown'} available
Is Correct Word: ${wordObject[0] === correctWord.value?.[0] ? 'Yes' : 'No'}`;
        console.log(debugInfo);
        
        if (isDevelopment.value) {
            playingStatusText.value = debugInfo;
            showDebugModal.value = true;
        }

        currentPlayback.isMP3 = true; // Still using this flag for "has audio file" vs TTS
        audioPlayer.src = audioPath;
        audioPlayer.play().catch(e => {
            console.error(`Audio play() catch for ${audioPath}:`, e);
            handleAudioPlayerError();
        });
    } else {
        currentPlayback.isMP3 = false;
        console.log(`Using TTS fallback for: ${wordObject[0]}`);
        if (isDevelopment.value) {
            playingStatusText.value = `Using TTS fallback for: ${wordObject[0]}`;
            showDebugModal.value = true;
        }
        speakWordTTS(wordObject[0], originatorButton, onEndCallback);
    }
}

function speakWordTTS(wordText, originatorButton, onEndCallback) {
    if (!('speechSynthesis' in window)) {
        playingStatusText.value = 'Text-to-Speech not supported.';
        finalizePlayback(false);
        return;
    }

    const utterance = new SpeechSynthesisUtterance(wordText);
    utterance.lang = props.langCode;
    utterance.rate = settings.speechRate;
    utterance.pitch = settings.speechPitch;

    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;
    if (props.langCode) {
        selectedVoice = voices.find(voice => voice.lang === props.langCode) ||
            voices.find(voice => voice.lang.startsWith(props.langCode.substring(0, 2)));
    }
    if (selectedVoice) utterance.voice = selectedVoice;

    utterance.onstart = () => { playingStatusText.value = ''; };
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
        const errorType = isMP3 ? "Audio File" : "Speech Synthesis";
        if (isDevelopment.value) {
            playingStatusText.value = `Error playing word. (${errorType})`;
            showDebugModal.value = true;
        }
    }

    if (onEndCallback) {
        currentPlayback.onEndCallback = null; // Clear before calling
        onEndCallback();
    }
    currentPlayback.originatorButton = null;
    currentPlayback.wordObject = null;
    currentPlayback.isMP3 = false;
    
    // DEBUG: Log when playback is complete
    console.log("Playback complete");
}

function playCorrectWord() {
    if (correctWord.value) {
        speakWord(correctWord.value, playButtonRef.value, null);
    }
}

function handleChoice(chosenWordObj, buttonElement) {
    if (isNextPairState.value) {
        if (chosenWordObj) speakWord(chosenWordObj, buttonElement, null);
        return;
    }
    if (isPlayingAudio.value) return;

    userSelectedWord.value = chosenWordObj;
    userSelectedButtonElement.value = buttonElement;

    if (settings.playGuessOnClick && chosenWordObj) {
        speakWord(chosenWordObj, buttonElement, null);
    }
}

function processGuess() {
    if (!userSelectedWord.value) return;
    totalAttempts.value++;
    let isCorrect = userSelectedWord.value[0] === correctWord.value[0];

    if (isCorrect) {
        feedbackText.value = 'Correct! 🎉';
        feedbackClass.value = 'feedback-correct text-xl mt-4';
        score.value++;
    } else {
        feedbackText.value = `Incorrect. The word was "${correctWord.value[0]}".`;
        feedbackClass.value = 'feedback-incorrect text-xl mt-4';
    }

    gameHistory.value.push({
        pair: currentPair.value.map(p => p[0]),
        correct: correctWord.value[0],
        guessed: userSelectedWord.value[0],
        isCorrect: isCorrect
    });
    submitButtonText.value = "Next Pair";
}

async function handleSubmitGuessOrNext() {
    if (submitButtonText.value === "Submit Guess") {
        if (!userSelectedWord.value) return;
        processGuess();
    } else {
        window.speechSynthesis.cancel();
        if (settings.autoPlayNextWord) {
            setTimeout(async () => {
                await startNewRound();
                if (currentFilteredPairs.value.length > 0) playCorrectWord();
            }, settings.autoPlayDelay);
        } else {
            startNewRound();
        }
    }
}

function skipPair() {
    window.speechSynthesis.cancel();
    // Logic is same as "Next Pair" without processing a guess
    if (settings.autoPlayNextWord) {
        setTimeout(async () => {
            await startNewRound();
            if (currentFilteredPairs.value.length > 0) playCorrectWord();
        }, settings.autoPlayDelay);
    } else {
        startNewRound();
    }
}

async function loadAudioManifest() {
    /**
     * Load the audio manifest JSON file that contains all available audio files.
     */
    if (audioManifest.value) {
        return audioManifest.value;
    }

    try {
        const response = await fetch(`${import.meta.env.BASE_URL}audio/audio_manifest.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        audioManifest.value = await response.json();
        console.log(`Loaded audio manifest: ${audioManifest.value.total_words} words, ${audioManifest.value.total_files} files`);
        return audioManifest.value;
    } catch (error) {
        console.error("Failed to load audio manifest:", error);
        audioManifest.value = { words: {} }; // Empty fallback
        return audioManifest.value;
    }
}

async function discoverAvailableRecordings(transliteration) {
    /**
     * Get available audio recordings for a word from the manifest.
     * Returns object with available voices: { voices: [...], extension: 'mp3'|'wav' }
     */
    if (audioCache.value[transliteration]) {
        return audioCache.value[transliteration];
    }

    // Ensure manifest is loaded
    await loadAudioManifest();
    
    // Get data from manifest
    const manifestData = audioManifest.value.words[transliteration];
    
    let result;
    if (manifestData) {
        result = {
            voices: manifestData.voices,
            extension: manifestData.extension
        };
    } else {
        // Fallback if word not found in manifest
        result = {
            voices: ['chirp3-hd-aoede'], // Default voice
            extension: 'wav'
        };
    }
    
    // Cache the result
    audioCache.value[transliteration] = result;
    
    console.log(`Found ${result.voices.length} ${result.extension} voices for "${transliteration}": [${result.voices.join(', ')}]`);
    return result;
}

function resetGame() {
    window.speechSynthesis.cancel();
    score.value = 0;
    totalAttempts.value = 0;
    nextPairToPrefetch.value = null; // Clear pre-selected next pair
    updateAudioPrefetchLinks(null, null, null); // Clear prefetch links
    gameHistory.value = []; // Keep history for the session unless cleared via modal
    startNewRound();
}

function handleSaveSettings(newSettings) {
    Object.assign(settings, newSettings);
}

function clearHistory() {
    gameHistory.value = [];
}

function handleAudioPlayerEnded() {
    finalizePlayback(true);
}

function handleAudioPlayerError() {
    if (!currentPlayback.isMP3 || !isPlayingAudio.value) return;

    const wordToSpeak = currentPlayback.wordObject;
    const originator = currentPlayback.originatorButton;
    const originalCallback = currentPlayback.onEndCallback;

    // Mark current MP3 attempt as failed, try TTS
    currentPlayback.isMP3 = false;

    if (wordToSpeak && typeof wordToSpeak[0] === 'string' && originator) {
        // Determine which voice was being attempted
        let voiceName = 'chirp3-hd-aoede';
        if (originator === playButtonRef.value) {
            voiceName = wordVoiceSelections.value.target;
        } else if (wordToSpeak[0] === word1.value?.[0]) {
            voiceName = wordVoiceSelections.value.choice1;
        } else if (wordToSpeak[0] === word2.value?.[0]) {
            voiceName = wordVoiceSelections.value.choice2;
        }
        
        const voiceData = availableVoices.value[wordToSpeak[1]];
        const extension = voiceData?.extension || 'wav';
        const audioFilename = `${wordToSpeak[1]}_${voiceName}.${extension}`;
        console.warn(`Audio error for ${audioFilename}, attempting TTS fallback for: ${wordToSpeak[0]}`);
        speakWordTTS(wordToSpeak[0], originator, originalCallback);
    } else {
        finalizePlayback(false); // Cannot fallback
    }
}

onMounted(async () => {
    audioPlayer = new Audio();
    audioPlayer.addEventListener('ended', handleAudioPlayerEnded);
    audioPlayer.addEventListener('error', handleAudioPlayerError);

    const dataLoaded = await fetchMinimalPairsData();
    if (!dataLoaded) return; // Stop further initialization if data failed to load

    if (props.langCode) { // Initialize based on the prop
        initializeGameForLanguage(props.langCode);
    }

    if ('speechSynthesis' in window && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
            // Voices loaded, re-check or re-initialize TTS if needed
        };
    }
    window.speechSynthesis.getVoices(); // Trigger voice loading
});

// Draggable modal functions
function startDragging(e) {
    if (e.target.tagName === 'BUTTON') return; // Don't drag when clicking close button
    
    isDragging.value = true;
    const event = e.type.includes('mouse') ? e : e.touches[0];
    
    dragOffset.value = {
        x: event.clientX - debugModalPosition.value.x,
        y: event.clientY - debugModalPosition.value.y
    };
    
    document.addEventListener('mousemove', handleDragging);
    document.addEventListener('mouseup', stopDragging);
    document.addEventListener('touchmove', handleDragging);
    document.addEventListener('touchend', stopDragging);
    
    e.preventDefault();
}

function handleDragging(e) {
    if (!isDragging.value) return;
    
    const event = e.type.includes('mouse') ? e : e.touches[0];
    
    debugModalPosition.value = {
        x: Math.max(0, Math.min(window.innerWidth - 300, event.clientX - dragOffset.value.x)),
        y: Math.max(0, Math.min(window.innerHeight - 200, event.clientY - dragOffset.value.y))
    };
}

function stopDragging() {
    isDragging.value = false;
    document.removeEventListener('mousemove', handleDragging);
    document.removeEventListener('mouseup', stopDragging);
    document.removeEventListener('touchmove', handleDragging);
    document.removeEventListener('touchend', stopDragging);
}

</script>

<style scoped>
/* Styles moved from App.vue, now scoped to LanguagePractice.vue */
.container {
    display: block;
    /* Ensure it's a block-level element for margin:auto centering */
    width: 100%;
    /* Allow it to take full width of its parent initially */
    max-width: 800px;
    /* Constrain its maximum width */
    margin: 2rem auto;
    /* Center the block and add vertical margin */
    padding: 1rem;
    /* Internal padding */
}

.modal-overlay.show {
    /* Assuming modal styles are handled by modal components or globally */
    display: flex;
}

.playing-indicator.hidden {
    display: none;
}

.word-button.selected {
    border-color: #3b82f6;
    /* Example: blue-500 */
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
}

.feedback-correct {
    color: #16a34a;
    /* Example: green-600 */
}

.feedback-incorrect {
    color: #dc2626;
    /* Example: red-600 */
}

.bg-green-500-custom {
    background-color: #22c55e !important;
    color: white !important;
}

.bg-red-500-custom {
    background-color: #ef4444 !important;
    color: white !important;
}


/* History item styles are within HistoryModal.vue, but if there were overrides: */
/* .history-item { ... } */
</style>