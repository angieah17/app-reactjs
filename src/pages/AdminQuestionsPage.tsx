import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import adminPreguntaService, {
  type AdminCreatePayload,
  type AdminListFilters,
  type AdminPregunta,
  type AdminPagedResponse,
  type TipoPreguntaAdmin,
} from '../services/adminPreguntaService';
import { getBackendErrorMessage } from '../services/apiClient';

type EstadoFiltroUI = 'TODAS' | 'ACTIVAS' | 'INACTIVAS';
type FormMode = 'create' | 'edit';

interface FiltersState {
  tematica: string;
  tipo: '' | TipoPreguntaAdmin;
  activa: EstadoFiltroUI;
  texto: string;
}

interface FormState {
  tipoPregunta: TipoPreguntaAdmin;
  enunciado: string;
  tematica: string;
  explicacion: string;
  activa: boolean;
  respuestaCorrectaVF: boolean;
  opciones: string[];
  respuestaCorrectaUnica: number;
  respuestasCorrectasMultiple: number[];
}

const PAGE_SIZE_OPTIONS = [5, 10, 20];
const SORT_OPTIONS = [
  { value: 'fechaCreacion,desc', label: 'Más recientes' },
  { value: 'fechaCreacion,asc', label: 'Más antiguas' },
  { value: 'enunciado,asc', label: 'Enunciado A-Z' },
  { value: 'enunciado,desc', label: 'Enunciado Z-A' },
];

function createInitialFormState(): FormState {
  return {
    tipoPregunta: 'VERDADERO_FALSO',
    enunciado: '',
    tematica: '',
    explicacion: '',
    activa: true,
    respuestaCorrectaVF: true,
    opciones: ['', '', ''],
    respuestaCorrectaUnica: 0,
    respuestasCorrectasMultiple: [],
  };
}

function mapEstadoToActiva(estado: EstadoFiltroUI): boolean | undefined {
  if (estado === 'ACTIVAS') return true;
  if (estado === 'INACTIVAS') return false;
  return undefined;
}

function normalizeOpciones(opciones?: string[]): string[] {
  if (!opciones || opciones.length === 0) {
    return ['', '', ''];
  }

  const trimmed = opciones.map((item) => item ?? '');
  return trimmed.length >= 3 ? trimmed : [...trimmed, ...Array.from({ length: 3 - trimmed.length }, () => '')];
}

export default function AdminQuestionsPage() {
  const [filters, setFilters] = useState<FiltersState>({
    tematica: '',
    tipo: '',
    activa: 'TODAS',
    texto: '',
  });
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sort, setSort] = useState('fechaCreacion,desc');

  const [data, setData] = useState<AdminPagedResponse<AdminPregunta>>({
    content: [],
    totalPages: 0,
    totalElements: 0,
    number: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [formMode, setFormMode] = useState<FormMode>('create');
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [formState, setFormState] = useState<FormState>(createInitialFormState());
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const totalPages = data.totalPages ?? 0;
  const totalElements = data.totalElements ?? 0;
  const currentPage = typeof data.number === 'number' ? data.number : page;
  const isFirstPage = currentPage <= 0;
  const isLastPage = totalPages > 0 ? currentPage >= totalPages - 1 : data.content.length === 0;

  const commonFilters = useMemo<AdminListFilters>(() => ({
    tematica: filters.tematica.trim() || undefined,
    tipo: filters.tipo || undefined,
    activa: mapEstadoToActiva(filters.activa),
  }), [filters.tematica, filters.tipo, filters.activa]);

  const loadQuestions = async (targetPage = page, targetSize = size) => {
    setLoading(true);
    setError(null);

    try {
      const queryText = filters.texto.trim();
      const response = queryText
        ? await adminPreguntaService.searchQuestions(queryText, commonFilters, targetPage, targetSize, sort)
        : await adminPreguntaService.listQuestions(commonFilters, targetPage, targetSize, sort);

      setData({
        content: response.content ?? [],
        totalPages: response.totalPages ?? 0,
        totalElements: response.totalElements ?? 0,
        number: typeof response.number === 'number' ? response.number : targetPage,
      });
      setPage(typeof response.number === 'number' ? response.number : targetPage);
    } catch (loadError) {
      setError(getBackendErrorMessage(loadError, 'No se pudieron cargar las preguntas de administración.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadQuestions(0, size);
  }, []);

  const clearForm = () => {
    setFormState(createInitialFormState());
    setFormError(null);
  };

  const backToCreateMode = () => {
    setFormMode('create');
    setEditingQuestionId(null);
    clearForm();
  };

  const setOptionValue = (index: number, value: string) => {
    setFormState((current) => {
      const nextOptions = [...current.opciones];
      nextOptions[index] = value;
      return { ...current, opciones: nextOptions };
    });
  };

  const toggleCorrectAnswerMultiple = (index: number) => {
    setFormState((current) => {
      const exists = current.respuestasCorrectasMultiple.includes(index);
      const next = exists
        ? current.respuestasCorrectasMultiple.filter((item) => item !== index)
        : [...current.respuestasCorrectasMultiple, index].sort((a, b) => a - b);
      return { ...current, respuestasCorrectasMultiple: next };
    });
  };

  const addOption = () => {
    setFormState((current) => ({ ...current, opciones: [...current.opciones, ''] }));
  };

  const removeLastOption = () => {
    setFormState((current) => {
      if (current.opciones.length <= 3) {
        return current;
      }

      const nextOptions = current.opciones.slice(0, -1);
      const lastIndex = current.opciones.length - 1;
      return {
        ...current,
        opciones: nextOptions,
        respuestaCorrectaUnica: Math.min(current.respuestaCorrectaUnica, nextOptions.length - 1),
        respuestasCorrectasMultiple: current.respuestasCorrectasMultiple.filter((idx) => idx !== lastIndex),
      };
    });
  };

  const validateForm = (): string | null => {
    if (!formState.enunciado.trim()) {
      return 'El enunciado es obligatorio.';
    }
    if (!formState.tematica.trim()) {
      return 'La temática es obligatoria.';
    }

    if (formState.tipoPregunta === 'UNICA' || formState.tipoPregunta === 'MULTIPLE') {
      const cleanedOptions = formState.opciones.map((item) => item.trim());
      if (cleanedOptions.length < 3) {
        return 'UNICA y MULTIPLE requieren mínimo 3 opciones.';
      }
      if (cleanedOptions.some((item) => item.length === 0)) {
        return 'Todas las opciones deben tener contenido.';
      }

      if (formState.tipoPregunta === 'UNICA') {
        if (formState.respuestaCorrectaUnica < 0 || formState.respuestaCorrectaUnica >= cleanedOptions.length) {
          return 'El índice de respuesta correcta en UNICA es inválido.';
        }
      }

      if (formState.tipoPregunta === 'MULTIPLE') {
        if (formState.respuestasCorrectasMultiple.length === 0) {
          return 'Debe seleccionar al menos una respuesta correcta en MULTIPLE.';
        }
        const hasInvalid = formState.respuestasCorrectasMultiple.some((idx) => idx < 0 || idx >= cleanedOptions.length);
        if (hasInvalid) {
          return 'Existen índices de respuestas correctas fuera de rango.';
        }
      }
    }

    return null;
  };

  const buildPayload = (): { tipo: TipoPreguntaAdmin; payload: AdminCreatePayload } => {
    const base = {
      enunciado: formState.enunciado.trim(),
      tematica: formState.tematica.trim(),
      explicacion: formState.explicacion.trim() || null,
    };

    const withActiva = formMode === 'create'
      ? { ...base, activa: formState.activa }
      : base;

    if (formState.tipoPregunta === 'VERDADERO_FALSO') {
      return {
        tipo: 'VERDADERO_FALSO',
        payload: {
          ...withActiva,
          respuestaCorrecta: formState.respuestaCorrectaVF,
        },
      };
    }

    if (formState.tipoPregunta === 'UNICA') {
      return {
        tipo: 'UNICA',
        payload: {
          ...withActiva,
          opciones: formState.opciones.map((item) => item.trim()),
          respuestaCorrecta: formState.respuestaCorrectaUnica,
        },
      };
    }

    return {
      tipo: 'MULTIPLE',
      payload: {
        ...withActiva,
        opciones: formState.opciones.map((item) => item.trim()),
        respuestasCorrectas: [...formState.respuestasCorrectasMultiple].sort((a, b) => a - b),
      },
    };
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setFeedback(null);

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const { tipo, payload } = buildPayload();

    setSubmitting(true);
    try {
      if (formMode === 'edit' && editingQuestionId !== null) {
        await adminPreguntaService.updateQuestion(tipo, editingQuestionId, payload);
        setFeedback('Pregunta actualizada correctamente.');
      } else {
        await adminPreguntaService.createQuestion(tipo, payload);
        setFeedback('Pregunta creada correctamente.');
      }

      backToCreateMode();
      await loadQuestions(0, size);
    } catch (submitError) {
      setFormError(getBackendErrorMessage(submitError, 'No se pudo guardar la pregunta.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (id: number) => {
    setFeedback(null);
    setFormError(null);

    try {
      const question = await adminPreguntaService.getQuestionById(id);
      const normalizedOptions = normalizeOpciones(question.opciones);
      setFormMode('edit');
      setEditingQuestionId(id);
      setFormState({
        tipoPregunta: question.tipoPregunta,
        enunciado: question.enunciado ?? '',
        tematica: question.tematica ?? '',
        explicacion: question.explicacion ?? '',
        activa: question.activa ?? true,
        respuestaCorrectaVF: typeof question.respuestaCorrecta === 'boolean' ? question.respuestaCorrecta : true,
        opciones: normalizedOptions,
        respuestaCorrectaUnica: typeof question.respuestaCorrecta === 'number' ? question.respuestaCorrecta : 0,
        respuestasCorrectasMultiple: question.respuestasCorrectas ? [...question.respuestasCorrectas] : [],
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (editError) {
      setError(getBackendErrorMessage(editError, 'No se pudo cargar la pregunta para edición.'));
    }
  };

  const handleToggle = async (question: AdminPregunta) => {
    if (!question.id) return;

    const nextAction = question.activa ? 'desactivar' : 'activar';
    const confirmed = window.confirm(`¿Confirmas ${nextAction} esta pregunta?`);
    if (!confirmed) {
      return;
    }

    setFeedback(null);
    setError(null);
    try {
      await adminPreguntaService.toggleQuestion(question.id, Boolean(question.activa));
      setFeedback(`Pregunta ${nextAction}da correctamente.`);
      await loadQuestions(currentPage, size);
    } catch (toggleError) {
      setError(getBackendErrorMessage(toggleError, `No se pudo ${nextAction} la pregunta.`));
    }
  };

  const applyFilters = async () => {
    setFeedback(null);
    setPage(0);
    await loadQuestions(0, size);
  };

  const resetFilters = async () => {
    setFilters({ tematica: '', tipo: '', activa: 'TODAS', texto: '' });
    setSort('fechaCreacion,desc');
    setPage(0);
    await loadQuestions(0, size);
  };

  const goToPage = async (nextPage: number) => {
    await loadQuestions(nextPage, size);
  };

  return (
    <section style={{ padding: '1rem' }}>
      <h1>Administración de preguntas</h1>

      <section style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem' }}>
        <h2 style={{ marginTop: 0 }}>{formMode === 'edit' ? 'Actualizar pregunta' : 'Crear nueva pregunta'}</h2>

        {formMode === 'edit' && editingQuestionId !== null && (
          <p style={{ marginTop: 0 }}>Editando pregunta ID: {editingQuestionId}</p>
        )}

        {formError && <p style={{ color: '#b00020' }}>{formError}</p>}
        {feedback && <p style={{ color: '#006600' }}>{feedback}</p>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '0.75rem' }}>
            <label htmlFor="tipoPregunta"><strong>Tipo *</strong></label>
            <br />
            <select
              id="tipoPregunta"
              value={formState.tipoPregunta}
              onChange={(event) => setFormState((current) => ({ ...current, tipoPregunta: event.target.value as TipoPreguntaAdmin }))}
              disabled={formMode === 'edit'}
            >
              <option value="VERDADERO_FALSO">VERDADERO_FALSO</option>
              <option value="UNICA">UNICA</option>
              <option value="MULTIPLE">MULTIPLE</option>
            </select>
            {formMode === 'edit' && <small style={{ marginLeft: '0.5rem' }}>El tipo no se cambia durante la edición.</small>}
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label htmlFor="enunciado"><strong>Enunciado *</strong></label>
            <br />
            <textarea
              id="enunciado"
              value={formState.enunciado}
              onChange={(event) => setFormState((current) => ({ ...current, enunciado: event.target.value }))}
              rows={3}
              style={{ width: '100%' }}
              required
            />
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label htmlFor="tematica"><strong>Temática *</strong></label>
            <br />
            <input
              id="tematica"
              type="text"
              value={formState.tematica}
              onChange={(event) => setFormState((current) => ({ ...current, tematica: event.target.value }))}
              style={{ width: '100%' }}
              required
            />
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label htmlFor="explicacion">Explicación</label>
            <br />
            <textarea
              id="explicacion"
              value={formState.explicacion}
              onChange={(event) => setFormState((current) => ({ ...current, explicacion: event.target.value }))}
              rows={2}
              style={{ width: '100%' }}
            />
          </div>

          {formMode === 'create' && (
            <div style={{ marginBottom: '0.75rem' }}>
              <label>
                <input
                  type="checkbox"
                  checked={formState.activa}
                  onChange={(event) => setFormState((current) => ({ ...current, activa: event.target.checked }))}
                />
                {' '}Activa
              </label>
            </div>
          )}

          {formState.tipoPregunta === 'VERDADERO_FALSO' && (
            <div style={{ marginBottom: '0.75rem' }}>
              <strong>Respuesta correcta *</strong>
              <br />
              <label>
                <input
                  type="radio"
                  name="respuesta-vf"
                  checked={formState.respuestaCorrectaVF}
                  onChange={() => setFormState((current) => ({ ...current, respuestaCorrectaVF: true }))}
                />
                {' '}Verdadero
              </label>
              <label style={{ marginLeft: '1rem' }}>
                <input
                  type="radio"
                  name="respuesta-vf"
                  checked={!formState.respuestaCorrectaVF}
                  onChange={() => setFormState((current) => ({ ...current, respuestaCorrectaVF: false }))}
                />
                {' '}Falso
              </label>
            </div>
          )}

          {(formState.tipoPregunta === 'UNICA' || formState.tipoPregunta === 'MULTIPLE') && (
            <div style={{ marginBottom: '0.75rem' }}>
              <strong>Opciones *</strong>
              {formState.opciones.map((option, index) => (
                <div key={index} style={{ marginTop: '0.5rem' }}>
                  <input
                    type="text"
                    value={option}
                    onChange={(event) => setOptionValue(index, event.target.value)}
                    placeholder={`Opción ${index + 1}`}
                    style={{ width: '100%' }}
                  />
                </div>
              ))}
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                <button type="button" onClick={addOption}>Agregar opción</button>
                <button type="button" onClick={removeLastOption} disabled={formState.opciones.length <= 3}>Quitar última</button>
              </div>
            </div>
          )}

          {formState.tipoPregunta === 'UNICA' && (
            <div style={{ marginBottom: '0.75rem' }}>
              <strong>Respuesta correcta *</strong>
              {formState.opciones.map((_, index) => (
                <label key={index} style={{ display: 'block' }}>
                  <input
                    type="radio"
                    name="respuesta-unica"
                    checked={formState.respuestaCorrectaUnica === index}
                    onChange={() => setFormState((current) => ({ ...current, respuestaCorrectaUnica: index }))}
                  />
                  {' '}Opción {index + 1}
                </label>
              ))}
            </div>
          )}

          {formState.tipoPregunta === 'MULTIPLE' && (
            <div style={{ marginBottom: '0.75rem' }}>
              <strong>Respuestas correctas *</strong>
              {formState.opciones.map((_, index) => (
                <label key={index} style={{ display: 'block' }}>
                  <input
                    type="checkbox"
                    checked={formState.respuestasCorrectasMultiple.includes(index)}
                    onChange={() => toggleCorrectAnswerMultiple(index)}
                  />
                  {' '}Opción {index + 1}
                </label>
              ))}
            </div>
          )}

          <button type="submit" disabled={submitting}>
            {submitting ? (formMode === 'edit' ? 'Actualizando...' : 'Creando...') : (formMode === 'edit' ? 'Actualizar pregunta' : 'Crear pregunta')}
          </button>
          {formMode === 'edit' && (
            <button type="button" onClick={backToCreateMode} style={{ marginLeft: '0.75rem' }} disabled={submitting}>
              Cancelar edición
            </button>
          )}
        </form>
      </section>

      <section style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem' }}>
        <h2 style={{ marginTop: 0 }}>Filtros</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <input
            type="text"
            placeholder="Buscar por texto"
            value={filters.texto}
            onChange={(event) => setFilters((current) => ({ ...current, texto: event.target.value }))}
          />
          <input
            type="text"
            placeholder="Filtrar por temática"
            value={filters.tematica}
            onChange={(event) => setFilters((current) => ({ ...current, tematica: event.target.value }))}
          />
          <select
            value={filters.tipo}
            onChange={(event) => setFilters((current) => ({ ...current, tipo: event.target.value as '' | TipoPreguntaAdmin }))}
          >
            <option value="">Todos los tipos</option>
            <option value="VERDADERO_FALSO">VERDADERO_FALSO</option>
            <option value="UNICA">UNICA</option>
            <option value="MULTIPLE">MULTIPLE</option>
          </select>
          <select
            value={filters.activa}
            onChange={(event) => setFilters((current) => ({ ...current, activa: event.target.value as EstadoFiltroUI }))}
          >
            <option value="TODAS">Todas</option>
            <option value="ACTIVAS">Activas</option>
            <option value="INACTIVAS">Inactivas</option>
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select
            value={size}
            onChange={async (event) => {
              const nextSize = Number(event.target.value);
              setSize(nextSize);
              setPage(0);
              await loadQuestions(0, nextSize);
            }}
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>{option} por página</option>
            ))}
          </select>

          <button type="button" onClick={() => void applyFilters()}>Aplicar filtros</button>
          <button type="button" onClick={() => void resetFilters()}>Limpiar filtros</button>
        </div>
      </section>

      {loading && <p>Cargando preguntas...</p>}
      {error && <p style={{ color: '#b00020' }}>{error}</p>}

      <section>
        <h2>Listado</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: '0.5rem' }}>Enunciado</th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: '0.5rem' }}>Tipo</th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: '0.5rem' }}>Temática</th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: '0.5rem' }}>Estado</th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: '0.5rem' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.content.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '0.75rem' }}>No hay preguntas para los filtros actuales.</td>
              </tr>
            )}
            {data.content.map((question) => (
              <tr key={question.id}>
                <td style={{ borderBottom: '1px solid #eee', padding: '0.5rem' }}>{question.enunciado}</td>
                <td style={{ borderBottom: '1px solid #eee', padding: '0.5rem' }}>{question.tipoPregunta}</td>
                <td style={{ borderBottom: '1px solid #eee', padding: '0.5rem' }}>{question.tematica}</td>
                <td style={{ borderBottom: '1px solid #eee', padding: '0.5rem' }}>{question.activa ? 'Activa' : 'Inactiva'}</td>
                <td style={{ borderBottom: '1px solid #eee', padding: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Link to={`/admin/preguntas/${question.id}`}>Ver detalle</Link>
                  <button type="button" onClick={() => question.id && void handleEdit(question.id)}>
                    Editar
                  </button>
                  <button type="button" onClick={() => void handleToggle(question)}>
                    {question.activa ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button type="button" onClick={() => void goToPage(currentPage - 1)} disabled={loading || isFirstPage}>Anterior</button>
        <span>Página {currentPage + 1}{totalPages > 0 ? ` de ${totalPages}` : ''}</span>
        <button type="button" onClick={() => void goToPage(currentPage + 1)} disabled={loading || isLastPage}>Siguiente</button>
        <span>Total: {totalElements}</span>
      </footer>
    </section>
  );
}
