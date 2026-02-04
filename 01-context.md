# Instrucciones para GitHub Copilot - Frontend React

## Contexto del Proyecto

Estamos desarrollando el frontend en React.js para una aplicación de gestión de preguntas. Por ahora, solo de tipo Verdadero/Falso. El backend está implementado en Spring Boot con una API REST completamente funcional.

- Solo existe el tipo de pregunta: VERDADERO_FALSO
- No hay autenticación
- No hay otros tipos de preguntas
- CRUD completo disponible

## Arquitectura Backend Existente

### API REST Endpoints
- **Base URL**: `http://localhost:8080/api/preguntas/vf`
- **CORS**: Configurado para `http://localhost:5173`

#### Endpoints Disponibles
1. `GET /api/preguntas/vf?page=0&size=10` - Listar preguntas paginadas
2. `GET /api/preguntas/vf/{id}` - Obtener pregunta por ID
3. `POST /api/preguntas/vf` - Crear nueva pregunta
4. `PUT /api/preguntas/vf/{id}` - Actualizar pregunta existente
5. `DELETE /api/preguntas/vf/{id}` - Desactivar pregunta (soft delete)
6. `PUT /api/preguntas/vf/activar/{id}` - Reactivar pregunta

### Estructura de Datos

```typescript
interface PreguntaVF {
  id: number | null;
  enunciado: string;        // max 500 caracteres, obligatorio
  tematica: string;         // max 100 caracteres, opcional
  fechaCreacion: string;    // ISO 8601 format
  activa: boolean;          // true por defecto
  respuestaCorrecta: boolean; // true o false, obligatorio
  explicacion: string;      // max 1000 caracteres, opcional
  tipoPregunta: "VERDADERO_FALSO"; // constante
}
```

### Respuestas de la API

**Éxito (GET lista)**:
```json
{
  "content": [
    {
      "id": 1,
      "enunciado": "¿La Tierra es redonda?",
      "tematica": "Geografía",
      "fechaCreacion": "2024-02-04T10:30:00",
      "activa": true,
      "respuestaCorrecta": true,
      "explicacion": "La Tierra tiene forma geoide",
      "tipoPregunta": "VERDADERO_FALSO"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10
  },
  "totalElements": 50,
  "totalPages": 5
}
```

**Éxito (GET individual, POST, PUT)**:
```json
{
  "id": 1,
  "enunciado": "¿La Tierra es redonda?",
  "tematica": "Geografía",
  "fechaCreacion": "2024-02-04T10:30:00",
  "activa": true,
  "respuestaCorrecta": true,
  "explicacion": "La Tierra tiene forma geoide",
  "tipoPregunta": "VERDADERO_FALSO"
}
```

### Reglas importantes

- El backend valida los campos
- Si el body es incorrecto → 400
- Si no existe el ID → 404
- Más adelante se incluirá Bootstrap, por ahora no
- Axios será el cliente HTTP
