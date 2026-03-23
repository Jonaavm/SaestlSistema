# 📊 Componentes Funcionales - Sistema de Gestión Financiera

## Descripción General

Este documento detalla los componentes desarrollados para la aplicación de gestión financiera de la Sociedad de Alumnos SAESTL.

---

## 🎯 Componentes Creados

### 1. **MovementsTable** (`movements-table.jsx`)
#### Ubicación: `src/app/components/dashboard/movements-table.jsx`

**Propósito**: Tabla detallada de movimientos con filtros avanzados.

**Características**:
- ✅ Tabla completa con columnas: Fecha, Concepto, Categoría, Monto, Responsable, Estado
- ✅ Filtros por:
  - 🔍 Búsqueda de concepto y responsable
  - 📋 Tipo (Ingreso/Egreso)
  - 🏷️ Categoría (Ingresos, Eventos, Papelería, Tecnología, Donaciones, Otros)
  - 📅 Rango de fechas (From/To)
- ✅ Ordenamiento interactivo en todas las columnas
- ✅ Resumen de totales (Ingresos, Egresos, Balance)
- ✅ Integración con privacidad (ocultar valores)
- ✅ Indicadores visuales por tipo de movimiento
- ✅ Descarga de datos

**Props**:
```jsx
<MovementsTable isPrivate={boolean} />
```

---

### 2. **ReportsAnalytics** (`reports-analytics.jsx`)
#### Ubicación: `src/app/components/dashboard/reports-analytics.jsx`

**Propósito**: Análisis visual de datos con gráficos y estadísticas.

**Características**:
- 📊 Selector de rango de fechas (desde/hasta)
- 📈 Estadísticas principales:
  - Total de Ingresos
  - Total de Egresos
  - Ganancia Neta
  - Promedio Diario
- 🥧 Gráficos Pie:
  - Egresos por Categoría (Eventos, Papelería, Tecnología, Otros)
  - Ingresos por Tipo (Inscripciones, Ventas, Donaciones, Cuotas)
- 📊 Gráfico de Barras: Tendencia Mensual (Ingresos, Egresos, Ganancia)
- 🎨 Colores coherentes con el tema de la marca
- 📥 Exportación de reportes en PDF
- 🔒 Integración con modo privacidad

**Props**:
```jsx
<ReportsAnalytics isPrivate={boolean} />
```

---

### 3. **CalendarEvents** (`calendar-events.jsx`)
#### Ubicación: `src/app/components/dashboard/calendar-events.jsx`

**Propósito**: Gestión de calendario con eventos y fechas límite.

**Características**:
- 📅 Calendario interactivo mes a mes
- 🎯 Marcado de eventos por tipo:
  - ❌ Fecha Límite (rojo)
  - 🔚 Cierre (gris)
  - 📍 Evento (azul)
  - 👥 Reunión (verde)
- ⏰ Detalles de eventos: fecha, hora, ubicación, responsable
- ◀️ ▶️ Navegación entre meses
- 📋 Lista de próximos eventos y fechas límite
- 🎨 Leyenda visual de tipos de eventos
- 🔒 Diseño limpio y profesional

**Props**:
```jsx
<CalendarEvents />
```

---

### 4. **AddMovementDialog** (`add-movement-dialog.jsx`)
#### Ubicación: `src/app/components/dashboard/add-movement-dialog.jsx`

**Propósito**: Modal para registrar nuevos movimientos financieros.

**Características**:
- 📝 Formulario con validación:
  - Tipo (Ingreso/Egreso)
  - Fecha
  - Concepto
  - Categoría (dinámica según tipo)
  - Monto
  - Responsable
  - Notas (opcional)
- 🎨 Diseño consistente con tema de marca
- ✅ Botones de Cancelar/Registrar
- 🔄 Reset de formulario después de envío

**Props**:
```jsx
<AddMovementDialog isOpen={boolean} onOpenChange={(bool) => void} />
```

**Uso**:
```jsx
const [isDialogOpen, setIsDialogOpen] = React.useState(false)

<Button onClick={() => setIsDialogOpen(true)}>
  Nuevo Movimiento
</Button>

<AddMovementDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
```

---

### 5. **EnhancedKPICards** (`enhanced-kpi-cards.jsx`)
#### Ubicación: `src/app/components/dashboard/enhanced-kpi-cards.jsx`

**Propósito**: Tarjetas mejoradas de KPI con Balance Total.

**Características**:
- 💰 Tarjeta de Balance Total (gradiente de marca)
- 📈 Tarjeta de Ingresos del Mes
- 📉 Tarjeta de Egresos del Mes
- 📊 Indicadores de tendencia vs mes anterior
- 🔒 Integración con modo privacidad
- ✨ Efectos hover y sombras mejoradas

**Props**:
```jsx
<EnhancedKPICards isPrivate={boolean} />
```

---

## 📄 Páginas Actualizadas

### 1. **Movimientos** (`src/app/pages/Mov.jsx`)
- Integración de `MovementsTable`
- Header con descripción mejorada
- Botón para agregar nuevo movimiento
- Navbar completa
- KPICards para contexto

### 2. **Reportes** (`src/app/pages/Reportes.jsx`)
- Integración de `ReportsAnalytics`
- Header descriptivo
- Botón para generar/descargar reporte
- Navbar completa

### 3. **Calendario** (`src/app/pages/Calendario.jsx`)
- Integración de `CalendarEvents`
- Botón para agregar nuevo evento
- Header descriptivo
- Navbar completa

---

## 🎨 Características de Diseño

### Paleta de Colores
- **Primario**: #800020 (Rojo vino)
- **Secundario**: #D4AF37 (Oro)
- **Fondo**: #FDFBF7 (Beige claro)
- **Texto Principal**: #3D3325 (Marrón oscuro)
- **Texto Secundario**: #8D8271 (Beige oscuro)
- **Éxito**: #2E7D32 (Verde)
- **Error**: #C62828 (Rojo)

### Componentes Reutilizables Utilizados
- `Card` - Contenedores principales
- `Button` - Botones de acción
- `Input` - Campos de texto
- `Select` - Desplegables
- `Dialog` - Modales
- `Textarea` - Áreas de texto

---

## 🔒 Consideraciones de Privacidad

Todos los componentes incluyen **modo privacidad** que:
- Oculta valores monetarios (muestra ****)
- Oscurece información sensible
- Mantiene la usabilidad sin comprometer seguridad
- Se activa/desactiva desde navbar de cada página

---

## 📊 Datos de Ejemplo

### Movimientos
- Inscripciones: $25,000
- Venta de Mercancía: $4,200
- Donaciones: $15,000
- Cuotas Mensuales: $12,000
- Pagos a Proveedores: $8,500
- Materiales: $1,200
- Servicios: $3,500

### Categorías
**Ingresos**: Inscripciones, Ventas, Donaciones, Cuotas, Otros
**Egresos**: Eventos, Papelería, Tecnología, Servicios, Otros

### Eventos del Calendario
- Pagos de Proveedores
- Cortes de Caja
- Eventos de Recaudación
- Fechas Límite de Reportes
- Reuniones de Junta Directiva

---

## 🚀 Próximos Pasos Recomendados

1. **Conexión a Backend**
   - Reemplazar datos estáticos con API calls
   - Implementar autenticación
   - Agregar validaciones en servidor

2. **Funcionalidades Adicionales**
   - Exportación a Excel/CSV
   - Notificaciones de alertas
   - Gráficos personalizables
   - Búsqueda avanzada
   - Reportes automatizados

3. **Mejoras de UX**
   - Animaciones en transiciones
   - Atajos de teclado
   - Dark mode
   - Respuesta táctil en móviles

4. **Seguridad**
   - Encriptación de datos sensibles
   - Auditoría de cambios
   - Permisos de usuario por rol
   - Backup automático

---

## 📱 Responsividad

Todos los componentes están optimizados para:
- 📱 Mobile (< 640px)
- 💻 Tablet (640px - 1024px)
- 🖥️ Desktop (> 1024px)

Las tablas se adaptan automáticamente con scroll horizontal en móviles.

---

## 🔧 Dependencias Utilizadas

- **React** 18.3.1
- **Recharts** 2.15.2 - Gráficos
- **Radix UI** - Componentes accesibles
- **Lucide React** - Iconos
- **date-fns** 3.6.0 - Formato de fechas
- **Tailwind CSS** 4.1.12 - Estilos

---

## 📧 Contacto para Mejoras

Si necesitas agregar más funcionalidades o realizar cambios, considera:

1. Agregar filtros de permisos por usuario
2. Implementar autorización con roles
3. Agregar historial de cambios
4. Crear reportes personalizables
5. Integrar con sistemas de pago
