# Respuestas a las preguntas del enunciado

Cada respuesta separa **lo que hay en la app** (con el archivo donde está y, cuando se midió, el resultado) de **lo que haría con más tiempo**. Lo que no se implementó está dicho como tal.

## 1. ¿Qué estado vive en el servidor, qué estado vive en el cliente y por qué? ¿Qué pondrías en la URL?

**Lo que hay**

- **Servidor:** los datos (ofertas y catálogos, con `fetch` en Server Components), el filtrado y la paginación (los hace la API), la validación de lo que llega por la URL (`src/lib/searchParams.ts`) y el 404 de una oferta (`notFound()`).
- **Cliente:** casi nada. El único `'use client'` es `app/error.tsx`, y es esencial: ofrece el botón «Reintentar», que es una acción del navegador y necesita JS. Los campos del formulario no están controlados y el envío lo hace una Server Action.
- **URL:** todo lo que cambia el resultado: `q`, `province`, `contractType` y `page` como parámetros, y el id de la oferta en la ruta (`/offers/[offerId]`).

**Por qué:** la URL es la única fuente de verdad de la búsqueda. Se puede compartir, recargar y funciona con atrás/adelante. Y no hay una copia de los filtros en el cliente, así que no hay dos versiones que desincronizar.

**Pendiente: `pageSize`.** La API ya lo soporta (por defecto 10, máximo 50), pero la web no lo expone. Fue una omisión, no una decisión. Lo añadiría a la URL validado contra una lista cerrada (10, 20 o 50), y al cambiarlo `page` volvería a 1.

## 2. ¿Cómo gestionarías el estado en cliente si la aplicación creciera? ¿Cuándo es necesario y cuándo no?

**Criterio:** servidor y URL primero. Solo subo estado al cliente cuando una interacción no puede esperar a un viaje al servidor.

**Si la aplicación creciera**

- Estado local de un componente: `useState`.
- Estado de interfaz que necesitan componentes alejados entre sí: **Zustand**. Por ejemplo, el cajón de filtros en móvil: el botón está en la cabecera, el panel en el layout y «Aplicar» dentro del panel. Con `useState` habría que pasarlo por props a través de todo el árbol.
- Los **datos** seguirían viniendo del servidor, no de un store.

**Por qué no TanStack Query hoy:** el navegador nunca llama a la API, todo pasa por Server Components. Obligaría a crear una segunda vía de lectura y a duplicar el estado. Compensaría con mucha interacción en cliente sobre datos que cambian, como un chat o un scroll infinito.

**Cuándo no es necesario:** con datos que ya llegan del servidor o se derivan de la URL. Copiarlos a un store crea dos fuentes de verdad. Los favoritos tampoco irían en un store (respuesta 5).

## 3. ¿Qué cachearías y dónde? ¿Cómo y cuándo invalidarías o revalidarías?

**Lo que hay** (`src/lib/api.ts`), en la caché de datos de Next, en el servidor:

| Dato                           | Tiempo      | Razón                                     |
| ------------------------------ | ----------- | ----------------------------------------- |
| Provincias y tipos de contrato | 1 hora      | Casi estáticos y se piden en cada visita  |
| Búsqueda y detalle de oferta   | 60 segundos | Cambian poco, pero deben verse en minutos |

- **La clave es la URL pedida a la API.** Un texto, filtro o página distintos hacen una llamada real. El orden de los parámetros, los espacios y los parámetros ajenos no cambian la clave, porque `parseSearchParams` y `toQueryString` normalizan la URL. `q=React` y `q=react` sí son claves distintas.
- Solo se guardan respuestas 200: un error no se cachea.
- Además, dentro de una misma petición, `generateMetadata` y la página comparten la llamada (memoización). Es distinta de la caché de datos, que persiste entre peticiones.

**Cómo se midió y cómo repetirlo:** un proxy contador entre la web y los mocks mostró que cuatro visitas a la home hacían una sola petición a cada catálogo. Sin proxy: las llamadas salen del servidor de Next, así que la pestaña Network de Chrome no las ve, pero el servidor de mocks sí. `GET /jobs/api/debug/history` devuelve las últimas 50 llamadas (el panel Mock calls de DevTools usa el mismo historial). Se borra, se navega y se cuentan las entradas.

**Límites que conozco**

- `q` no tiene longitud máxima: cada texto nuevo es un fallo de caché que llega a la API y ocupa espacio. Lo acotaría a unos 100 caracteres.
- Con varios pods en Kubernetes, **cada pod tiene su propia caché**. La solución sería un `cacheHandler` con Redis, a costa de operar otro componente.

**Invalidar:** hoy, por tiempo. Lo siguiente sería invalidar **por evento** (no implementado): poner `tags` a los `fetch` y llamar a `revalidateTag` cuando la fuente de datos avise de un cambio, combinado con un TTL largo. No lo hice porque aquí no existe ese aviso.

## 4. ¿Cómo evitarías datos obsoletos al volver a una búsqueda o al navegar entre la lista y el detalle?

1. **La caché de datos.** Una oferta que cambia en la API puede verse vieja hasta 60 s. Es una decisión de producto; si no fuera aceptable, se acorta el tiempo o se invalida por evento.
2. **Atrás/adelante del navegador.** Next reutiliza en el navegador la página visitada al volver. Para volver a una búsqueda tal cual es lo deseable, aunque puede estar más vieja que los 60 s (no lo medí). Si hiciera falta fresca, `router.refresh()`.
3. **«Volver a las ofertas» pierde la búsqueda.** Enlaza siempre a `/`: con la búsqueda «react» en la página 3, pulsarlo lleva a la página 1 sin filtros, mientras que el atrás del navegador sí vuelve a `/?q=react&page=3`. **Pendiente, no implementado.** Lo resolvería llevando los filtros en la URL del detalle (`/offers/of-1?q=react&page=3`) y reconstruyendo el enlace con `parseSearchParams` y `toQueryString`: sigue siendo Server Component, funciona sin JS y no hay redirección abierta, porque solo pasan los cuatro parámetros ya validados. Descarto `router.back()` porque obliga a un Client Component y falla si se entró directo al detalle.
4. **Feedback al navegar.** Sin `key`, React mantiene la lista vieja mientras el servidor prepara la nueva y el usuario no sabe si el clic hizo algo. Con `<Suspense key={filtros}>` aparece «Cargando ofertas…». Medido con la API retrasada 2 s: con la `key`, 600 ms después del clic hay aviso y ninguna oferta vieja; sin ella, siguen las 10 viejas.

## 5. ¿Cómo plantearías las actualizaciones optimistas, por ejemplo guardar una oferta como favorita?

**No está implementado** (la API de mocks no tiene endpoints de favoritos). Mi planteamiento:

- Un Client Component pequeño, `FavoriteButton`, con `useOptimistic`: pinta el resultado esperado al instante y, cuando termina la acción, vuelve a mostrar el valor real del servidor.
- Una Server Action `setFavorite(id, value)`, **idempotente**: fija un valor, no alterna. Así un doble clic o un reintento no invierte el resultado.
- La acción **valida dentro** la sesión y la entrada: una Server Action es un endpoint al que se puede llamar directamente.
- Al terminar, `updateTag` con una etiqueta que incluya al usuario (`favorites-<userId>`), para que el siguiente render vea el cambio sin afectar a otros usuarios.
- **Si falla:** React deshace el estado optimista solo.
- Los favoritos son por usuario, así que **no van en la caché compartida**: otro usuario podría verlos. El identificador sale siempre de la sesión.

## 6. ¿Cómo gestionarías los errores y los reintentos en servidor y en cliente?

**Lo que hay**

- **Servidor:** si la API responde con error, `request` lanza un `ApiError` con el estado HTTP. Un 404 de una oferta se convierte en la página «oferta no encontrada» (`notFound()`); cualquier otro error llega a `error.tsx`.
- **Cliente:** `error.tsx` muestra el mensaje y un botón «Reintentar» que llama a `retry()` y vuelve a pedir los datos. Necesita JS, porque el reintento ocurre en el navegador.

**Lo que falta**

- No hay timeout: si la API no responde, la página se queda esperando.
- No hay reintentos automáticos: un fallo de red puntual llega directo al usuario.

**Lo que haría**

- En `request`, un timeout de unos 3 segundos (`AbortSignal.timeout`) y **un reintento** si falla por red o por un 5xx, esperando un momento antes de reintentar.
- Solo para peticiones `GET`, y nunca con un 4xx: un 4xx es culpa de la petición y reintentarla no lo arregla.
- Un solo reintento, porque cada uno suma espera al usuario dentro del render.
- Si aun así falla, el usuario tiene el botón «Reintentar».

**Para decirlo en la entrevista:** hoy el reintento lo hace el usuario con un botón; el siguiente paso es un timeout y un reintento automático en el servidor, solo para lecturas.

## 7. ¿Qué mejorarías o cambiarías si tuvieras más tiempo?

En orden de prioridad:

1. **El `loading.tsx` raíz.** Hace que una oferta inexistente responda 200 en lugar de 404 y que la home sin JavaScript solo muestre «Cargando ofertas…». Lo llevaría a un grupo de rutas solo para la home. Es lo primero porque afecta a la corrección, no solo a la comodidad.
2. **Fiabilidad de las llamadas a la API** (preguntas 3 y 6): un timeout y un reintento en las lecturas, y una longitud máxima para `q`.
3. **Navegación** (preguntas 1 y 4): que «Volver a las ofertas» conserve la búsqueda y exponer `pageSize` en la URL.
4. **Tests e2e del error y del aviso de carga.** Necesitan un escenario global de los mocks, así que irían en un proyecto de Playwright aparte.
5. **Estilos:** View Transitions entre la lista y el detalle y una comprobación automática de accesibilidad (axe).
6. **Producción** (pregunta 3 y despliegue): invalidación por evento y caché compartida entre pods, un `/api/ready` que compruebe la API, y una integración continua que ejecute lint, tests y la construcción de la imagen.

**Funcionalidad nueva:** los favoritos con actualización optimista (pregunta 5).
