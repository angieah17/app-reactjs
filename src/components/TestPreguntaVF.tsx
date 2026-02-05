import { useEffect } from "react";
import preguntaVFService from "../services/preguntaVFService";

const TestPreguntaVF = () => {
  useEffect(() => {
    const test = async () => {
      const page = await preguntaVFService.getAll();
      console.log("GET ALL:", page);

      const pregunta = await preguntaVFService.getById(1);
      console.log("GET BY ID:", pregunta);
    };

    test();
  }, []);

  return <div>Probando servicio Pregunta VF (mira la consola)</div>;
};

export default TestPreguntaVF;