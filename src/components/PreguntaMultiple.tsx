import { useEffect, useState } from "react";
import preguntaMultipleService, {
  type IPreguntaMultiple,
} from "../services/PreguntaMultipleService";

const PreguntaMultiple = () => {
  const [preguntas, setPreguntas] = useState<IPreguntaMultiple[]>([]);
  const [cargando, setCargando] = useState(false);

  // Estado del formulario de creación/edición
  const [enunciado, setEnunciado] = useState("");
  const [opciones, setOpciones] = useState<string[]>(["", "", "", ""]);
  const [respuestasCorrectas, setRespuestasCorrectas] = useState<number[]>([]);
  const [activa, setActiva] = useState(true);
  const [tematica, setTematica] = useState("");
  const [explicacion, setExplicacion] = useState("");
  const [creando, setCreando] = useState(false);

  // Estado para modo edición
  const [editingId, setEditingId] = useState<number | null>(null);

  // Estado para ver detalles
  const [detallesId, setDetallesId] = useState<number | null>(null);
  const [detallesPregunta, setDetallesPregunta] = useState<IPreguntaMultiple | null>(null);
  const [cargandoDetalles, setCargandoDetalles] = useState(false);

  const cargarPreguntas = async () => {
    setCargando(true);
    try {
      const resp = await preguntaMultipleService.getAll(0, 10);
      setPreguntas(resp.content);
    } catch (error) {
      console.error("Error cargando preguntas", error);
    } finally {
      setCargando(false);
    }
  };

  const cambiarEstado = async (p: IPreguntaMultiple) => {
    if (!p.id) return;

    try {
      if (p.activa) {
        await preguntaMultipleService.desactivar(p.id);
      } else {
        await preguntaMultipleService.activar(p.id);
      }

      cargarPreguntas();
    } catch (error) {
      console.error("Error cambiando estado", error);
    }
  };

  const iniciarEdicion = (p: IPreguntaMultiple) => {
    if (!p.id) return;

    setDetallesId(null);
    setDetallesPregunta(null);

    setEditingId(p.id);
    setEnunciado(p.enunciado);
    setOpciones([...p.opciones]);
    setRespuestasCorrectas([...p.respuestasCorrectas]);
    setTematica(p.tematica || "");
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
    setRespuestasCorrectas([]);
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

  const toggleRespuestaCorrecta = (index: number) => {
    if (respuestasCorrectas.includes(index)) {
      setRespuestasCorrectas(respuestasCorrectas.filter(i => i !== index));
    } else {
      setRespuestasCorrectas([...respuestasCorrectas, index].sort((a, b) => a - b));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    // Validar que haya al menos una respuesta correcta
    if (respuestasCorrectas.length === 0) {
      alert("Debes seleccionar al menos una respuesta correcta");
      return;
    }

    // Validar que los índices de respuestas correctas sean válidos
    if (respuestasCorrectas.some(idx => idx < 0 || idx >= opciones.length)) {
      alert("Algunos índices de respuestas correctas no son válidos");
      return;
    }

    setCreando(true);
    try {
      const preguntaData = {
        enunciado: enunciado.trim(),
        opciones: opciones.map((op) => op.trim()),
        respuestasCorrectas,
        ...(editingId === null && { activa }), // Solo incluir activa al crear
        tematica: tematica.trim() || null,
        explicacion: explicacion.trim() || null,
      };

      console.log("Enviando datos:", preguntaData);

      if (editingId !== null) {
        await preguntaMultipleService.update(editingId, preguntaData);
        setEditingId(null);
      } else {
        await preguntaMultipleService.create(preguntaData);
      }

      limpiarFormulario();
      cargarPreguntas();
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
        const pregunta = await preguntaMultipleService.getById(detallesId);
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
    cargarPreguntas();
  }, []);

  return (
    <div>
      <h2>Preguntas de Opción Múltiple</h2>

      {/* Formulario de creación/edición */}
      <section style={{ border: "1px solid #ccc", padding: "15px", marginBottom: "20px" }}>
        <h3>{editingId !== null ? "Editar Pregunta" : "Crear Nueva Pregunta"}</h3>
        {editingId !== null && (
          <p style={{ color: "#0066cc", fontWeight: "bold" }}>
            Editando pregunta ID: {editingId}
          </p>
        )}
        <form onSubmit={handleSubmit}>
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
            <strong>Respuestas Correctas * (Selecciona una o más)</strong>
            <br />
            {opciones.map((opcion, index) => (
              <label key={index} style={{ display: "block", marginTop: "5px" }}>
                <input
                  type="checkbox"
                  checked={respuestasCorrectas.includes(index)}
                  onChange={() => toggleRespuestaCorrecta(index)}
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
            <label htmlFor="tematica">Temática (opcional)</label>
            <br />
            <input
              type="text"
              id="tematica"
              value={tematica}
              onChange={(e) => setTematica(e.target.value)}
              placeholder="Ej: Programación, Historia, etc."
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label htmlFor="explicacion">Explicación (opcional)</label>
            <br />
            <textarea
              id="explicacion"
              value={explicacion}
              onChange={(e) => setExplicacion(e.target.value)}
              placeholder="Explica por qué estas son las respuestas correctas"
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
      <button onClick={cargarPreguntas}>Recargar preguntas</button>

      {cargando && <p>Cargando...</p>}

      <ul>
        {preguntas.map((p) => (
          <li key={p.id}>
            <strong>{p.enunciado}</strong>
            <br />
            Opciones: {p.opciones.length}
            <br />
            Respuestas correctas: {p.respuestasCorrectas.map(idx => `Opción ${idx + 1} (${p.opciones[idx]})`).join(", ")}
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
                          color: detallesPregunta.respuestasCorrectas.includes(index) ? "#0066cc" : "inherit",
                          fontWeight: detallesPregunta.respuestasCorrectas.includes(index) ? "bold" : "normal",
                          backgroundColor: detallesPregunta.respuestasCorrectas.includes(index) ? "#f0f8ff" : "transparent",
                          padding: "5px",
                          marginBottom: "5px"
                        }}
                      >
                        {opcion}
                        {detallesPregunta.respuestasCorrectas.includes(index) && " ✓"}
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

export default PreguntaMultiple;