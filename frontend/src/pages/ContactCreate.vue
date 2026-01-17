<template>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0">Add contact</h2>
      <RouterLink class="btn" to="/">Back</RouterLink>
    </div>

    <div class="card">
      <div class="content">
        <ContactForm :requireImage="true" submitLabel="Create" @submit="submit" @cancel="goBack" />
        <div v-if="serverError" class="error" style="margin-top: 10px">{{ serverError }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { createContact } from "../api";
import ContactForm from "../components/ContactForm.vue";

const router = useRouter();
const serverError = ref("");

function goBack() {
  router.push("/");
}

async function submit(payload) {
  serverError.value = "";
  try {
    await createContact(payload);
    router.push("/");
  } catch (e) {
    serverError.value = e.status === 409 ? "Email or contact already exists" : e.data?.message || e.message;
  }
}
</script>
