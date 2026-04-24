// src/utils/token.tsx
/*Sirve para que el localStorage guarde el Token del usuario autorizado */
export function saveToken(token: string) {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem("hurios_token", token);
  }
}
/*Sirve para obtener el token del usuario que inicio sesión */
export function getToken(): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem("hurios_token");
  }
  return null;
}
/*Sirve para que el localStorage borre el token de autorización una vez finaliza la sesión */
export function clearToken() {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem("hurios_token");
    localStorage.removeItem("hurios_role");
  }
}
/*Sirve para que el localStorage guarde el nuevo rol que tiene el usuario */
export function saveRole(role: string) {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem("hurios_role", role);
  }
}
/*Sirve para obtener obtener el rol del usuario */
export function getRole(): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem("hurios_role");
  }
  return null;
}