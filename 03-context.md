# Instrucciones para GitHub Copilot - Frontend React

## Contexto del Proyecto

Estamos desarrollando el frontend en React.js para una aplicación de gestión de preguntas. **Ahora necesitamos implementar el tipo de pregunta "OPCIÓN MÚLTIPLE" (múltiples respuestas correctas)**. El backend ya está implementado en Spring Boot con una API REST completamente funcional para PreguntaMultiple.

- **Backend YA EXISTE**: Entidad, Controller, Service y Repository de PreguntaMultiple están implementados
- **Frontend BASE**: Ya existen PreguntaVF.tsx y PreguntaUnica.tsx funcionando como referencia
- **No hay autenticación**
- **CRUD completo** disponible para PreguntaMultiple

## Arquitectura Backend Existente

### API REST Endpoints
- **Base URL**: `http://localhost:8080/api/preguntas/multiple`
- **CORS**: Configurado para `http://localhost:5173`

#### Endpoints Disponibles (Mismos que PreguntaVF y PreguntaUnica pero para Multiple)
1. `GET /api/preguntas/multiple?page=0&size=10` - Listar preguntas paginadas
2. `GET /api/preguntas/multiple/{id}` - Obtener pregunta por ID
3. `POST /api/preguntas/multiple` - Crear nueva pregunta
4. `PUT /api/preguntas/multiple/{id}` - Actualizar pregunta existente
5. `DELETE /api/preguntas/multiple/{id}` - Desactivar pregunta (soft delete)
6. `PUT /api/preguntas/multiple/activar/{id}` - Reactivar pregunta

### Estructura de Datos PreguntaMultiple
```typescript
interface PreguntaMultiple {
  id: number | null;
  enunciado: string;                // max 500 caracteres, obligatorio
  tematica: string | null;          // max 100 caracteres, opcional
  fechaCreacion?: string;           // ISO 8601 format
  activa: boolean;                  // true por defecto
  opciones: string[];               // Array de opciones, mínimo 3, cada opción max 500 caracteres
  respuestasCorrectas: number[];    // Array de índices de opciones correctas (0-based), mínimo 1, obligatorio
  explicacion: string | null;       // max 1000 caracteres, opcional
  tipoPregunta: "MULTIPLE";         // constante
}
```

### Diferencia Clave con PreguntaUnica

**PreguntaUnica**: Una sola respuesta correcta (`respuestaCorrecta: number`)
**PreguntaMultiple**: Múltiples respuestas correctas (`respuestasCorrectas: number[]`)
