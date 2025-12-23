# CoreBiz Backend

API REST para el sistema ERP CoreBiz.

## Requisitos

-   Node.js >= 18
-   Cuenta en Turso (https://turso.tech)

## Instalación

```bash
# Instalar dependencias
npm install

# Copiar archivo de configuración
cp .env.example .env

# Configurar Turso
# 1. Crear cuenta en https://turso.tech
# 2. Instalar Turso CLI: curl -sSfL https://get.tur.so/install.sh | bash
# 3. Iniciar sesión: turso auth login
# 4. Crear base de datos: turso db create corebiz
# 5. Obtener URL: turso db show corebiz --url
# 6. Crear token: turso db tokens create corebiz
# 7. Actualizar .env con TURSO_DATABASE_URL y TURSO_AUTH_TOKEN

# Ejecutar el seed (crea tablas y datos de prueba)
npm run seed
```

## Uso

```bash
# Desarrollo (con recarga automática)
npm run dev

# Producción
npm start
```

## Estructura del Proyecto

```
src/
├── config/          # Configuración (database, etc)
├── routes/          # Rutas de la API
├── middleware/      # Middleware (auth, audit, errors)
└── database/        # SQL y seed
```

## Endpoints API

### Autenticación

-   `POST /api/auth/register` - Registrar empresa y admin
-   `POST /api/auth/login` - Iniciar sesión
-   `POST /api/auth/change-password` - Cambiar contraseña

### Empresas

-   `GET /api/companies` - Obtener empresa
-   `PUT /api/companies` - Actualizar empresa (admin)
-   `POST /api/companies/deactivate` - Desactivar empresa (admin)

### Usuarios

-   `GET /api/users` - Listar usuarios (admin)
-   `GET /api/users/:id` - Obtener usuario
-   `POST /api/users` - Crear usuario (admin)
-   `PUT /api/users/:id` - Actualizar usuario (admin)
-   `POST /api/users/:id/deactivate` - Desactivar (admin)
-   `POST /api/users/:id/activate` - Activar (admin)

### Clientes

-   `GET /api/customers` - Listar clientes
-   `GET /api/customers/:id` - Obtener cliente
-   `POST /api/customers` - Crear cliente
-   `PUT /api/customers/:id` - Actualizar cliente
-   `POST /api/customers/:id/deactivate` - Desactivar
-   `POST /api/customers/:id/activate` - Activar
-   `GET /api/customers/:id/sales` - Historial de ventas

### Ventas

-   `GET /api/sales` - Listar ventas
-   `GET /api/sales/:id` - Obtener venta
-   `POST /api/sales` - Crear venta
-   `PUT /api/sales/:id` - Actualizar venta
-   `PATCH /api/sales/:id/status` - Cambiar estado
-   `GET /api/sales/export/csv` - Exportar a CSV

### Dashboard

-   `GET /api/dashboard/stats` - Estadísticas generales
-   `GET /api/dashboard/sales-by-month` - Ventas por mes
-   `GET /api/dashboard/top-customers` - Mejores clientes (admin)
-   `GET /api/dashboard/recent-activity` - Actividad reciente

### Auditoría

-   `GET /api/audit` - Registros de auditoría (admin)
-   `GET /api/audit/:id` - Obtener registro (admin)
-   `GET /api/audit/summary/stats` - Resumen (admin)

## Credenciales de Prueba

Después de ejecutar `npm run seed`:

```
Email: admin@corebiz.com
Password: password123
Role: admin
```

```
Email: staff@corebiz.com
Password: password123
Role: staff
```

## Características de Seguridad

-   ✅ Autenticación JWT
-   ✅ Hash de contraseñas con bcrypt
-   ✅ Multi-tenant (aislamiento por company_id)
-   ✅ Autorización por roles
-   ✅ Validación de inputs
-   ✅ Registro de auditoría
