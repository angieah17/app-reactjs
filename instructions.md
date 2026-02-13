🎮 INSTRUCCIONES FRONTEND (ALINEADAS AL BACKEND REAL)
1. Contexto del proyecto
Backend: Spring Boot 4.x con Spring Security + JPA.
Frontend: React + Vite.
Base URL API: http://localhost:8080
Autenticación: HTTP Basic Auth (no JWT, no sesión con token).
Base de datos: MySQL (configurada en puerto 3307 en backend).
2. Reglas de autenticación y autorización
Endpoint público:
POST /auth/register
Endpoint autenticado:
GET /auth/me
Todo /api/** requiere usuario autenticado.
Todo /api/admin/** requiere rol ADMIN.
No existe POST /auth/login.
El login en front se resuelve guardando temporalmente credenciales para enviar Authorization: Basic base64(username:password) en cada request.
3. Endpoints reales disponibles
3.1 Autenticación
POST /auth/register
GET /auth/me
3.2 Tests (usuario autenticado)
GET /api/tests
Query opcionales: tematica, tipoPregunta, limite
POST /api/tests/submit
Body: TestSubmitDTO
Query opcionales: tematica, tipoPregunta
GET /api/tests/historial
Query: page (default 0), pageSize (default 10)
3.3 Administración (solo ADMIN)
GET /api/admin/preguntas
Filtros opcionales combinables: tematica, tipo, activa
Paginación y orden: page, size, sort
GET /api/admin/preguntas/buscar
Requerido: texto
Opcionales: tematica, tipo, activa, page, size, sort
GET /api/admin/preguntas/{id}
POST /api/admin/preguntas/verdadero-falso
POST /api/admin/preguntas/unica
POST /api/admin/preguntas/multiple
PUT /api/admin/preguntas/verdadero-falso/{id}
PUT /api/admin/preguntas/unica/{id}
PUT /api/admin/preguntas/multiple/{id}
PATCH /api/admin/preguntas/{id}/activar
PATCH /api/admin/preguntas/{id}/desactivar
3.4 Endpoints por tipo (autenticado)
Para vf, unica, multiple:

GET /api/preguntas/{tipo}?page=&size=
GET /api/preguntas/{tipo}/{id}
POST /api/preguntas/{tipo}
PUT /api/preguntas/{tipo}/{id}
DELETE /api/preguntas/{tipo}/{id} → desactivación lógica (soft delete)
PUT /api/preguntas/{tipo}/activar/{id}
4. Contratos reales de datos (DTO)
4.1 Generar test
Request:

GET /api/tests?tematica=&tipoPregunta=&limite=
Response real (TestPlayDTO):

preguntas: array de TestPreguntaDTO
tematica: string o null
tipoPregunta: string o null
totalPreguntas: number
TestPreguntaDTO real:

id: number
enunciado: string
tipoPregunta: VERDADERO_FALSO | UNICA | MULTIPLE
opciones: string[] (solo UNICA/MULTIPLE; en VF puede venir null)
Nota: no incluye respuesta correcta ni explicación.

4.2 Envío de respuestas (submit)
Request real (TestSubmitDTO):

respuestas: mapa por id de pregunta, pero cada valor es RespuestaDTO.
Formato correcto:

VF: { respuestaVF: true|false }
UNICA: { respuestaUnica: indice }
MULTIPLE: { respuestaMultiple: [indices] }
Ejemplo:

respuestas:
1: { respuestaVF: true }
2: { respuestaUnica: 1 }
3: { respuestaMultiple: [0,2] }
4.3 Resultado de corrección
Response real (TestResultDTO):

puntuacion: number (escala 0 a 10)
totalPreguntas: number
preguntasCorrectas: number
preguntasIncorrectas: number
porcentajeAcierto: number (0 a 100)
revision: array de RevisionPreguntaDTO
RevisionPreguntaDTO:

preguntaId
enunciado
tipoPregunta
esCorrecta
respuestaUsuario (texto)
respuestaCorrecta (texto)
explicacion
4.4 Historial
Response real (Page<TestHistorialDTO>):

content: array con:
id
puntuacion
tematica
fechaRealizacion
y metadatos de página estándar:
totalElements, totalPages, number, size, etc.
Nota: no devuelve desglose de aciertos/totales por registro histórico.

5. Tipos y validaciones de negocio
Tipos válidos:
VERDADERO_FALSO
UNICA
MULTIPLE
Índices en respuestas:
UNICA: número 0-based.
MULTIPLE: array de índices 0-based.
Validaciones mínimas backend:
enunciado obligatorio
temática obligatoria
UNICA/MULTIPLE con mínimo 3 opciones
password de usuario mínimo 6 caracteres
Los errores del backend suelen devolverse como texto plano (400, 404, 500).
6. Objetivo funcional del frontend (MVP)
Perfil USER
Generar test con filtros.
Responder preguntas de 3 tipos.
Enviar respuestas y ver corrección detallada.
Consultar historial paginado.
Perfil ADMIN
Listar preguntas con filtros combinados.
Buscar por texto.
Crear/editar preguntas por tipo.
Activar/desactivar preguntas.
Ver detalle por id.
7. Arquitectura recomendada de frontend
Estructura sugerida:

components/auth
components/tests
components/admin
components/common
services
context
hooks
utils
types
Servicios recomendados:

authService
testService
adminService
8. Flujos UX mínimos
8.1 Flujo jugador
Configura filtros.
Llama GET /api/tests.
Renderiza preguntas según tipoPregunta.
Arma respuestas en formato RespuestaDTO.
Llama POST /api/tests/submit.
Muestra resumen + revisión.
Permite ir a historial.
8.2 Flujo historial
Llama GET /api/tests/historial?page=&pageSize=.
Muestra tabla paginada.
Navega entre páginas.
8.3 Flujo admin
Lista con GET /api/admin/preguntas.
Filtros y búsqueda con query params.
Crear según tipo con POST.
Editar según tipo con PUT.
Toggle con PATCH activar/desactivar.
9. Implementación de servicios (criterio clave)
9.1 testService
generateTest(filters)
submitTest(respuestas, tematica, tipoPregunta)
getTestHistory(page, pageSize)
Importante en submitTest:

Transformar estado de UI al contrato real TestSubmitDTO con RespuestaDTO por pregunta.
9.2 adminService
listQuestions(filters, page, size, sort)
searchQuestions(texto, filters, page, size, sort)
getQuestionDetail(id)
createQuestion(tipo, payload)
updateQuestion(tipo, id, payload)
activateQuestion(id)
deactivateQuestion(id)
toggleQuestion(id, activa)
10. Mapeo de tipos en frontend
VERDADERO_FALSO ↔ ruta verdadero-falso
UNICA ↔ ruta unica
MULTIPLE ↔ ruta multiple
11. Errores comunes a evitar
No enviar primitivas directas en submit; enviar objeto RespuestaDTO.
No asumir tipo en preguntas de test; el campo real es tipoPregunta.
No asumir puntuacion de 0-100; en resultado es 0-10 y además viene porcentajeAcierto.
No asumir endpoint de estadísticas admin: actualmente no existe uno dedicado.
No asumir detalle histórico extendido: el historial real es compacto.
12. Checklist final de correspondencia con backend
Login por Basic Auth, sin endpoint /auth/login.
Submit usa estructura respuestas: { id: RespuestaDTO }.
Campos reales usados en UI:
test: tipoPregunta, totalPreguntas
resultado: revision, preguntasIncorrectas, porcentajeAcierto
historial: fechaRealizacion
CRUD admin por tipo para create/update.
Toggle admin por id sin tipo (activar/desactivar).