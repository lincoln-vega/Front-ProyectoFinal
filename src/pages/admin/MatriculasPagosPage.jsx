import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Wallet,
  DollarSign,
  Search,
  Plus,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Eye,
  Trash2,
  Calendar,
  GraduationCap,
  Receipt,
  X,
  User,
  Check,
  Printer,
  ChevronRight,
  TrendingUp,
  Building,
  Phone,
  Mail,
  ArrowUpRight
} from "lucide-react";
import { userService } from "../../services/api";

const STORAGE_KEYS = {
  MATRICULAS: "academia_matriculas_data",
  PAGOS: "academia_pagos_data",
};

const PROGRAMAS_ACADEMICOS = [
  { nombre: "Semestral San Marcos - Ciencias Médicas", costo: 1200, cuotasSugeridas: 3 },
  { nombre: "Anual UNI - Ingeniería y Ciencias", costo: 1800, cuotasSugeridas: 4 },
  { nombre: "Semestral PUCP - Letras y Humanidades", costo: 1400, cuotasSugeridas: 4 },
  { nombre: "Intensivo Verano - Ciencias Exactas", costo: 850, cuotasSugeridas: 2 },
  { nombre: "Repaso Integral San Marcos / UNI", costo: 600, cuotasSugeridas: 1 },
];

const INITIAL_MATRICULAS = [
  {
    id: "MAT-2026-001",
    estudiante: "Juan Carlos Flores Mendoza",
    dni: "74839201",
    correo: "estudiante@gmail.com",
    celular: "987654321",
    programa: "Semestral San Marcos - Ciencias Médicas",
    ciclo: "Ciclo 2026-I",
    turno: "Mañana (08:00 - 13:00)",
    fechaMatricula: "15/01/2026",
    modalidadPago: "Cuotas (3 cuotas)",
    montoTotal: 1200,
    montoPagado: 800,
    saldoPendiente: 400,
    estado: "Al día",
  },
  {
    id: "MAT-2026-002",
    estudiante: "Valeria Sofía Quispe Alarcón",
    dni: "76543210",
    correo: "v.quispe@academia.edu.pe",
    celular: "912345678",
    programa: "Anual UNI - Ingeniería y Ciencias",
    ciclo: "Ciclo 2026-I",
    turno: "Tarde (14:00 - 19:00)",
    fechaMatricula: "18/01/2026",
    modalidadPago: "Contado (Descuento 10%)",
    montoTotal: 1800,
    montoPagado: 1800,
    saldoPendiente: 0,
    estado: "Pagado Total",
  },
  {
    id: "MAT-2026-003",
    estudiante: "Lucía Fernanda Gómez Pérez",
    dni: "73214569",
    correo: "l.gomez@academia.edu.pe",
    celular: "945612378",
    programa: "Semestral PUCP - Letras y Humanidades",
    ciclo: "Ciclo 2026-I",
    turno: "Mañana (08:00 - 13:00)",
    fechaMatricula: "20/01/2026",
    modalidadPago: "Cuotas (4 cuotas)",
    montoTotal: 1400,
    montoPagado: 700,
    saldoPendiente: 700,
    estado: "Cuota Vencida",
  },
  {
    id: "MAT-2026-004",
    estudiante: "Diego Flores Mendoza",
    dni: "75849302",
    correo: "d.flores@academia.edu.pe",
    celular: "933221144",
    programa: "Intensivo Verano - Ciencias Exactas",
    ciclo: "Ciclo 2026-I",
    turno: "Noche (19:00 - 22:00)",
    fechaMatricula: "25/01/2026",
    modalidadPago: "Contado",
    montoTotal: 850,
    montoPagado: 850,
    saldoPendiente: 0,
    estado: "Pagado Total",
  },
  {
    id: "MAT-2026-005",
    estudiante: "Elena Morales Ruiz",
    dni: "71928374",
    correo: "e.morales@academia.edu.pe",
    celular: "977889900",
    programa: "Semestral San Marcos - Ciencias Médicas",
    ciclo: "Ciclo 2026-I",
    turno: "Mañana (08:00 - 13:00)",
    fechaMatricula: "02/02/2026",
    modalidadPago: "Cuotas (3 cuotas)",
    montoTotal: 1200,
    montoPagado: 400,
    saldoPendiente: 800,
    estado: "Pendiente",
  },
];

const INITIAL_PAGOS = [
  {
    id: "PAG-001",
    matriculaId: "MAT-2026-001",
    estudiante: "Juan Carlos Flores Mendoza",
    concepto: "Matrícula + Cuota 1 (Enero)",
    monto: 400,
    metodo: "Yape / Plin",
    operacion: "OP-9823412",
    comprobante: "B001-00382",
    fecha: "15/01/2026 10:30 AM",
    estado: "Aprobado",
  },
  {
    id: "PAG-002",
    matriculaId: "MAT-2026-001",
    estudiante: "Juan Carlos Flores Mendoza",
    concepto: "Cuota 2 (Febrero)",
    monto: 400,
    metodo: "Transferencia BCP",
    operacion: "BCP-5544321",
    comprobante: "B001-00412",
    fecha: "14/02/2026 04:15 PM",
    estado: "Aprobado",
  },
  {
    id: "PAG-003",
    matriculaId: "MAT-2026-002",
    estudiante: "Valeria Sofía Quispe Alarcón",
    concepto: "Pago Único Contado Anual UNI (10% Dcto)",
    monto: 1800,
    metodo: "Tarjeta Débito/Crédito",
    operacion: "VISA-44021",
    comprobante: "B001-00395",
    fecha: "18/01/2026 11:20 AM",
    estado: "Aprobado",
  },
  {
    id: "PAG-004",
    matriculaId: "MAT-2026-003",
    estudiante: "Lucía Fernanda Gómez Pérez",
    concepto: "Matrícula + Cuota 1 (Enero)",
    monto: 350,
    metodo: "Transferencia BBVA",
    operacion: "BBVA-88219",
    comprobante: "B001-00401",
    fecha: "20/01/2026 09:40 AM",
    estado: "Aprobado",
  },
  {
    id: "PAG-005",
    matriculaId: "MAT-2026-003",
    estudiante: "Lucía Fernanda Gómez Pérez",
    concepto: "Cuota 2 (Febrero)",
    monto: 350,
    metodo: "Yape / Plin",
    operacion: "OP-7731209",
    comprobante: "B001-00450",
    fecha: "22/02/2026 03:50 PM",
    estado: "Aprobado",
  },
  {
    id: "PAG-006",
    matriculaId: "MAT-2026-004",
    estudiante: "Diego Flores Mendoza",
    concepto: "Pago Único Intensivo Verano",
    monto: 850,
    metodo: "Transferencia BCP",
    operacion: "BCP-9912301",
    comprobante: "B001-00422",
    fecha: "25/01/2026 12:10 PM",
    estado: "Aprobado",
  },
  {
    id: "PAG-007",
    matriculaId: "MAT-2026-005",
    estudiante: "Elena Morales Ruiz",
    concepto: "Matrícula + Cuota 1 (Febrero)",
    monto: 400,
    metodo: "Efectivo en Caja",
    operacion: "CAJA-019",
    comprobante: "B001-00465",
    fecha: "02/02/2026 10:00 AM",
    estado: "Aprobado",
  },
];

export default function MatriculasPagosPage({ defaultTab = "matriculas" }) {
  const [tabActiva, setTabActiva] = useState(defaultTab); // 'matriculas' | 'pagos'

  useEffect(() => {
    setTabActiva(defaultTab);
  }, [defaultTab]);
  const [matriculas, setMatriculas] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [isNewStudent, setIsNewStudent] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroPrograma, setFiltroPrograma] = useState("TODOS");
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [notification, setNotification] = useState(null);

  // Modales
  const [modalMatriculaOpen, setModalMatriculaOpen] = useState(false);
  const [modalPagoOpen, setModalPagoOpen] = useState(false);
  const [fichaMatricula, setFichaMatricula] = useState(null);
  const [reciboPago, setReciboPago] = useState(null);

  // Formulario Matrícula
  const [formMatricula, setFormMatricula] = useState({
    estudiante: "",
    dni: "",
    correo: "",
    celular: "",
    programa: PROGRAMAS_ACADEMICOS[0].nombre,
    turno: "Mañana (08:00 - 13:00)",
    modalidadPago: "Cuotas (3 cuotas)",
    montoTotal: PROGRAMAS_ACADEMICOS[0].costo,
    primerAbono: 400,
  });

  // Formulario Pago
  const [formPago, setFormPago] = useState({
    matriculaId: "",
    concepto: "Cuota Regular de Pensión",
    monto: "",
    metodo: "Yape / Plin",
    operacion: "",
    comprobanteTipo: "Boleta de Venta Electrónica",
  });

  useEffect(() => {
    const savedMatriculas = localStorage.getItem(STORAGE_KEYS.MATRICULAS);
    const savedPagos = localStorage.getItem(STORAGE_KEYS.PAGOS);
    setStudents(userService.getUsers().filter((user) => String(user.rol).toLowerCase() === "estudiante"));

    if (savedMatriculas) {
      setMatriculas(JSON.parse(savedMatriculas));
    } else {
      setMatriculas(INITIAL_MATRICULAS);
      localStorage.setItem(STORAGE_KEYS.MATRICULAS, JSON.stringify(INITIAL_MATRICULAS));
    }

    if (savedPagos) {
      setPagos(JSON.parse(savedPagos));
    } else {
      setPagos(INITIAL_PAGOS);
      localStorage.setItem(STORAGE_KEYS.PAGOS, JSON.stringify(INITIAL_PAGOS));
    }
  }, []);

  const resetStudentSelection = () => {
    setSelectedStudentId("");
    setStudentSearch("");
    setIsNewStudent(false);
    setFormMatricula((current) => ({
      ...current,
      estudiante: "",
      dni: "",
      correo: "",
      celular: ""
    }));
  };

  const handleStudentSelect = (student) => {
    setSelectedStudentId(student.id);
    setStudentSearch(`${student.nombres} ${student.apellidos}`.trim());
    setIsNewStudent(false);
    setFormMatricula((current) => ({
      ...current,
      estudiante: `${student.nombres} ${student.apellidos}`.trim(),
      dni: student.dni,
      correo: student.correo || "",
      celular: student.celular || ""
    }));
  };

  const splitStudentName = (fullName) => {
    const parts = fullName.trim().split(/\s+/);
    return {
      nombres: parts.slice(0, -1).join(" ") || parts[0] || "",
      apellidos: parts.at(-1) || ""
    };
  };

  const saveMatriculasStorage = (data) => {
    setMatriculas(data);
    localStorage.setItem(STORAGE_KEYS.MATRICULAS, JSON.stringify(data));
  };

  const savePagosStorage = (data) => {
    setPagos(data);
    localStorage.setItem(STORAGE_KEYS.PAGOS, JSON.stringify(data));
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // KPIs
  const totalRecaudado = pagos.reduce((acc, p) => (p.estado === "Aprobado" ? acc + Number(p.monto) : acc), 0);
  const totalPorCobrar = matriculas.reduce((acc, m) => acc + Number(m.saldoPendiente || 0), 0);
  const matriculasAlDia = matriculas.filter((m) => m.estado === "Al día" || m.estado === "Pagado Total").length;
  const porcentajeCumplimiento = matriculas.length > 0 ? ((matriculasAlDia / matriculas.length) * 100).toFixed(1) : 0;

  // Filtrado de Matrículas
  const matriculasFiltradas = matriculas.filter((m) => {
    const matchSearch =
      m.estudiante.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.dni.includes(searchTerm) ||
      m.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchProg = filtroPrograma === "TODOS" || m.programa === filtroPrograma;
    const matchEst = filtroEstado === "TODOS" || m.estado === filtroEstado;
    return matchSearch && matchProg && matchEst;
  });

  // Filtrado de Pagos
  const pagosFiltrados = pagos.filter((p) => {
    const matchSearch =
      p.estudiante.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.comprobante.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.operacion.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  const matchingStudents = students.filter((student) => {
    const term = studentSearch.toLowerCase().trim();
    if (!term) return true;
    return [student.nombres, student.apellidos, student.dni, student.correo]
      .some((field) => String(field || "").toLowerCase().includes(term));
  }).slice(0, 5);

  // Registro de Nueva Matrícula
  const handleGuardarMatricula = (e) => {
    e.preventDefault();
    if (!formMatricula.estudiante || !formMatricula.dni) {
      showNotification("Por favor completa los campos de nombre y DNI.");
      return;
    }

    let estudianteId = selectedStudentId;
    if (isNewStudent) {
      estudianteId = `USR-${Date.now().toString().slice(-6)}`;
      const newStudent = {
        id: estudianteId,
        ...splitStudentName(formMatricula.estudiante),
        dni: formMatricula.dni,
        correo: formMatricula.correo || `${formMatricula.dni}@academia.edu.pe`,
        password: "estudiante123",
        celular: formMatricula.celular || "",
        carreraObjetivo: "",
        areaAcademica: "",
        rol: "estudiante",
        estado: "Activo"
      };
      const updatedStudents = [newStudent, ...students];
      userService.saveUsers([...userService.getUsers().filter((user) => user.id !== estudianteId), newStudent]);
      setStudents(updatedStudents);
    }

    const nuevoId = `MAT-2026-00${matriculas.length + 1}`;
    const abonoInicial = Number(formMatricula.primerAbono) || 0;
    const montoTotal = Number(formMatricula.montoTotal);
    const saldo = Math.max(0, montoTotal - abonoInicial);

    let estado = "Pendiente";
    if (saldo === 0) estado = "Pagado Total";
    else if (abonoInicial > 0) estado = "Al día";

    const nuevaMat = {
      id: nuevoId,
      estudianteId,
      estudiante: formMatricula.estudiante,
      dni: formMatricula.dni,
      correo: formMatricula.correo || `${formMatricula.dni}@academia.edu.pe`,
      celular: formMatricula.celular || "900000000",
      programa: formMatricula.programa,
      ciclo: "Ciclo 2026-I",
      turno: formMatricula.turno,
      fechaMatricula: new Date().toLocaleDateString("es-PE"),
      modalidadPago: formMatricula.modalidadPago,
      montoTotal: montoTotal,
      montoPagado: abonoInicial,
      saldoPendiente: saldo,
      estado: estado,
    };

    const nuevasMatriculas = [nuevaMat, ...matriculas];
    saveMatriculasStorage(nuevasMatriculas);

    // Si hubo abono inicial, generamos su pago automáticamente
    if (abonoInicial > 0) {
      const nuevoPago = {
        id: `PAG-00${pagos.length + 1}`,
        matriculaId: nuevoId,
        estudiante: nuevaMat.estudiante,
        concepto: "Matrícula Inicial / Cuota 1",
        monto: abonoInicial,
        metodo: "Efectivo en Caja",
        operacion: `OP-INI-${Date.now().toString().slice(-5)}`,
        comprobante: `B001-00${450 + pagos.length + 1}`,
        fecha: new Date().toLocaleString("es-PE"),
        estado: "Aprobado",
      };
      savePagosStorage([nuevoPago, ...pagos]);
    }

    setModalMatriculaOpen(false);
    resetStudentSelection();
    setFormMatricula({
      estudiante: "",
      dni: "",
      correo: "",
      celular: "",
      programa: PROGRAMAS_ACADEMICOS[0].nombre,
      turno: "Mañana (08:00 - 13:00)",
      modalidadPago: "Cuotas (3 cuotas)",
      montoTotal: PROGRAMAS_ACADEMICOS[0].costo,
      primerAbono: 400,
    });
    showNotification(`¡Matrícula ${nuevoId} registrada con éxito!`);
  };

  // Abrir Modal de Pago para una matrícula específica
  const handleAbrirPagoParaMatricula = (mat) => {
    setFormPago({
      matriculaId: mat.id,
      concepto: `Cuota de Pensión (${mat.programa.split("-")[0].trim()})`,
      monto: mat.saldoPendiente > 0 ? Math.min(mat.saldoPendiente, 400) : 0,
      metodo: "Yape / Plin",
      operacion: "",
      comprobanteTipo: "Boleta de Venta Electrónica",
    });
    setModalPagoOpen(true);
  };

  // Registro de Pago
  const handleGuardarPago = (e) => {
    e.preventDefault();
    const montoNum = Number(formPago.monto);
    if (!formPago.matriculaId || !montoNum || montoNum <= 0) {
      showNotification("Selecciona una matrícula y especifica un monto válido.");
      return;
    }

    const mat = matriculas.find((m) => m.id === formPago.matriculaId);
    if (!mat) {
      showNotification("Matrícula no encontrada.");
      return;
    }

    const nuevoPagoId = `PAG-00${pagos.length + 1}`;
    const nuevoPago = {
      id: nuevoPagoId,
      matriculaId: mat.id,
      estudiante: mat.estudiante,
      concepto: formPago.concepto,
      monto: montoNum,
      metodo: formPago.metodo,
      operacion: formPago.operacion || `TRANS-${Date.now().toString().slice(-6)}`,
      comprobante: `B001-00${450 + pagos.length + 1}`,
      fecha: new Date().toLocaleString("es-PE"),
      estado: "Aprobado",
    };

    const nuevosPagos = [nuevoPago, ...pagos];
    savePagosStorage(nuevosPagos);

    // Actualizar matrícula
    const nuevoPagado = mat.montoPagado + montoNum;
    const nuevoSaldo = Math.max(0, mat.montoTotal - nuevoPagado);
    const nuevoEstado = nuevoSaldo === 0 ? "Pagado Total" : "Al día";

    const nuevasMatriculas = matriculas.map((m) =>
      m.id === mat.id ? { ...m, montoPagado: nuevoPagado, saldoPendiente: nuevoSaldo, estado: nuevoEstado } : m
    );
    saveMatriculasStorage(nuevasMatriculas);

    setModalPagoOpen(false);
    showNotification(`Pago de S/. ${montoNum.toFixed(2)} registrado correctamente.`);
  };

  // Eliminar Matrícula
  const handleEliminarMatricula = (id, nombre) => {
    if (window.confirm(`¿Confirmas la anulación de la matrícula de ${nombre} (${id})?`)) {
      const filtered = matriculas.filter((m) => m.id !== id);
      saveMatriculasStorage(filtered);
      showNotification(`Matrícula ${id} eliminada.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notificación Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-[#1E3A8A] text-white px-5 py-3 rounded-xl shadow-lg border border-blue-400/40 flex items-center gap-3 animate-fade-in text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* BANNER SUPERIOR INSTITUCIONAL */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-blue-50 text-[#1E3A8A] text-xs font-bold uppercase tracking-wider border border-blue-200 mb-2">
              <Wallet className="w-3.5 h-3.5 text-[#1E3A8A]" />
              <span>Módulo de Matrículas y Pagos</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-800">
              Gestión de Matrículas, Cobranzas y Comprobantes
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Control centralizado de inscripciones por ciclo académico, seguimiento de cronogramas de pensiones, registro de vouchers bancarios y emisión de comprobantes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setFormPago({
                  matriculaId: matriculas[0]?.id || "",
                  concepto: "Cuota Regular de Pensión",
                  monto: 400,
                  metodo: "Yape / Plin",
                  operacion: "",
                  comprobanteTipo: "Boleta de Venta Electrónica",
                });
                setModalPagoOpen(true);
              }}
              className="inline-flex items-center space-x-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>+ Registrar Pago</span>
            </button>

            <button
              onClick={() => {
                resetStudentSelection();
                setModalMatriculaOpen(true);
              }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-[#1E3A8A] hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>+ Nueva Matrícula</span>
            </button>
          </div>
        </div>

        {/* TARJETAS DE MÉTRICAS / KPIS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Recaudado (S/.)
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xl font-extrabold text-slate-800">
                S/. {totalRecaudado.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
              </span>
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {pagos.length} transacciones validadas
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Alumnos Matriculados
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xl font-extrabold text-slate-800">{matriculas.length} alumnos</span>
              <div className="p-2 bg-blue-100 text-[#1E3A8A] rounded-lg">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {matriculasAlDia} al día / {matriculas.length - matriculasAlDia} pendientes
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Saldo Pendiente de Cobro
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xl font-extrabold text-amber-600">
                S/. {totalPorCobrar.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
              </span>
              <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Por vencer en el ciclo</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Tasa de Cumplimiento
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xl font-extrabold text-slate-800">{porcentajeCumplimiento}%</span>
              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Cobranzas al día</span>
          </div>
        </div>
      </div>

      {/* TABS Y BARRA DE FILTROS */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Selector de Pestañas */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTabActiva("matriculas")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                tabActiva === "matriculas"
                  ? "bg-[#1E3A8A] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Matrículas Registradas ({matriculas.length})</span>
            </button>

            <button
              onClick={() => setTabActiva("pagos")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                tabActiva === "pagos"
                  ? "bg-[#1E3A8A] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Historial de Pagos ({pagos.length})</span>
            </button>
          </div>

          <span className="text-xs text-slate-400 hidden sm:inline">
            Periodo Actual: <strong className="text-slate-700">Ciclo 2026-I</strong>
          </span>
        </div>

        {/* Buscador y Filtros */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={
                tabActiva === "matriculas"
                  ? "Buscar por alumno, DNI o código..."
                  : "Buscar por alumno, N° comprobante u operación..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-800/20 focus:border-[#1E3A8A] transition-all"
            />
          </div>

          {tabActiva === "matriculas" && (
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filtroPrograma}
                onChange={(e) => setFiltroPrograma(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-medium focus:outline-none"
              >
                <option value="TODOS">Todos los Programas</option>
                {PROGRAMAS_ACADEMICOS.map((p) => (
                  <option key={p.nombre} value={p.nombre}>
                    {p.nombre}
                  </option>
                ))}
              </select>

              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-medium focus:outline-none"
              >
                <option value="TODOS">Todos los Estados</option>
                <option value="Pagado Total">Pagado Total</option>
                <option value="Al día">Al día</option>
                <option value="Cuota Vencida">Cuota Vencida</option>
                <option value="Pendiente">Pendiente</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* VISTA 1: TABLA DE MATRÍCULAS */}
      {tabActiva === "matriculas" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Código / Fecha</th>
                  <th className="py-3.5 px-4">Estudiante</th>
                  <th className="py-3.5 px-4">Programa / Modalidad</th>
                  <th className="py-3.5 px-4 text-right">Monto Total</th>
                  <th className="py-3.5 px-4 text-right">Pagado</th>
                  <th className="py-3.5 px-4 text-right">Saldo</th>
                  <th className="py-3.5 px-4 text-center">Estado</th>
                  <th className="py-3.5 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {matriculasFiltradas.length > 0 ? (
                  matriculasFiltradas.map((mat) => {
                    return (
                      <tr key={mat.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-bold text-[#1E3A8A] font-mono block">{mat.id}</span>
                          <span className="text-[11px] text-slate-400">{mat.fechaMatricula}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">{mat.estudiante}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2">
                            <span>DNI: {mat.dni}</span>
                            <span>•</span>
                            <span>{mat.celular}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800">{mat.programa}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono text-[10px]">
                              {mat.turno}
                            </span>
                            <span>•</span>
                            <span className="text-slate-400">{mat.modalidadPago}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right font-semibold text-slate-800">
                          S/. {mat.montoTotal.toFixed(2)}
                        </td>

                        <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                          S/. {mat.montoPagado.toFixed(2)}
                        </td>

                        <td className="py-3.5 px-4 text-right font-bold">
                          {mat.saldoPendiente > 0 ? (
                            <span className="text-amber-600">S/. {mat.saldoPendiente.toFixed(2)}</span>
                          ) : (
                            <span className="text-slate-400">S/. 0.00</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              mat.estado === "Pagado Total"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : mat.estado === "Al día"
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : mat.estado === "Cuota Vencida"
                                ? "bg-red-100 text-red-800 border border-red-200"
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {mat.estado}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            {/* Ver Ficha */}
                            <button
                              onClick={() => setFichaMatricula(mat)}
                              className="p-1.5 text-slate-500 hover:text-[#1E3A8A] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Ver Ficha de Matrícula"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Registrar Pago Rápido */}
                            {mat.saldoPendiente > 0 && (
                              <button
                                onClick={() => handleAbrirPagoParaMatricula(mat)}
                                className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                title="Abonar Cuota"
                              >
                                <DollarSign className="w-4 h-4" />
                              </button>
                            )}

                            {/* Eliminar */}
                            <button
                              onClick={() => handleEliminarMatricula(mat.id, mat.estudiante)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Anular matrícula"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                      No se encontraron matrículas con los criterios de búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VISTA 2: HISTORIAL DE PAGOS */}
      {tabActiva === "pagos" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">N° Recibo / Fecha</th>
                  <th className="py-3.5 px-4">Estudiante / Matrícula</th>
                  <th className="py-3.5 px-4">Concepto</th>
                  <th className="py-3.5 px-4">Método de Pago</th>
                  <th className="py-3.5 px-4">N° Operación</th>
                  <th className="py-3.5 px-4 text-right">Monto</th>
                  <th className="py-3.5 px-4 text-center">Estado</th>
                  <th className="py-3.5 px-4 text-center">Recibo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {pagosFiltrados.length > 0 ? (
                  pagosFiltrados.map((pago) => (
                    <tr key={pago.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-800 font-mono block">{pago.comprobante}</span>
                        <span className="text-[11px] text-slate-400">{pago.fecha}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{pago.estudiante}</div>
                        <span className="text-[11px] text-[#1E3A8A] font-mono font-medium">
                          Ref: {pago.matriculaId}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-800">{pago.concepto}</td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                          <CreditCard className="w-3 h-3 text-slate-500" />
                          {pago.metodo}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                        {pago.operacion}
                      </td>

                      <td className="py-3.5 px-4 text-right font-extrabold text-emerald-600 text-sm">
                        S/. {Number(pago.monto).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {pago.estado}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setReciboPago(pago)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-[#1E3A8A] hover:text-white text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Boleta</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                      No se encontraron registros de pagos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: REGISTRAR NUEVA MATRÍCULA */}
      {modalMatriculaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-scale-up my-8">
            <div className="bg-[#1E3A8A] text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-white/10 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Ficha de Nueva Matrícula</h3>
                  <p className="text-xs text-blue-200">Inscripción y apertura de expediente académico</p>
                </div>
              </div>
              <button
                onClick={() => setModalMatriculaOpen(false)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarMatricula} className="p-6 space-y-4">
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Estudiante *
                    </label>
                    <p className="text-[11px] text-slate-500">Busca por nombre, DNI o correo.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewStudent(true);
                      setSelectedStudentId("");
                      setStudentSearch("");
                      setFormMatricula({ ...formMatricula, estudiante: "", dni: "", correo: "", celular: "" });
                    }}
                    className="text-[11px] font-semibold text-[#1E3A8A] hover:underline cursor-pointer"
                  >
                    Registrar nuevo
                  </button>
                </div>

                {!isNewStudent ? (
                  <>
                    <input
                      type="search"
                      required
                      placeholder="Ej. Juan Carlos o 74839201"
                      value={studentSearch}
                      onChange={(e) => {
                        setStudentSearch(e.target.value);
                        setSelectedStudentId("");
                        setFormMatricula({ ...formMatricula, estudiante: "", dni: "", correo: "", celular: "" });
                      }}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#1E3A8A]"
                    />
                    <div className="max-h-36 overflow-y-auto space-y-1">
                      {matchingStudents.map((student) => (
                        <button
                          type="button"
                          key={student.id}
                          onClick={() => handleStudentSelect(student)}
                          className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-colors cursor-pointer ${selectedStudentId === student.id ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-300"}`}
                        >
                          <span className="font-semibold text-slate-800">{student.nombres} {student.apellidos}</span>
                          <span className="block text-[11px] text-slate-500">DNI: {student.dni} · {student.correo}</span>
                        </button>
                      ))}
                      {!matchingStudents.length && <p className="text-[11px] text-slate-400 py-2">No se encontró un estudiante. Usa “Registrar nuevo”.</p>}
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      placeholder="Nombres y apellidos"
                      value={formMatricula.estudiante}
                      onChange={(e) => setFormMatricula({ ...formMatricula, estudiante: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#1E3A8A]"
                    />
                    <input
                      type="text"
                      required
                      maxLength={8}
                      placeholder="DNI / Documento"
                      value={formMatricula.dni}
                      onChange={(e) => setFormMatricula({ ...formMatricula, dni: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#1E3A8A]"
                    />
                  </div>
                )}

                {selectedStudentId && (
                  <div className="flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-[11px] text-emerald-800">
                    <span>Estudiante seleccionado: <strong>{formMatricula.estudiante}</strong></span>
                    <button type="button" onClick={resetStudentSelection} className="font-semibold hover:underline cursor-pointer">Cambiar</button>
                  </div>
                )}

                {isNewStudent && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="alumno@correo.com"
                    value={formMatricula.correo}
                    onChange={(e) => setFormMatricula({ ...formMatricula, correo: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#1E3A8A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Celular de Contacto
                  </label>
                  <input
                    type="tel"
                    placeholder="987654321"
                    value={formMatricula.celular}
                    onChange={(e) => setFormMatricula({ ...formMatricula, celular: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#1E3A8A]"
                  />
                </div>
                </div>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Programa Académico
                </label>
                <select
                  value={formMatricula.programa}
                  onChange={(e) => {
                    const sel = PROGRAMAS_ACADEMICOS.find((p) => p.nombre === e.target.value);
                    setFormMatricula({
                      ...formMatricula,
                      programa: e.target.value,
                      montoTotal: sel ? sel.costo : formMatricula.montoTotal,
                    });
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#1E3A8A] bg-white"
                >
                  {PROGRAMAS_ACADEMICOS.map((p) => (
                    <option key={p.nombre} value={p.nombre}>
                      {p.nombre} — (S/. {p.costo}.00)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Turno Asignado
                  </label>
                  <select
                    value={formMatricula.turno}
                    onChange={(e) => setFormMatricula({ ...formMatricula, turno: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#1E3A8A] bg-white"
                  >
                    <option value="Mañana (08:00 - 13:00)">Mañana (08:00 - 13:00)</option>
                    <option value="Tarde (14:00 - 19:00)">Tarde (14:00 - 19:00)</option>
                    <option value="Noche (19:00 - 22:00)">Noche (19:00 - 22:00)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Modalidad de Pago
                  </label>
                  <select
                    value={formMatricula.modalidadPago}
                    onChange={(e) => setFormMatricula({ ...formMatricula, modalidadPago: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#1E3A8A] bg-white"
                  >
                    <option value="Contado (Descuento 10%)">Contado (10% Dcto)</option>
                    <option value="Cuotas (2 cuotas)">En 2 Cuotas</option>
                    <option value="Cuotas (3 cuotas)">En 3 Cuotas</option>
                    <option value="Cuotas (4 cuotas)">En 4 Cuotas</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Costo Total del Ciclo
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">S/.</span>
                    <input
                      type="number"
                      value={formMatricula.montoTotal}
                      onChange={(e) => setFormMatricula({ ...formMatricula, montoTotal: Number(e.target.value) })}
                      className="w-full pl-9 pr-3 py-1.5 text-xs font-bold text-slate-800 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Abono Inicial en Matrícula
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">S/.</span>
                    <input
                      type="number"
                      value={formMatricula.primerAbono}
                      onChange={(e) => setFormMatricula({ ...formMatricula, primerAbono: Number(e.target.value) })}
                      className="w-full pl-9 pr-3 py-1.5 text-xs font-bold text-emerald-700 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalMatriculaOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-blue-800 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Completar Matrícula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REGISTRAR NUEVO PAGO */}
      {modalPagoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scale-up my-8">
            <div className="bg-emerald-700 text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-white/10 rounded-lg">
                  <CreditCard className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Registrar Nuevo Pago</h3>
                  <p className="text-xs text-emerald-100">Abono de pensión y emisión de comprobante</p>
                </div>
              </div>
              <button
                onClick={() => setModalPagoOpen(false)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarPago} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Matrícula / Estudiante *
                </label>
                <select
                  required
                  value={formPago.matriculaId}
                  onChange={(e) => {
                    const mat = matriculas.find((m) => m.id === e.target.value);
                    setFormPago({
                      ...formPago,
                      matriculaId: e.target.value,
                      monto: mat && mat.saldoPendiente > 0 ? Math.min(mat.saldoPendiente, 400) : formPago.monto,
                    });
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white"
                >
                  <option value="">-- Seleccionar Estudiante --</option>
                  {matriculas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.id} - {m.estudiante} (Saldo: S/. {m.saldoPendiente.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Monto a Abonar (S/.) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="Monto S/."
                    value={formPago.monto}
                    onChange={(e) => setFormPago({ ...formPago, monto: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold text-emerald-700 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Método de Pago
                  </label>
                  <select
                    value={formPago.metodo}
                    onChange={(e) => setFormPago({ ...formPago, metodo: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white"
                  >
                    <option value="Yape / Plin">Yape / Plin</option>
                    <option value="Transferencia BCP">Transferencia BCP</option>
                    <option value="Transferencia BBVA">Transferencia BBVA</option>
                    <option value="Tarjeta Débito/Crédito">Tarjeta Débito/Crédito</option>
                    <option value="Efectivo en Caja">Efectivo en Caja</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Concepto del Pago
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Cuota 2 - Pensión Febrero"
                  value={formPago.concepto}
                  onChange={(e) => setFormPago({ ...formPago, concepto: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    N° de Operación Bancaria / Voucher
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. OP-4892103"
                    value={formPago.operacion}
                    onChange={(e) => setFormPago({ ...formPago, operacion: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tipo de Comprobante
                  </label>
                  <select
                    value={formPago.comprobanteTipo}
                    onChange={(e) => setFormPago({ ...formPago, comprobanteTipo: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white"
                  >
                    <option value="Boleta de Venta Electrónica">Boleta de Venta Electrónica</option>
                    <option value="Factura Electrónica">Factura Electrónica</option>
                    <option value="Recibo de Caja Interno">Recibo de Caja Interno</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalPagoOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Registrar Cobro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: FICHA DE MATRÍCULA Y ESTADO DE CUENTA */}
      {fichaMatricula && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-scale-up my-8">
            <div className="bg-[#1E3A8A] text-white p-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-amber-300 font-bold uppercase">
                  Academia Pre - Expediente Digital
                </span>
                <h3 className="text-xl font-bold mt-0.5">Constancia y Ficha de Matrícula</h3>
                <p className="text-xs text-blue-200 mt-0.5">Registro oficial: {fichaMatricula.id}</p>
              </div>
              <button
                onClick={() => setFichaMatricula(null)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Datos del Alumno */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Estudiante</span>
                  <span className="font-bold text-slate-800">{fichaMatricula.estudiante}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">DNI</span>
                  <span className="font-semibold text-slate-700">{fichaMatricula.dni}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Celular</span>
                  <span className="text-slate-700">{fichaMatricula.celular}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Programa</span>
                  <span className="font-semibold text-[#1E3A8A]">{fichaMatricula.programa}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Turno</span>
                  <span className="text-slate-700">{fichaMatricula.turno}</span>
                </div>
              </div>

              {/* Estado de Cuenta */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  Resumen de Cuenta del Estudiante
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Costo Total</span>
                    <span className="text-base font-extrabold text-slate-800">
                      S/. {fichaMatricula.montoTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase block">Total Abonado</span>
                    <span className="text-base font-extrabold text-emerald-700">
                      S/. {fichaMatricula.montoPagado.toFixed(2)}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
                    <span className="text-[10px] font-bold text-amber-700 uppercase block">Saldo Pendiente</span>
                    <span className="text-base font-extrabold text-amber-700">
                      S/. {fichaMatricula.saldoPendiente.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pagos Realizados por este alumno */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Abonos y Comprobantes Asociados
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Comprobante</th>
                        <th className="p-2.5">Concepto</th>
                        <th className="p-2.5">Fecha</th>
                        <th className="p-2.5 text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pagos
                        .filter((p) => p.matriculaId === fichaMatricula.id)
                        .map((p) => (
                          <tr key={p.id}>
                            <td className="p-2.5 font-mono text-slate-700">{p.comprobante}</td>
                            <td className="p-2.5 text-slate-800">{p.concepto}</td>
                            <td className="p-2.5 text-slate-500 text-[11px]">{p.fecha}</td>
                            <td className="p-2.5 text-right font-bold text-emerald-600">
                              S/. {Number(p.monto).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      {pagos.filter((p) => p.matriculaId === fichaMatricula.id).length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-slate-400 text-xs">
                            No registra pagos aún.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Botones de Acción del Modal */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    showNotification("Comprobante enviado al correo del estudiante.");
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Enviar por Correo</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      window.print();
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600" />
                    <span>Imprimir Ficha</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFichaMatricula(null)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-blue-800 rounded-xl transition-colors cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: RECIBO / BOLETA ELECTRÓNICA */}
      {reciboPago && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-scale-up my-8">
            <div className="p-6 text-center border-b border-slate-100 space-y-1">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Check className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Comprobante Electrónico
              </span>
              <h3 className="text-xl font-extrabold text-slate-800">{reciboPago.comprobante}</h3>
              <p className="text-xs text-slate-500">Academia Preuniversitaria S.A.C. - RUC: 20608912345</p>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-2 border-b border-slate-100 pb-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Estudiante:</span>
                  <span className="font-bold text-slate-800 text-right">{reciboPago.estudiante}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Referencia Matrícula:</span>
                  <span className="font-mono text-[#1E3A8A] font-bold">{reciboPago.matriculaId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Concepto:</span>
                  <span className="text-slate-700 text-right font-medium">{reciboPago.concepto}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Método de Pago:</span>
                  <span className="text-slate-700">{reciboPago.metodo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">N° Operación:</span>
                  <span className="font-mono text-slate-800">{reciboPago.operacion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Fecha y Hora:</span>
                  <span className="text-slate-600">{reciboPago.fecha}</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-2 bg-emerald-50 px-3.5 rounded-xl border border-emerald-200">
                <span className="text-xs font-bold text-emerald-800 uppercase">Total Abonado:</span>
                <span className="text-xl font-extrabold text-emerald-700">
                  S/. {Number(reciboPago.monto).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-white transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir</span>
              </button>
              <button
                type="button"
                onClick={() => setReciboPago(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
