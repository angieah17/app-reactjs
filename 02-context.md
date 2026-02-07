# Instrucciones para GitHub Copilot - Frontend React

## Contexto del Proyecto

Estamos desarrollando el frontend en React.js para una aplicación de gestión de preguntas. **Ahora necesitamos implementar el tipo de pregunta "OPCIÓN ÚNICA" (múltiple choice)**. El backend ya está implementado en Spring Boot con una API REST completamente funcional para PreguntaUnica.

- **Backend YA EXISTE**: Entidad, Controller, Service y Repository de PreguntaUnica están implementados
- **Frontend BASE**: Ya existe PreguntaVF.tsx funcionando como referencia
- **No hay autenticación**
- **CRUD completo** disponible para PreguntaUnica

## Arquitectura Backend Existente

### API REST Endpoints
- **Base URL**: `http://localhost:8080/api/preguntas/unica`
- **CORS**: Configurado para `http://localhost:5173`

#### Endpoints Disponibles (Mismos que PreguntaVF pero para Unica)
1. `GET /api/preguntas/unica?page=0&size=10` - Listar preguntas paginadas
2. `GET /api/preguntas/unica/{id}` - Obtener pregunta por ID
3. `POST /api/preguntas/unica` - Crear nueva pregunta
4. `PUT /api/preguntas/unica/{id}` - Actualizar pregunta existente
5. `DELETE /api/preguntas/unica/{id}` - Desactivar pregunta (soft delete)
6. `PUT /api/preguntas/unica/activar/{id}` - Reactivar pregunta

### Estructura de Datos PreguntaUnica

```typescript
interface PreguntaUnica {
  id: number | null;
  enunciado: string;           // max 500 caracteres, obligatorio
  tematica: string;           // max 100 caracteres, opcional
  fechaCreacion: string;      // ISO 8601 format
  activa: boolean;            // true por defecto
  opciones: string[];         // Array de opciones, mínimo 3, cada opción max 500 caracteres
  respuestaCorrecta: number;  // Índice de la opción correcta (0-based), obligatorio
  explicacion: string;        // max 1000 caracteres, opcional
  tipoPregunta: "UNICA";      // constante
}