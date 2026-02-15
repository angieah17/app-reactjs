import { useEffect, useState } from "react";
import preguntaUnicaService, {
  type IPreguntaUnica,
} from "../services/preguntaUnicaService";

const PAGE_SIZE_OPTIONS = [5, 10, 20];
const SORT_OPTIONS = [
  { value: "fechaCreacion,desc", label: "Más recientes" },
  { value: "fechaCreacion,asc", label: "Más antiguas" },
  { value: "enunciado,asc", label: "Enunciado A-Z" },
  { value: "enunciado,desc", label: "Enunciado Z-A" },
];

type EstadoFiltro = "TODAS" | "ACTIVAS" | "INACTIVAS";

const PreguntaUnica = () => {
  const [preguntas, setPreguntas] = useState<IPreguntaUnica[]>([]);
  const [cargando, setCargando] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [size, setSize] = useState(10);
  const [sort, setSort] = useState("fechaCreacion,desc");
  const [filtroTematica, setFiltroTematica] = useState("");
  const [filtroActiva, setFiltroActiva] = useState<EstadoFiltro>("TODAS");
  const [textoBusquedaInput, setTextoBusquedaInput] = useState("");
  const [textoBusqueda, setTextoBusqueda] = useState("");

  // Estado del formulario de creación/edición
  const [enunciado, setEnunciado] = useState("");
  const [opciones, setOpciones] = useState<string[]>(["", "", "", ""]);
  const [respuestaCorrecta, setRespuestaCorrecta] = useState(0);
  const [activa, setActiva] = useState(true);
  const [tematica, setTematica] = useState("");
  const [explicacion, setExplicacion] = useState("");
  const [creando, setCreando] = useState(false);

  // Estado para modo edición
  const [editingId, setEditingId] = useState<number | null>(null);

  // Estado para ver detalles
  const [detallesId, setDetallesId] = useState<number | null>(null);
  const [detallesPregunta, setDetallesPregunta] = useState<IPreguntaUnica | null>(null);
  const [cargandoDetalles, setCargandoDetalles] = useState(false);

  const mapFiltroActiva = () => {
    if (filtroActiva === "ACTIVAS") return true;
    if (filtroActiva === "INACTIVAS") return false;
    return undefined;
  };

  const cargarPreguntas = async (targetPage = page, targetSize = size, targetTextoBusqueda = textoBusqueda) => {
    setCargando(true);
    try {
      const filtros = {
        tematica: filtroTematica.trim() || undefined,
        activa: mapFiltroActiva(),
        sort,
      };

      const resp = targetTextoBusqueda.trim()
        ? await preguntaUnicaService.search(targetTextoBusqueda.trim(), targetPage, targetSize, filtros)
        : await preguntaUnicaService.getAll(targetPage, targetSize, filtros);

      setPreguntas(resp.content);
      setPage(typeof resp.number === "number" ? resp.number : targetPage);
      setTotalPages(typeof resp.totalPages === "number" ? resp.totalPages : 0);
    } catch (error) {
      console.error("Error cargando preguntas", error);
    } finally {
      setCargando(false);
    }
  };

  const cambiarEstado = async (p: IPreguntaUnica) => {
    if (!p.id) return;

    try {
      if (p.activa) {
        await preguntaUnicaService.desactivar(p.id);
      } else {
        await preguntaUnicaService.activar(p.id);
      }

      cargarPreguntas(page, size);
    } catch (error) {
      console.error("Error cambiando estado", error);
    }
  };

  const iniciarEdicion = (p: IPreguntaUnica) => {
    if (!p.id) return;

    setDetallesId(null);
    setDetallesPregunta(null);

    setEditingId(p.id);
    setEnunciado(p.enunciado);
    setOpciones([...p.opciones]);
    setRespuestaCorrecta(p.respuestaCorrecta);
    // No cargamos activa al editar, ya que se maneja con los botones
    setTematica(p.tematica);
    setExplicacion(p.explicacion || "");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelarEdicion = () => {
    setEditingId(null);
    limpiarFormulario();
  };

  const limpiarFormulario = () => {
    setEnunciado("");
    setOpciones(["", "", "", ""]);
    setRespuestaCorrecta(0);
    setActiva(true);
    setTematica("");
    setExplicacion("");
  };

  const verDetalles = (id: number | null) => {
    if (!id) return;
    setDetallesId(id);
  };

  const cerrarDetalles = () => {
    setDetallesId(null);
    setDetallesPregunta(null);
  };

  const actualizarOpcion = (index: number, valor: string) => {
    const nuevasOpciones = [...opciones];
    nuevasOpciones[index] = valor;
    setOpciones(nuevasOpciones);
  };

  const handleSubmit = async () => {

    // Validación
    if (!enunciado.trim()) {
      alert("El enunciado es obligatorio");
      return;
    }

    // Validar que todas las opciones estén completas
    if (opciones.some((op) => !op.trim())) {
      alert("Todas las opciones deben estar completadas");
      return;
    }

    // Validar que la respuesta correcta sea válida
    if (respuestaCorrecta < 0 || respuestaCorrecta >= opciones.length) {
      alert("El índice de respuesta correcta no es válido");
      return;
    }

    // Validar que la temática no esté vacía
    if (!tematica.trim()) {
      alert("La temática es obligatoria");
      return;
    }

    setCreando(true);
    try {
      const preguntaData = {
        enunciado: enunciado.trim(),
        opciones: opciones.map((op) => op.trim()),
        respuestaCorrecta,
        ...(editingId === null && { activa }), // Solo incluir activa al crear
        tematica: tematica.trim(),
        explicacion: explicacion.trim() || null,
      };

      console.log("Enviando datos:", preguntaData);

      if (editingId !== null) {
        await preguntaUnicaService.update(editingId, preguntaData);
        setEditingId(null);
      } else {
        await preguntaUnicaService.create(preguntaData);
      }

      limpiarFormulario();
      cargarPreguntas(page, size);
    } catch (error) {
      console.error("Error guardando pregunta", error);
      alert(`Error ${editingId !== null ? "actualizando" : "creando"} la pregunta`);
    } finally {
      setCreando(false);
    }
  };

  // Efecto para cargar detalles cuando cambia detallesId
  useEffect(() => {
    if (detallesId === null) {
      setDetallesPregunta(null);
      return;
    }

    const cargarDetalles = async () => {
      setCargandoDetalles(true);
      try {
        const pregunta = await preguntaUnicaService.getById(detallesId);
        console.log("Datos recibidos del backend:", pregunta);
        setDetallesPregunta(pregunta);
      } catch (error) {
        console.error("Error cargando detalles", error);
        alert("Error al cargar los detalles");
        setDetallesId(null);
      } finally {
        setCargandoDetalles(false);
      }
    };

    cargarDetalles();
  }, [detallesId]);

  useEffect(() => {
    cargarPreguntas(0, size);
  }, []);

  const aplicarFiltros = () => {
    setPage(0);
    cargarPreguntas(0, size);
  };

  const aplicarBusqueda = () => {
    const nextBusqueda = textoBusquedaInput;
    setTextoBusqueda(nextBusqueda);
    setPage(0);
    cargarPreguntas(0, size, nextBusqueda);
  };

  const limpiarBusqueda = () => {
    setTextoBusquedaInput("");
    setTextoBusqueda("");
    setPage(0);
    cargarPreguntas(0, size, "");
  };

  const isFirstPage = page <= 0;
  const hasData = preguntas.length > 0;
  const isLastPage = totalPages > 0 ? page >= totalPages - 1 : !hasData;

  return (
    <div>
      <h2>Preguntas de Opción Única</h2>

      {/* Formulario de creación/edición */}
      <section style={{ border: "1px solid #ccc", padding: "15px", marginBottom: "20px" }}>
        <h3>{editingId !== null ? "Editar Pregunta" : "Crear Nueva Pregunta"}</h3>
        {editingId !== null && (
          <p style={{ color: "#0066cc", fontWeight: "bold" }}>
            Editando pregunta ID: {editingId}
          </p>
        )}
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div style={{ marginBottom: "10px" }}>
            <label htmlFor="enunciado">
              <strong>Enunciado *</strong>
            </label>
            <br />
            <textarea
              id="enunciado"
              value={enunciado}
              onChange={(e) => setEnunciado(e.target.value)}
              placeholder="Escribe el enunciado de la pregunta"
              rows={3}
              style={{ width: "100%" }}
              required
            />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <strong>Opciones * (Edita todas las opciones)</strong>
            {opciones.map((opcion, index) => (
              <div key={index} style={{ marginTop: "5px" }}>
                <label htmlFor={`opcion-${index}`}>
                  Opción {index + 1}
                </label>
                <br />
                <input
                  id={`opcion-${index}`}
                  type="text"
                  value={opcion}
                  onChange={(e) => actualizarOpcion(index, e.target.value)}
                  placeholder={`Escribe la opción ${index + 1}`}
                  style={{ width: "100%" }}
                />
              </div>
            ))}
          </div>

          <div style={{ marginBottom: "10px" }}>
            <strong>Respuesta Correcta *</strong>
            <br />
            {opciones.map((opcion, index) => (
              <label key={index} style={{ display: "block", marginTop: "5px" }}>
                <input
                  type="radio"
                  name="respuestaCorrecta"
                  checked={respuestaCorrecta === index}
                  onChange={() => setRespuestaCorrecta(index)}
                />
                Opción {index + 1}
              </label>
            ))}
          </div>

          {editingId === null && (
            <div style={{ marginBottom: "10px" }}>
              <label>
                <input
                  type="checkbox"
                  checked={activa}
                  onChange={(e) => setActiva(e.target.checked)}
                />
                Activa al crear
              </label>
            </div>
          )}

          <div style={{ marginBottom: "10px" }}>
            <label htmlFor="tematica">
              <strong>Temática *</strong>
            </label>
            <br />
            <input
              type="text"
              id="tematica"
              value={tematica}
              onChange={(e) => setTematica(e.target.value)}
              placeholder="Ej: Programación, Historia, etc."
              style={{ width: "100%" }}
              required
              maxLength={100}
            />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label htmlFor="explicacion">Explicación (opcional)</label>
            <br />
            <textarea
              id="explicacion"
              value={explicacion}
              onChange={(e) => setExplicacion(e.target.value)}
              placeholder="Explica por qué esta es la respuesta correcta"
              rows={3}
              style={{ width: "100%" }}
            />
          </div>

          <button type="submit" disabled={creando}>
            {creando 
              ? (editingId !== null ? "Actualizando..." : "Creando...") 
              : (editingId !== null ? "Actualizar Pregunta" : "Crear Pregunta")
            }
          </button>
          
          {editingId !== null && (
            <button 
              type="button" 
              onClick={cancelarEdicion}
              style={{ marginLeft: "10px" }}
              disabled={creando}
            >
              Cancelar
            </button>
          )}
        </form>
      </section>

      {/* Lista de preguntas */}
      <section style={{ border: "1px solid #ccc", padding: "15px", marginBottom: "10px" }}>
        <h3>Filtros de listado</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "10px" }}>
          <input
            type="text"
            value={filtroTematica}
            onChange={(e) => setFiltroTematica(e.target.value)}
            placeholder="Filtrar por temática"
          />
          <select
            value={filtroActiva}
            onChange={(e) => setFiltroActiva(e.target.value as EstadoFiltro)}
          >
            <option value="TODAS">Todas</option>
            <option value="ACTIVAS">Activas</option>
            <option value="INACTIVAS">Inactivas</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select
            value={size}
            onChange={(e) => {
              const nextSize = Number(e.target.value);
              setSize(nextSize);
              setPage(0);
              cargarPreguntas(0, nextSize);
            }}
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>{option} por página</option>
            ))}
          </select>
          <button type="button" onClick={aplicarFiltros}>Aplicar filtros</button>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            type="text"
            value={textoBusquedaInput}
            onChange={(e) => setTextoBusquedaInput(e.target.value)}
            placeholder="Buscar texto en preguntas"
          />
          <button type="button" onClick={aplicarBusqueda}>Buscar</button>
          <button type="button" onClick={limpiarBusqueda}>Limpiar búsqueda</button>
          <button type="button" onClick={() => cargarPreguntas(page, size)}>Recargar</button>
        </div>
      </section>

      {cargando && <p>Cargando...</p>}

      <ul>
        {preguntas.map((p) => (
          <li key={p.id}>
            <strong>{p.enunciado}</strong>
            <br />
            Opciones: {p.opciones.length}
            <br />
            Respuesta correcta: Opción {p.respuestaCorrecta + 1} ({p.opciones[p.respuestaCorrecta]})
            <br />
            Estado: {p.activa ? "Activa" : "Inactiva"}
            {p.tematica && (
              <>
                <br />
                Temática: {p.tematica}
              </>
            )}
            <br />
            <button onClick={() => cambiarEstado(p)}>
              {p.activa ? "Desactivar" : "Activar"}
            </button>
            <button 
              onClick={() => iniciarEdicion(p)}
              style={{ marginLeft: "10px" }}
            >
              Editar
            </button>
            <button 
              onClick={() => verDetalles(p.id)}
              style={{ marginLeft: "10px" }}
            >
              Ver Detalles
            </button>
          </li>
        ))}
      </ul>

      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "10px" }}>
        <button
          type="button"
          onClick={() => cargarPreguntas(page - 1, size)}
          disabled={cargando || isFirstPage}
        >
          Anterior
        </button>
        <span>
          Página {page + 1}
          {totalPages > 0 ? ` de ${totalPages}` : ""}
        </span>
        <button
          type="button"
          onClick={() => cargarPreguntas(page + 1, size)}
          disabled={cargando || isLastPage}
        >
          Siguiente
        </button>
      </div>

      {/* Modal de detalles */}
      {detallesId !== null && detallesPregunta && (
        <div style={modalStyles.overlay} onClick={cerrarDetalles}>
          <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={modalStyles.header}>
              <h2>Detalles de la Pregunta (ID: {detallesPregunta.id})</h2>
              <button 
                onClick={cerrarDetalles}
                style={modalStyles.closeButton}
                type="button"
              >
                ✕
              </button>
            </div>

            {cargandoDetalles ? (
              <div style={modalStyles.content}>
                <p>Cargando...</p>
              </div>
            ) : (
              <div style={modalStyles.content}>
                <div style={{ marginBottom: "15px" }}>
                  <strong>Enunciado:</strong>
                  <p>{detallesPregunta.enunciado}</p>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <strong>Opciones:</strong>
                  <ol>
                    {Array.isArray(detallesPregunta.opciones) && detallesPregunta.opciones.map((opcion, index) => (
                      <li 
                        key={`${detallesPregunta.id}-opt-${index}`}
                        style={{
                          color: index === detallesPregunta.respuestaCorrecta ? "#0066cc" : "inherit",
                          fontWeight: index === detallesPregunta.respuestaCorrecta ? "bold" : "normal",
                          backgroundColor: index === detallesPregunta.respuestaCorrecta ? "#f0f8ff" : "transparent",
                          padding: "5px",
                          marginBottom: "5px"
                        }}
                      >
                        {opcion}
                        {index === detallesPregunta.respuestaCorrecta && " ✓"}
                      </li>
                    ))}
                  </ol>
                </div>

                {detallesPregunta.explicacion ? (
                  <div style={{ marginBottom: "15px", backgroundColor: "#f0f8ff", padding: "10px", borderRadius: "5px" }}>
                    <strong style={{ color: "#0066cc" }}>Explicación:</strong>
                    <p>{detallesPregunta.explicacion}</p>
                  </div>
                ) : (
                  <div style={{ marginBottom: "15px", backgroundColor: "#f5f5f5", padding: "10px", borderRadius: "5px" }}>
                    <em>Sin explicación disponible</em>
                  </div>
                )}
              </div>
            )}

            <div style={modalStyles.footer}>
              <button onClick={cerrarDetalles}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Estilos para el modal
const modalStyles = {
  overlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    maxWidth: "600px",
    width: "90%",
    maxHeight: "80vh",
    overflow: "auto",
  },
  header: {
    display: "flex" as const,
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px",
    borderBottom: "1px solid #ddd",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#999",
  },
  content: {
    padding: "15px",
  },
  footer: {
    display: "flex" as const,
    justifyContent: "flex-end",
    gap: "10px",
    padding: "15px",
    borderTop: "1px solid #ddd",
  },
};

export default PreguntaUnica;