# 🍰 DET Invoice App - Sistema de Gestión de Pedidos

Sistema completo de gestión de pedidos para panaderías y pastelerías, desarrollado con React, TypeScript y Vite. Permite administrar productos, realizar pedidos, gestionar órdenes personalizadas y visualizar reportes de ventas en tiempo real.

![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.18-06B6D4?logo=tailwindcss&logoColor=white)

## ✨ Características Principales

### 📊 Dashboard Interactivo

- **Métricas en tiempo real**: Visualización de ventas, productos más vendidos y stock bajo
- **Gráficos dinámicos**: Análisis de ventas con Recharts
- **Carrusel de productos destacados**: Navegación fluida con Embla Carousel
- **Alertas de stock**: Notificaciones automáticas para productos con inventario bajo

### 🛒 Gestión de Pedidos

- **Sistema POS completo**: Interfaz intuitiva para realizar pedidos rápidos
- **Carrito de compras**: Gestión dinámica de productos con actualización en tiempo real
- **Múltiples métodos de pago**: Efectivo y tarjeta con cálculo automático de cambio
- **Facturación instantánea**: Generación de facturas al completar pedidos

### 🎨 Pedidos Personalizados

- **Tablero Kanban**: Gestión visual de pedidos con drag & drop
- **Estados de pedido**: Por Hacer → En Proceso → Listo → Entregado
- **Seguimiento de pagos**: Control de abonos y saldos pendientes
- **Fechas de entrega**: Alertas automáticas para pedidos próximos o atrasados

### 📦 Administración de Productos

- **Catálogo completo**: Gestión de productos con categorías y subcategorías
- **Filtros avanzados**: Búsqueda por nombre, categoría, subcategoría y rango de precio
- **Control de inventario**: Ajuste de stock con historial de movimientos
- **Edición en línea**: Actualización rápida de precios y detalles

### 👥 Gestión de Usuarios

- **Roles y permisos**: Control de acceso basado en roles
- **Registro de actividad**: Seguimiento de acciones de usuarios
- **Autenticación segura**: Sistema de login con validación

### 📈 Reportes y Análisis

- **Reportes de ventas**: Análisis por período, categoría y producto
- **Gráficos interactivos**: Visualización de tendencias y patrones
- **Exportación de datos**: Generación de reportes en diferentes formatos

### ⚙️ Configuración del Sistema

- **Información del negocio**: Personalización de datos empresariales
- **Configuración de moneda**: Ajuste de moneda y valores por defecto
- **Gestión de caja**: Control de apertura y cierre de caja diaria

## 🚀 Tecnologías Utilizadas

### Frontend Core

- **React 19.2.0** - Biblioteca UI con las últimas características
- **TypeScript 5.9.3** - Tipado estático para mayor robustez
- **Vite 7.2.4** - Build tool ultrarrápido con HMR

### Estilos y UI

- **TailwindCSS 4.1.18** - Framework CSS utility-first
- **Lucide React** - Iconos modernos y personalizables
- **React Hot Toast** - Notificaciones elegantes y personalizables

### Navegación y Routing

- **React Router DOM 7.13.0** - Enrutamiento declarativo
- **Navegación protegida** - Rutas privadas con autenticación

### Visualización de Datos

- **Recharts 3.7.0** - Gráficos interactivos y responsivos
- **Embla Carousel 8.6.0** - Carruseles fluidos y táctiles

### Drag & Drop

- **@hello-pangea/dnd 18.0.1** - Sistema de arrastrar y soltar para el tablero Kanban

### Utilidades

- **clsx** - Composición condicional de clases CSS
- **tailwind-merge** - Fusión inteligente de clases Tailwind

## 📁 Estructura del Proyecto

```
DET.Invoice.App/
├── src/
│   ├── features/           # Módulos por funcionalidad
│   │   ├── auth/          # Autenticación y login
│   │   ├── dashboard/     # Dashboard principal
│   │   ├── products/      # Gestión de productos
│   │   ├── orders/        # Sistema POS y pedidos
│   │   ├── custom-oders/  # Pedidos personalizados (Kanban)
│   │   ├── users/         # Gestión de usuarios
│   │   ├── reports/       # Reportes y análisis
│   │   └── settings/      # Configuración del sistema
│   ├── shared/            # Componentes y utilidades compartidas
│   │   ├── ui/           # Componentes UI reutilizables
│   │   ├── context/      # Contextos de React
│   │   └── hooks/        # Custom hooks
│   ├── assets/           # Imágenes y recursos estáticos
│   ├── App.tsx           # Componente raíz con rutas
│   └── main.tsx          # Punto de entrada
├── public/               # Archivos públicos
└── package.json          # Dependencias y scripts
```

### 🎯 Arquitectura de Features

Cada feature sigue una estructura modular consistente:

```
feature/
├── pages/           # Páginas principales del módulo
├── components/      # Componentes específicos del feature
├── hooks/          # Custom hooks del feature
├── types/          # Definiciones de TypeScript
└── index.ts        # Exportaciones públicas
```

## 🛠️ Instalación y Configuración

### Prerrequisitos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 o **yarn** >= 1.22.0

### Instalación

1. **Clonar el repositorio**

   ```bash
   git clone <repository-url>
   cd DET.Invoice.App
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Configurar variables de entorno** (opcional)

   ```bash
   cp .env.example .env
   ```

4. **Iniciar el servidor de desarrollo**

   ```bash
   npm run dev
   ```

   La aplicación estará disponible en `http://localhost:5173`

## 📜 Scripts Disponibles

| Script            | Descripción                                     |
| ----------------- | ----------------------------------------------- |
| `npm run dev`     | Inicia el servidor de desarrollo con HMR        |
| `npm run build`   | Compila TypeScript y genera build de producción |
| `npm run preview` | Previsualiza el build de producción localmente  |
| `npm run lint`    | Ejecuta ESLint para verificar el código         |

## 🎨 Características de Diseño

### Sistema de Diseño

- **Paleta de colores personalizada**: Tonos cálidos inspirados en panadería
  - Primary: `#E8BC6E` (Dorado cálido)
  - Secondary: `#593D31` (Marrón chocolate)
  - Background: `#FDFBF7` (Crema suave)
  - Text: `#2D2D2D` (Gris oscuro)

### Componentes UI Reutilizables

- **Card**: Contenedor con sombras y bordes redondeados
- **ConfirmDialog**: Diálogos de confirmación modales
- **ImageUploadField**: Campo de carga de imágenes con preview
- **Modales personalizados**: Sistema de modales consistente

### Animaciones y Transiciones

- **Transiciones suaves**: Hover effects y state changes
- **Animaciones de entrada**: Fade-in para modales y notificaciones
- **Feedback visual**: Estados de loading y success

## 🔧 Configuración Avanzada

### Path Aliases

El proyecto utiliza path aliases para importaciones más limpias:

```typescript
// tsconfig.app.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Ejemplo de uso:

```typescript
// ❌ Antes
import { Card } from "../../../shared/ui/Card";

// ✅ Ahora
import { Card } from "@/shared/ui/Card";
```

### Configuración de Vite

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

## 🧪 Mejores Prácticas

### Convenciones de Código

- **Componentes**: PascalCase (`ProductCard.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useCart.ts`)
- **Tipos**: PascalCase con sufijo `Type` o interfaces (`ProductType`, `OrderStatus`)
- **Constantes**: UPPER_SNAKE_CASE (`PRODUCTS`, `CATEGORIES_DATA`)

### Organización de Imports

```typescript
// 1. Imports de React y bibliotecas externas
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// 2. Imports de features y shared
import { Card } from "@/shared/ui/Card";
import { useCart } from "@/features/orders/hooks/useCart";

// 3. Imports de tipos
import type { Product } from "@/features/orders/types";

// 4. Imports de assets
import logoImage from "@/assets/logo.png";
```

### Gestión de Estado

- **useState**: Para estado local de componentes
- **Context API**: Para estado compartido entre features
- **Custom Hooks**: Para lógica reutilizable

## 🚧 Roadmap

### En Desarrollo

- [ ] Integración con backend REST API
- [ ] Sistema de autenticación con JWT
- [ ] Base de datos persistente
- [ ] Exportación de reportes a PDF/Excel

### Futuras Mejoras

- [ ] Modo oscuro
- [ ] Soporte multiidioma (i18n)
- [ ] PWA (Progressive Web App)
- [ ] Notificaciones push
- [ ] Integración con sistemas de pago
- [ ] App móvil con React Native

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es privado y está protegido por derechos de autor.

## 👨‍💻 Autor

**DET Devs Team**

---

⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub!
