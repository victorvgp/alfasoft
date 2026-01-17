<template>
  <form @submit.prevent="onSubmit">
    <div class="field">
      <label>Name</label>
      <input v-model.trim="form.name" placeholder="Full name" />
      <div v-if="errors.name" class="error">{{ errors.name }}</div>
    </div>

    <div class="field">
      <label>Contact (9 digits)</label>
      <input v-model.trim="form.contact" placeholder="912345678" />
      <div v-if="errors.contact" class="error">{{ errors.contact }}</div>
    </div>

    <div class="field">
      <label>Email</label>
      <input v-model.trim="form.email" placeholder="name@example.com" />
      <div v-if="errors.email" class="error">{{ errors.email }}</div>
    </div>

    <div class="field">
      <label>Picture {{ requireImage ? "(required)" : "(optional)" }}</label>
      <input type="file" accept="image/*" @change="onFile" />
      <div v-if="errors.picture" class="error">{{ errors.picture }}</div>
    </div>

    <div class="row">
      <button class="btn primary" type="submit">{{ submitLabel }}</button>
      <button class="btn" type="button" @click="$emit('cancel')">Cancel</button>
    </div>

    <div v-if="errors.form" class="error" style="margin-top: 10px">{{ errors.form }}</div>
  </form>
</template>

<script setup>
import { reactive } from "vue";

const props = defineProps({
  initial: { type: Object, default: () => ({ name: "", contact: "", email: "" }) },
  requireImage: { type: Boolean, default: true },
  submitLabel: { type: String, default: "Save" },
});

const emit = defineEmits(["submit", "cancel"]);

const form = reactive({
  name: props.initial.name || "",
  contact: props.initial.contact || "",
  email: props.initial.email || "",
  picture: null,
});

const errors = reactive({});

function validate() {
  errors.name = form.name && form.name.length > 5 ? "" : "Name must have more than 5 characters";
  errors.contact = /^\d{9}$/.test(form.contact) ? "" : "Contact must contain exactly 9 digits";
  errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? "" : "Invalid email address";
  errors.picture = props.requireImage && !form.picture ? "Image is required" : "";
  return !(errors.name || errors.contact || errors.email || errors.picture);
}

function onFile(e) {
  const file = e.target.files?.[0];
  form.picture = file || null;
}

function onSubmit() {
  errors.form = "";
  if (!validate()) return;
  emit("submit", { ...form });
}
</script>
