<template>
    <div v-if="show" id="dataErrorModal" class="modal-overlay show">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Data Loading Error</h2>
            </div>
            <div class="modal-body">
                <p id="dataErrorModalMessage" class="text-gray-700 text-left">{{ message }}</p>
            </div>
            <div class="modal-footer">
                <button class="button-primary" @click="closeModal">OK</button>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    show: Boolean,
    message: String
});

const emit = defineEmits(['update:show']);

function closeModal() {
    emit('update:show', false);
}
</script>

<style scoped>
/* Styles specific to this modal can go here if needed */
</style>