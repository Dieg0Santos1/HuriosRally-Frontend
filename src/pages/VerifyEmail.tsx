// src/pages/VerifyEmail.tsx
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

/*
 Página para:
  - re-enviar código de verificación
  - ingresar el código recibido por email y validar
  - una vez verificado, redirigir al Login
*/

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const preEmail = searchParams.get("email") || ""; // si frontend recibió ?email=...
  const [email, setEmail] = useState(preEmail);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Reenviar código: POST /auth/send-verification-code
  const resend = async () => {
    setMsg(null);
    if (!email) { setMsg("Ingresa un correo primero"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/auth/send-verification-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || json.message || "Error al reenviar");
      setMsg("Código reenviado. Revisa tu correo (o consola si estás en dev).");
    } catch (err: any) {
      setMsg(err.message || "Error al reenviar código");
    } finally { setLoading(false); }
  };

  // Verificar código: POST /auth/verify-code
  const verify = async () => {
    setMsg(null);
    if (!email || !code) { setMsg("Completa email y código"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/auth/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || json.message || "Código inválido");
      }
      // éxito
      setMsg("Email verificado. Serás redirigido al login...");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err: any) {
      setMsg(err.message || "Error al verificar código");
    } finally { setLoading(false); }
  };


  return (
    <main className="min-h-screen bg-gradient-to-br from-[var(--Primary_0)] via-[var(--Primary_1)] to-[var(--Primary_2)] flex items-center justify-center relative overflow-hidden py-8">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-[var(--Primary_3)] rounded-full opacity-15 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[var(--Primary_4)] rounded-full opacity-10 blur-3xl"></div>
      </div>

      {/* Contenedor principal */}
      <div className="relative z-10 w-full max-w-md mx-8 sm:mx-6 md:mx-4">
        <div className="bg-white/90 backdrop-blur-sm shadow-2xl border border-white/20 rounded-2xl p-8">
          
          {/* Header con icono */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[var(--Primary_4)] to-[var(--Primary_5)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[var(--Primary_7)] mb-2">
              Verificar correo electrónico
            </h2>
            <p className="text-[var(--Primary_5)] text-sm">
              Ingresa el código que enviamos a tu correo
            </p>
          </div>

          {/* Formulario */}
          <div className="space-y-6">
            {/* Campo de email */}
            <div>
              <label className="block text-sm font-medium text-[var(--Primary_6)] mb-2">
                Correo electrónico
              </label>
              <input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--Primary_4)] focus:border-transparent transition-all duration-200 bg-white/90"
                placeholder="ejemplo@gmail.com"
                type="email"
              />
            </div>

            {/* Botón reenviar */}
            <button 
              onClick={resend} 
              disabled={loading || !email}
              className="w-full bg-gradient-to-r from-[var(--Primary_2)] to-[var(--Primary_3)] text-[var(--Primary_7)] py-3 px-4 rounded-lg font-medium hover:from-[var(--Primary_3)] hover:to-[var(--Primary_4)] hover:text-white transition-all duration-300 transform hover:scale-[1.02] shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-[var(--Primary_3)]"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                  Reenviando...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reenviar código
                </div>
              )}
            </button>

            {/* Campo de código */}
            <div>
              <label className="block text-sm font-medium text-[var(--Primary_6)] mb-2">
                Código de verificación
              </label>
              <input 
                value={code} 
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--Primary_4)] focus:border-transparent transition-all duration-200 bg-white/90 text-center text-lg font-mono tracking-wider"
                placeholder="123456"
                maxLength={6}
                pattern="[0-9]{6}"
              />
              <p className="text-xs text-[var(--Primary_5)] mt-1 text-center">
                Ingresa el código de 6 dígitos
              </p>
            </div>

            {/* Botón verificar */}
            <button 
              onClick={verify} 
              disabled={loading || !email || !code}
              className="w-full bg-gradient-to-r from-[var(--Primary_4)] to-[var(--Primary_5)] text-white py-3 px-4 rounded-lg font-medium hover:from-[var(--Primary_5)] hover:to-[var(--Primary_6)] transition-all duration-300 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Verificando...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verificar código
                </div>
              )}
            </button>

            {/* Mensaje de estado */}
            {msg && (
              <div className={`p-4 rounded-lg text-sm font-medium ${
                msg.includes("verificado") || msg.includes("reenviado") 
                  ? "bg-green-50 border border-green-200 text-green-700" 
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}>
                <div className="flex items-start gap-2">
                  {msg.includes("verificado") || msg.includes("reenviado") ? (
                    <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <span>{msg}</span>
                </div>
              </div>
            )}

            {/* Información adicional */}
            <div className="bg-[var(--Primary_0)] border border-[var(--Primary_2)] rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[var(--Primary_3)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-xs text-[var(--Primary_6)] leading-relaxed">
                  <p className="font-medium mb-1">¿No recibes el correo?</p>
                  <p>• Revisa tu carpeta de spam o correo no deseado</p>
                  <p>• Usa el botón "Reenviar código" para intentar nuevamente</p>
                  <p>• El código tiene una validez limitada</p>
                </div>
              </div>
            </div>

            {/* Enlace de regreso */}
            <div className="text-center">
              <a 
                href="/login" 
                className="text-[var(--Primary_5)] hover:text-[var(--Primary_6)] text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver al inicio de sesión
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

