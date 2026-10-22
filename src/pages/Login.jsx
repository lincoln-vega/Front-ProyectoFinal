import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, User, Lock, ArrowRight, Loader2 } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import { insforge } from "../lib/insforge";
import { userService } from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const trimmedEmail = email.trim().toLowerCase();
      const { data: authData, error: authError } = await insforge.auth.signInWithPassword({
        email: trimmedEmail,
        password
      });

      if (authError) {
        throw new Error(
          "No se pudo iniciar sesión. Verifica tu correo y contraseña registrados."
        );
      }

      const foundUser = await userService.getUserByEmail(authData.user.email);
      if (!foundUser) {
        await insforge.auth.signOut();
        throw new Error("La cuenta inició sesión, pero no tiene un perfil en la tabla users.");
      }

      if (foundUser.estado && foundUser.estado.toLowerCase() !== "activo") {
        await insforge.auth.signOut();
        setError("La cuenta se encuentra inactiva. Contacte al administrador.");
        return;
      }

      const role = (foundUser.rol || foundUser.role || "estudiante").toLowerCase();
      const name = `${foundUser.nombres || foundUser.name || ""} ${foundUser.apellidos || ""}`.trim();
      
      localStorage.setItem("userRole", role);
      localStorage.setItem("userName", name || foundUser.correo);
      localStorage.setItem("userEmail", foundUser.correo || trimmedEmail);
      localStorage.setItem("userId", foundUser.id || "1");
      localStorage.setItem("user", JSON.stringify(foundUser));
      localStorage.setItem("usuarioLogueado", JSON.stringify(foundUser));

      if (role === "admin") navigate("/admin/usuarios");
      else if (role === "docente") navigate("/docente/panel");
      else navigate("/estudiante/panel");

    } catch (err) {
      console.error("Error en login:", err);
      setError(err.message || "Error al conectar con InsForge Auth.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0e] relative flex items-center justify-center p-4 overflow-hidden transition-colors duration-500">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/20 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/20 dark:bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm z-10">
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-white/40 dark:border-white/10 p-8 rounded-3xl shadow-2xl dark:shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600/10 dark:bg-white/5 rounded-xl mb-4 border border-blue-600/20 dark:border-white/10">
              <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Academia Preuniversitaria</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-light">
              Ingresa tus credenciales para acceder a la plataforma
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-xl text-center backdrop-blur-md">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="relative group">
                <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-0 top-3" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Correo institucional" 
                  className="w-full pl-7 pr-4 py-2 bg-transparent border-b border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-colors"
                />
              </div>

              <div className="relative group">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-0 top-3" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña" 
                  className="w-full pl-7 pr-4 py-2 bg-transparent border-b border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-colors"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-black font-medium py-2.5 px-4 rounded-xl hover:bg-slate-800 dark:hover:bg-gray-100 transition-all flex justify-center items-center gap-2 group shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verificando...
                </>
              ) : (
                <>
                  Ingresar a la Plataforma <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}