import { CheckCircle2 } from "lucide-react";

export default function Notification({ message, onClose }) {
  return (
    <div className="bg-blue-900 border-l-4 border-amber-400 text-white p-3 rounded-lg shadow-lg flex items-center justify-between animate-fade-in text-sm">
      <div className="flex items-center space-x-2">
        <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
        <span>{message}</span>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar notificación"
        className="text-white/70 hover:text-white text-xs font-bold px-2 py-1"
      >
        ✕
      </button>
    </div>
  );
}
