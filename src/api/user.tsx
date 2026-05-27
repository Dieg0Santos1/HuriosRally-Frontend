import { getToken } from "../utils/token";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

export interface UserProfile {
  email: string;
  fullName?: string;
  phone?: string;
  address?: string;
  role?: string;
  createdAt?: string;
  profileImage?: string;
}

function requireToken() {
  const token = getToken();
  if (!token) {
    throw new Error("No hay sesión activa");
  }
  return token;
}

function asNetworkError(error: unknown): never {
  if (error instanceof TypeError && error.message.includes("fetch")) {
    throw new Error("No se puede conectar con el servidor. Verifica que el backend esté corriendo.");
  }
  throw error;
}

export async function getUserProfile(): Promise<UserProfile> {
  const token = requireToken();

  try {
    const res = await fetch(`${API_BASE}/user/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || body.message || "Error al obtener perfil");
    }

    return await res.json();
  } catch (error) {
    asNetworkError(error);
  }
}

export async function updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
  const token = requireToken();

  try {
    const res = await fetch(`${API_BASE}/user/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || body.message || "Error al actualizar perfil");
    }
  } catch (error) {
    asNetworkError(error);
  }
}

export async function uploadProfileImage(file: File): Promise<{ imageUrl: string }> {
  const token = requireToken();

  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/user/profile-image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || body.message || "Error al subir imagen");
    }

    return await res.json();
  } catch (error) {
    asNetworkError(error);
  }
}
