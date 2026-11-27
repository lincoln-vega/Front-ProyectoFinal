// Combobox interactivo con búsqueda por escritura en tiempo real (insensible a tildes y mayúsculas)
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";

function normalizeSearch(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * @param {Object} props
 * @param {Array<{value: string, label: string, sublabel?: string, searchText?: string, group?: string}>} props.options
 * @param {string} props.value
 * @param {(newValue: string) => void} props.onChange
 * @param {string} [props.placeholder]
 * @param {string} [props.emptyOptionLabel] - Si se indica, muestra una primera opción con value="" (ej. "Todos los cursos")
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.error]
 * @param {string} [props.className]
 */
export default function SearchableSelect({
  options = [],
  value = "",
  onChange,
  placeholder = "Seleccionar o escribir para filtrar...",
  emptyOptionLabel = null,
  disabled = false,
  error = false,
  className = ""
}) {
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightIdx, setHighlightIdx] = useState(0);

  const fullOptions = useMemo(() => {
    const normalized = (options || []).map((opt) =>
      typeof opt === "string"
        ? { value: opt, label: opt, sublabel: "", searchText: "", group: "" }
        : {
            value: String(opt.value ?? ""),
            label: String(opt.label ?? opt.value ?? ""),
            sublabel: opt.sublabel ? String(opt.sublabel) : "",
            searchText: opt.searchText ? String(opt.searchText) : "",
            group: opt.group ? String(opt.group) : ""
          }
    );
    if (emptyOptionLabel !== null) {
      return [
        { value: "", label: emptyOptionLabel, sublabel: "", searchText: "", group: "" },
        ...normalized
      ];
    }
    return normalized;
  }, [options, emptyOptionLabel]);

  const selectedOption = useMemo(
    () => fullOptions.find((o) => String(o.value) === String(value ?? "")) || null,
    [fullOptions, value]
  );

  const filteredOptions = useMemo(() => {
    const q = normalizeSearch(query);
    if (!q) return fullOptions;
    return fullOptions.filter((opt) => {
      if (opt.value === "" && emptyOptionLabel !== null) {
        return normalizeSearch(opt.label).includes(q);
      }
      const haystack = normalizeSearch(
        `${opt.label} ${opt.sublabel} ${opt.searchText} ${opt.value} ${opt.group}`
      );
      return haystack.includes(q);
    });
  }, [fullOptions, query, emptyOptionLabel]);

  useEffect(() => {
    setHighlightIdx(0);
  }, [query, isOpen]);

  // Cerrar al hacer clic fuera y restaurar texto limpio
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleOutside = (ev) => {
      if (containerRef.current && !containerRef.current.contains(ev.target)) {
        setIsOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen]);

  const openDropdown = () => {
    if (disabled) return;
    setIsOpen(true);
    setQuery("");
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleSelect = (optValue) => {
    onChange?.(optValue);
    setIsOpen(false);
    setQuery("");
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (!isOpen && (e.key === "ArrowDown" || e.key === "Enter")) {
      e.preventDefault();
      openDropdown();
      return;
    }
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((prev) =>
        filteredOptions.length > 0 ? (prev + 1) % filteredOptions.length : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((prev) =>
        filteredOptions.length > 0
          ? (prev - 1 + filteredOptions.length) % filteredOptions.length
          : 0
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = filteredOptions[highlightIdx];
      if (target) {
        handleSelect(target.value);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setQuery("");
    }
  };

  useEffect(() => {
    if (!isOpen || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-opt-idx="${highlightIdx}"]`);
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIdx, isOpen]);

  const displayLabel = selectedOption
    ? selectedOption.label
    : value
    ? String(value)
    : "";

  return (
    <div ref={containerRef} className={`relative ${isOpen ? "z-50" : ""} ${className}`}>
      {/* Campo principal interactivo: muestra el valor actual o permite escribir al abrirse */}
      <div
        onClick={() => {
          if (!isOpen) openDropdown();
        }}
        className={`w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl border text-xs transition-all backdrop-blur-xl ${
          disabled
            ? "opacity-55 cursor-not-allowed bg-slate-100/90 dark:bg-slate-800/60 border-slate-200 dark:border-white/10"
            : isOpen
            ? "ring-2 ring-blue-400 border-blue-400 bg-white/95 dark:bg-slate-900/90 shadow-lg cursor-text"
            : error
            ? "border-rose-400 dark:border-rose-500 bg-white/90 dark:bg-slate-900/85 cursor-pointer"
            : "border-slate-300/90 dark:border-white/20 bg-white/90 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900/90 hover:border-slate-400 dark:hover:border-white/30 cursor-pointer"
        }`}
      >
        {isOpen ? (
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <Search className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                displayLabel
                  ? `Filtrar... (actual: ${displayLabel})`
                  : "Escribe nombre, DNI o código..."
              }
              className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-medium"
            />
          </div>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onKeyDown={handleKeyDown}
            className="flex-1 min-w-0 text-left truncate focus:outline-none cursor-pointer disabled:cursor-not-allowed"
          >
            {displayLabel ? (
              <span className="font-semibold text-slate-800 dark:text-slate-100 truncate block">
                {displayLabel}
              </span>
            ) : (
              <span className="text-slate-400 dark:text-slate-500 truncate block">
                {placeholder}
              </span>
            )}
          </button>
        )}

        <div className="flex items-center gap-1 shrink-0">
          {!disabled && emptyOptionLabel !== null && value !== "" && !isOpen && (
            <button
              type="button"
              onClick={(ev) => {
                ev.stopPropagation();
                handleSelect("");
              }}
              title="Restablecer filtro"
              className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${
              isOpen ? "rotate-180 text-blue-500" : ""
            }`}
          />
        </div>
      </div>

      {/* Lista desplegable con efecto vidrio esmerilado (traslúcida densa, sin perder legibilidad) */}
      {isOpen && !disabled && (
        <div
          ref={listRef}
          className="absolute left-0 right-0 mt-1.5 z-[80] max-h-60 overflow-y-auto rounded-2xl border border-slate-300/80 dark:border-blue-400/25 bg-white/85 dark:bg-[#0f172a]/82 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_22px_55px_-8px_rgba(2,6,23,0.82)] ring-1 ring-slate-900/5 dark:ring-white/15 py-1.5 animate-fade-in"
        >
          {filteredOptions.length === 0 ? (
            <div className="px-3.5 py-4 text-center text-xs text-slate-500 dark:text-slate-300">
              Sin coincidencias para “{query}”
            </div>
          ) : (
            (() => {
              let lastGroup = null;
              return filteredOptions.map((opt, idx) => {
                const isSelected = String(opt.value) === String(value ?? "");
                const isHighlighted = idx === highlightIdx;
                const showGroupHeader = Boolean(opt.group && opt.group !== lastGroup);
                if (opt.group) lastGroup = opt.group;

                return (
                  <React.Fragment key={`${opt.value}-${idx}`}>
                    {showGroupHeader && (
                      <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-blue-300/80 bg-slate-100/85 dark:bg-slate-950/75 backdrop-blur-md sticky top-0 border-y border-slate-200/60 dark:border-white/10">
                        {opt.group}
                      </div>
                    )}
                    <button
                      type="button"
                      data-opt-idx={idx}
                      onMouseEnter={() => setHighlightIdx(idx)}
                      onClick={() => handleSelect(opt.value)}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                        isHighlighted
                          ? "bg-blue-600/12 dark:bg-blue-500/25 text-blue-950 dark:text-white"
                          : isSelected
                          ? "bg-slate-900/[0.05] dark:bg-white/10 text-slate-950 dark:text-white"
                          : "text-slate-800 dark:text-slate-100 hover:bg-slate-900/[0.04] dark:hover:bg-white/10"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className={`truncate ${isSelected ? "font-extrabold" : "font-semibold"}`}>
                          {opt.label}
                        </div>
                        {opt.sublabel && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-300/85 truncate">
                            {opt.sublabel}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-blue-600 dark:text-amber-300 shrink-0" />
                      )}
                    </button>
                  </React.Fragment>
                );
              });
            })()
          )}
        </div>
      )}
    </div>
  );
}
