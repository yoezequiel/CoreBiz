# CoreBiz ERP - Sistema de Gestión Empresarial 🚀

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18.2-blue.svg)](https://expressjs.com/)
[![Astro](https://img.shields.io/badge/Astro-4.16.0-purple.svg)](https://astro.build/)
[![Turso](https://img.shields.io/badge/Turso-SQLite-turquoise.svg)](https://turso.tech/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Sistema ERP (Enterprise Resource Planning) moderno y escalable diseñado específicamente para PyMEs, con arquitectura multi-tenant profesional y gestión empresarial completa.

> **🎓 Proyecto de Portafolio**: Este proyecto demuestra arquitectura profesional de software, separación de capas, patrones de diseño modernos y mejores prácticas de desarrollo full-stack.

## ✨ Demo en Vivo

🔗 **[Ver Demo](https://corebiz-yoezequiel.vercel.app)**

**Credenciales de Prueba:**

-   **Email**: `admin@corebiz.com`
-   **Contraseña**: `password123`

_Las credenciales están visibles directamente en la página de login con un botón de auto-completado._

## 🎯 Características Principales

### 📊 Módulos Implementados

#### 🔐 Autenticación y Autorización

-   ✅ Registro multi-tenant (empresa + usuario admin)
-   ✅ Login/logout con JWT
-   ✅ Cambio de contraseña seguro
-   ✅ Control de acceso basado en roles (Admin/Staff)
-   ✅ Auditoría completa de accesos

#### 🏢 Gestión de Empresas (Multi-tenant)

-   ✅ Aislamiento completo de datos por empresa
-   ✅ Gestión de información empresarial
-   ✅ Planes de suscripción (Free/Basic/Premium/Enterprise)
-   ✅ Activación/suspensión de cuentas

#### 👥 Gestión de Usuarios

-   ✅ CRUD completo de usuarios
-   ✅ Asignación de roles y permisos
-   ✅ Activación/desactivación de cuentas
-   ✅ Reseteo de contraseñas (admin)

#### 💼 Gestión de Clientes

-   ✅ CRUD completo con validación
-   ✅ Historial de ventas por cliente
-   ✅ Estados activo/inactivo
-   ✅ Búsqueda y filtros avanzados

#### 💰 Ventas y Facturación

-   ✅ Creación y gestión de ventas
-   ✅ Estados: pendiente/pagada/cancelada
-   ✅ Asociación con clientes y usuarios
-   ✅ Exportación a CSV
-   ✅ Filtros por fecha, cliente, estado

#### 📈 Dashboard Analítico

-   ✅ Métricas en tiempo real
-   ✅ Gráficos de ventas por mes
-   ✅ Top clientes por facturación
-   ✅ Actividad reciente
-   ✅ Estadísticas de clientes activos

#### 📝 Sistema de Auditoría

-   ✅ Registro automático de todas las acciones
-   ✅ Tracking de cambios (old/new values)
-   ✅ IP y timestamp de cada operación
-   ✅ Filtros y búsqueda en logs

## 🏗️ Arquitectura Profesional

### Stack Tecnológico

#### Backend

-   **Framework**: Express.js v4.18.2 con ES Modules
-   **Base de Datos**: Turso (SQLite distribuido globalmente)
-   **Autenticación**: JWT + bcrypt
-   **Validación**: validator.js
-   **Arquitectura**: Layered Architecture con separación de responsabilidades

#### Frontend

-   **Framework**: Astro v4.16.0 con SSR
-   **Estilos**: Tailwind CSS v3.4.1
-   **Rendering**: Server-Side Rendering para mejor SEO

### Estructura de Capas

```
📁 backend/
├── 📁 src/
│   ├── 📁 config/         # Configuraciones (DB, env)
│   ├── 📁 constants/      # Constantes centralizadas
│   ├── 📁 controllers/    # Controladores (opcional, ejemplo)
│   ├── 📁 services/       # ⭐ Lógica de negocio
│   ├── 📁 routes/         # Definición de endpoints
│   ├── 📁 middleware/     # Auth, audit, error handling
│   ├── 📁 utils/          # Utilidades y helpers
│   ├── 📁 database/       # Schema y seeds
│   └── 📄 index.js        # Entry point
```

**Principios Aplicados:**

-   ✅ **Separation of Concerns**: Servicios separados de rutas
-   ✅ **DRY**: Código reutilizable en servicios
-   ✅ **SOLID**: Clases de error especializadas
-   ✅ **Error Handling**: Sistema centralizado con tipos de error
-   ✅ **Security**: Multi-tenant isolation, JWT, bcrypt
-   ✅ **Testability**: Servicios independientes de Express

> 📖 Ver [ARQUITECTURA.md](./ARQUITECTURA.md) para documentación completa de la arquitectura.

## 🚀 Inicio Rápido

### Requisitos Previos

-   Node.js >= 18
-   npm o pnpm
-   Cuenta en [Turso](https://turso.tech) (gratuita)

### Instalación Rápida

#### 1. Clonar y Configurar Backend

```bash
# Clonar repositorio
cd corebiz/backend

# Instalar dependencias
npm install

# Copiar archivo de entorno
cp .env.example .env
```

#### 2. Configurar Base de Datos Turso

```bash
# Instalar CLI de Turso
curl -sSfL https://get.tur.so/install.sh | bash

# Login (abre navegador)
turso auth login

# Crear base de datos
turso db create corebiz

# Obtener URL y token
turso db show corebiz --url
turso db tokens create corebiz
```

Actualizar [backend/.env](backend/.env):

```env
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=eyJhbGci...
JWT_SECRET=your-super-secret-key-change-this
PORT=3000
FRONTEND_URL=http://localhost:4321
```

#### 3. Inicializar Base de Datos

```bash
# Crear tablas y datos de prueba
npm run seed
```

#### 4. Iniciar Backend

```bash
npm run dev
# ✅ Backend corriendo en http://localhost:3000
```

#### 5. Configurar e Iniciar Frontend

```bash
cd ../frontend
npm install

# Crear .env (opcional, usa defaults)
echo "PUBLIC_API_URL=http://localhost:3000/api" > .env

npm run dev
# ✅ Frontend corriendo en http://localhost:4321
```

### 🎉 ¡Listo!

Abre [http://localhost:4321](http://localhost:4321) y usa las credenciales demo:

-   **Email**: `admin@corebiz.com`
-   **Contraseña**: `password123`

## 📚 Documentación Adicional

-   [ARQUITECTURA.md](./ARQUITECTURA.md) - Documentación completa de arquitectura
-   [TURSO_SETUP.md](./TURSO_SETUP.md) - Guía detallada de configuración de Turso
-   [REQUERIEMIENTOS.md](./REQUERIEMIENTOS.md) - Especificación original del proyecto

## 🔑 Credenciales de Prueba

El sistema incluye datos de demostración pre-cargados:

### Empresas y Usuarios

| Email              | Contraseña  | Rol   | Empresa      |
| ------------------ | ----------- | ----- | ------------ |
| admin@corebiz.com  | password123 | Admin | CoreBiz Demo |
| staff@corebiz.com  | password123 | Staff | CoreBiz Demo |
| admin@empresa2.com | password123 | Admin | Empresa 2    |

### Datos de Prueba Incluidos

-   2 empresas registradas
-   3 usuarios (2 admins, 1 staff)
-   4 clientes de ejemplo
-   6 ventas registradas
-   Logs de auditoría

## 🛠️ Comandos Disponibles

### Backend

```bash
npm run dev          # Desarrollo con nodemon
npm start            # Producción
npm run seed         # Inicializar DB con datos
```

### Frontend

```bash
npm run dev          # Desarrollo (puerto 4321)
npm run build        # Build para producción
npm run preview      # Preview del build
```

## 🔐 Seguridad

-   ✅ **JWT** con expiración de 7 días
-   ✅ **Bcrypt** para hashing de contraseñas (10 rounds)
-   ✅ **Prepared Statements** para prevenir SQL injection
-   ✅ **Validación de inputs** con validator.js
-   ✅ **CORS** configurado para origen específico
-   ✅ **Multi-tenant isolation** a nivel de datos
-   ✅ **Auditoría completa** de acciones sensibles
-   ✅ **Error handling** sin exponer información sensible

## 🌐 API Endpoints

### Autenticación

```
POST   /api/auth/register          # Registrar empresa
POST   /api/auth/login             # Iniciar sesión
POST   /api/auth/change-password   # Cambiar contraseña
```

### Empresas

```
GET    /api/company                # Info de la empresa
PUT    /api/company                # Actualizar empresa
PATCH  /api/company/deactivate     # Desactivar empresa
```

### Usuarios

```
GET    /api/users                  # Listar usuarios
POST   /api/users                  # Crear usuario
GET    /api/users/:id              # Obtener usuario
PUT    /api/users/:id              # Actualizar usuario
PATCH  /api/users/:id/status       # Cambiar estado
```

### Clientes

```
GET    /api/customers              # Listar clientes
POST   /api/customers              # Crear cliente
GET    /api/customers/:id          # Obtener cliente
PUT    /api/customers/:id          # Actualizar cliente
PATCH  /api/customers/:id/status   # Cambiar estado
```

### Ventas

```
GET    /api/sales                  # Listar ventas
POST   /api/sales                  # Crear venta
GET    /api/sales/:id              # Obtener venta
PUT    /api/sales/:id              # Actualizar venta
DELETE /api/sales/:id              # Eliminar venta
GET    /api/sales/export/csv       # Exportar CSV
```

### Dashboard

```
GET    /api/dashboard/stats        # Estadísticas generales
GET    /api/dashboard/sales-month  # Ventas por mes
GET    /api/dashboard/top-customers # Top clientes
GET    /api/dashboard/activity     # Actividad reciente
```

### Auditoría

```
GET    /api/audit                  # Logs de auditoría
GET    /api/audit/summary          # Resumen de auditoría
```

## 📊 Modelo de Datos

### Esquema Multi-Tenant

```
companies
├── users (1:N)
├── customers (1:N)
│   └── sales (1:N)
└── audit_logs (1:N)
```

**Aislamiento**: Todas las queries incluyen filtro por `company_id` para garantizar separación completa de datos entre empresas.

## 🎨 Características de UX/UI

-   ✅ **Diseño Responsive** - Mobile-first design
-   ✅ **Credenciales Visibles** - Botón de auto-completado en login
-   ✅ **Feedback Visual** - Mensajes de éxito/error claros
-   ✅ **Tablas Interactivas** - Filtros, búsqueda, paginación
-   ✅ **Modales** - Para crear/editar sin salir de página
-   ✅ **Exportación** - Descargar ventas en CSV
-   ✅ **Dashboard Analítico** - Métricas visuales importantes

## 🚀 Deployment

### Recomendaciones de Hosting

**Backend:**

-   Railway.app (recomendado)
-   Render.com
-   Fly.io
-   AWS ECS/Fargate

**Frontend:**

-   Vercel (recomendado para Astro)
-   Netlify
-   Cloudflare Pages

**Base de Datos:**

-   Turso (incluye plan gratuito con 9GB)

### Variables de Entorno en Producción

**Backend (.env):**

```env
NODE_ENV=production
PORT=3000
TURSO_DATABASE_URL=libsql://[name].turso.io
TURSO_AUTH_TOKEN=eyJ...
JWT_SECRET=use-strong-random-secret-here
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://yourdomain.com
```

**Frontend (.env):**

```env
PUBLIC_API_URL=https://api.yourdomain.com/api
```

## 🧪 Testing (Futuro)

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```
