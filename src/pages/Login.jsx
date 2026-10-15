import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, GraduationCap, User, Lock, ArrowRight, Briefcase, Loader2 } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import { insforge } from "../lib/insforge";

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
      const trimmedEmail = email.trim();
      
      // Consultar usuario en InsForge (PostgreSQL)
      const { data: user, error: dbError } = await insforge.database
        .from("users")
        .select("*")
        .eq("correo", trimmedEmail)
        .eq("password", password)
        .maybeSingle();

      if (dbError) throw dbError;

      if (!user) {
        // Fallback para sandbox demo local si no coincide con BD
        const credentials = [
          { email: "admin@academia.edu.pe", pass: "admin123", role: "admin", name: "Roberto Morales" },
          { email: "docente@academia.edu.pe", pass: "docente123", role: "docente", name: "Lincoln Vega" },
          { email: "estudiante@academia.edu.pe", pass: "estudiante123", role: "estudiante", name: "Juan Carlos Flores" }
        ];
        const localUser = credentials.find(u => u.email === trimmedEmail && u.pass === password);
        if (localUser) {
          localStorage.setItem("userRole", localUser.role);
          localStorage.setItem("userName", localUser.name);
          localStorage.setItem("userEmail", localUser.email);
          if (localUser.role === "admin") navigate("/admin/usuarios");
          else if (localUser.role === "docente") navigate("/docente/panel");
          else navigate("/estudiante/panel");
          return;
        }

        setError("Credenciales incorrectas. Inténtalo de nuevo.");
        return;
      }

      if (user.estado && user.estado !== "Activo") {
        setError("La cuenta se encuentra inactiva. Contacte al administrador.");
        return;
      }

      const role = (user.rol || "estudiante").toLowerCase();
      const name = `${user.nombres || ""} ${user.apellidos || ""}`.trim();
      localStorage.setItem("userRole", role);
      localStorage.setItem("userName", name || user.correo);
      localStorage.setItem("userEmail", user.correo);
      localStorage.setItem("userId", user.id);

      if (role === "admin") navigate("/admin/usuarios");
      else if (role === "docente") navigate("/docente/panel");
      else navigate("/estudiante/panel");
    } catch (err) {
      console.error("Error en login:", err);
      setError("Error al conectar con la base de datos.");
    } finally {
      setLoading(false);
    }
  };

  const loginDirecto = (role, email, pass, name) => {
    localStorage.setItem("userRole", role);
    localStorage.setItem("userName", name);
    localStorage.setItem("userEmail", email);
    if (role === "admin") navigate("/admin/usuarios");
    else if (role === "docente") navigate("/docente/panel");
    else navigate("/estudiante/panel");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0e] relative flex items-center justify-center p-4 overflow-hidden transition-colors duration-500">
      {/* Luces Ambientales (Glows) */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/20 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/20 dark:bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Theme Toggle Superior */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm z-10">
        {/* Glassmorphism Card */}
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-white/40 dark:border-white/10 p-8 rounded-3xl shadow-2xl dark:shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600/10 dark:bg-white/5 rounded-xl mb-4 border border-blue-600/20 dark:border-white/10">
              <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Academia SCRM</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-light">Conectado a InsForge PostgreSQL</p>
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
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-black font-medium py-2.5 px-4 rounded-xl hover:bg-slate-800 dark:hover:bg-gray-100 transition-all flex justify-center items-center gap-2 group shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50"
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

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
            <p className="text-xs text-center text-slate-500 dark:text-slate-400 mb-4 font-light tracking-wide uppercase">Accesos Rápidos (Sandbox)</p>
            <div className="flex justify-center gap-2">
              <button onClick={() => loginDirecto("admin", "admin@gmail.com", "admin123", "Roberto Carlos Morales")} className="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg flex flex-col items-center justify-center transition-colors group">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mb-1" />
                <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">Admin</span>
              </button>
              <button onClick={() => loginDirecto("docente", "c.herrera@academia.edu.pe", "docente123", "Carmen Rosa Herrera")} className="flex-1 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg flex flex-col items-center justify-center transition-colors group">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mb-1" />
                <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">Docente</span>
              </button>
              <button onClick={() => loginDirecto("estudiante", "estudiante@gmail.com", "estudiante123", "Juan Carlos Flores")} className="flex-1 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg flex flex-col items-center justify-center transition-colors group">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mb-1" />
                <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">Estudiante</span>
              </button>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">SCRM Core • InsForge BaaS</span>
          </div>

        </div>
      </div>
    </div>
  );
}
