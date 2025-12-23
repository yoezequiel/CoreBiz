# CoreBiz Frontend

Frontend para el sistema ERP CoreBiz, construido con Astro y Tailwind CSS.

## Requisitos

-   Node.js >= 18

## Instalación

```bash
# Instalar dependencias
npm install

# Copiar archivo de configuración
cp .env.example .env

# Configurar la URL de la API en .env
```

## Uso

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview de producción
npm run preview
```

La aplicación estará disponible en `http://localhost:4321`

## Estructura

```
src/
├── layouts/         # Layout base
└── pages/           # Páginas (rutas)
    ├── index.astro          # Login
    ├── register.astro       # Registro
    ├── dashboard.astro      # Dashboard
    ├── customers.astro      # Clientes
    ├── sales.astro          # Ventas
    └── users.astro          # Usuarios (admin)
```

## Características

-   ✅ Autenticación con JWT
-   ✅ Dashboard con estadísticas
-   ✅ Gestión de clientes
-   ✅ Gestión de ventas
-   ✅ Gestión de usuarios (admin)
-   ✅ Exportación de ventas a CSV
-   ✅ Filtros y búsqueda
-   ✅ Diseño responsive con Tailwind CSS

## Credenciales de Prueba

Después de ejecutar el seed del backend:

```
Email: admin@corebiz.com
Password: password123
```

## Conexión con Backend

Asegúrate de que el backend esté corriendo en `http://localhost:3000` o configura la variable de entorno `PUBLIC_API_URL` en el archivo `.env`.
