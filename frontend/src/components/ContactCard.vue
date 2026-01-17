<template>
  <div class="card">
    <div class="avatar-wrapper">
      <img class="avatar" :src="contact.picture_path" :alt="contact.name" />
    </div>
    <div class="content">
      <strong>{{ contact.name }}</strong>

      <div class="row" style="margin-top: 10px">
        <RouterLink class="btn" :to="`/contacts/${contact.id}`">Details</RouterLink>

        <!-- Só mostra Edit/Delete se autenticado -->
        <RouterLink v-if="canEdit" class="btn" :to="`/contacts/${contact.id}/edit`">Edit</RouterLink>
        <button v-if="canEdit" class="btn" @click="$emit('delete', contact)">Delete</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  contact: Object,
  canEdit: { type: Boolean, default: false },
});
defineEmits(["delete"]);
</script>
