PROYECTO: App Spring Boot + React - CRUD de Preguntas
----------------------------------------------------------
ESTADO ACTUAL:
- Backend funcionando para PreguntaVF (Verdadero/Falso) y PreguntaUnica (Opción única).
- Frontend React con PreguntaVF.tsx, PreguntaUnica.tsx y servicios funcionando.
- CRUD completo probado y operativo para ambos tipos.

SIGUIENTE FASE: Crear PreguntaMultiple (Opción múltiple, varias respuestas correctas)
---------------------------------------------------------------------------------------
ENFOQUE MÍNIMO Y DIRECTO:

BACKEND (Spring):
1. PreguntaMultiple.java → extiende Pregunta.java
   - Atributos: opciones (List<String>), respuestasCorrectas (List<Integer> - índices).
2. PreguntaMultipleRepository.java → interface JpaRepository<PreguntaMultiple, Long>
3. PreguntaMultipleService.java → extiende AbstractPreguntaService<PreguntaMultiple>
4. PreguntaMultipleController.java → igual que PreguntaVFController pero con PreguntaMultiple

FRONTEND (React/TypeScript):
1. PreguntaMultipleService.ts → igual que PreguntaVFService.ts pero con ruta /api/preguntas/multiple
2. PreguntaMultiple.tsx → mismo CRUD UI que PreguntaUnica.tsx, adaptando para múltiples respuestas (checkboxes en lugar de radio).

REGLAS ESTRICTAS:
- SOLO funcionalidad base CRUD.
- REUTILIZAR lo ya existente (AbstractPreguntaService, excepciones, SecurityConfig).
- MISMOS patrones de código y estructura que PreguntaUnica.
- NO añadir: Bootstrap, Swagger, gestión de usuarios, seguridad extra, logs, validaciones extras.
- La única diferencia: múltiples respuestas correctas en lugar de una única.

OBJETIVO FINAL:
CRUD de PreguntaMultiple funcionando igual que PreguntaUnica, pero permitiendo seleccionar múltiples opciones como correctas.