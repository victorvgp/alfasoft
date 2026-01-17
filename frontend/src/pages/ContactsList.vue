<template>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0">Contacts</h2>

      <div class="row">
        <RouterLink v-if="!authed" class="btn" to="/login">Login</RouterLink>

        <RouterLink v-if="authed" class="btn primary" to="/contacts/new">Add contact</RouterLink>
        <button v-if="authed" class="btn" @click="doLogout">Logout</button>
      </div>
    </div>

    <div v-if="loading">Loading...</div>
    <div v-else class="grid">
      <ContactCard v-for="c in contacts" :key="c.id" :contact="c" :canEdit="authed" @delete="askDelete" />
    </div>

    <ConfirmModal
      v-if="confirmOpen"
      title="Delete contact"
      :message="`Delete ${selected?.name}?`"
      @cancel="confirmOpen = false"
      @confirm="doDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { listContacts, deleteContact, isAuthed, logout } from "../api";
import ContactCard from "../components/ContactCard.vue";
import ConfirmModal from "../components/ConfirmModal.vue";

const contacts = ref([]);
const loading = ref(true);

const confirmOpen = ref(false);
const selected = ref(null);

const authed = ref(isAuthed());

async function load() {
  loading.value = true;
  contacts.value = await listContacts();
  loading.value = false;
}

function askDelete(contact) {
  if (!authed.value) return;

  selected.value = contact;
  confirmOpen.value = true;
}

async function doDelete() {
  await deleteContact(selected.value.id);
  confirmOpen.value = false;
  selected.value = null;
  await load();
}

function doLogout() {
  logout();
  authed.value = false;
  confirmOpen.value = false;
  selected.value = null;
}

onMounted(load);
</script>
