<template>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0">Login</h2>
      <RouterLink class="btn" to="/">Back</RouterLink>
    </div>

    <div class="card">
      <div class="content">
        <form @submit.prevent="submit">
          <div class="field">
            <label>Username</label>
            <input v-model.trim="username" />
          </div>
          <div class="field">
            <label>Password</label>
            <input type="password" v-model="password" />
          </div>

          <div class="row">
            <button class="btn primary" type="submit">Login</button>
          </div>

          <div v-if="err" class="error" style="margin-top: 10px">{{ err }}</div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { login } from "../api";

const router = useRouter();
const username = ref("");
const password = ref("");
const err = ref("");

async function submit() {
  err.value = "";
  try {
    await login(username.value, password.value);
    router.push("/");
  } catch (e) {
    err.value = "Invalid credentials";
  }
}
</script>
