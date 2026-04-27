
import { Input } from "../components/ui/Input";
import { ButtonState } from "../components/ui/ButtonState";
import { useState } from "react";
import { loginUser } from "../api/auth";
import { saveToken, saveRole } from "../utils/token";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

export function Login() {
  const [selectedRole, setSelectedRole] = useState<"CLIENTE" | "ADMINISTRADOR" | null>(null);
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [clicked, setClicked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isFormValid || !selectedRole) return;
    setClicked(true);
    try {
      const res = await loginUser({ email: correo, password: clave, role: selectedRole });
      // res: { token, role }
      saveToken(res.token);
      saveRole(res.role);
      // redirigir a home
      navigate("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al iniciar sesiÃ³n");
      }
    } finally {
      setClicked(false);
    }
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
  const isPasswordMatch = clave.length >= 8;
  const isFormValid = isEmailValid && isPasswordMatch;

  return (
    <>
    <Navbar/>
    <main className="min-h-screen bg-gradient-to-br from-[var(--Primary_0)] via-[var(--Primary_1)] to-[var(--Primary_2)] flex flex-col justify-center items-center relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-[var(--Primary_3)] rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[var(--Primary_4)] rounded-full opacity-15 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--Primary_2)] rounded-full opacity-10 blur-2xl"></div>
      </div>

      {/* Contenedor principal del formulario */}
      <div className="relative z-10 w-full max-w-md mx-8 sm:mx-6 md:mx-4">
        <div className="bg-white/90 backdrop-blur-sm shadow-2xl border border-white/20 rounded-2xl p-6 sm:p-8 md:p-10">
          {/* Header con logo */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <img 
                src="/assets/imgs/logo.webp" 
                className="h-20 w-auto mx-auto drop-shadow-lg" 
                alt="Hurios Rally Logo" 
              />
            </div>
            <h1 className="text-2xl font-bold text-[var(--Primary_7)] mb-2">
              Bienvenido de vuelta
            </h1>
            <p className="text-[var(--Primary_5)] text-sm">
              Inicia sesiÃ³n en tu cuenta
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* SelecciÃ³n de rol */}
            {!selectedRole ? (
              <div className="space-y-4">
                <h2 className="text-center text-lg font-semibold text-[var(--Primary_6)] mb-4">
                  Selecciona tu tipo de perfil
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedRole("CLIENTE")}
                    className="p-6 border-2 border-[var(--Primary_4)] rounded-lg hover:bg-[var(--Primary_1)] transition-all duration-300 group"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--Primary_5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span className="font-semibold text-[var(--Primary_6)]">Cliente</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole("ADMINISTRADOR")}
                    className="p-6 border-2 border-[var(--Primary_4)] rounded-lg hover:bg-[var(--Primary_1)] transition-all duration-300 group"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--Primary_5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                        <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
                      </svg>
                      <span className="font-semibold text-[var(--Primary_6)]">Administrador</span>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Mostrar rol seleccionado */}
                <div className="flex items-center justify-between bg-[var(--Primary_1)] p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--Primary_5)" strokeWidth="2">
                      {selectedRole === "CLIENTE" ? (
                        <>
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </>
                      ) : (
                        <>
                          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                          <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
                        </>
                      )}
                    </svg>
                    <span className="font-medium text-[var(--Primary_6)]">
                      Perfil: {selectedRole === "CLIENTE" ? "Cliente" : "Administrador"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole(null);
                      setCorreo("");
                      setClave("");
                      setError(null);
                    }}
                    className="text-sm text-[var(--Primary_5)] hover:text-[var(--Primary_6)] font-medium"
                  >
                    Cambiar
                  </button>
                </div>
                <div className="space-y-4">
                  <Input 
                    label="Correo electrÃ³nico" 
                    type="email" 
                    placeholder="ejemplo@gmail.com" 
                    onChange={(e) => setCorreo(e.target.value)} 
                  />
                   <Input 
                    label="ContraseÃ±a" 
                    type="password" 
                    placeholder="********" 
                    onChange={(e) => setClave(e.target.value)} 
                  />
                </div>

                {/* Error message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* BotÃ³n principal */}
                <div className="space-y-4">
                  <ButtonState 
                    initialText="Iniciar sesiÃ³n" 
                    successText="Â¡Ingreso exitoso!" 
                    disabled={!isFormValid || !selectedRole} 
                    clicked={clicked} 
                  />
                  
                  {/* Enlace de registro */}
                  <a 
                    href="/register" 
                    className="block w-full text-center bg-gradient-to-r from-[var(--Primary_4)] to-[var(--Primary_5)] text-white py-3 rounded-lg hover:from-[var(--Primary_5)] hover:to-[var(--Primary_6)] transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                  >
                    Crear cuenta nueva
                  </a>
                </div>

                {/* Enlace de recuperaciÃ³n */}
                <div className="text-center">
                  <Link 
                    to="/reset-password" 
                    className="text-[var(--Primary_5)] hover:text-[var(--Primary_6)] text-sm font-medium transition-colors duration-200 hover:underline"
                  >
                    Â¿Olvidaste tu contraseÃ±a?
                  </Link>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer decorativo */}
        <div className="text-center mt-8">
          <p className="text-[var(--Primary_5)] text-sm">
            Repuestos y accesorios de calidad
          </p>
        </div>
      </div>
    </main>
    </>
  );
}



