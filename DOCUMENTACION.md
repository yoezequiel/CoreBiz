# CoreBiz ERP - Documentación Técnica

## 📋 Resumen Ejecutivo

**CoreBiz** es un sistema ERP (Enterprise Resource Planning) multi-tenant diseñado para gestionar operaciones comerciales de pequeñas y medianas empresas. El sistema permite a múltiples compañías operar de manera independiente en una única instancia de la aplicación, con aislamiento completo de datos y gestión centralizada de clientes, ventas, usuarios y análisis empresarial.

### Propósito del Proyecto

Este proyecto fue desarrollado como una demostración de arquitectura de software profesional, implementando patrones de diseño modernos, separación de responsabilidades y mejores prácticas de desarrollo. Está diseñado para ser presentado en un portafolio profesional, destacando capacidades en:

-   Arquitectura de software escalable
-   Desarrollo full-stack con tecnologías modernas
-   Implementación de seguridad y autenticación
-   Diseño de APIs RESTful
-   Gestión de bases de datos relacionales
-   Patrones de diseño empresariales

---

## 🎯 Funcionalidades Principales

### Para Usuarios Administradores

-   **Gestión de Usuarios**: Crear, editar y administrar usuarios de la empresa
-   **Dashboard Analítico**: Visualización de métricas clave (ventas, clientes, ingresos)
-   **Gestión de Clientes**: CRUD completo de clientes con historial de ventas
-   **Gestión de Ventas**: Registro, seguimiento y control de ventas
-   **Reportes y Auditoría**: Logs de actividad y trazabilidad de operaciones
-   **Gestión de Empresa**: Configuración y administración de datos empresariales

### Para Usuarios Staff

-   **Acceso a Dashboard**: Visualización de métricas de la empresa
-   **Gestión de Clientes**: Crear y editar información de clientes
-   **Registro de Ventas**: Crear y gestionar ventas propias
-   **Consulta de Información**: Acceso de lectura a datos de la empresa

---

## 🏗️ Arquitectura del Sistema

### Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Astro)                       │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Pages     │  │  Components  │  │   Lib (API)  │      │
│  │   (.astro)  │  │   (.astro)   │  │   (.ts)      │      │
│  └─────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP/REST API
                            │ JWT Authentication
┌───────────────────────────┴─────────────────────────────────┐
│                    BACKEND (Express.js)                      │
│  ┌────────────┐  ┌──────────┐  ┌────────────┐             │
│  │   Routes   │→ │  Service │→ │  Database  │             │
│  │ (REST API) │  │  Layer   │  │   (Turso)  │             │
│  └────────────┘  └──────────┘  └────────────┘             │
│         ↓              ↓                                     │
│  ┌────────────┐  ┌──────────┐                              │
│  │ Middleware │  │  Utils   │                              │
│  └────────────┘  └──────────┘                              │
└─────────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                   DATABASE (Turso/SQLite)                    │
│  • Multi-tenant (company_id isolation)                       │
│  • Relational schema with foreign keys                       │
│  • Triggers for auto-update timestamps                       │
│  • Indexes for query optimization                            │
└─────────────────────────────────────────────────────────────┘
```

### Arquitectura Backend - Capa de Servicio

```
┌──────────────┐
│   Route      │  ← Define endpoints y validaciones HTTP
└──────┬───────┘
       │ calls
┌──────▼───────┐
│  Service     │  ← Lógica de negocio, validaciones, reglas
└──────┬───────┘
       │ uses
┌──────▼───────┐
│  Database    │  ← Acceso a datos, queries SQL
└──────────────┘
```

**Ventajas de esta arquitectura:**

-   ✅ Separación de responsabilidades (SoC)
-   ✅ Reutilización de lógica de negocio
-   ✅ Facilidad de testing
-   ✅ Mantenibilidad y escalabilidad
-   ✅ Independencia de la capa de presentación

### Arquitectura Frontend - Lib Centralizada

```
┌────────────────────────────────────────┐
│           Pages (.astro)               │
│  • index.astro (Login)                 │
│  • dashboard.astro                     │
│  • customers.astro, sales.astro, etc.  │
└────────────────┬───────────────────────┘
                 │ imports
┌────────────────▼───────────────────────┐
│         Lib Folder (/lib)              │
│  ┌──────────────────────────────────┐  │
│  │ services.ts                      │  │
│  │ • authService                    │  │
│  │ • customerService                │  │
│  │ • saleService, etc.              │  │
│  └──────────────┬───────────────────┘  │
│                 │ uses                  │
│  ┌──────────────▼───────────────────┐  │
│  │ api.ts (HTTP Client)             │  │
│  │ • get(), post(), put(), del()    │  │
│  │ • Auth header management         │  │
│  └──────────────┬───────────────────┘  │
│                 │ uses                  │
│  ┌──────────────▼───────────────────┐  │
│  │ config.ts                        │  │
│  │ • API_BASE_URL                   │  │
│  │ • API_ENDPOINTS                  │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ utils.ts                         │  │
│  │ • formatCurrency(), formatDate() │  │
│  │ • showError(), debounce()        │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

---

## 💻 Stack Tecnológico

### Backend

| Tecnología         | Propósito                                | Versión |
| ------------------ | ---------------------------------------- | ------- |
| **Node.js**        | Runtime de JavaScript                    | v18+    |
| **Express.js**     | Framework web para APIs REST             | v4.x    |
| **Turso (libSQL)** | Base de datos SQLite en la nube          | -       |
| **JWT**            | Autenticación basada en tokens           | -       |
| **bcrypt**         | Hash seguro de contraseñas               | v5.x    |
| **Bun**            | Runtime alternativo y gestor de paquetes | Latest  |

### Frontend

| Tecnología     | Propósito                           | Versión |
| -------------- | ----------------------------------- | ------- |
| **Astro**      | Framework para sitios web estáticos | v5.x    |
| **TypeScript** | Tipado estático para JavaScript     | v5.x    |
| **HTML/CSS**   | Estructura y estilos                | -       |

### Infraestructura

-   **Turso Cloud**: Base de datos SQLite distribuida y serverless
-   **Control de Versiones**: Git
-   **Gestión de Dependencias**: Bun / npm

---

## 🗄️ Modelo de Datos

### Diagrama Entidad-Relación

```
┌─────────────┐
│  companies  │
│─────────────│
│ id (PK)     │◄──┐
│ name        │   │
│ email       │   │ 1:N
│ plan        │   │
│ status      │   │
└─────────────┘   │
                  │
     ┌────────────┴────────────┬─────────────┬─────────────┐
     │                         │             │             │
┌────▼─────┐          ┌────────▼───┐  ┌─────▼─────┐  ┌───▼──────┐
│  users   │          │ customers  │  │   sales   │  │ audit_   │
│──────────│          │────────────│  │───────────│  │  logs    │
│ id (PK)  │          │ id (PK)    │  │ id (PK)   │  │──────────│
│ company_id│         │ company_id │  │ company_id│  │ id (PK)  │
│ email    │          │ name       │  │ customer_id│ │company_id│
│ password │          │ email      │  │ user_id   │  │ user_id  │
│ full_name│          │ phone      │  │ amount    │  │ action   │
│ role     │          │ status     │  │ status    │  │ entity_  │
│ status   │          └────────────┘  │ sale_date │  │  type    │
└──────────┘                          │ notes     │  └──────────┘
                                      └───────────┘
```

### Aislamiento Multi-Tenant

Cada tabla (excepto `companies`) contiene `company_id` como Foreign Key, asegurando:

-   ✅ Aislamiento completo de datos por empresa
-   ✅ Queries automáticamente filtrados por `company_id`
-   ✅ Imposibilidad de acceso cruzado entre empresas
-   ✅ DELETE CASCADE para integridad referencial

---

## 🔒 Seguridad

### Autenticación y Autorización

1. **JWT (JSON Web Tokens)**

    - Token generado al login con payload: `{ userId, companyId, role }`
    - Expiración configurable
    - Almacenado en cookies HTTP-only (frontend)

2. **Middleware de Autenticación**

    ```javascript
    authenticate → Verifica token válido
    ensureSameTenant → Valida company_id en requests
    authorize(role) → Control de acceso basado en roles
    ```

3. **Hash de Contraseñas**

    - bcrypt con salt rounds configurable
    - No se almacenan contraseñas en texto plano

4. **Control de Acceso Basado en Roles (RBAC)**
    - **admin**: Acceso completo a todas las funcionalidades
    - **staff**: Acceso limitado (sin gestión de usuarios)

### Validaciones

-   ✅ Validación de datos de entrada en servicios
-   ✅ Sanitización de inputs para prevenir SQL injection
-   ✅ Uso de prepared statements (queries parametrizadas)
-   ✅ Validación de tipos con TypeScript en frontend

---

## 📁 Estructura del Proyecto

```
corebiz/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Configuración de Turso
│   │   ├── constants/
│   │   │   └── index.js              # Constantes (roles, status, etc.)
│   │   ├── controllers/
│   │   │   ├── auth.controller.js    # Controlador de autenticación
│   │   │   └── customer.controller.js # Ejemplo de controlador
│   │   ├── database/
│   │   │   ├── schema.sql            # Esquema de base de datos
│   │   │   └── seed.js               # Script de datos demo
│   │   ├── middleware/
│   │   │   ├── auth.js               # Middleware de autenticación
│   │   │   └── errorHandler.js       # Manejo centralizado de errores
│   │   ├── routes/
│   │   │   ├── auth.routes.js        # Rutas de autenticación
│   │   │   ├── company.routes.js     # Rutas de empresa
│   │   │   ├── customer.routes.js    # Rutas de clientes
│   │   │   ├── dashboard.routes.js   # Rutas de dashboard
│   │   │   ├── sale.routes.js        # Rutas de ventas
│   │   │   ├── user.routes.js        # Rutas de usuarios
│   │   │   └── audit.routes.js       # Rutas de auditoría
│   │   ├── services/
│   │   │   ├── auth.service.js       # Lógica de negocio - Auth
│   │   │   ├── company.service.js    # Lógica de negocio - Company
│   │   │   ├── customer.service.js   # Lógica de negocio - Customers
│   │   │   ├── dashboard.service.js  # Lógica de negocio - Dashboard
│   │   │   ├── sale.service.js       # Lógica de negocio - Sales
│   │   │   ├── user.service.js       # Lógica de negocio - Users
│   │   │   └── audit.service.js      # Lógica de negocio - Audit
│   │   ├── utils/
│   │   │   └── response.js           # Utilidades de respuesta HTTP
│   │   └── index.js                  # Punto de entrada del servidor
│   ├── .env                          # Variables de entorno
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.astro          # Componente de navegación
│   │   ├── lib/
│   │   │   ├── config.ts             # Configuración centralizada
│   │   │   ├── api.ts                # Cliente HTTP
│   │   │   ├── services.ts           # Servicios de API
│   │   │   └── utils.ts              # Utilidades UI
│   │   ├── pages/
│   │   │   ├── index.astro           # Página de login
│   │   │   ├── dashboard.astro       # Dashboard principal
│   │   │   ├── customers.astro       # Gestión de clientes
│   │   │   ├── sales.astro           # Gestión de ventas
│   │   │   ├── users.astro           # Gestión de usuarios
│   │   │   └── register.astro        # Registro de empresa
│   │   └── env.d.ts                  # Tipos de variables de entorno
│   ├── astro.config.mjs
│   └── package.json
│
├── DOCUMENTACION.md                  # Este archivo
├── ARQUITECTURA.md                   # Documentación de arquitectura backend
├── ARQUITECTURA_FRONTEND.md          # Documentación de arquitectura frontend
├── PATRONES_DISEÑO.md                # Patrones implementados
├── MEJORAS_IMPLEMENTADAS.md          # Log de mejoras backend
├── FRONTEND_MEJORAS.md               # Log de mejoras frontend
├── PROYECTO_COMPLETO.md              # Resumen ejecutivo del proyecto
├── TURSO_SETUP.md                    # Guía de configuración Turso
├── QUICK_START.md                    # Guía de inicio rápido
├── REQUERIEMIENTOS.md                # Requerimientos originales
└── README.md                         # Documentación general
```

---

## 🚀 Instalación y Ejecución

### Requisitos Previos

-   Node.js 18+ o Bun
-   Cuenta en Turso Cloud (https://turso.tech)
-   Git

### Configuración Inicial

#### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd corebiz
```

#### 2. Configurar Backend

```bash
cd backend
bun install  # o npm install

# Crear archivo .env con las credenciales de Turso
cp .env.example .env
```

**Archivo `.env`:**

```env
TURSO_DATABASE_URL=libsql://your-database-url.turso.io
TURSO_AUTH_TOKEN=your-auth-token
JWT_SECRET=your-secret-key-here
PORT=3000
```

#### 3. Inicializar Base de Datos

```bash
# Ejecutar schema y seed (crear tablas + datos demo)
bun run seed
```

**Datos de demostración creados:**

-   Empresa: "Empresa Demo" (admin@demo.com / Admin123!)
-   3 usuarios (1 admin, 2 staff)
-   5 clientes
-   10 ventas

#### 4. Configurar Frontend

```bash
cd ../frontend
bun install  # o npm install

# Crear archivo .env
echo "PUBLIC_API_URL=http://localhost:3000/api" > .env
```

### Ejecutar en Desarrollo

#### Terminal 1 - Backend

```bash
cd backend
bun run dev
# Servidor corriendo en http://localhost:3000
```

#### Terminal 2 - Frontend

```bash
cd frontend
bun run dev
# Frontend corriendo en http://localhost:4321
```

### Acceso a la Aplicación

1. Abrir navegador en `http://localhost:4321`
2. Login con credenciales demo:
    - **Email**: admin@demo.com
    - **Password**: Admin123!
3. Explorar dashboard, clientes, ventas, usuarios

---

## 🧪 Testing y Validación

### Endpoints Disponibles

#### Autenticación

```
POST   /api/auth/register      # Registro de empresa
POST   /api/auth/login         # Login de usuario
POST   /api/auth/change-password # Cambio de contraseña
GET    /api/auth/me            # Información del usuario actual
```

#### Dashboard

```
GET    /api/dashboard/stats              # Estadísticas generales
GET    /api/dashboard/sales-by-month     # Ventas por mes
GET    /api/dashboard/top-customers      # Top clientes
GET    /api/dashboard/recent-activity    # Actividad reciente
```

#### Clientes

```
GET    /api/customers          # Lista de clientes
POST   /api/customers          # Crear cliente
GET    /api/customers/:id      # Obtener cliente
PUT    /api/customers/:id      # Actualizar cliente
PATCH  /api/customers/:id/status # Toggle status
GET    /api/customers/:id/sales  # Ventas del cliente
```

#### Ventas

```
GET    /api/sales              # Lista de ventas
POST   /api/sales              # Crear venta
GET    /api/sales/:id          # Obtener venta
PUT    /api/sales/:id          # Actualizar venta
DELETE /api/sales/:id          # Eliminar venta
GET    /api/sales/export/csv   # Exportar CSV
```

#### Usuarios (Admin only)

```
GET    /api/users              # Lista de usuarios
POST   /api/users              # Crear usuario
GET    /api/users/:id          # Obtener usuario
PUT    /api/users/:id          # Actualizar usuario
PATCH  /api/users/:id/status   # Toggle status
```

### Testing Manual con cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.com","password":"Admin123!"}'

# Dashboard stats (con token)
curl http://localhost:3000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"

# Crear cliente
curl -X POST http://localhost:3000/api/customers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Nuevo Cliente","email":"cliente@test.com"}'
```

---

## 🎨 Patrones de Diseño Implementados

### 1. Service Layer Pattern

Separación de lógica de negocio de controladores y rutas.

**Beneficios:**

-   Reutilización de código
-   Testing simplificado
-   Mantenibilidad

### 2. Repository Pattern

Abstracción de acceso a datos a través de servicios.

### 3. Middleware Chain Pattern

Composición de middlewares para autenticación, autorización y manejo de errores.

### 4. Singleton Pattern

Instancia única de conexión a base de datos compartida.

### 5. Factory Pattern

Creación de respuestas HTTP estandarizadas.

### 6. Strategy Pattern

Diferentes estrategias de autenticación y autorización según rol.

---

## 📊 Métricas de Calidad

### Código

-   ✅ **Separación de responsabilidades**: Capa de servicio independiente
-   ✅ **DRY (Don't Repeat Yourself)**: Utilidades reutilizables
-   ✅ **SOLID Principles**: Aplicados en servicios y middleware
-   ✅ **Error Handling**: Manejo centralizado con clases de error personalizadas
-   ✅ **Type Safety**: TypeScript en frontend

### Seguridad

-   ✅ **Autenticación JWT**
-   ✅ **Hash de contraseñas con bcrypt**
-   ✅ **RBAC (Role-Based Access Control)**
-   ✅ **Prepared statements** (prevención SQL injection)
-   ✅ **Aislamiento multi-tenant**

### Performance

-   ✅ **Índices en base de datos** para queries frecuentes
-   ✅ **Queries optimizadas** con JOINs eficientes
-   ✅ **Conexión única a DB** (singleton)
-   ✅ **Debouncing en búsquedas** (frontend)

---

## 🔄 Flujos de Usuario Principales

### 1. Registro de Empresa

```
Usuario → Formulario Registro → Backend valida datos
→ Crea company → Crea usuario admin → Retorna token
→ Redirección a Dashboard
```

### 2. Login

```
Usuario → Formulario Login → Backend valida credenciales
→ Genera JWT → Frontend guarda token → Redirección a Dashboard
```

### 3. Crear Venta

```
Usuario → Formulario Venta → Frontend valida datos
→ API POST /api/sales → Service valida customer_id
→ Crea venta en DB → Registra audit log → Retorna venta creada
→ Frontend actualiza vista
```

### 4. Dashboard Analytics

```
Usuario → Dashboard → Frontend solicita /api/dashboard/stats
→ Service calcula métricas del mes actual
→ Service obtiene ventas por mes
→ Frontend renderiza gráficos y KPIs
```

---

## 🛠️ Mantenimiento y Escalabilidad

### Agregar Nuevas Funcionalidades

#### 1. Nueva entidad (ejemplo: Products)

**Backend:**

```bash
# 1. Crear tabla en schema.sql
# 2. Crear servicio: services/product.service.js
# 3. Crear rutas: routes/product.routes.js
# 4. Registrar en index.js: app.use("/api/products", productRoutes)
```

**Frontend:**

```typescript
// 1. Agregar endpoints en lib/config.ts
// 2. Agregar servicio en lib/services.ts
// 3. Crear página: pages/products.astro
```

### Escalabilidad Horizontal

El sistema está diseñado para escalar horizontalmente:

-   ✅ Stateless API (JWT en cliente)
-   ✅ Base de datos en la nube (Turso)
-   ✅ Sin sesiones en memoria
-   ✅ Ready para load balancers

### Migraciones de Base de Datos

Para cambios en el schema:

1. Modificar `schema.sql`
2. Crear script de migración
3. Aplicar en producción antes de deployment
4. Actualizar servicios afectados

---

## 📚 Recursos Adicionales

### Documentación Relacionada

-   [QUICK_START.md](QUICK_START.md) - Guía rápida de inicio
-   [ARQUITECTURA.md](ARQUITECTURA.md) - Arquitectura backend detallada
-   [ARQUITECTURA_FRONTEND.md](ARQUITECTURA_FRONTEND.md) - Arquitectura frontend detallada
-   [PATRONES_DISEÑO.md](PATRONES_DISEÑO.md) - Patrones implementados
-   [TURSO_SETUP.md](TURSO_SETUP.md) - Configuración de Turso

### Referencias Técnicas

-   [Astro Documentation](https://docs.astro.build)
-   [Express.js Guide](https://expressjs.com)
-   [Turso Documentation](https://docs.turso.tech)
-   [JWT Introduction](https://jwt.io/introduction)

---

## 👥 Información para Recursos Humanos

### Habilidades Técnicas Demostradas

1. **Backend Development**

    - API REST design
    - Arquitectura de microservicios
    - Seguridad y autenticación
    - Manejo de bases de datos relacionales

2. **Frontend Development**

    - Frameworks modernos (Astro)
    - TypeScript
    - Integración de APIs
    - UX/UI básico

3. **Software Architecture**

    - Patrones de diseño
    - Separation of Concerns
    - Clean Code principles
    - Documentación técnica

4. **DevOps & Tools**
    - Git version control
    - Environment configuration
    - Database migrations
    - Deployment readiness

### Complejidad del Proyecto

-   **Nivel**: Intermedio-Avanzado
-   **Líneas de Código**: ~5,000+ LOC
-   **Tiempo de Desarrollo**: 2-3 semanas (desarrollo profesional)
-   **Tecnologías**: 8+ diferentes
-   **Patrones de Diseño**: 6+ implementados

---

## 📞 Contacto y Soporte

Para preguntas técnicas o aclaraciones sobre la implementación, consultar la documentación adicional en el repositorio o revisar el código fuente directamente.

### Estructura de Archivos Clave para Revisión

**Backend:**

-   `backend/src/services/*.js` - Lógica de negocio
-   `backend/src/middleware/errorHandler.js` - Manejo de errores
-   `backend/src/routes/*.js` - Endpoints API

**Frontend:**

-   `frontend/src/lib/services.ts` - Servicios de API
-   `frontend/src/pages/dashboard.astro` - Dashboard principal
-   `frontend/src/components/Navbar.astro` - Componente reusable

---

## ✅ Checklist de Evaluación Técnica

### Arquitectura

-   [x] Separación de capas (Routes → Services → Database)
-   [x] Patrones de diseño implementados
-   [x] Código modular y reutilizable
-   [x] Manejo centralizado de errores

### Seguridad

-   [x] Autenticación JWT
-   [x] Hash de contraseñas
-   [x] Control de acceso basado en roles
-   [x] Validación de datos de entrada
-   [x] Prevención de SQL injection

### Calidad de Código

-   [x] Nombres descriptivos de variables y funciones
-   [x] Comentarios donde es necesario
-   [x] Estructura de proyecto organizada
-   [x] Constantes centralizadas
-   [x] Manejo de errores consistente

### Frontend

-   [x] Arquitectura de lib/ centralizada
-   [x] TypeScript para type safety
-   [x] Servicios reutilizables
-   [x] Componentes modulares
-   [x] Manejo de errores UI

### Base de Datos

-   [x] Schema normalizado
-   [x] Índices para performance
-   [x] Foreign keys para integridad
-   [x] Triggers para automatización
-   [x] Multi-tenancy implementado

### Documentación

-   [x] README completo
-   [x] Documentación técnica detallada
-   [x] Guías de instalación
-   [x] Comentarios en código
-   [x] Diagramas de arquitectura

---

**Última Actualización**: Diciembre 2025  
**Versión**: 1.0  
**Autor**: Proyecto Portfolio - CoreBiz ERP
