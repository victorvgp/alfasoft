import { createRouter, createWebHistory } from "vue-router";

import ContactsList from "./pages/ContactsList.vue";
import ContactDetails from "./pages/ContactDetails.vue";
import ContactCreate from "./pages/ContactCreate.vue";
import ContactEdit from "./pages/ContactEdit.vue";
import Login from "./pages/Login.vue";
import { isAuthed } from "./api";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: ContactsList },
    { path: "/contacts/new", component: ContactCreate },
    { path: "/contacts/:id", component: ContactDetails },
    { path: "/contacts/:id/edit", component: ContactEdit },
    { path: "/login", component: Login },
  ],
});

router.beforeEach((to) => {
  const protectedPaths = ["/contacts/new"];
  const isEdit = /^\/contacts\/\d+\/edit$/.test(to.path);

  if ((protectedPaths.includes(to.path) || isEdit) && !isAuthed()) {
    return "/login";
  }
});
