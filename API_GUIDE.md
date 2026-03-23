# 🔌 Guía de APIs y Conexión Backend

## 📡 Endpoints Recomendados

### Base URL
```
http://localhost:3000/api/v1
```

---

## 👤 Autenticación

### `POST /auth/login`
**Descripción**: Iniciar sesión

```json
// Request
{
  "email": "tesorera@example.com",
  "password": "password123"
}

// Response (200 OK)
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user_id": 1,
  "nombre": "Tesorera Test",
  "rol": "tesorera",
  "expires_in": 86400
}
```

### `POST /auth/logout`
**Descripción**: Cerrar sesión

```json
// Response (200 OK)
{
  "message": "Sesión cerrada exitosamente"
}
```

### `GET /auth/profile`
**Descripción**: Obtener datos del usuario actual

```json
// Response (200 OK)
{
  "id": 1,
  "nombre": "Tesorera Test",
  "email": "tesorera@example.com",
  "rol": "tesorera",
  "estado": "activo",
  "fecha_ultima_actividad": "2026-03-22T10:30:00Z"
}
```

---

## 💰 Movimientos

### `GET /movimientos`
**Descripción**: Obtener lista de movimientos (con filtros)

**Query Parameters**:
```
?tipo=ingreso|egreso|all
?categoria=Eventos&categoria=Papelería
?fecha_desde=2026-03-01
?fecha_hasta=2026-03-31
?estado=completado|pendiente|all
?responsable=Tesorera
?search=inscripcion
?page=1
&limit=20
&sort=fecha&order=desc
```

```json
// Response (200 OK)
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tipo": "ingreso",
      "fecha": "2026-03-22",
      "concepto": "Inscripciones Semestre",
      "categoria": "Inscripciones",
      "monto": 25000,
      "usuario_id": 1,
      "responsable_nombre": "Tesorera",
      "estado": "completado",
      "notas": "120 estudiantes",
      "fecha_creacion": "2026-03-22T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "pages": 8
  }
}
```

### `POST /movimientos`
**Descripción**: Crear nuevo movimiento

```json
// Request
{
  "tipo": "egreso",
  "fecha": "2026-03-22",
  "concepto": "Pago a Proveedores",
  "categoria": "Eventos",
  "monto": 8500,
  "responsable_nombre": "Coordinador Eventos",
  "notas": "Evento Primavera",
  "estado": "pendiente"
}

// Response (201 Created)
{
  "success": true,
  "message": "Movimiento creado exitosamente",
  "data": {
    "id": 123,
    "tipo": "egreso",
    "fecha": "2026-03-22",
    "concepto": "Pago a Proveedores",
    // ... resto de datos
  }
}
```

### `PUT /movimientos/:id`
**Descripción**: Actualizar movimiento

```json
// Request
{
  "concepto": "Pago a Proveedores - Actualizado",
  "monto": 8700,
  "estado": "completado",
  "notas": "Pago confirmado"
}

// Response (200 OK)
{
  "success": true,
  "message": "Movimiento actualizado exitosamente",
  "data": { /* movimiento actualizado */ }
}
```

### `DELETE /movimientos/:id`
**Descripción**: Eliminar movimiento

```json
// Response (200 OK)
{
  "success": true,
  "message": "Movimiento eliminado exitosamente"
}
```

### `GET /movimientos/resumen/mensual`
**Descripción**: Obtener resumen mensual

```json
// Response (200 OK)
{
  "success": true,
  "data": {
    "total_ingresos": 56200,
    "total_egresos": 14400,
    "balance_neto": 41800,
    "cantidad_ingresos": 12,
    "cantidad_egresos": 28,
    "promedio_ingreso": 4683.33,
    "promedio_egreso": 514.29,
    "mayor_ingreso": 25000,
    "mayor_egreso": 8500,
    "mes": "2026-03"
  }
}
```

---

## 📊 Reportes

### `GET /reportes`
**Descripción**: Obtener lista de reportes generados

```json
// Response (200 OK)
{
  "success": true,
  "data": [
    {
      "id": 1,
      "titulo": "Reporte Marzo 2026",
      "fecha_inicio": "2026-03-01",
      "fecha_fin": "2026-03-31",
      "tipo_reporte": "mensual",
      "total_ingresos": 56200,
      "total_egresos": 14400,
      "ganancia_neta": 41800,
      "archivo_url": "/reports/reporte_2026_03.pdf",
      "fecha_generacion": "2026-03-22T14:30:00Z"
    }
  ]
}
```

### `POST /reportes/generar`
**Descripción**: Generar nuevo reporte

```json
// Request
{
  "fecha_inicio": "2026-03-01",
  "fecha_fin": "2026-03-31",
  "tipo_reporte": "mensual",
  "incluir_graficos": true,
  "formato": "pdf" | "xlsx" | "csv"
}

// Response (200 OK)
{
  "success": true,
  "message": "Reporte generado exitosamente",
  "data": {
    "id": 5,
    "archivo_url": "/reports/reporte_2026_03_final.pdf",
    "archivo_descarga": "/download/reporte_2026_03_final.pdf"
  }
}
```

### `GET /reportes/estadisticas`
**Descripción**: Obtener estadísticas por categoría

```json
// Response (200 OK)
{
  "success": true,
  "data": {
    "gastos_por_categoria": [
      {
        "categoria": "Eventos",
        "cantidad": 5,
        "total": 8500,
        "porcentaje": 58.9
      },
      {
        "categoria": "Papelería",
        "cantidad": 12,
        "total": 1950,
        "porcentaje": 13.5
      }
    ],
    "ingresos_por_tipo": [
      {
        "tipo": "Inscripciones",
        "cantidad": 1,
        "total": 25000,
        "porcentaje": 44.5
      }
    ]
  }
}
```

---

## 📅 Eventos

### `GET /eventos`
**Descripción**: Obtener eventos del calendario

**Query Parameters**:
```
?fecha_desde=2026-03-01
?fecha_hasta=2026-03-31
?tipo=deadline|closing|event|meeting
?estado=activo|cancelado|completado
```

```json
// Response (200 OK)
{
  "success": true,
  "data": [
    {
      "id": 1,
      "titulo": "Pago Proveedores",
      "descripcion": "Pago de Q1",
      "tipo": "deadline",
      "fecha": "2026-03-05",
      "hora": "14:00",
      "ubicacion": "Oficina Tesorería",
      "responsable_user_id": 1,
      "responsable_nombre": "Tesorera",
      "estado": "activo",
      "recordatorio_dias": 1
    }
  ]
}
```

### `POST /eventos`
**Descripción**: Crear nuevo evento

```json
// Request
{
  "titulo": "Evento Primavera",
  "descripcion": "Jornada de recaudación",
  "tipo": "event",
  "fecha": "2026-03-15",
  "hora": "10:00",
  "ubicacion": "Cancha Principal",
  "responsable_user_id": 3,
  "recordatorio_dias": 3
}

// Response (201 Created)
{
  "success": true,
  "message": "Evento creado exitosamente",
  "data": { /* evento creado */ }
}
```

---

## 📊 Dashboard

### `GET /dashboard/resumen`
**Descripción**: Obtener datos para dashboard

```json
// Response (200 OK)
{
  "success": true,
  "data": {
    "balance_total": 127600,
    "ingresos_mes": 56200,
    "egresos_mes": 14400,
    "tendencia_ingresos": 8.2,
    "tendencia_egresos": -4.1,
    "movimientos_recientes": [
      {
        "id": 1,
        "concepto": "Inscripciones",
        "monto": 25000,
        "tipo": "ingreso",
        "fecha": "2026-03-22"
      }
    ],
    "eventos_proximos": [
      {
        "id": 1,
        "titulo": "Evento Primavera",
        "fecha": "2026-03-15",
        "tipo": "event"
      }
    ]
  }
}
```

---

## 📝 Categorías

### `GET /categorias`
**Descripción**: Obtener lista de categorías

```json
// Response (200 OK)
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Inscripciones",
      "tipo": "ingreso",
      "descripcion": "Cuotas de inscripción",
      "color_codigo": "#2E7D32",
      "activa": true
    }
  ]
}
```

---

## 👥 Usuarios (Admin Only)

### `GET /usuarios`
**Descripción**: Obtener lista de usuarios

```json
// Response (200 OK)
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Tesorera Test",
      "email": "tesorera@example.com",
      "rol": "tesorera",
      "estado": "activo"
    }
  ]
}
```

### `POST /usuarios`
**Descripción**: Crear nuevo usuario

```json
// Request
{
  "nombre": "Nuevo Admin",
  "email": "admin@example.com",
  "password": "securePassword123",
  "rol": "admin"
}

// Response (201 Created)
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "data": { /* usuario creado */ }
}
```

---

## 🔔 Notificaciones

### `GET /notificaciones`
**Descripción**: Obtener notificaciones del usuario

```json
// Response (200 OK)
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tipo": "alerta",
      "titulo": "Presupuesto Excedido",
      "mensaje": "Categoría Eventos ha excedido presupuesto",
      "leida": false,
      "fecha_creacion": "2026-03-22T10:00:00Z"
    }
  ]
}
```

### `PUT /notificaciones/:id/marcar-leida`
**Descripción**: Marcar notificación como leída

```json
// Response (200 OK)
{
  "success": true,
  "message": "Notificación marcada como leída"
}
```

---

## 🔍 Búsqueda Global

### `GET /buscar`
**Descripción**: Búsqueda global en movimientos y eventos

**Query Parameters**:
```
?q=evento primavera
?tipo=movimiento|evento|all
```

```json
// Response (200 OK)
{
  "success": true,
  "data": {
    "movimientos": [
      {
        "id": 1,
        "concepto": "Evento Primavera",
        "monto": 8500
      }
    ],
    "eventos": [
      {
        "id": 1,
        "titulo": "Evento Primavera",
        "fecha": "2026-03-15"
      }
    ]
  }
}
```

---

## 🛠️ Manejo de Errores

### Error 400 (Bad Request)
```json
{
  "success": false,
  "error": "Validation Error",
  "message": "El campo 'monto' es requerido"
}
```

### Error 401 (Unauthorized)
```json
{
  "success": false,
  "error": "Authentication Error",
  "message": "Token inválido o expirado"
}
```

### Error 403 (Forbidden)
```json
{
  "success": false,
  "error": "Authorization Error",
  "message": "No tienes permisos para realizar esta acción"
}
```

### Error 404 (Not Found)
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Movimiento no encontrado"
}
```

### Error 500 (Server Error)
```json
{
  "success": false,
  "error": "Server Error",
  "message": "Error interno del servidor"
}
```

---

## 📝 Respuestas Estándar

Todas las respuestas siguen este formato:

```json
{
  "success": true|false,
  "message": "Descripción de la acción",
  "data": { /* datos */ },
  "error": "Código de error (si aplica)",
  "timestamp": "2026-03-22T10:00:00Z"
}
```

---

## 🔐 Headers Requeridos

```
Content-Type: application/json
Authorization: Bearer <access_token>
X-API-Version: v1
```

---

## 📊 Rate Limiting

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1679494800
```

---

## 🧪 Testing APIs con cURL

```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tesorera@example.com","password":"password123"}'

# Obtener movimientos
curl -X GET "http://localhost:3000/api/v1/movimientos?tipo=ingreso" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Crear movimiento
curl -X POST http://localhost:3000/api/v1/movimientos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "tipo":"egreso",
    "fecha":"2026-03-22",
    "concepto":"Pago",
    "categoria":"Eventos",
    "monto":8500
  }'

# Obtener dashboard
curl -X GET http://localhost:3000/api/v1/dashboard/resumen \
  -H "Authorization: Bearer <token>"
```

---

## 🔄 Implementar en Frontend

### Setup en `src/services/api.js`

```javascript
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

### Usar en Componentes

```javascript
import api from '@/services/api'

// En MovementsTable.jsx
useEffect(() => {
  const fetchMovements = async () => {
    try {
      const response = await api.get('/movimientos', {
        params: {
          fecha_desde: dateRange.from,
          fecha_hasta: dateRange.to,
          tipo: filters.type,
          categoria: filters.category
        }
      })
      setMovements(response.data.data)
    } catch (error) {
      console.error('Error fetching movements:', error)
    }
  }
  
  fetchMovements()
}, [dateRange, filters])
```

---

**Nota**: Estas APIs son recomendaciones basadas en mejores prácticas REST. Ajusta según tu arquitectura de backend.
