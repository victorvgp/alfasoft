<template>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0">Edit contact</h2>
      <RouterLink class="btn" :to="`/contacts/${id}`">Back</RouterLink>
    </div>

    <div v-if="loading">Loading...</div>

    <div v-else class="card">
      <img class="img" :src="contact.picture_path" :alt="contact.name" />
      <div class="content">
        <ContactForm :initial="contact" :requireImage="false" submitLabel="Save" @submit="submit" @cancel="goBack" />
        <div v-if="serverError" class="error" style="margin-top: 10px">{{ serverError }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getContact, updateContact } from "../api";
import ContactForm from "../components/ContactForm.vue";

const route = useRoute();
const router = useRouter();
const id = route.params.id;

const contact = ref(null);
const loading = ref(true);
const serverError = ref("");

function goBack() {
  router.push(`/contacts/${id}`);
}

onMounted(async () => {
  loading.value = true;
  contact.value = await getContact(id);
  loading.value = false;
});

async function submit(payload) {
  serverError.value = "";
  try {
    await updateContact(id, payload);
    router.push(`/contacts/${id}`);
  } catch (e) {
    serverError.value = e.status === 409 ? "Email or contact already exists" : e.data?.message || e.message;
  }
}
</script>
