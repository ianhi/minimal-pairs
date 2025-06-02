<template>
    <div v-if="show" id="historyModal" class="modal-overlay show">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Game History</h2>
                <button class="modal-close-button" @click="closeModal">&times;</button>
            </div>
            <div class="modal-body">
                <div id="historyList" class="history-list w-full">
                    <p v-if="history.length === 0" class="text-gray-500 text-center">No guesses yet.</p>
                    <div v-for="(entry, index) in history" :key="index" class="history-item">
                        <strong>{{ index + 1 }}.</strong> Pair: {{ entry.pair.join(' / ') }}<br>
                        Guessed: <span :class="entry.isCorrect ? 'correct-answer' : 'wrong-answer'">{{ entry.guessed }}</span> {{ entry.isCorrect ? '✅' : '❌' }}<br>
                        Correct: <span class="correct-answer">{{ entry.correct }}</span>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="button-secondary" @click="emitClearHistory">Clear History</button>
                <button class="button-primary" @click="closeModal">OK</button>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    show: Boolean,
    history: Array
});

const emit = defineEmits(['update:show', 'clear-history']);

function closeModal() {
    emit('update:show', false);
}

function emitClearHistory() {
    emit('clear-history');
}
</script>

<style scoped>
/* Styles specific to this modal can go here if needed */
</style>