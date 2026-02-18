import { type ChangeEvent, useState } from 'react';
import adminPreguntaUploadService from '../services/adminPreguntaUploadService';

export default function AdminUploadCsvPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  return (
    <main>
      <h1>Subir preguntas CSV</h1>

      <form
        className="mb-3"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!selectedFile) {
            return;
          }

          setIsUploading(true);
          setSuccessMessage(null);
          setErrorMessage(null);

          try {
            const total = await adminPreguntaUploadService.uploadPreguntasCsv(selectedFile);
            setSuccessMessage(`Se importaron ${total} preguntas`);
          } catch {
            setErrorMessage('No se pudo importar el archivo');
          } finally {
            setIsUploading(false);
          }
        }}
      >
        <div className="mb-3">
          <label htmlFor="csv-file" className="form-label">Archivo CSV</label>
          <input
            id="csv-file"
            type="file"
            className="form-control"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={!selectedFile || isUploading}>
          {isUploading ? 'Subiendo...' : 'Subir'}
        </button>
      </form>

      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      <section>
        <h2>Formato CSV</h2>
        <p>Cabecera obligatoria y separador ;</p>
        <pre className="bg-light p-3 border rounded">
tipo;enunciado;tematica;explicacion;opciones;respuestasCorrectas
UNICA;Capital de Francia;Geografía;París es la capital;Madrid|París|Roma;1
MULTIPLE;Números primos;Matemática;Selecciona primos;2|3|4|5;0,1,3
VERDADERO_FALSO;La Tierra es plana;Ciencia;Es falsa;;false
        </pre>
      </section>
    </main>
  );
}