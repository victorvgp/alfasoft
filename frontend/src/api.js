const API_BASE = "/api";

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseJson(res) {
  const text = await res.text();

  const trimmed = text.trim().toLowerCase();
  if (trimmed.startsWith("<!doctype") || trimmed.startsWith("<html")) {
    const err = new Error("Server returned HTML instead of JSON. Check Vite proxy / backend URL.");
    err.status = res.status;
    err.data = { preview: text.slice(0, 120) };
    throw err;
  }

  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const err = new Error(data?.message || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export async function listContacts() {
  const res = await fetch(`${API_BASE}/contacts`);
  return parseJson(res);
}

export async function getContact(id) {
  const res = await fetch(`${API_BASE}/contacts/${id}`);
  return parseJson(res);
}

export async function createContact(payload) {
  const fd = new FormData();
  fd.append("name", payload.name);
  fd.append("contact", payload.contact);
  fd.append("email", payload.email);
  fd.append("picture", payload.picture);

  const res = await fetch(`${API_BASE}/contacts`, { method: "POST", headers: { ...authHeaders() }, body: fd });
  return parseJson(res);
}

export async function updateContact(id, payload) {
  const fd = new FormData();
  fd.append("name", payload.name);
  fd.append("contact", payload.contact);
  fd.append("email", payload.email);

  if (payload.picture) {
    fd.append("picture", payload.picture);
  }

  const res = await fetch(`${API_BASE}/contacts/${id}`, {
    method: "PUT",
    headers: { ...authHeaders() },
    body: fd,
  });

  return parseJson(res);
}

export async function deleteContact(id) {
  const res = await fetch(`${API_BASE}/contacts/${id}`, { method: "DELETE", headers: { ...authHeaders() } });
  if (res.status === 204) return true;
  return parseJson(res);
}

export async function login(username, password) {
  const res = await fetch(`/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await parseJson(res);
  localStorage.setItem("token", data.token);
  return true;
}

export function logout() {
  localStorage.removeItem("token");
}

export function isAuthed() {
  return !!getToken();
}
