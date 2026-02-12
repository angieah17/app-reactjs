# 🔐 INSTRUCCIONES: INTEGRACIÓN AUTENTICACIÓN REACT + SPRING BOOT

## 📋 CONTEXTO DEL PROYECTO

### Información General
- **Proyecto**: Sistema de gestión de preguntas y tests evaluables
- **Backend**: Spring Boot 4.0.1 + Java 21
- **Frontend**: React + Vite
- **Base de Datos**: MySQL 8.0 (puerto 3307)
- **Autenticación**: Spring Security con HTTP Basic Authentication

### Backend Ya Implementado
```java
// Endpoint de autenticación
POST /auth/register - Registro de nuevos usuarios
GET /api/users/me - Obtener usuario actual autenticado

// Sistema de Roles
- ADMIN: Acceso completo (CRUD preguntas, ver todos los tests)
- USER: Acceso limitado (realizar tests, ver sus resultados)

// Usuario Precargado
username: admin
password: admin (encriptado con BCrypt)
```

### Configuración CORS (Backend)
```java
// Ya configurado para aceptar requests desde:
http://localhost:5173 (Vite dev server)
http://localhost:3000 (alternativo)

// Headers permitidos:
Authorization, Content-Type
```

---

## 🎯 OBJETIVO DE ESTA TAREA

Implementar un sistema de autenticación en React que:
1. Permita login/logout de usuarios
2. Mantenga la sesión activa (incluso al recargar)
3. Proteja rutas privadas
4. Inyecte credenciales automáticamente en todas las peticiones API
5. Maneje errores de autenticación (401, 403)

**IMPORTANTE**: Usar HTTP Basic Authentication (NO JWT, NO OAuth)

---

## 🏗️ ARQUITECTURA DE LA SOLUCIÓN

### Flujo de Autenticación
```
1. Usuario ingresa credenciales (username, password)
2. React codifica credenciales en Base64
3. Se envía header: Authorization: Basic {base64(username:password)}
4. Spring Boot valida contra la base de datos
5. Si válido: retorna datos del usuario
6. React guarda en Context + LocalStorage
7. Todas las peticiones posteriores incluyen el header Authorization
```

### Estructura de Carpetas
```
src/
├── components/
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   └── ProtectedRoute.jsx
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   └── common/
│       ├── ErrorMessage.jsx
│       └── LoadingSpinner.jsx
│
├── context/
│   └── AuthContext.jsx
│
├── services/
│   ├── authService.js
│   └── apiClient.js
│
├── utils/
│   └── authUtils.js
│
├── pages/
│   ├── HomePage.jsx
│   ├── DashboardPage.jsx
│   └── AdminPage.jsx
│
└── App.jsx
```

---

## 📝 PASOS DE IMPLEMENTACIÓN

### PASO 1: Utilidades de Autenticación (utils/authUtils.js)

**Objetivo**: Funciones auxiliares para codificación y almacenamiento

**Funciones a implementar**:
```javascript
// Codificar credenciales para Basic Auth
encodeCredentials(username, password) → string

// Gestión de LocalStorage
saveAuthData(username, encodedCredentials, user)
getAuthData() → {username, credentials, user} | null
clearAuthData()
```

**Criterios**:
- Usar btoa() para codificación Base64
- Guardar como JSON en localStorage.authData
- Manejar errores de parsing JSON

---

### PASO 2: Cliente API con Axios (services/apiClient.js)

**Objetivo**: Instancia configurada de Axios con interceptores

**Configuración**:
```javascript
baseURL: 'http://localhost:8080'
timeout: 10000
headers: { 'Content-Type': 'application/json' }
```

**Interceptores a implementar**:

**Request Interceptor**:
- Recuperar credenciales de getAuthData()
- Si existen: inyectar header Authorization: Basic {credentials}
- Si no existen: dejar pasar sin header

**Response Interceptor**:
- Capturar errores 401 (Unauthorized)
- Limpiar sesión automáticamente
- Redirigir a /login
- Mostrar mensaje de error

---

### PASO 3: Servicio de Autenticación (services/authService.js)

**Objetivo**: Lógica de negocio para auth

**Funciones a implementar**:

```javascript
// Login
async login(username, password) {
  // 1. Codificar credenciales
  // 2. Hacer GET /api/users/me con Basic Auth
  // 3. Si exitoso: guardar datos y retornar user
  // 4. Si falla: lanzar error
}

// Registro
async register(username, password) {
  // POST /auth/register con {username, password}
}

// Obtener usuario actual
async getCurrentUser() {
  // GET /api/users/me (usa credenciales guardadas)
}

// Logout
logout() {
  // Limpiar localStorage
}
```

**Manejo de Errores**:
- Capturar errores de red
- Validar respuestas del servidor
- Retornar mensajes claros

---

### PASO 4: Context de Autenticación (context/AuthContext.jsx)

**Objetivo**: Estado global accesible desde toda la app

**Estado**:
```javascript
{
  user: null | {id, username, roles},
  isAuthenticated: false,
  isLoading: true // importante para carga inicial
}
```

**Funciones del Context**:
```javascript
login(username, password) → Promise
logout()
register(userData) → Promise
```

**Hook personalizado**:
```javascript
export const useAuth = () => useContext(AuthContext)
```

**Inicialización**:
- Al montar: verificar si hay sesión en localStorage
- Si hay datos: validar llamando a /api/users/me
- Si válidos: restaurar sesión
- Si inválidos: limpiar localStorage

---

### PASO 5: Página de Login (components/auth/LoginPage.jsx)

**Campos del formulario**:
- Username (input text, required)
- Password (input password, required)
- Botón "Iniciar Sesión"
- Link a "¿No tienes cuenta? Regístrate"

**Validaciones**:
- Campos no vacíos
- Mostrar errores del backend

**Flujo**:
```javascript
1. Usuario completa formulario
2. Submit → authContext.login(username, password)
3. Si exitoso → navigate('/dashboard')
4. Si falla → mostrar mensaje de error
```

**Estados**:
- isSubmitting: deshabilitar botón durante petición
- error: mensaje de error si falla

---

### PASO 6: Página de Registro (components/auth/RegisterPage.jsx)

**Campos del formulario**:
- Username
- Password
- Confirmar Password

**Validaciones**:
- Username: mínimo 3 caracteres
- Password: mínimo 6 caracteres
- Passwords coinciden

**Flujo**:
```javascript
1. Usuario completa formulario
2. Validar campos
3. Submit → authService.register(username, password)
4. Si exitoso → navigate('/login') con mensaje de éxito
5. Si falla → mostrar error (ej: "Usuario ya existe")
```

---

### PASO 7: Protección de Rutas (components/auth/ProtectedRoute.jsx)

**Objetivo**: HOC que protege rutas privadas

**Lógica**:
```javascript
function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  // Mostrar loading mientras se verifica sesión
  if (isLoading) return <LoadingSpinner />;
  
  // Si no autenticado: redirect a /login
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  // Si requiere admin y no lo es: redirect a /dashboard
  if (requireAdmin && !user.roles.includes('ADMIN')) {
    return <Navigate to="/dashboard" />;
  }
  
  // Todo OK: renderizar componente hijo
  return children;
}
```

---

### PASO 8: Navbar Dinámica (components/layout/Navbar.jsx)

**Objetivo**: Navegación que cambia según estado de auth

**Elementos condicionales**:

**Si NO está autenticado**:
- Logo / Home
- Botón "Iniciar Sesión"
- Botón "Registrarse"

**Si SÍ está autenticado**:
- Logo / Home
- Link "Dashboard"
- Link "Mis Tests"
- Link "Panel Admin" (solo si es ADMIN)
- Dropdown con:
  - "Perfil"
  - "Configuración"
  - "Cerrar Sesión"

**Datos a mostrar**:
```javascript
const { user, isAuthenticated, logout } = useAuth();

// Mostrar: "Bienvenido, {user.username}"
// Badge con rol: ADMIN / USER
```

---

### PASO 9: Configuración de Rutas (App.jsx)

**Rutas públicas**:
```javascript
/ → HomePage
/login → LoginPage
/register → RegisterPage
```

**Rutas privadas** (requieren autenticación):
```javascript
/dashboard → DashboardPage
/tests → TestsPage
/tests/:id → TestDetailPage
/profile → ProfilePage
```

**Rutas de admin** (requieren rol ADMIN):
```javascript
/admin → AdminDashboard
/admin/preguntas → CRUDPreguntasPage
/admin/usuarios → GestionUsuariosPage
```

**Estructura**:
```jsx
<AuthProvider>
  <Router>
    <Navbar />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/*" element={
        <ProtectedRoute requireAdmin>
          <AdminRoutes />
        </ProtectedRoute>
      } />
    </Routes>
  </Router>
</AuthProvider>
```

---

## 🔧 CONSIDERACIONES TÉCNICAS

### HTTP Basic Authentication

**Formato del Header**:
```
Authorization: Basic {base64(username:password)}

Ejemplo:
username: admin
password: admin123
Encoded: YWRtaW46YWRtaW4xMjM=
Header: Authorization: Basic YWRtaW46YWRtaW4xMjM=
```

**Codificación en JavaScript**:
```javascript
const credentials = btoa(`${username}:${password}`);
const authHeader = `Basic ${credentials}`;
```

### Persistencia de Sesión

**¿Qué guardar en LocalStorage?**
```javascript
{
  username: "admin",
  credentials: "YWRtaW46YWRtaW4xMjM=", // base64 encoded
  user: {
    id: 1,
    username: "admin",
    roles: ["ADMIN", "USER"]
  }
}
```

**Cuándo limpiar**:
- Al hacer logout
- Al recibir error 401
- Al cerrar sesión manualmente

### Gestión de Errores

**Errores comunes**:
```javascript
400 Bad Request → Datos inválidos
401 Unauthorized → Credenciales incorrectas o sesión expirada
403 Forbidden → Sin permisos para el recurso
404 Not Found → Endpoint no existe
500 Internal Server Error → Error del servidor
```

**Mensajes al usuario**:
- 401: "Usuario o contraseña incorrectos"
- 403: "No tienes permisos para acceder a este recurso"
- 500: "Error del servidor. Inténtalo más tarde"
- Network Error: "No se pudo conectar con el servidor"

---

## 🎨 ESTILOS Y UX

### Estados de Carga
```javascript
// Mostrar mientras se procesa
<button disabled={isSubmitting}>
  {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
</button>
```

### Mensajes de Error
```javascript
{error && (
  <div className="alert alert-danger" role="alert">
    {error}
  </div>
)}
```

---

## ✅ CHECKLIST DE VALIDACIÓN

### Testing Manual
- [ ] Login con credenciales correctas → acceso exitoso
- [ ] Login con credenciales incorrectas → mensaje de error
- [ ] Registro de nuevo usuario → éxito + redirect a login
- [ ] Acceso a ruta privada sin login → redirect a /login
- [ ] Logout → limpieza de sesión + redirect
- [ ] Refresh de página → sesión se mantiene
- [ ] Usuario ADMIN ve rutas de admin
- [ ] Usuario USER NO ve rutas de admin
- [ ] Petición API incluye header Authorization
- [ ] Error 401 → logout automático + redirect
- [ ] Navbar muestra info correcta según estado

### Validación de Código
- [ ] No hay credenciales hardcodeadas
- [ ] Manejo de errores en todos los try-catch
- [ ] Loading states en todas las peticiones async
- [ ] Cleanup de efectos con useEffect
- [ ] PropTypes o TypeScript en componentes
- [ ] Console.logs eliminados en producción

---

## 🚫 ERRORES COMUNES A EVITAR

### ❌ NO hacer
```javascript
// 1. Guardar contraseña en texto plano
localStorage.setItem('password', password); // NUNCA

// 2. Confiar solo en el frontend
if (user.role === 'ADMIN') {
  // Mostrar panel admin SIN validar en backend
}

// 3. No limpiar sesión en errores 401
axios.get('/api/endpoint').catch(err => {
  console.log(err); // Debe hacer logout si es 401
});

// 4. No manejar estados de carga
const handleLogin = async () => {
  await authService.login(); // Sin loading state
}
```

### ✅ SÍ hacer
```javascript
// 1. Codificar credenciales
const encoded = btoa(`${username}:${password}`);

// 2. Validar permisos en backend siempre
// Frontend solo oculta UI, backend rechaza peticiones

// 3. Limpiar sesión automáticamente
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      clearAuthData();
      window.location.href = '/login';
    }
  }
);

// 4. Manejar estados
const [isLoading, setIsLoading] = useState(false);
const handleLogin = async () => {
  setIsLoading(true);
  try {
    await authService.login();
  } finally {
    setIsLoading(false);
  }
}
```

---

## 📚 RECURSOS Y REFERENCIAS

### Documentación
- Axios Interceptors: https://axios-http.com/docs/interceptors
- React Context API: https://react.dev/reference/react/useContext
- React Router Protected Routes: https://reactrouter.com/en/main/start/overview
- HTTP Basic Authentication: https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication

### Endpoints del Backend
```
POST /auth/register
Body: {username: string, password: string}
Response: {id, username, roles}

GET /api/users/me
Headers: Authorization: Basic {credentials}
Response: {id, username, roles}

GET /api/tests (requiere auth)
GET /api/admin/preguntas (requiere ADMIN)
```

---

## 🔄 ORDEN DE DESARROLLO RECOMENDADO

1. authUtils.js → Funciones básicas primero
2. apiClient.js → Configurar Axios
3. authService.js → Lógica de negocio
4. AuthContext.jsx → Estado global
5. LoginPage.jsx → Primera pantalla funcional
6. ProtectedRoute.jsx → Protección de rutas
7. Navbar.jsx → Navegación dinámica
8. RegisterPage.jsx → Segunda pantalla
9. App.jsx → Integración completa
10. Testing → Validar todos los flujos
