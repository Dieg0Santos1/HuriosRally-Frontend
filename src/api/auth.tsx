import {
  generateCode,
  getUsers,
  nextUserId,
  saveUsers,
  setCurrentEmail,
  type UserRole,
} from "./localStorageDb";

type RegisterReq = {
  fullName?: string;
  phone?: string;
  email: string;
  password: string;
};

type LoginReq = { email: string; password: string; role: UserRole };

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function createLocalToken(email: string) {
  return `local-${btoa(email)}-${Date.now()}`;
}

export async function registerUser(data: RegisterReq) {
  const email = normalizeEmail(data.email);
  const users = getUsers();

  if (users.some((u) => normalizeEmail(u.email) === email)) {
    throw new Error("El correo ya est\u00e1 registrado");
  }

  const verificationCode = generateCode();
  users.push({
    id: nextUserId(),
    email,
    password: data.password,
    role: "CLIENTE",
    fullName: data.fullName?.trim() || "",
    phone: data.phone?.trim() || "",
    createdAt: new Date().toISOString(),
    isVerified: false,
    verificationCode,
  });

  saveUsers(users);
  return {
    ok: true,
    message: "Registro exitoso. Verifica tu correo.",
    verificationCode,
  };
}

export async function loginUser(data: LoginReq) {
  const email = normalizeEmail(data.email);
  const users = getUsers();
  const user = users.find((u) => normalizeEmail(u.email) === email);

  if (!user || user.password !== data.password) {
    throw new Error("Credenciales inv\u00e1lidas");
  }
  if (user.role !== data.role) {
    throw new Error("El rol seleccionado no coincide con el usuario");
  }
  if (!user.isVerified) {
    throw new Error("Debes verificar tu correo antes de iniciar sesi\u00f3n");
  }

  const token = createLocalToken(email);
  setCurrentEmail(email);

  return {
    ok: true,
    message: "Inicio de sesi\u00f3n exitoso",
    token,
    role: user.role,
  };
}

export async function sendVerificationCode(email: string) {
  const normalized = normalizeEmail(email);
  const users = getUsers();
  const index = users.findIndex((u) => normalizeEmail(u.email) === normalized);
  if (index < 0) throw new Error("No existe una cuenta con ese correo");

  const code = generateCode();
  users[index] = { ...users[index], verificationCode: code };
  saveUsers(users);
  return { ok: true, message: "C\u00f3digo enviado", code };
}

export async function verifyCode(email: string, code: string) {
  const normalized = normalizeEmail(email);
  const users = getUsers();
  const index = users.findIndex((u) => normalizeEmail(u.email) === normalized);
  if (index < 0) throw new Error("Correo no registrado");

  const current = users[index];
  if ((current.verificationCode || "").trim() !== code.trim()) {
    throw new Error("C\u00f3digo inv\u00e1lido");
  }

  users[index] = {
    ...current,
    isVerified: true,
    verificationCode: undefined,
  };
  saveUsers(users);
  return { ok: true, message: "Correo verificado correctamente" };
}

export async function requestPasswordReset(email: string) {
  const normalized = normalizeEmail(email);
  const users = getUsers();
  const index = users.findIndex((u) => normalizeEmail(u.email) === normalized);
  if (index < 0) throw new Error("No existe una cuenta con ese correo");

  const resetToken = generateCode();
  users[index] = { ...users[index], resetToken };
  saveUsers(users);

  return {
    ok: true,
    message: "Solicitud de recuperaci\u00f3n registrada",
    token: resetToken,
  };
}

export async function resetPassword(email: string, token: string, newPassword: string) {
  const normalized = normalizeEmail(email);
  const users = getUsers();
  const index = users.findIndex((u) => normalizeEmail(u.email) === normalized);
  if (index < 0) throw new Error("No existe una cuenta con ese correo");

  const user = users[index];
  if ((user.resetToken || "").trim() !== token.trim()) {
    throw new Error("Token de recuperaci\u00f3n inv\u00e1lido");
  }

  users[index] = { ...user, password: newPassword, resetToken: undefined };
  saveUsers(users);
  return { ok: true, message: "Contrase\u00f1a actualizada" };
}

