
# Instrucciones FRONT — Pantalla de CRUD de Usuarios (solo ADMIN)
Este documento define cómo implementar en el frontend una **nueva pantalla de Administración de Usuarios** conectada al backend actual.

## 1) Reglas de acceso (obligatorio)

- La pantalla debe estar disponible **únicamente para usuarios con rol `ADMIN`**.
- El backend protege `/api/usuarios/**` con `hasRole('ADMIN')`.
- La validación en front debe hacerse con `GET /auth/me` después de autenticar:
	- Si `role === "ADMIN"` → permitir ruta/pantalla.
	- Si no es admin → redirigir a pantalla sin permisos (o inicio).

## 2) Autenticación que usa este backend

El backend usa **HTTP Basic Auth** (no JWT).

- En cada request protegida enviar header:

```http
Authorization: Basic base64(username:password)
```

- Endpoint para obtener el usuario autenticado:

```http
GET /auth/me
```

Respuesta ejemplo:

```json
{
	"id": 1,
	"username": "admin",
	"role": "ADMIN",
	"enabled": true
}
```

## 3) Endpoints reales para CRUD de usuarios

Base URL sugerida: `http://localhost:8080`

### Listar usuarios (paginado)

```http
GET /api/usuarios?page=0&size=10&sort=id,desc
```

Respuesta: objeto `Page<UsuarioDTO>` de Spring (campos principales):

```json
{
	"content": [
		{ "id": 1, "username": "admin", "role": "ADMIN", "enabled": true }
	],
	"number": 0,
	"size": 10,
	"totalElements": 1,
	"totalPages": 1,
	"first": true,
	"last": true
}
```

### Obtener usuario por id

```http
GET /api/usuarios/{id}
```

### Crear usuario

```http
POST /api/usuarios
Content-Type: application/json

{
	"username": "nuevo_user",
	"password": "1234",
	"role": "USER",
	"enabled": true
}
```

Notas backend:
- Si `role` es inválido o nulo en **create**, el backend lo guarda como `USER`.
- Si `enabled` es nulo en **create**, el backend usa `true`.

### Actualizar usuario

```http
PUT /api/usuarios/{id}
Content-Type: application/json

{
	"username": "usuario_editado",
	"password": "nuevaClave",
	"role": "ADMIN",
	"enabled": false
}
```

Notas backend:
- En update, `password` solo se cambia si llega no vacío.
- Si `role` es inválido en update, backend conserva el rol actual.

### Eliminar usuario

```http
DELETE /api/usuarios/{id}
```

Respuesta esperada: `204 No Content`.

## 4) Errores a manejar en UI

El backend responde texto plano (`String`) en errores controlados:

- `400 Bad Request`: por ejemplo, username duplicado (`"El nombre de usuario ya existe"`).
- `404 Not Found`: por ejemplo, `"Usuario no encontrado"`.
- `500 Internal Server Error`: `"Error interno del servidor"`.

Recomendación front:
- Mostrar el mensaje del body cuando exista.
- Si no hay mensaje parseable, mostrar uno genérico.

## 5) Pantalla nueva: "Administración de Usuarios"

## Objetivo UI

- Vista tipo tabla con columnas: `ID`, `Username`, `Rol`, `Habilitado`, `Acciones`.
- Acciones por fila: `Editar` y `Eliminar`.
- Acción global: `Crear usuario`.

## Flujo mínimo requerido

1. Al entrar a la ruta admin, validar `GET /auth/me`.
2. Si es `ADMIN`, cargar `GET /api/usuarios?page=0&size=10`.
3. Pintar la tabla con paginación (`anterior/siguiente` o números de página).
4. Crear/editar con formulario (modal o sección en la misma pantalla).
5. Eliminar con confirmación.
6. Tras cualquier operación CRUD exitosa, refrescar la página actual de la tabla.

## Campos del formulario

- `username` (string, requerido para crear).
- `password`:
	- requerido en crear,
	- opcional en editar (vacío = no cambiar contraseña).
- `role` (select estricto con valores: `ADMIN`, `USER`).
- `enabled` (checkbox boolean).

## 6) Estructura sugerida en front

```text
src/
	services/
		authService.(ts|js)
		usuariosService.(ts|js)
	pages/
		AdminUsuariosPage.(tsx|jsx)
	components/
		usuarios/
			UsuariosTable.(tsx|jsx)
			UsuarioForm.(tsx|jsx)
```

## Contrato sugerido de servicio

- `getMe()` → `GET /auth/me`
- `listUsuarios({ page, size, sort })` → `GET /api/usuarios`
- `getUsuario(id)` → `GET /api/usuarios/{id}`
- `createUsuario(payload)` → `POST /api/usuarios`
- `updateUsuario(id, payload)` → `PUT /api/usuarios/{id}`
- `deleteUsuario(id)` → `DELETE /api/usuarios/{id}`

## 7) Consideraciones técnicas importantes

- CORS backend permitido para `http://localhost:5173`.
- Incluir `Authorization: Basic ...` en todas las llamadas a `/auth/me` y `/api/usuarios/**`.
- Para evitar errores de rol por mayúsculas/minúsculas, enviar siempre `ADMIN` o `USER` en mayúscula.

## 8) Criterios de aceptación

Se considera completo cuando:

1. Existe una nueva ruta/pantalla de administración de usuarios.
2. La ruta está protegida en frontend por rol `ADMIN` usando `/auth/me`.
3. Se muestra tabla paginada con datos de `/api/usuarios`.
4. Se puede crear, editar y eliminar usuarios consumiendo el backend real.
5. Se muestran mensajes de error de backend (400/404/500).
6. Tras cada operación, la tabla se actualiza correctamente.