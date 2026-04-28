import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { sendVerificationCode, verifyCode } from "../api/auth";
import { saveRole, saveToken } from "../utils/token";

type VerifyLocationState = {
  demoCode?: string;
};

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const preEmail = searchParams.get("email") || "";
  const [email, setEmail] = useState(preEmail);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [showDemoCodeModal, setShowDemoCodeModal] = useState(false);
  const [demoCode, setDemoCode] = useState("");

  useEffect(() => {
    const state = (location.state || {}) as VerifyLocationState;
    if (state.demoCode) {
      setDemoCode(state.demoCode);
      setShowDemoCodeModal(true);
    }
  }, [location.state]);

  const copyCode = async () => {
    if (!demoCode) return;
    try {
      await navigator.clipboard.writeText(demoCode);
      setMsg("Codigo copiado al portapapeles");
    } catch {
      setMsg("No se pudo copiar el codigo");
    }
  };

  const resend = async () => {
    setMsg(null);
    if (!email) {
      setMsg("Ingresa un correo primero");
      return;
    }
    setLoading(true);
    try {
      const result = await sendVerificationCode(email);
      setDemoCode(result.code);
      setShowDemoCodeModal(true);
      setMsg("Se genero un nuevo codigo para la demo local");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMsg(err.message);
      } else {
        setMsg("Error al reenviar codigo");
      }
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    setMsg(null);
    if (!email || !code) {
      setMsg("Completa correo y codigo");
      return;
    }
    setLoading(true);
    try {
      const result = await verifyCode(email, code);
      saveToken(result.token);
      saveRole(result.role);
      setMsg("Correo verificado. Sesion iniciada, redirigiendo...");
      setTimeout(() => navigate("/"), 800);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMsg(err.message);
      } else {
        setMsg("Error al verificar codigo");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[var(--Primary_0)] via-[var(--Primary_1)] to-[var(--Primary_2)] flex items-center justify-center relative overflow-hidden py-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-[var(--Primary_3)] rounded-full opacity-15 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[var(--Primary_4)] rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-8 sm:mx-6 md:mx-4">
        <div className="bg-white/90 backdrop-blur-sm shadow-2xl border border-white/20 rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[var(--Primary_4)] to-[var(--Primary_5)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[var(--Primary_7)] mb-2">Verificar correo electronico</h2>
            <p className="text-[var(--Primary_5)] text-sm">Ingresa el codigo de verificacion</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--Primary_6)] mb-2">Correo electronico</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--Primary_4)] focus:border-transparent transition-all duration-200 bg-white/90"
                placeholder="ejemplo@gmail.com"
                type="email"
              />
            </div>

            <button
              onClick={resend}
              disabled={loading || !email}
              className="w-full bg-gradient-to-r from-[var(--Primary_2)] to-[var(--Primary_3)] text-[var(--Primary_7)] py-3 px-4 rounded-lg font-medium hover:from-[var(--Primary_3)] hover:to-[var(--Primary_4)] hover:text-white transition-all duration-300 transform hover:scale-[1.02] shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-[var(--Primary_3)]"
            >
              {loading ? "Reenviando..." : "Reenviar codigo"}
            </button>

            <div>
              <label className="block text-sm font-medium text-[var(--Primary_6)] mb-2">Codigo de verificacion</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--Primary_4)] focus:border-transparent transition-all duration-200 bg-white/90 text-center text-lg font-mono tracking-wider"
                placeholder="123456"
                maxLength={6}
                pattern="[0-9]{6}"
              />
              <p className="text-xs text-[var(--Primary_5)] mt-1 text-center">Ingresa el codigo de 6 digitos</p>
            </div>

            <button
              onClick={verify}
              disabled={loading || !email || !code}
              className="w-full bg-gradient-to-r from-[var(--Primary_4)] to-[var(--Primary_5)] text-white py-3 px-4 rounded-lg font-medium hover:from-[var(--Primary_5)] hover:to-[var(--Primary_6)] transition-all duration-300 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? "Verificando..." : "Verificar codigo"}
            </button>

            {msg && (
              <div
                className={`p-4 rounded-lg text-sm font-medium ${
                  msg.toLowerCase().includes("verificado") || msg.toLowerCase().includes("codigo")
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
              >
                {msg}
              </div>
            )}

            <div className="bg-[var(--Primary_0)] border border-[var(--Primary_2)] rounded-lg p-4">
              <div className="text-xs text-[var(--Primary_6)] leading-relaxed">
                <p className="font-medium mb-1">No recibes correo en modo local?</p>
                <p>- Usa "Reenviar codigo" para generar uno nuevo.</p>
                <p>- El codigo se muestra en una ventana emergente de demo.</p>
              </div>
            </div>

            <div className="text-center">
              <a
                href="/login"
                className="text-[var(--Primary_5)] hover:text-[var(--Primary_6)] text-sm font-medium transition-colors duration-200"
              >
                Volver al inicio de sesion
              </a>
            </div>
          </div>
        </div>
      </div>

      {showDemoCodeModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-[var(--Primary_2)]">
            <h3 className="text-lg font-bold text-[var(--Primary_7)] mb-2">Codigo de verificacion (modo local)</h3>
            <p className="text-sm text-[var(--Primary_5)] mb-4">
              En este flujo demo no se envia correo real. Usa este codigo:
            </p>
            <div className="text-center text-3xl font-mono tracking-[0.3em] text-[var(--Primary_7)] bg-[var(--Primary_0)] rounded-lg py-3 mb-4">
              {demoCode || "------"}
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyCode}
                className="flex-1 py-2 rounded-lg border border-[var(--Primary_4)] text-[var(--Primary_6)] hover:bg-[var(--Primary_1)]"
              >
                Copiar
              </button>
              <button
                onClick={() => setShowDemoCodeModal(false)}
                className="flex-1 py-2 rounded-lg bg-[var(--Primary_5)] text-white hover:bg-[var(--Primary_6)]"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
