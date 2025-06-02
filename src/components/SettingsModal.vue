<template>
    <div v-if="show" id="settingsModal" class="modal-overlay show">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Settings</h2>
                <button class="modal-close-button" @click="closeModal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="modal-setting-item toggle-switch">
                    <label for="modalPlayGuessToggle">Play guess on click</label>
                    <input type="checkbox" id="modalPlayGuessToggle" v-model="editableSettings.playGuessOnClick">
                </div>
                <div class="modal-setting-item toggle-switch">
                    <label for="modalAutoPlayNextWordToggle">Auto-play next word</label>
                    <input type="checkbox" id="modalAutoPlayNextWordToggle" v-model="editableSettings.autoPlayNextWord">
                </div>
                <div class="modal-setting-item">
                    <label for="modalAutoPlayDelay">Auto-play delay (ms)</label>
                    <input type="number" id="modalAutoPlayDelay" ref="modalAutoPlayDelayInputRef" min="0" v-model.number="editableSettings.autoPlayDelay" :disabled="!editableSettings.autoPlayNextWord">
                </div>
                <div class="modal-setting-item">
                    <label for="modalSpeechRate">Speech Rate (0.1-10)</label>
                    <input type="number" id="modalSpeechRate" min="0.1" max="10" step="0.1" v-model.number="editableSettings.speechRate">
                </div>
                <div class="modal-setting-item">
                    <label for="modalSpeechPitch">Speech Pitch (0-2)</label>
                    <input type="number" id="modalSpeechPitch" min="0" max="2" step="0.1" v-model.number="editableSettings.speechPitch">
                </div>
            </div>
            <div class="modal-footer">
                <button class="button-secondary" @click="closeModal">Cancel</button>
                <button class="button-primary" @click="save">Save</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, watch, toRaw } from 'vue';

const props = defineProps({
    show: Boolean,
    currentSettings: Object
});

const emit = defineEmits(['update:show', 'save-settings']);

// Initialize editableSettings without bengaliAccent
const { bengaliAccent, ...restOfSettings } = props.currentSettings;
const editableSettings = reactive({ ...restOfSettings });


const modalAutoPlayDelayInputRef = ref(null);

watch(() => props.currentSettings, (newSettings) => {
    Object.assign(editableSettings, newSettings);
}, { deep: true });

watch(() => editableSettings.autoPlayNextWord, (newValue) => {
    if (modalAutoPlayDelayInputRef.value) {
        modalAutoPlayDelayInputRef.value.disabled = !newValue;
    }
});

function closeModal() {
    emit('update:show', false);
}

function save() {
    // Validate and clamp settings before emitting
    if (isNaN(editableSettings.autoPlayDelay) || editableSettings.autoPlayDelay < 0) editableSettings.autoPlayDelay = 0;
    if (isNaN(editableSettings.speechRate) || editableSettings.speechRate < 0.1) editableSettings.speechRate = 0.1;
    if (editableSettings.speechRate > 10) editableSettings.speechRate = 10;
    if (isNaN(editableSettings.speechPitch) || editableSettings.speechPitch < 0) editableSettings.speechPitch = 0;
    if (editableSettings.speechPitch > 2) editableSettings.speechPitch = 2;
    
    emit('save-settings', toRaw(editableSettings)); // Emit a plain object
    closeModal();
}
</script>

<style scoped>
/* Styles specific to this modal can go here if needed, or use global styles */
</style>