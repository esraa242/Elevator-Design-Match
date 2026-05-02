const BASE = "/api";

function getToken() {
  return localStorage.getItem("em_token") ?? "";
}

function authHeaders() {
  return { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` };
}

export async function apiLogin(email: string, password: string) {
  const r = await fetch(`${BASE}/tenants/login`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) throw new Error((await r.json()).error ?? "Login failed");
  return r.json();
}

export async function apiRegister(name: string, email: string, password: string, whatsappNumber?: string) {
  const r = await fetch(`${BASE}/tenants/register`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, whatsappNumber }),
  });
  if (!r.ok) throw new Error((await r.json()).error ?? "Registration failed");
  return r.json();
}

export async function apiGetMe() {
  const r = await fetch(`${BASE}/tenants/me`, { headers: authHeaders() });
  if (!r.ok) throw new Error("Unauthorized");
  return r.json();
}

export async function apiUpdateMe(data: Record<string, string>) {
  const r = await fetch(`${BASE}/tenants/me`, {
    method: "PATCH", headers: authHeaders(), body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error((await r.json()).error ?? "Update failed");
  return r.json();
}

export async function apiGetLeads() {
  const r = await fetch(`${BASE}/tenants/me/leads`, { headers: authHeaders() });
  if (!r.ok) throw new Error("Failed to fetch leads");
  return r.json();
}

export async function apiGetUsage() {
  const r = await fetch(`${BASE}/tenants/me/usage`, { headers: authHeaders() });
  if (!r.ok) throw new Error("Failed to fetch usage");
  return r.json();
}

export async function apiGetCabins() {
  const r = await fetch(`${BASE}/tenants/me/cabins`, { headers: authHeaders() });
  if (!r.ok) throw new Error("Failed to fetch cabins");
  return r.json();
}

export async function apiToggleCabin(cabinId: number, isEnabled: boolean) {
  const r = await fetch(`${BASE}/tenants/me/cabins/${cabinId}`, {
    method: "PATCH", headers: authHeaders(), body: JSON.stringify({ isEnabled }),
  });
  if (!r.ok) throw new Error("Failed to update cabin");
  return r.json();
}

export async function apiCreateCabin(data: Record<string, unknown>) {
  const r = await fetch(`${BASE}/admin/cabins`, {
    method: "POST", headers: authHeaders(), body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error((await r.json()).error ?? "Failed to create cabin");
  return r.json();
}

export async function apiDeleteCabin(cabinId: number) {
  const r = await fetch(`${BASE}/admin/cabins/${cabinId}`, {
    method: "DELETE", headers: authHeaders(),
  });
  if (!r.ok) throw new Error((await r.json()).error ?? "Failed to delete cabin");
  return r.json();
}
