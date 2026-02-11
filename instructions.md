🎯 Contexto del Proyecto

Este frontend forma parte de una aplicación completa de gestión de preguntas y tests evaluables.

🔧 Backend ya implementado

Spring Boot 4.0.1 + Java 21

MySQL 8

Arquitectura REST en capas

Autenticación con Spring Security (HTTP Basic)

Roles: ADMIN y USER

CORS habilitado para: http://localhost:5173

Base URL backend: http://localhost:8080

🏗️ Stack del Frontend

React + TypeScript

Vite

Axios

React Router

Context API para autenticación

Arquitectura modular por features

🔐 Autenticación
Endpoint
POST /auth/register


Autenticación mediante HTTP Basic.

Requisitos:

Crear contexto AuthContext

Guardar credenciales en memoria (NO localStorage en versión básica)

Crear helper para incluir Authorization header automáticamente:

Authorization: Basic base64(username:password)


Redirigir según rol:

ADMIN → Panel administración

USER → Generación de test

📚 Funcionalidades a Implementar
1️⃣ MODO USER
🎓 Generar Test
Endpoint
POST /api/tests/generar

Filtros posibles:

temática

tipo (VERDADERO_FALSO, UNICA, MULTIPLE)

límite de preguntas

Requisitos UI:

Formulario con filtros

Mostrar preguntas dinámicamente

Renderizado condicional según tipo:

VERDADERO_FALSO → radio true/false

UNICA → radio opciones

MULTIPLE → checkbox opciones

📝 Enviar Respuestas
POST /api/tests/corregir


Debe:

Mostrar puntuación

Mostrar respuestas correctas

Guardar resultado

📊 Historial de Resultados
GET /api/tests/resultados


Mostrar:

Fecha

Puntuación

Número de preguntas

2️⃣ MODO ADMIN
📋 Gestión de Preguntas

Endpoint base:

/api/admin/preguntas

Funcionalidades:

Listado paginado

Filtros combinables:

temática

tipo

estado (activa/inactiva)

texto en enunciado

Ordenación

Activar / desactivar pregunta (soft delete)

➕ CRUD por Tipo

Endpoints:

/api/preguntas/vf
/api/preguntas/unica
/api/preguntas/multiple


Cada tipo tiene:

Crear

Editar

Eliminar lógico

Ver detalle

🧠 Modelos TypeScript

Copilot debe generar interfaces basadas en backend:

export interface PreguntaBase {
  id: number
  enunciado: string
  tematica: string
  activa: boolean
  tipoPregunta: 'VEDADERO_FALSO' | 'UNICA' | 'MULTIPLE'
}


Extensiones:

export interface PreguntaVF extends PreguntaBase {
  respuestaCorrecta: boolean
}

export interface Opcion {
  id?: number
  texto: string
  correcta: boolean
}

export interface PreguntaUnica extends PreguntaBase {
  opciones: Opcion[]
}

export interface PreguntaMultiple extends PreguntaBase {
  opciones: Opcion[]
}

🎨 Estructura Recomendada
src/
├── api/                 # ❄️ Comunicación con backend
│   ├── client.ts       # Configuración de Axios
│   ├── auth.ts         # Llamadas de autenticación
│   └── tests.ts        # Llamadas de tests
├── assets/             # 🖼️ Imágenes, fuentes, etc.
├── components/         # 🧩 Componentes reutilizables
│   ├── common/         # Botones, inputs, modales
│   └── layout/         # Header, Footer, Sidebar
├── hooks/              # 🪝 Lógica reutilizable con React Hooks
│   └── useAuth.ts     # Hook de autenticación
├── pages/              # 📄 Vistas completas
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   └── Test.tsx
├── types/              # 📝 Definiciones TypeScript
│   └── index.ts       # Interfaces compartidas
├── utils/             # 🔧 Utilidades
│   └── format.ts      # Formateadores
└── App.tsx            # 🏠 Componente raíz

⚙️ Reglas Importantes

Usar componentes reutilizables.

Separar lógica de API en carpeta /api.

Manejar errores HTTP correctamente.

Mostrar loaders en llamadas async.

No duplicar lógica de validación (usar validaciones frontend coherentes con backend).

Respetar soft delete (campo activa).

🧩 Comportamientos Clave
Pregunta Multiple

Permitir múltiples checkboxes

Validar al menos una marcada

Edición

Precargar datos correctamente

No perder estado de opciones

Seguridad

Proteger rutas según rol

Si 401 → redirigir a login

🚀 Buenas Prácticas

Usar useEffect correctamente

Evitar any

Tipado fuerte siempre

Manejo centralizado de errores

Componentes pequeños y desacoplados

No mezclar lógica de negocio en componentes

🧪 Testing Manual Esperado

Copilot debe generar código que permita:

Crear preguntas de los 3 tipos

Generar test con filtros

Corregir test

Consultar historial

Activar/desactivar preguntas

Filtrar desde panel admin

🎯 Objetivo Final

El frontend debe:

Consumir correctamente la API REST ya implementada

Respetar roles

Ser modular y mantenible

Permitir ampliar funcionalidades fácilmente

Tener código limpio y tipado fuerte