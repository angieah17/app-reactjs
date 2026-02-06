import { useEffect, useState } from "react";
import type { PreguntaVF } from "../services/preguntaVFService";
import preguntaVFService from "../services/preguntaVFService";


const PreguntaVF = () => {
  const [preguntas, setPreguntas] = useState<PreguntaVF[]>([]);
  const [cargando, setCargando] = useState(false);

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

  // De momento NO cargamos automáticamente
  // useEffect(() => {
  //   cargarPreguntas();
  // }, []);

  return (
    <div>
      <h2>Preguntas Verdadero / Falso</h2>

      <button onClick={cargarPreguntas}>
        Cargar preguntas
      </button>

      {cargando && <p>Cargando...</p>}

      <ul>
        {preguntas.map((p) => (
          <li key={p.id}>
            <strong>{p.enunciado}</strong>
            <br />
            Respuesta correcta: {p.respuestaCorrecta ? "Verdadero" : "Falso"}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PreguntaVF;
