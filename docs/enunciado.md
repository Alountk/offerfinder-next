# Prueba técnica: buscador de ofertas

Bienvenido/a. En esta sesión vas a construir, sobre esta app de Next.js, un buscador de ofertas de empleo y la visualización del detalle de una oferta, consumiendo la API que sirve el servidor de mocks.

## Qué tienes que hacer

1. Crear un **buscador de ofertas** con **3 filtros distintos** y **paginación** de los resultados.
2. Permitir **clicar en una oferta** para ver su **página de detalle**.
3. Gestionar los estados de carga, sin resultados y error (puedes forzarlos desde el DevTools).

Los filtros:

- **Texto libre** `q` — Busca por título de la oferta o nombre de la empresa.
- **Provincia** `province` — Id de provincia obtenido de /catalogs/provinces.
- **Tipo de contrato** `contractType` — Id obtenido de /catalogs/contract-types.

## Qué vamos a valorar

Valoraremos **una arquitectura testeable y mantenible por encima del diseño visual**. No hace falta que quede bonito: nos interesa cómo separas responsabilidades, cómo estructuras el código y cómo lo pruebas.

También valoraremos el **uso de las funcionalidades server-side de Next.js**, por ejemplo:

- Server Components y data fetching en servidor
- searchParams como fuente de verdad de filtros y paginación (URL compartible)
- Server Actions (p. ej. para enviar el formulario de filtros)
- loading.tsx / Suspense, error.tsx y not-found.tsx / notFound()
- generateMetadata para el detalle de la oferta
- Caché y revalidación de fetch

## Estilos: usa Tailwind

Los estilos se tienen que hacer **usando Tailwind CSS** (v4, ya configurado en este proyecto): clases utilitarias en los componentes y, si necesitas valores propios, tokens en el bloque `@theme` de `app/globals.css`. No uses librerías de componentes de UI ni CSS propio fuera de ese fichero.

Recuerda que el diseño visual pesa menos que la arquitectura, pero si lo trabajas se valorará la calidad del CSS: mantenible, sin duplicación y con tokens, no solo que quede bonito.

## Extras que suman puntos

No son obligatorios, pero si te sobra tiempo **suman puntos**. Es preferible tener lo principal bien resuelto antes que llegar a los extras.

- **Dockerizar la aplicación para desplegarla en un clúster de Kubernetes**
  - Dockerfile multi-stage para apps/web (imagen ligera, usuario no root, output standalone de Next.js)
  - Configuración por variables de entorno (por ejemplo MOCKS_URL), sin valores hardcodeados en la imagen
  - Un endpoint de salud para los probes de liveness/readiness

- **Diseño y CSS**
  - Diseño responsive real (móvil, tablet y escritorio); por ejemplo, los filtros en un panel o cajón en móvil
  - Modo oscuro con prefers-color-scheme, apoyado en tokens de diseño (colores, espaciados, tipografía) definidos en @theme
  - Componentes reutilizables y accesibles con sus variantes y estados: hover, focus, disabled y error
  - Accesibilidad visual: foco visible, contraste AA, navegación por teclado y prefers-reduced-motion
  - Estados bien diseñados: esqueletos de carga, estado vacío y estado de error con acción de reintentar
  - Microinteracciones y transiciones sobrias (por ejemplo, View Transitions entre la lista y el detalle)
  - Detalle de oferta cuidado: jerarquía tipográfica, información clave destacada (salario, contrato, teletrabajo) y versión para imprimir

## API disponible

Base URL: `http://localhost:5001/jobs` (servidor de mocks). Desde el servidor de Next.js está disponible como `API_BASE_URL` en `src/lib/config.ts`.

| Método | Endpoint                                                | Descripción                                                               | Escenarios                   |
| ------ | ------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------- |
| GET    | `/offers?q=&province=&contractType=&page=1&pageSize=10` | Búsqueda paginada. Devuelve { items, page, pageSize, total, totalPages }. | `default · empty · error`    |
| GET    | `/offers/:offerId`                                      | Detalle de una oferta (ids de "of-0001" a "of-0060").                     | `default · notFound · error` |
| GET    | `/catalogs/provinces`                                   | Provincias disponibles.                                                   | `default · error`            |
| GET    | `/catalogs/contract-types`                              | Tipos de contrato disponibles.                                            | `default · error`            |

## DevTools de mocks

En desarrollo, abajo a la derecha verás el botón **DevTools**. Desde la pestaña _Mocks_ puedes ver todos los endpoints, cambiar el escenario de cada uno (`empty`, `error`, `notFound`…) y añadir un retardo. En _Mock Calls_ verás el historial de llamadas con su respuesta.

## Cómo trabajar

```bash
./setup.sh        # opcional: comprueba e instala lo necesario (pide permiso por cada cosa)
pnpm install
pnpm dev          # app en :3000 y mocks en :5001
pnpm test         # tests unitarios (Vitest + Testing Library)
pnpm check-types && pnpm lint
```

Puedes usar la ayuda que quieras (documentación, buscador, IA), pero tendrás que explicar tus decisiones.

## Preguntas para resolver al final

Cuando termines (o cuando se acabe el tiempo) las comentaremos en voz alta. No hace falta implementarlas, pero ten en cuenta tus respuestas mientras desarrollas: queremos entender cómo razonas sobre la gestión del estado en cliente, la caché y los datos.

1. ¿Qué estado vive en el servidor, qué estado vive en el cliente y por qué? ¿Qué pondrías en la URL?
2. ¿Cómo gestionarías el estado en cliente si la aplicación creciera? ¿Cuándo es necesario y cuándo no?
3. ¿Qué cachearías y dónde? ¿Cómo y cuándo invalidarías o revalidarías?
4. ¿Cómo evitarías datos obsoletos al volver a una búsqueda o al navegar entre la lista y el detalle?
5. ¿Cómo plantearías las actualizaciones optimistas, por ejemplo guardar una oferta como favorita?
6. ¿Cómo gestionarías los errores y los reintentos en servidor y en cliente?
7. ¿Qué mejorarías o cambiarías si tuvieras más tiempo?
