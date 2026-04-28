// src/api/user.tsx
import { getToken } from "../utils/token";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";
//Es una clase que ayuda a saber y modificar las propiedades de un usuario
export interface UserProfile {
  email: string;
  fullName?: string;
  phone?: string;
  address?: string;
  role?: string;
  createdAt?: string;
  profileImage?: string;
}
//Sirve para que el usuario pueda iniciar sesión
export async function getUserProfile(): Promise<UserProfile> {
  const token = getToken();
  if (!token) {
    throw new Error("No hay sesión activa");
  }

  try {
    const res = await fetch(`${API_BASE}/user/profile`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Error al obtener perfil");
    }

    return await res.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("No se puede conectar con el servidor. Verifica que el backend esté corriendo.");
    }
    throw error;
  }
}
//Sirve para actualizar los datos de un  usuario en especifico
export async function updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
  const token = getToken();
  if (!token) {
    throw new Error("No hay sesión activa");
  }

  try {
    const res = await fetch(`${API_BASE}/user/profile`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Error al actualizar perfil");
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("No se puede conectar con el servidor. Verifica que el backend esté corriendo.");
    }
    throw error;
  }
}

/**
 * Subir imagen de perfil
 */
export async function uploadProfileImage(file: File): Promise<{ imageUrl: string }> {
  const token = getToken();
  if (!token) {
    throw new Error("No hay sesión activa");
  }

  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/user/profile-image`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Error al subir imagen");
    }

    return await res.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("No se puede conectar con el servidor. Verifica que el backend esté corriendo.");
    }
    throw error;
  }
}

