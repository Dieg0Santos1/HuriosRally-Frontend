// src/api/auth.tsx
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

type RegisterReq = { email: string; password: string };
type LoginReq = { email: string; password: string; role: string };

export async function registerUser(data: RegisterReq) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || body.message || "Error al registrar");
  }
  return await res.json();
}

export async function loginUser(data: LoginReq) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Credenciales inválidas");
  }
  return await res.json(); // { ok: true, message: "...", token: "...", role: "..." }
}

export async function sendVerificationCode(email: string) {
  const res = await fetch(`${API_BASE}/auth/send-verification-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("No se pudo enviar el código");
  return await res.json();
}

export async function verifyCode(email: string, code: string) {
  const res = await fetch(`${API_BASE}/auth/verify-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  if (!res.ok) {
    const body = await res.json().catch(()=>({}));
    throw new Error(body.error || "Código inválido");
  }
  return await res.json();
}

export async function requestPasswordReset(email: string) {
  const res = await fetch(`${API_BASE}/auth/request-password-reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const body = await res.json().catch(()=>({}));
    throw new Error(body.error || "Error");
  }
  return await res.json();
}

export async function resetPassword(email: string, token: string, newPassword: string) {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, token, newPassword }),
  });
  if (!res.ok) {
    const body = await res.json().catch(()=>({}));
    throw new Error(body.error || "Error al resetear");
  }
  return await res.json();
}
    