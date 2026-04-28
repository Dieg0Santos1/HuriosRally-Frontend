import { getCurrentEmail, getUsers, saveUsers } from "./localStorageDb";
import { getToken } from "../utils/token";

export interface UserProfile {
  email: string;
  fullName?: string;
  phone?: string;
  address?: string;
  role?: string;
  createdAt?: string;
  profileImage?: string;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function requireCurrentUserIndex() {
  const token = getToken();
  if (!token) throw new Error("No hay sesi\u00f3n activa");

  const email = getCurrentEmail();
  if (!email) throw new Error("No se encontr\u00f3 el usuario de la sesi\u00f3n");

  const users = getUsers();
  const index = users.findIndex((u) => normalizeEmail(u.email) === normalizeEmail(email));
  if (index < 0) throw new Error("Usuario no encontrado");

  return { users, index };
}

export async function getUserProfile(): Promise<UserProfile> {
  const { users, index } = requireCurrentUserIndex();
  const user = users[index];
  return {
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    address: user.address,
    role: user.role,
    createdAt: user.createdAt,
    profileImage: user.profileImage,
  };
}

export async function updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
  const { users, index } = requireCurrentUserIndex();
  users[index] = {
    ...users[index],
    fullName: updates.fullName ?? users[index].fullName,
    phone: updates.phone ?? users[index].phone,
    address: updates.address ?? users[index].address,
    profileImage: updates.profileImage ?? users[index].profileImage,
  };
  saveUsers(users);
}

export async function uploadProfileImage(file: File): Promise<{ imageUrl: string }> {
  const { users, index } = requireCurrentUserIndex();
  const imageUrl = URL.createObjectURL(file);
  users[index] = {
    ...users[index],
    profileImage: imageUrl,
  };
  saveUsers(users);
  return { imageUrl };
}

