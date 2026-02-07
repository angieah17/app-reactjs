import { useEffect, useState } from "react";
import preguntaVFService, {
  type IPreguntaVF,
} from "../services/preguntaVFService";

const PreguntaVF = () => {
  const [preguntas, setPreguntas] = useState<IPreguntaVF[]>([]);
  const [cargando, setCargando] = useState(false);

  // Estado del formulario de creación/edición
  const [enunciado, setEnunciado] = useState("");
  const [respuestaCorrecta, setRespuestaCorrecta] = useState(true);
  const [activa, setActiva] = useState(true);
  const [tematica, setTematica] = useState("");
  const [explicacion, setExplicacion] = useState("");
  const [creando, setCreando] = useState(false);

  // Estado para modo edición
  const [editingId, setEditingId] = useState<number | null>(null);

  // Estado para ver detalles
  const [detallesPregunta, setDetallesPregunta] = useState<IPreguntaVF | null>(null);
  const [cargandoDetalles, setCargandoDetalles] = useState(false);

  const cargarPreguntas = async () => {
    setCargando(true);
    try {
      const resp = await preguntaVFService.getAll(0, 10);
      setPreguntas(resp.content);
    } catch (error) {
      console.error("Error cargando preguntas", error);
    } finally {
      setCargando(false);
    }
  };

  const cambiarEstado = async (p: IPreguntaVF) => {
    if (!p.id) return;

    try {
      if (p.activa) {
        await preguntaVFService.desactivar(p.id);
      } else {
        await preguntaVFService.activar(p.id);
      }

      cargarPreguntas(); // refrescamos la lista
    } catch (error) {
      console.error("Error cambiando estado", error);
    }
  };

  const iniciarEdicion = (p: IPreguntaVF) => {
    if (!p.id) return;

    // Cerrar modal de detalles si está abierto
    setDetallesPregunta(null);

    // Cargar datos de la pregunta en el formulario
    setEditingId(p.id);
    setEnunciado(p.enunciado);
    setRespuestaCorrecta(p.respuestaCorrecta);
    setActiva(p.activa ?? true);
    setTematica(p.tematica || "");
    setExplicacion(p.explicacion || "");

    // Scroll al formulario
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelarEdicion = () => {
    setEditingId(null);
    limpiarFormulario();
  };

  const limpiarFormulario = () => {
    setEnunciado("");
    setRespuestaCorrecta(true);
    setActiva(true);
    setTematica("");
    setExplicacion("");
  };

  const verDetalles = async (id: number | null) => {
    if (!id) return;

    setCargandoDetalles(true);
    try {
      const pregunta = await preguntaVFService.getById(id);
      setDetallesPregunta(pregunta);
    } catch (error) {
      console.error("Error cargando detalles de la pregunta", error);
      alert("Error al cargar los detalles de la pregunta");
    } finally {
      setCargandoDetalles(false);
    }
  };

  const cerrarDetalles = () => {
    setDetallesPregunta(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación
    if (!enunciado.trim()) {
      alert("El enunciado es obligatorio");
      return;
    }

    setCreando(true);
    try {
      const preguntaData = {
        enunciado: enunciado.trim(),
        respuestaCorrecta,
        activa,
        tematica: tematica.trim() || null,
        explicacion: explicacion.trim() || null,
      };

      if (editingId !== null) {
        // Modo edición
        await preguntaVFService.update(editingId, preguntaData);
        setEditingId(null);
      } else {
        // Modo creación
        await preguntaVFService.create(preguntaData);
      }

      // Limpiar formulario
      limpiarFormulario();

      // Recargar lista
      cargarPreguntas();
    } catch (error) {
      console.error("Error guardando pregunta", error);
      alert(`Error ${editingId !== null ? "actualizando" : "creando"} la pregunta`);
    } finally {
      setCreando(false);
    }
  };

  //Se ejecuta una sola vez, justo después de que el componente aparece en pantalla
  useEffect(() => {
    cargarPreguntas();
  }, []);

  return (
    <div>
      <h2>Preguntas Verdadero / Falso</h2>

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
            <strong>Respuesta Correcta *</strong>
            <br />
            <label>
              <input
                type="radio"
                name="respuestaCorrecta"
                checked={respuestaCorrecta === true}
                onChange={() => setRespuestaCorrecta(true)}
              />
              Verdadero
            </label>
            <label style={{ marginLeft: "15px" }}>
              <input
                type="radio"
                name="respuestaCorrecta"
                checked={respuestaCorrecta === false}
                onChange={() => setRespuestaCorrecta(false)}
              />
              Falso
            </label>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label>
              <input
                type="checkbox"
                checked={activa}
                onChange={(e) => setActiva(e.target.checked)}
              />
              {editingId !== null ? "Activa" : "Activa al crear"}
            </label>
          </div>

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
      <button onClick={cargarPreguntas}>Recargar preguntas</button>

      {cargando && <p>Cargando...</p>}

      <ul>
        {preguntas.map((p) => (
          <li key={p.id}>
            <strong>{p.enunciado}</strong>
            <br />
            Respuesta correcta: {p.respuestaCorrecta ? "Verdadero" : "Falso"}
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
      {detallesPregunta && (
        <div style={modalStyles.overlay} onClick={cerrarDetalles}>
          <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={modalStyles.header}>
              <h2>Detalles de la Pregunta</h2>
              <button 
                onClick={cerrarDetalles}
                style={modalStyles.closeButton}
                type="button"
              >
                ✕
              </button>
            </div>

            {cargandoDetalles ? (
              <p style={{ padding: "15px" }}>Cargando...</p>
            ) : (
              <div style={modalStyles.content}>
                <div style={{ marginBottom: "15px" }}>
                  <strong>Enunciado:</strong>
                  <p>{detallesPregunta.enunciado}</p>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <strong>Respuesta Correcta:</strong>
                  <p style={{ color: "#0066cc", fontWeight: "bold" }}>
                    {detallesPregunta.respuestaCorrecta ? "Verdadero" : "Falso"}
                  </p>
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
              <button 
                onClick={cerrarDetalles}
              >
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

export default PreguntaVF;