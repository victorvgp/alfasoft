<template>
  <div class="modal-backdrop" @click.self="$emit('cancel')">
    <div class="modal">
      <h3 style="margin: 0 0 8px 0">{{ title }}</h3>
      <p style="margin: 0 0 14px 0">{{ message }}</p>
      <div class="row" style="justify-content: flex-end">
        <button class="btn" @click="$emit('cancel')">Cancel</button>
        <button class="btn primary" @click="$emit('confirm')">Confirm</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: "Confirm" },
  message: { type: String, default: "Are you sure?" },
});
defineEmits(["confirm", "cancel"]);
</script>
