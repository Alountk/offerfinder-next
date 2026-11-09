# Buscador de ofertas

Buscador de ofertas de empleo con detalle de oferta, hecho con Next.js sobre un monorepo (pnpm + Turborepo). Consume la API del servidor de mocks.

## Documentación

- [Enunciado](docs/enunciado.md): el README original de la prueba. En el resto de documentos, «README» se refiere a este.
- [Respuestas a las preguntas del enunciado](docs/respuestas.md)
- [Registro de uso de IA](docs/ai-log.md): cada fase con los prompts, mis correcciones, la verificación y el tiempo.

## Cómo ejecutarlo

```bash
pnpm install
pnpm dev            # web en :3000 y mocks en :5001
pnpm test           # tests unitarios (Vitest)
pnpm e2e            # tests e2e (Playwright)
pnpm check-types && pnpm lint
```

En producción la app exige `MOCKS_URL`: sin ella, todas las rutas responden 500. Imagen y despliegue:

```bash
docker build -f apps/web/Dockerfile -t jobs-web .
docker run -p 3000:3000 -e MOCKS_URL=<url de la API> jobs-web
kubectl apply -f k8s/web.yaml
```

## Decisiones

- **La URL es la fuente de verdad.** Filtros y página viven en `searchParams`; la Server Action `applyFilters` valida el formulario y redirige a la URL.
- **Casi todo es servidor.** El único Client Component es `error.tsx`, porque el reintento necesita JavaScript.
- **Carga, vacío, error y 404.** `loading.tsx` en la primera carga, `Suspense` con `key` para la lista al buscar o paginar, `EmptyResults`, `error.tsx` y un `not-found.tsx` por ruta.
- **Caché de `fetch` por tipo de dato.** Catálogos 1 h; búsqueda y detalle 60 s.
- **Tailwind sin CSS propio fuera de `app/globals.css`.** Tokens en `@theme`, modo oscuro y componentes con variantes.
- **Despliegue.** Dockerfile multi-stage (standalone, usuario no root), `GET /api/health` para los probes y `k8s/web.yaml`.

## Lo que no está hecho

`pageSize` en la URL, revalidación bajo demanda, el e2e del estado de error y View Transitions. El resto de ideas pospuestas está al final del [registro de IA](docs/ai-log.md).
