# 🗄️ Esquema de Base de Datos Sugerido

## Tablas Principales

```sql
-- ============================================
-- 1. TABLA: usuarios
-- Gestionar acceso y permisos
-- ============================================
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'tesorera', 'coordinador', 'miembro') NOT NULL,
    estado ENUM('activo', 'inactivo', 'suspendido') DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_ultima_actividad TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_rol (rol)
);

-- ============================================
-- 2. TABLA: movimientos
-- Registro de ingresos y egresos
-- ============================================
CREATE TABLE movimientos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tipo ENUM('ingreso', 'egreso') NOT NULL,
    fecha DATE NOT NULL,
    concepto VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50) NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    usuario_id INT NOT NULL,
    responsable_nombre VARCHAR(100),
    estado ENUM('completado', 'pendiente', 'cancelado') DEFAULT 'pendiente',
    notas TEXT,
    adjuntos_url VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    INDEX idx_fecha (fecha),
    INDEX idx_tipo (tipo),
    INDEX idx_categoria (categoria),
    INDEX idx_estado (estado),
    INDEX idx_usuario (usuario_id)
);

-- ============================================
-- 3. TABLA: categorias
-- Define categorías disponibles
-- ============================================
CREATE TABLE categorias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    tipo ENUM('ingreso', 'egreso', 'ambos') NOT NULL,
    descripcion VARCHAR(255),
    color_codigo VARCHAR(7),
    activa BOOLEAN DEFAULT TRUE,
    INDEX idx_tipo (tipo)
);

-- ============================================
-- 4. TABLA: eventos
-- Calendario de eventos y fechas límite
-- ============================================
CREATE TABLE eventos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo ENUM('deadline', 'closing', 'event', 'meeting', 'other') NOT NULL,
    fecha DATE NOT NULL,
    hora TIME,
    ubicacion VARCHAR(255),
    responsable_user_id INT,
    estado ENUM('activo', 'cancelado', 'completado') DEFAULT 'activo',
    recordatorio_dias INT DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (responsable_user_id) REFERENCES usuarios(id),
    INDEX idx_fecha (fecha),
    INDEX idx_tipo (tipo),
    INDEX idx_estado (estado)
);

-- ============================================
-- 5. TABLA: reportes
-- Historial de reportes generados
-- ============================================
CREATE TABLE reportes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    tipo_reporte ENUM('mensual', 'trimestral', 'anual', 'personalizado') NOT NULL,
    total_ingresos DECIMAL(10, 2),
    total_egresos DECIMAL(10, 2),
    ganancia_neta DECIMAL(10, 2),
    archivo_url VARCHAR(255),
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_fecha (fecha_generacion)
);

-- ============================================
-- 6. TABLA: auditoria
-- Registro de cambios importantes
-- ============================================
CREATE TABLE auditoria (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    tabla_afectada VARCHAR(50) NOT NULL,
    registro_id INT,
    accion ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    valores_antiguos JSON,
    valores_nuevos JSON,
    razon VARCHAR(255),
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_fecha (fecha_cambio),
    INDEX idx_tabla (tabla_afectada)
);

-- ============================================
-- 7. TABLA: presupuestos
-- Proyecciones y límites de gasto
-- ============================================
CREATE TABLE presupuestos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    categoria_id INT NOT NULL,
    monto_presupuestado DECIMAL(10, 2) NOT NULL,
    mes_ano DATE NOT NULL,
    monto_gastado DECIMAL(10, 2) DEFAULT 0,
    estado_alerta ENUM('normal', 'advertencia', 'excedido') DEFAULT 'normal',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    UNIQUE KEY unique_categoria_mes (categoria_id, mes_ano),
    INDEX idx_mes (mes_ano)
);

-- ============================================
-- 8. TABLA: notificaciones
-- Sistema de alertas
-- ============================================
CREATE TABLE notificaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    tipo ENUM('alerta', 'recordatorio', 'confirmacion', 'error') NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    referencia_tabla VARCHAR(50),
    referencia_id INT,
    leida BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_lectura TIMESTAMP NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_leida (leida),
    INDEX idx_fecha (fecha_creacion)
);
```

---

## 🔍 Vistas SQL Útiles

```sql
-- Vista: Resumen Mensual
CREATE VIEW vw_resumen_mensual AS
SELECT
    DATE_FORMAT(fecha, '%Y-%m') as periodo,
    SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) as total_ingresos,
    SUM(CASE WHEN tipo = 'egreso' THEN monto ELSE 0 END) as total_egresos,
    (SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) -
     SUM(CASE WHEN tipo = 'egreso' THEN monto ELSE 0 END)) as balance_neto
FROM movimientos
WHERE estado = 'completado'
GROUP BY DATE_FORMAT(fecha, '%Y-%m')
ORDER BY periodo DESC;

-- Vista: Gasto por Categoría
CREATE VIEW vw_gasto_por_categoria AS
SELECT
    c.nombre as categoria,
    COUNT(m.id) as cantidad_movimientos,
    SUM(m.monto) as total_monto,
    AVG(m.monto) as promedio,
    DATE_FORMAT(m.fecha, '%Y-%m') as mes
FROM movimientos m
JOIN categorias c ON m.categoria = c.nombre
WHERE m.tipo = 'egreso' AND m.estado = 'completado'
GROUP BY c.nombre, DATE_FORMAT(m.fecha, '%Y-%m')
ORDER BY DATE_FORMAT(m.fecha, '%Y-%m') DESC, total_monto DESC;

-- Vista: Balance por Usuario
CREATE VIEW vw_balance_por_usuario AS
SELECT
    u.nombre,
    u.email,
    SUM(CASE WHEN m.tipo = 'ingreso' THEN m.monto ELSE 0 END) as ingresos_registrados,
    SUM(CASE WHEN m.tipo = 'egreso' THEN m.monto ELSE 0 END) as egresos_registrados,
    COUNT(m.id) as total_movimientos
FROM usuarios u
LEFT JOIN movimientos m ON u.id = m.usuario_id
GROUP BY u.id
ORDER BY total_movimientos DESC;
```

---

## 📝 Datos Iniciales (Categorías)

```sql
INSERT INTO categorias (nombre, tipo, descripcion, color_codigo) VALUES
('Inscripciones', 'ingreso', 'Cuotas de inscripción de alumnos', '#2E7D32'),
('Ventas', 'ingreso', 'Venta de mercancía y productos', '#4CAF50'),
('Donaciones', 'ingreso', 'Donaciones recibidas', '#81C784'),
('Cuotas', 'ingreso', 'Cuotas mensuales/periódicas', '#A5D6A7'),
('Eventos', 'egreso', 'Gastos en eventos y actividades', '#FFB74D'),
('Papelería', 'egreso', 'Materiales y suministros de oficina', '#FFA726'),
('Tecnología', 'egreso', 'Servicios tecnológicos y hosting', '#EF5350'),
('Servicios', 'egreso', 'Servicios varios', '#E57373'),
('Otros', 'ambos', 'Categoría general', '#9E9E9E');
```

---

## 🔐 Roles y Permisos

```sql
-- Tabla de permisos
CREATE TABLE permisos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rol VARCHAR(50) NOT NULL,
    accion VARCHAR(100) NOT NULL,
    recurso VARCHAR(100) NOT NULL,
    UNIQUE KEY unique_permiso (rol, accion, recurso)
);

INSERT INTO permisos (rol, accion, recurso) VALUES
-- Admin
('admin', 'crear', 'movimiento'),
('admin', 'editar', 'movimiento'),
('admin', 'eliminar', 'movimiento'),
('admin', 'ver', 'reportes'),
('admin', 'exportar', 'reportes'),
('admin', 'gestionar', 'usuarios'),

-- Tesorera
('tesorera', 'crear', 'movimiento'),
('tesorera', 'editar', 'movimiento'),
('tesorera', 'ver', 'reportes'),
('tesorera', 'exportar', 'reportes'),

-- Coordinador
('coordinador', 'crear', 'movimiento'),
('coordinador', 'ver', 'movimiento'),
('coordinador', 'ver', 'reportes'),

-- Miembro
('miembro', 'ver', 'movimiento'),
('miembro', 'ver', 'reportes_publicos');
```

---

## 📊 Queries Útiles para el Dashboard

```sql
-- Balance actual
SELECT
    SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) as ingresos_mes,
    SUM(CASE WHEN tipo = 'egreso' THEN monto ELSE 0 END) as egresos_mes,
    (SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) -
     SUM(CASE WHEN tipo = 'egreso' THEN monto ELSE 0 END)) as balance_mes
FROM movimientos
WHERE MONTH(fecha) = MONTH(CURDATE())
AND YEAR(fecha) = YEAR(CURDATE())
AND estado = 'completado';

-- Top 5 categorías de gasto
SELECT
    categoria,
    COUNT(*) as cantidad,
    SUM(monto) as total
FROM movimientos
WHERE tipo = 'egreso'
AND estado = 'completado'
AND fecha >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY categoria
ORDER BY total DESC
LIMIT 5;

-- Próximos eventos
SELECT
    titulo,
    fecha,
    hora,
    tipo,
    responsable_user_id
FROM eventos
WHERE estado = 'activo'
AND fecha >= CURDATE()
AND fecha <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
ORDER BY fecha ASC;

-- Movimientos pendientes
SELECT
    id,
    concepto,
    monto,
    fecha,
    responsable_nombre
FROM movimientos
WHERE estado = 'pendiente'
ORDER BY fecha ASC;
```

---

## 🔄 Relaciones entre Tablas

```
usuarios
    ├── hace ← movimientos
    ├── hace ← reportes
    ├── hace ← eventos (como responsable)
    └── hace ← auditoria
    
movimientos
    ├── tiene → usuario_id
    └── relacionada ← categorias

categorias
    ├── tiene ← movimientos
    └── tiene ← presupuestos

presupuestos
    └── relacionada ← categorias

eventos
    └── tiene → usuario_id (responsable)

reportes
    └── tiene → usuario_id

auditoria
    └── tiene → usuario_id
    
notificaciones
    └── tiene → usuario_id
```

---

## 💾 Backups Recomendados

```bash
# Daily backup
0 2 * * * mysqldump -u user -p password database | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz

# Weekly full backup
0 3 * * 0 mysqldump -u user -p password database | gzip > /backups/db_full_$(date +\%Y\%m\%d).sql.gz
```

---

## 🔒 Índices para Performance

Los índices ya están incluidos en las definiciones de tabla:
- `idx_fecha` - Para querys por rango de fechas
- `idx_tipo` - Para filtrar por tipo
- `idx_usuario` - Para búsquedas por usuario
- `idx_estado` - Para filtrar por estado

---

## 📈 Escalabilidad Futura

- Agregar tabla `transacciones_detalladas` para análisis granular
- Tabla `companias_asociadas` para gestionar múltiples entidades
- Tabla `integraciones` para conectar con sistemas externos
- Tabla `webhooks_eventos` para notificaciones en tiempo real

---

## 🧪 Script de Prueba (Datos de Ejemplo)

```sql
-- Crear usuario de prueba
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
('Tesorera Test', 'tesorera@example.com', SHA2('password123', 256), 'tesorera');

-- Crear movimientos de prueba (últimos 30 días)
INSERT INTO movimientos 
(tipo, fecha, concepto, categoria, monto, usuario_id, responsable_nombre, estado) 
VALUES
('ingreso', CURDATE() - INTERVAL 5 DAY, 'Inscripciones', 'Inscripciones', 25000, 1, 'Tesorera', 'completado'),
('egreso', CURDATE() - INTERVAL 3 DAY, 'Pago Proveedores', 'Eventos', 8500, 1, 'Coordinador', 'completado'),
('ingreso', CURDATE() - INTERVAL 2 DAY, 'Donación', 'Donaciones', 15000, 1, 'Admin', 'completado'),
('egreso', CURDATE(), 'Materiales', 'Papelería', 1200, 1, 'Tesorera', 'completado');
```

---

**Nota**: Este esquema está optimizado para:
- ✅ Integridad de datos
- ✅ Seguridad
- ✅ Performance
- ✅ Auditoría completa
- ✅ Escalabilidad futura
