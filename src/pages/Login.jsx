import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, GraduationCap, School, User, Lock, ArrowRight, Briefcase } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    // Credenciales hardcodeadas para demostración sin backend
    const credentials = [
      { email: "admin@academia.edu.pe", pass: "admin123", role: "admin", name: "Roberto Morales" },
      { email: "docente@academia.edu.pe", pass: "docente123", role: "docente", name: "Lincoln Vega" },
      { email: "estudiante@academia.edu.pe", pass: "estudiante123", role: "estudiante", name: "Juan Carlos Flores" }
    ];

    const user = credentials.find(u => u.email === email && u.pass === password);

    if (user) {
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userName", user.name);
      localStorage.setItem("userEmail", user.email);
      
      if (user.role === "admin") navigate("/admin/usuarios");
      else if (user.role === "docente") navigate("/docente/panel");
      else navigate("/estudiante/panel");
    } else {
      setError("Credenciales incorrectas. Inténtalo de nuevo.");
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
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-[#1E3A8A] text-white p-8 text-center relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-800 rounded-full opacity-40 pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-blue-700 rounded-full opacity-30 pointer-events-none" />
          
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4 backdrop-blur-xs border border-white/20">
            <School className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Academia Preuniversitaria</h1>
          <p className="text-blue-200 text-sm mt-1">
            Sistema Integrado de Gestión Académica (SCRM)
          </p>
        </div>

        <div className="p-8 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200 text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Correo Electrónico</label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ej. admin@academia.edu.pe" 
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Contraseña</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden transition-all"
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-[#1E3A8A] text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-800 transition-colors shadow-md flex justify-center items-center gap-2 cursor-pointer">
              Iniciar Sesión <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-slate-500">O accesos rápidos de prueba</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => loginDirecto("admin", "admin@academia.edu.pe", "admin123", "Roberto Morales")} className="p-2 border border-slate-200 rounded-lg flex flex-col items-center hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer group">
              <ShieldCheck className="w-5 h-5 text-slate-500 group-hover:text-blue-600 mb-1" />
              <span className="text-[10px] font-semibold text-slate-600">Admin</span>
            </button>
            <button onClick={() => loginDirecto("docente", "docente@academia.edu.pe", "docente123", "Lincoln Vega")} className="p-2 border border-slate-200 rounded-lg flex flex-col items-center hover:bg-amber-50 hover:border-amber-300 transition-colors cursor-pointer group">
              <Briefcase className="w-5 h-5 text-slate-500 group-hover:text-amber-600 mb-1" />
              <span className="text-[10px] font-semibold text-slate-600">Docente</span>
            </button>
            <button onClick={() => loginDirecto("estudiante", "estudiante@academia.edu.pe", "estudiante123", "Juan Carlos Flores")} className="p-2 border border-slate-200 rounded-lg flex flex-col items-center hover:bg-emerald-50 hover:border-emerald-300 transition-colors cursor-pointer group">
              <GraduationCap className="w-5 h-5 text-slate-500 group-hover:text-emerald-600 mb-1" />
              <span className="text-[10px] font-semibold text-slate-600">Estudiante</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
