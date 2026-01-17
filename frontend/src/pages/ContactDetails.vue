<template>
  <div class="container">
    <div class="header">
      <RouterLink class="btn" to="/">Back</RouterLink>
      <RouterLink class="btn" :to="`/contacts/${id}/edit`">Edit</RouterLink>
    </div>

    <div v-if="loading">Loading...</div>
    <div v-else class="card">
      <div class="avatar-wrapper large">
        <img class=" " :src="contact.picture_path" :alt="contact.name" />
      </div>
      <div class="content">
        <h2 style="margin: 0">{{ contact.name }}</h2>
        <div><strong>Contact:</strong> {{ contact.contact }}</div>
        <div><strong>Email:</strong> {{ contact.email }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { getContact } from "../api";

const route = useRoute();
const id = route.params.id;

const contact = ref(null);
const loading = ref(true);

onMounted(async () => {
  loading.value = true;
  contact.value = await getContact(id);
  loading.value = false;
});
</script>
