import { useEffect, useState } from "react";
import preguntaVFService, {
  type IPreguntaVF,
} from "../services/preguntaVFService";

const PreguntaVF = () => {
  const [preguntas, setPreguntas] = useState<IPreguntaVF[]>([]);
  const [cargando, setCargando] = useState(false);

  // Estado del formulario de creación
  const [enunciado, setEnunciado] = useState("");
  const [respuestaCorrecta, setRespuestaCorrecta] = useState(true);
  const [activa, setActiva] = useState(true);
  const [tematica, setTematica] = useState("");
  const [explicacion, setExplicacion] = useState("");
  const [creando, setCreando] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación
    if (!enunciado.trim()) {
      alert("El enunciado es obligatorio");
      return;
    }

    setCreando(true);
    try {
      await preguntaVFService.create({
        enunciado: enunciado.trim(),
        respuestaCorrecta,
        activa,
        tematica: tematica.trim() || null,
        explicacion: explicacion.trim() || null,
      });

      // Limpiar formulario
      setEnunciado("");
      setRespuestaCorrecta(true);
      setActiva(true);
      setTematica("");
      setExplicacion("");

      // Recargar lista
      cargarPreguntas();
    } catch (error) {
      console.error("Error creando pregunta", error);
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

      {/* Formulario de creación */}
      <section style={{ border: "1px solid #ccc", padding: "15px", marginBottom: "20px" }}>
        <h3>Crear Nueva Pregunta</h3>
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
              Activa al crear
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
            {creando ? "Creando..." : "Crear Pregunta"}
          </button>
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
            <br />
            <button onClick={() => cambiarEstado(p)}>
              {p.activa ? "Desactivar" : "Activar"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PreguntaVF;