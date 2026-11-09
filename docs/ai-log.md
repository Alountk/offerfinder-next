# Registro de uso de IA

Reparto: la IA propone e implementa el código; yo defino el alcance de cada paso, reviso cada diff, corrijo, verifico y testeo (lint, tipos, tests, navegador).

## Fase 0: entorno y reconocimiento

**Prompt:**
"Sin modificar ficheros: dime cómo arrancar el proyecto en local, qué endpoints
expone el mock (método, ruta, parámetros) y qué DTOs usa
(packages/mocks-scenarios/src/domain/types.ts). Resúmelo en una tabla."

**Resultado:**
Resumen de arranque (Node ≥ 22, pnpm 11.9.0, `pnpm install`, `pnpm dev` con web en
:3000 y mocks en :5001, MOCKS_URL por defecto http://localhost:5001/jobs) y tabla de
4 endpoints: GET /offers, GET /offers/:offerId, GET /catalogs/provinces y
GET /catalogs/contract-types. También los DTOs: CatalogItem, OfferSummaryDTO,
OfferDetailDTO, PaginatedOffersDTO y ApiErrorDTO.
Comportamientos útiles que detectó en searchOffers.ts:

- q se normaliza (trim + minúsculas) y busca en título y empresa.
- page y pageSize inválidos vuelven al valor por defecto, sin error.
- Página fuera de rango devuelve 200 con items: [], no 404.
- El escenario `empty` ignora los filtros.

**Corrección mía:**

- La IA reconoció que no leyó línea a línea el escenario de contract-types y asumía
  que seguía el mismo patrón. Lo leí yo: y parecia que todo estaba correcto
- La tabla salió con los campos sin cortar pero no lo habia revisado todo, así que me 
  toco revisarlo a mano. 

**Verificación:**

- [x] `pnpm install --frozen-lockfile` sin errores.
- [x] `pnpm dev` levanta web (:3000) y mocks (:5001).
- [x] `curl http://localhost:5001/jobs/offers` devuelve 10 ofertas.
- [x] `curl http://localhost:5001/jobs/offers/of-0001` devuelve el detalle.
- [x] Los dos endpoints de catálogos responden con CatalogItem[].
- [x] Los campos de OfferDetailDTO coinciden con types.ts.

**Tiempo:** 25s

## Fase 1: llamadas y vista tonta

**Prompt:**
"Crea apps/web/src/lib/api.ts con searchOffers, getOffer, getProvinces y
getContractTypes... Si la respuesta no es ok, lanza un error tipado (ApiError con
status y code). Después, en app/page.tsx, un Server Component con una lista simple."

**Resultado:**
api.ts con las cuatro funciones, una clase ApiError, un type guard (isApiErrorDTO)
y un helper (toApiError) que parsea el cuerpo del error. Además generó tests /
otros ficheros que no había pedido.

**Corrección mía:**

- Se extralimitó para un MVP: quité isApiErrorDTO y toApiError y dejé ApiError con
  solo status y message. Parte del exceso vino de mi prompt, que pedía "error tipado
  con status y code"; lo aprendí y acoto más el alcance en las siguientes fases.
- Eliminé los tests / ficheros no solicitados, que añadiré cuando toque la fase de tests.

**Verificación:**

- [x] `pnpm lint` y `pnpm check-types` limpios.
- [x] La home muestra las 10 primeras ofertas.
- [x] Con el escenario `error` en el devtools, la app lanza ApiError (aún sin UI de error).

**Tiempo:** 2 min 24s

## Fase 2: endurecer la capa de datos (Prettier, ApiError, server-only)

**Prompt:**
"Prettier no funciona, ¿podrías echarle un vistazo y explicarme cómo pasa y cómo puedo solucionarlo?"
"Dentro de api.test.ts, analiza el describe de errors y por qué está fallando. Explícamelo"
"No, dímelo cómo añadirlo, quiero hacerlo yo" (sobre `server-only`)
"Vitest: dime qué he de modificar en el resolve"

**Resultado:**

- Prettier fallaba porque el export `./prettierrc` de packages/eslint-config no
  estaba definido. La IA lo explicó y lo corregí yo.
- Los tests de `errors` fallaban porque `ApiError` no guardaba `status`.
- `import 'server-only'` en api.ts y un alias de Vitest a un stub vacío
  (`vitest.server-only.ts`), porque Vitest no resuelve ese paquete como Next.
- Dos tests de errores: `ApiError` con status 500 y con cuerpo que no es JSON (502).

**Corrección mía:**

- La IA afirmó primero que había que instalar `server-only`. Le dije que Next lo
  resolvía por dentro; tenía razón y lo comprobó en la doc y en el código de Next.
  Lo que sí necesita Vitest es el alias.
- Se me olvidó crear el stub `vitest.server-only.ts` ("Failed to resolve import").
- En un smoke test la IA ejecutó `pkill -f "next dev"` y pudo matar un proceso mío.
  Lo reconoció y repitió la prueba parando solo sus propios PIDs.

**Verificación:**

- [x] `pnpm test`, `pnpm check-types`, `pnpm lint` y Prettier limpios.
- [x] Un Client Component que importe api.ts rompe el build (protección de `server-only`).

**Tiempo:** 4 min 39s

## Fase 3: búsqueda con filtros en la URL

**Prompt:**
"Ahora me gustaría implementar la búsqueda, así que hay que recuperar lo que hemos quitado antes"
"Hay que hacer el test de toQueryString"
"Otra vez no has abstraído el test de firstNonBlank"

**Resultado:**
`parseSearchParams` (URL a filtros), `toQueryString` en `src/lib/queryString.ts`,
`SearchFilters` con `next/form` (GET, sin JavaScript de cliente) y `page.tsx` leyendo
`searchParams` (una Promise) y pidiendo ofertas y catálogos en paralelo.

**Corrección mía:**

- Pedí probar `toQueryString` fuera de api.ts (que es server-only) y sin crear una
  carpeta nueva: vive en `src/lib`.
- La IA dejó `firstNonBlank` privado y sin test directo. Lo exporté y lo renombré a
  `firstParamValue`, porque el nombre mentía: toma el primer valor y luego recorta
  (`['', '28']` da `undefined`).
- La IA buscó el campo por `/buscar/i`, pero su etiqueta es "Texto": se corrigieron
  los tests, no el componente.
- Una mutación mostró que el encoding no estaba cubierto: se añadió ese test.
- Quité `page` y `pageSize` del test de api.ts: la paginación aún no existía.
- Decidí dejar la X nativa de `type="search"`: el formulario es un borrador que se
  confirma con "Buscar", igual que los selects.
- Pedí que no se añadan comentarios al código; los que ya había se quedan.

**Verificación:**

- [x] 27 tests, tipos, lint y Prettier limpios.
- [x] Mutaciones sobre `firstParamValue` detectadas y fichero restaurado idéntico.

**Tiempo:** 6 min 50s

## Fase 4: paginación

**Prompt:**
"¿Cómo solventarías si de alguna manera falsearan el page, como tú dices, 999 de 6?"
"¿Y qué pasa cuando el número es -1? Creo que lo tenemos controlado en el transformador del número de la paginación"

**Resultado:**

- `page` se lee de la URL como entero positivo (`/^[1-9]\d*$/`); lo inválido se ignora.
- `Pagination` (Server Component) con "Anterior" y "Siguiente" que conservan filtros.
- Si `page > totalPages`, `redirect` (307) a la última página, construido con
  `toQueryString`. Necesita `as Route` por `typedRoutes`.

**Corrección mía:**

- Detecté que `/?page=999` pintaba "Página 999 de 6". Entre redirigir, `notFound()` o
  un estado vacío, elegí redirigir: la URL es la fuente de verdad y se corrige ahí.
- La primera comprobación en servidor apuntó al `:3000` de otro repositorio; la IA lo
  detectó y repitió la prueba en `:3100`, con la app de este repo.
- Una mutación sobrevivió: `[1-9]` solapa con `if (page)` para el `0`. Solo aporta
  rechazar ceros a la izquierda. Lo dejé explícito.
- El test "ignores params that are not filters" usaba `page`; se ajustó.

**Verificación:**

- [x] 48 tests, tipos, lint y Prettier limpios.
- [x] `/?page=999` responde 307 a `/?page=6`; `/?page=6` responde 200.

**Tiempo:** 4 min 19s

## Fase 5: estados de vacío, error y carga

**Prompt:**
"Vamos por steps pequeños, 1. Recuerda el resto para los siguientes pasos"
"Explícame más sobre esto: Carga en navegación..."

**Resultado:**

- Mensaje "No hay ofertas que coincidan con tu búsqueda." cuando `items` está vacío.
- `app/error.tsx` (`'use client'`, lo único imprescindible hasta ahora) con botón
  "Reintentar", y `app/loading.tsx`.
- Probado en un Chromium con la API caída (`MOCKS_URL` a un puerto sin servidor):
  aparece el aviso y el botón vuelve a pedir los datos.

**Corrección mía:**

- La IA dijo que `error.tsx` recibe `reset`. En Next 16.4 el prop estable es `retry`
  (desde 16.3); lo comprobó en la doc.
- Pedí comprobar la carga en navegación. Con un proxy que retrasa `/offers` 2 s:
  `loading.tsx` solo sale en la primera carga; en "Siguiente" y "Buscar" se queda la
  lista anterior (las navegaciones son transiciones de React).
- Decisión: no es prioritario para la prueba. Queda como mejora futura.

**Verificación:**

- [x] 54 tests, tipos, lint y Prettier limpios.
- [x] Error real en navegador y retry.
- [x] Medición de la carga en navegación (con `next dev`, no en producción).
- [x] Escenarios `empty` y `error` del DevTools probados a mano.

**Tiempo:** 5 min 47s

## Fase 6: detalle de la oferta

**Prompt:**
"Mira los tests de page.test.tsx de offerId: ¿no son muy rebuscados algunos? Por ejemplo: lists the requirements and the benefits. Si no es así, explícamelos. Y si es así, deberíamos hacer solo los tests más importantes."
"¿Qué es el generateMetadata? ¿Es un step de la prueba técnica?"
"Tenemos que acabar la implementación de generateMetadata, ¿no? ¿O cómo está, está implementado? Ahora mismo solo está creada en page, se exporta y se usa en test para testear"
"Pero el not found, ¿no debería ir dentro de la carpeta [offerId]?"

**Resultado:**

- `getOffer(id)` en api.ts. El id viene de la URL, así que se codifica con
  `encodeURIComponent`: sin codificar, `fetch` normaliza `../` y un id manipulado pedía
  `/jobs/catalogs/provinces` en vez de una oferta.
- `app/offers/[offerId]/page.tsx`: `params` es una Promise; un `ApiError` 404 se
  convierte en `notFound()` y cualquier otro error se relanza a `error.tsx`.
- Cada título de la lista enlaza a `/offers/<id>`.
- `generateMetadata`: título "<título> · <empresa>" y la descripción de la oferta. La
  doc dice que el `fetch` se memoiza; lo medí con un proxy contador: una sola petición a
  la API por visita.
- Dos `not-found.tsx` en español: uno en la raíz (URLs inexistentes) y otro en
  `[offerId]` (oferta caducada o enlace incorrecto).

**Corrección mía:**

- Pedí revisar los tests de la página: algunos eran rebuscados. La IA había añadido un
  guard de lista vacía que nadie pidió (en el mock, 0 de 60 ofertas tienen listas
  vacías) y un test que comprobaba el cableado ARIA y no los datos. Se quitaron 2 tests,
  se simplificó 1 y se eliminó el guard. La IA reconoció que el test de listas quedó más
  débil: ya no distingue requisitos de beneficios.
- Pregunté si `generateMetadata` estaba terminada. Next la llama por convención; lo
  probamos renombrando el export, y el título volvió al del layout. El test unitario
  comprueba lo que devuelve, no que Next lo aplique; eso lo cubrirá el e2e.
- Pregunté por la ubicación del `not-found`. La doc usa el más cercano a la ruta, así
  que el detalle tiene el suyo y la raíz queda genérico.
- La IA escribió "que ha caducado" (mal en español) y un test lo fijaba. Se corrigió
  primero el test (RED) y luego el texto.
- Una comprobación con `curl` no valía: el texto contado estaba en el payload de
  datos y no en el HTML visible. Se rehízo en un navegador.

**Verificación:**

- [x] 72 tests, tipos, lint y Prettier limpios.
- [x] Mutaciones detectadas en el mapeo del 404, el salario opcional, el id y los textos.
- [x] En un navegador: lista, detalle, "Volver", y los dos 404 en español.
- [x] Título de la pestaña del detalle, comprobado a mano en el servidor real.
- [x] Título de la pestaña como aserción automática (test e2e).

**Tiempo:** 11 min 53s

## Fase 7: tests e2e con Playwright

**Prompt:**
"Dale, step by step: cambios enteros pero de cosas pequeñas, vigilando que testeamos; pruebas importantes, no anodinas, no quiero crear ruido"
"Este es mi primer test, ¿qué te parece?"
"Me gusta ese código, pero ¿qué pasaría si el título es el mismo que varios li que tenemos?"
"Pero este test es muy débil, me refiero a que no puedes especificar un toHaveURL, porque si el día de mañana se cambian las offers y esa no existe, ¿qué pasa? Si queremos testear realmente esto de manera correcta, es coger directamente la URL y viajar a ella, ¿no?"
"Tal vez un siguiente test sería bueno: que probáramos los combos y el input del search y que la URL cambiara de manera correcta, ¿no?"
"Pero lo has metido en los mismos tests, ¿no es mejor hacer estos tests? No creo que sea buena idea un test que haga demasiadas cosas."
"No entiendo muy bien el propósito del test: the offer page title is the offer title and its company. ¿Tendría sentido que, si pulsas el link, verificaras el title y la company, si son los mismos? Primero verificas si en la URL tiene offers, no make sense, a no ser que quieras verificar que donde has pulsado es donde quieres ir, y para eso tiene que contrastar, y eso va por el título y la compañía; para mí es lo mismo. El test del 404 tiene mucho más sentido."
"Creo que esto debería pasar a la lista de nice to have"

**Resultado:** `qa/web/tests/home.spec.ts`, un comportamiento por test:

- Filtros: texto, provincia y tipo de contrato; la URL queda
  `/?q=desarrollador&province=madrid&contractType=autonomo` y la lista solo tiene ofertas
  que cumplen los tres.
- Estado vacío: una búsqueda sin coincidencias muestra el mensaje y ninguna oferta.
- Paginación: "Siguiente" y "Anterior" cambian la URL y la primera oferta.
- Lista → detalle → lista: la cabecera del detalle coincide con la tarjeta pulsada.
- Título de la pestaña del detalle: "<título> · <empresa>" de la oferta pulsada.
- 404 de una oferta que no existe.
- Se conservan los 2 tests de DevTools del starter.

**Corrección mía:**

- Revisé mi primer test: encadenaba búsqueda, detalle y vuelta casi sin aserciones, no
  comprobaba el resultado de la búsqueda y hacía clic en la primera oferta mientras la
  lista antigua seguía en pantalla. Se separó y se le dieron aserciones.
- La primera versión del detalle fijaba `of-0001` en la URL. La señalé como frágil. La IA
  me dio la razón, pero `goto` a la URL dejaba de probar el clic en el enlace; se resolvió
  comparando la cabecera del detalle con el texto de la tarjeta, sin ids fijos.
- La IA metió la comprobación del título dentro del test de navegación. Lo señalé: un
  test que hace demasiado falla por varios motivos y no dice cuál. Se separó.
- No entendí el test del título: el nombre era ambiguo (es el `<title>` de la pestaña, no
  el `h1`) y la espera por la URL parecía una aserción. Se reescribió leyendo título y
  empresa de la lista antes del clic, sin esperas.
- Decidí que el e2e del estado de error pase a "nice to have": exige forzar un escenario
  global de los mocks y una config de Playwright aparte. Ver "Ideas pospuestas".

**Fallos de la IA, que sirvieron para afinar los tests:**

- `innerText` de la tarjeta lleva saltos de línea y `toHaveText` los ve distintos de la
  cabecera: falló en verde. Se pasó a `textContent`.
- Dos combinaciones de filtros dejaron sobrevivir un mutante: con Madrid y Temporal, o
  con Madrid y "QA Automation", solo existían 2 ofertas o 1, así que un filtro no
  descartaba nada. Se calculó sobre los fixtures una combinación en que cada filtro
  descarta algo.
- La IA leyó el `h1` justo después del clic, cuando la lista seguía en pantalla: carrera.
- El primer test fijaba la URL completa y falló: confirmó en un navegador real la idea
  pospuesta de los parámetros vacíos en "Buscar".

**Verificación:**

- [x] 8 tests e2e en verde, en paralelo; Prettier y `tsc` limpios en `qa/web`.
- [x] Cada test falla con un mutante dirigido: `q`, provincia o contrato ignorados;
      página sin pedir; enlaces de paginación desviados; enlace de la lista a otra oferta con
      el mismo título; `generateMetadata` sin exportar o sin empresa; 404 que deja de ser
      `notFound()`; rama de vacío eliminada.
- [x] Ejecutado con puertos propios (3100 y 5101): los servidores de 3000 y 5001 eran de
      otro checkout y el `dev` de mocks mata lo que escucha en su puerto. Matiz descubierto
      después (Fase 9): los 2 tests de DevTools consultan desde el navegador a
      `localhost:5001` salvo que se defina `NEXT_PUBLIC_MOCKS_URL`, así que en estas
      ejecuciones hablaban con el servidor de mocks del otro checkout.
- [x] Chromium 1243 ya instalado mediante una config local; no se descargó nada.
- [ ] Estado de error y "Reintentar" en e2e (pospuesto).
- [ ] Sin ejecutar con el `playwright.config.ts` original: pide Chromium 1248, ausente.

**Tiempo:** 14 min 15s

## Fase 8: caché, Suspense, Server Action y health

**Prompt:**
"Deja el tema de cachear, por los extras: empiezan con el dockerizar la aplicación, configuración por variables de entorno y un health endpoint para las probes de liveness/readiness"
"Espera, espera un momento, paremos. Hemos hecho el loading, error y notfound. Entonces, ¿nos queda suspense y notfound? ¿O es que lo han puesto de que tengo que hacer uno o otro? Luego sí que es verdad que han puesto lo de caché y revalidación de fetch. Creo que son los puntos que van a valorar"
"Revisa OffersResults.test.tsx: solo pon los tests necesarios, no los que te plazcan, los que cubran las cosas importantes. Yo los cotejaré"
"Revisa el test de page.test.tsx, no vayamos a extralimitarnos con los tests, y explícame qué has implementado en él"
"Deja el 1, acorta la 2 como propones y la 3 creo que la podemos quitar"
"Volvamos a los tests de page.test.tsx: creo que, si el test es para verificar la URL, podemos dejar lo que teníamos del check de q / provincia / contrato"
"Explícame por qué has cambiado el test de SearchFilters y has empezado a utilizar userEvent"
"Si voy a testear lo mismo que en e2e, creo que prefiero e2e, que es mejor"
"Además, solo hay caché en el catalog; ¿no hay que poner caché a searchOffers y getOffer?"
"¿Cómo se comporta la caché si en la búsqueda el query cambia?"
"¿Puedes recordarme por qué pusimos este test antes? does not cache the search"
"La revalidación son los tests que hemos colocado, ¿no?"
"\"La revalidación bajo demanda la dejaría como respuesta de entrevista a la pregunta 3\": apunta eso para repasar más adelante."

**Resultado:**

- Caché de `fetch` con un TTL por tipo de dato: provincias y tipos de contrato 1 h
  (`revalidate: 3600`); búsqueda y detalle de oferta 60 s (`revalidate: 60`). Medido con un
  proxy contador en `next dev`: 4 visitas a la home hicieron 1 petición a cada catálogo
  (sin caché, 3 visitas más hicieron 3 más), y dos visitas al detalle hicieron 1.
- Cómo se comporta la caché de la búsqueda: la clave es la URL pedida a la API, así que un
  texto, filtro o página distinto es una entrada distinta. Medido: `?q=a` dos veces = 1
  petición; `?q=b`, `?q=a&page=2` y `?province=madrid&q=a` = una más cada una; mismos
  filtros en otro orden, o con espacios y un parámetro ajeno, = caché. La normalización de
  `parseSearchParams` y `toQueryString` ya construye la misma URL, lo que sube los aciertos.
- Endpoint de salud `GET /api/health`: 200 con `{"status":"ok"}`, un solo endpoint para
  liveness y readiness. No consulta la API de ofertas: si ésta cayera, Kubernetes sacaría
  todos los pods del servicio y el usuario vería un corte en vez de la página de error
  con "Reintentar".
- `OffersResults`: lista, mensaje de vacío, paginación y `redirect` salen de la página a
  un componente asíncrono. La página solo lee la URL, pide los catálogos y compone.
- `Suspense` con `key` sobre los resultados y un fallback compartido (`OffersLoading`).
  Medido con la API retrasada 2 s: con la `key`, 600 ms después del clic hay aviso y la
  lista vieja ha desaparecido; sin la `key`, sigue la lista vieja sin aviso.
- Server Action `applyFilters`: el formulario de filtros pasa de `next/form` (GET) a
  `<form action={action}>`. La acción lee solo `q`, `province` y `contractType`, los
  limpia con el mismo `parseSearchParams` de la URL y hace `redirect` a `/` con la query.
  Trata el `FormData` como no fiable: ignora cualquier campo ajeno (un `page`
  manipulado, los `$ACTION_…` de React) y el destino es siempre `/`.
  La URL de "Buscar" queda limpia (`/?q=QA`, sin `province=&contractType=` vacíos).

**Corrección mía:**

- La IA propuso Docker como siguiente paso. Frené: el README pone Server Actions, caché y
  revalidación entre lo que se valora, y Docker entre los extras, y el README prefiere lo
  principal bien resuelto antes. Se reordenó: `Suspense`, Server Action y caché primero.
- Pregunté si `loading.tsx` y `Suspense` eran uno u otro. La doc lo trata como dos vías
  para lo mismo (`loading.tsx` es un `Suspense` que Next coloca), pero `loading.tsx` solo
  sale en la primera carga; por eso se añadió el `Suspense` con `key`.
- Señalé que solo se cacheaban los catálogos. La IA había dejado la búsqueda y el detalle
  sin caché por prudencia, con un test que lo fijaba, sin que fuera una necesidad. Se
  cambió a 60 s para ambos, tras medir cómo se comporta la caché ante una `q` distinta.
  Queda como contrapartida que las claves de la búsqueda no están acotadas (cualquier
  `q`) y que cada pod de Kubernetes tiene su propia caché.
- Pregunté por qué se había puesto el test "does not cache the search": era una
  protección que la IA añadió al compartir `request` con los catálogos, no una necesidad.
  Y pregunté si la revalidación eran los tests: no, la revalidación es el `revalidate` de
  `api.ts` (la por tiempo); los tests solo comprueban que está. La bajo demanda queda como
  respuesta de entrevista (ver "Ideas pospuestas").
- Pedí podar los tests. `OffersResults.test`: de 10 a 8 (uno ya lo cubre `Pagination.test`
  y otro lo cubren los de enlace y contenido). `page.test`: se quitó el del aviso de
  carga, que no probaba la `key` y necesitaba un interruptor mutable; el de los filtros
  se recortó y luego volví a las aserciones de q / provincia / contrato.
- Pregunté por qué `SearchFilters.test` pasó a usar `userEvent`. Con una Server Action, mirar
  los `name` ya no prueba que el formulario esté conectado a la acción. La IA reconoció
  que el e2e cubre lo mismo. Prefiero el e2e para los campos; la IA comprobó con
  mutantes que el e2e atrapa los tres nombres pero no "formulario sin acción" (un
  `<form>` nativo da la misma URL). Quedó un test unitario mínimo: un clic en "Buscar"
  llama a la acción.

**Fallos de la IA:**

- La primera medición del `Suspense`, hecha por la IA, no valía: usó una ruta de configuración inexistente
  y la API no se retrasó. Se detectó porque la lista llegaba antes de los 600 ms.
- La comparación del refactor con `curl` marcó diferencias que eran solo el orden del
  streaming; se rehízo comparando el DOM renderizado en Chromium: idéntico en 5 URLs.
- La IA daba por hecho que el `redirect` fuera de rango era un 307. Con el `loading.tsx`
  raíz ya era una redirección de cliente (200). Comprobado con el código anterior.
- El fallback no podía ser `loading.tsx` (trae su `<main>`; quedaría uno dentro de otro).

**Hallazgo:** con JavaScript desactivado, la home solo muestra "Cargando ofertas…". La
causa es el `loading.tsx` raíz (sin él aparece el formulario). El streaming de un
`Suspense` necesita JS para intercambiar el contenido. Ya existía desde la Fase 5.

**Verificación:**

- [x] 74 tests unitarios, tipos, lint y Prettier limpios.
- [x] 8 e2e en verde, ya pasando por la Server Action real.
- [x] Mutantes detectados: caché (ausente en catálogos, búsqueda o detalle, y TTL cruzados),
      health (cuerpo y código), redirect y su frontera, paginación sin filtros, campos de la
      acción, `page` colado, formulario sin acción.
- [x] DOM idéntico antes y después del refactor; redirect fuera de rango igual que antes.
- [ ] `Suspense` y su `key`: sin test automático; medido a mano. Un e2e fiable necesita
      un escenario con retraso global (ver "Ideas pospuestas").
- [x] Health comprobado en una build de producción (ruta dinámica) y dentro de Docker.
- [x] Docker y Kubernetes: ver Fase 9.

**Tiempo:** 20 min 35s

## Fase 9: Docker y Kubernetes

**Prompt:**
"No podemos orquestarlo porque no tengo entorno para ello. Creo recordar que hay un k8s bastante ligero; podríamos instalarlo para poder hacer las últimas pruebas, creo que con kind o minikube"
"No hay nada hardcodeado, en variables de entorno; creo que es uno de los puntos fuertes"
"¿Qué me recomiendas? Dime los puntos fuertes y los débiles"

**Resultado:**

- `output: 'standalone'` y `outputFileTracingRoot` (la raíz del monorepo) en
  `next.config.ts`. La build genera `.next/standalone` con solo los archivos usados: 41 MB
  frente a 604 MB de `node_modules`. Sin `outputFileTracingRoot`, Next solo rastrearía
  `apps/web` y dejaría fuera los paquetes del workspace.
- `/api/health` sale dinámica en la build (`ƒ`), no prerrenderizada. `MOCKS_URL` se lee en
  tiempo de ejecución: se construyó sin ella, se arrancó con ella apuntando a un proxy y
  las peticiones pasaron por él.
- `apps/web/Dockerfile` multi-stage (contexto de build: la raíz del repositorio):
  `fetch` (`pnpm fetch`, solo con el lockfile, para reutilizar la capa), `build`
  (`pnpm install --offline --frozen-lockfile --filter @live-coding/web...` y `build`) y
  `runner` (`node:22-alpine`, solo `.next/standalone` y `.next/static`, usuario `node`,
  `HEALTHCHECK` sobre `/api/health` y `CMD env HOSTNAME=0.0.0.0 node apps/web/server.js`).
  `.dockerignore` en la raíz. Imagen de 199 MB, construida a la primera en 21 s.
- `k8s/web.yaml`: `ConfigMap` con `MOCKS_URL`, `Deployment` de 2 réplicas con liveness y
  readiness sobre `/api/health`, `runAsNonRoot` con uid 1000, sin escalada de privilegios,
  `capabilities: drop ALL` y requests/limits, y un `Service`.
- Auditoría de la configuración: la única variable de entorno que lee el código de
  `apps/web` es `MOCKS_URL`, no hay ninguna `NEXT_PUBLIC_*` en la app y la imagen solo
  trae `NODE_ENV`, `PORT` y la telemetría desactivada. El paquete de DevTools sí lee
  `NEXT_PUBLIC_MOCKS_URL`, con `http://localhost:5001/jobs` por defecto: su chunk está en
  la build, pero la home no lo carga en producción (`DevToolsLoader` devuelve `null`). El agujero era el valor por
  defecto `localhost:5001`: en producción, olvidar la variable no daba ningún aviso.
- `assertApiConfigured()` en `src/lib/config.ts` (falla si `NODE_ENV=production` y falta
  `MOCKS_URL`) y `apps/web/instrumentation.ts`, cuyo `register` la llama al iniciar el
  servidor. En desarrollo y en los tests sigue el valor por defecto. `instrumentation.ts`
  va en la raíz de `apps/web`: `src/` no es la carpeta `src` de Next porque `app/` no
  cuelga de ella.

**Corrección mía:**

- Pregunté cómo funciona `instrumentation.ts`. La respuesta, contrastada con la doc: Next lo
  detecta por el nombre en la raíz del proyecto y ejecuta su `register` una vez al iniciar
  el servidor, antes de atender peticiones; no se ejecuta en la build (comprobado
  construyendo sin `MOCKS_URL`) y, si falla, el servidor sigue vivo pero responde 500.
- Decidí aplazar los estilos (Tailwind, responsive, modo oscuro, accesibilidad visual) y
  pasar a preparar las preguntas del README: el README pesa más la arquitectura que el
  diseño, y los extras de Docker ya están.
- Planteé que, sin entorno de orquestación, no se podía probar el manifiesto, y propuse
  instalar un Kubernetes ligero. Se instaló `kind` (10,5 MB) con permiso, se creó un
  clúster temporal y se borró al terminar.

**Hallazgos:**

- La salida standalone trae `sharp` con un binario nativo de la plataforma de la build
  (aquí `darwin-arm64`): la fase de build y la final deben usar la misma familia de
  imagen (misma libc). Por eso las dos son `node:22-alpine`.
- No existe `apps/web/public`: un `COPY` de esa carpeta habría roto el build.
- Kubernetes sí sobrescribe `HOSTNAME` con el nombre del pod (`HOSTNAME=jobs-web-…` en el
  entorno del contenedor). El servidor, por el `CMD`, arrancó con `HOSTNAME=0.0.0.0`
  (leído en el PID 1) y escucha en `0.0.0.0:3000`. Antes era una suposición de la IA.

**Fallos de la IA:**

- Los 2 tests e2e de DevTools pasaban "con puertos propios" por casualidad: DevTools
  consulta desde el navegador a `localhost:5001` (salvo `NEXT_PUBLIC_MOCKS_URL`) y en esas
  ejecuciones respondía el servidor de mocks del otro checkout. Al pararse éste, fallaron.
  Se detectó descartando primero `instrumentation.ts` (fallaban igual sin él). Con
  `NEXT_PUBLIC_MOCKS_URL=http://localhost:5101/jobs` los 8 e2e pasan contra servidores propios.
- La IA dijo que sin `MOCKS_URL` el pod entraría en `CrashLoopBackOff`. No es así: `register`
  falla, pero el proceso sigue vivo y **todas las rutas responden 500, incluida
  `/api/health`**. Igualmente falla cerrado (probes en rojo, el despliegue no sustituye a
  los pods sanos, el motivo sale en el log), pero no es una caída inmediata.
- La comprobación del tráfico durante el despliegue defectuoso, por `port-forward`, falló
  (`000`): un `port-forward` a un Service se ata a un pod que se estaba reemplazando. Es un
  fallo de método y no un resultado sobre la app; la IA no lo afirmó.
- En la prueba de Docker la IA imprimió un texto sobre probar el fallo del `HEALTHCHECK` sin
  hacerlo; el camino no sano de ese `HEALTHCHECK` no se verificó.

**Verificación:**

- [x] `next build` y arranque de `.next/standalone` con `MOCKS_URL` solo en ejecución.
- [x] Imagen construida y ejecutada: salud 200, home con ofertas de la API externa,
      estático 200, proceso como `node` (uid 1000), `HEALTHCHECK` en `healthy`.
- [x] Clúster `kind`: 2 réplicas `Ready`, `MOCKS_URL` desde el `ConfigMap`, `HOSTNAME`
      inyectado por Kubernetes y resistido por el `CMD`.
- [x] Liveness rota a propósito: reinicios y eventos `statuscode: 404` / `will be restarted`.
- [x] Readiness rota a propósito: el pod nuevo queda `0/1` y fuera de los endpoints del
      Service; los pods antiguos conservan el tráfico (por endpoints).
- [x] Service enrutado por DNS desde dentro del clúster (6 de 6 respuestas correctas).
- [x] El `HEALTHCHECK` de Docker marcando `unhealthy` sin `MOCKS_URL` (y `healthy` con ella).
- [x] Build sin `MOCKS_URL` correcta; el servidor standalone en producción sin ella
      responde 500 y con ella 200; tests de `assertApiConfigured` y 3 mutantes detectados.
- [ ] Tráfico real al Service durante un despliegue defectuoso.
- [ ] Límites de recursos: sin `metrics-server`, no se ha medido el consumo.
- [ ] Instalación en Alpine comprobada solo en un `docker build` en arm64; no en x86_64.

**Tiempo:** 17 min 34s

## Fase 10: estilos con Tailwind

**Prompt:**
"¿Podríamos asaltar ahora, después de repasar esto, los estilos?"
Acepté el plan de cinco pasos (tokens y modo oscuro, componentes, responsive, detalle de oferta,
accesibilidad), verificado con capturas y medición en Chromium en lugar de mutaciones, que en
CSS no tienen sentido.
Acepté aplazar al paso 5 el hallazgo del contraste del borde de los campos (1,47 en claro y 1,83
en oscuro, frente al 3:1 de WCAG).
"Los cambios de button a Button, ¿no nos obligan a poner use client porque es un type submit?"
"Sí, actualízalo, y has hecho bien: no tenemos que instalar ninguna dependencia, como dice el README"

**Resultado:** cinco pasos pequeños, sin CSS fuera de `app/globals.css` ni librerías de UI.

1. **Tokens y modo oscuro:** `--background`, `--foreground`, `--muted`, `--border`,
   `--danger` y `--focus`, con valores oscuros bajo `@media screen and (prefers-color-scheme:
dark)`, expuestos con `@theme inline`. `color-scheme: light dark` para los controles
   nativos. Se sustituyeron los colores sueltos de los componentes.
2. **Componentes reutilizables:** `Button` (`type="button"` por defecto) y `Field`, `Input` y
   `Select`, con hover, foco, deshabilitado y error (`aria-invalid`). Sin `className`: los
   estilos se cambian en un solo sitio. Siguen siendo Server Components.
3. **Responsive:** `Page` (un solo contenedor `main` con márgenes de 16 y 24 px) y los
   filtros en un `<details>` plegado en móvil, forzado visible desde 768 px con
   `details-content:`. Sin JS y sin `'use client'`. El resumen solo se oculta si el navegador
   soporta `::details-content`.
4. **Detalle de oferta:** tarjeta de datos clave (salario, contrato y teletrabajo
   destacados), `PageTitle` responsive y versión para imprimir (sin el enlace «Volver», a
   ancho completo y sin cortar secciones).
5. **Accesibilidad visual:** una sola regla `:focus-visible` global, token `--input` para el
   borde de los campos, placeholder atenuado, transiciones solo con `motion-safe:` y
   «Anterior» y «Siguiente» subrayados.

**Corrección mía:**

- Pregunté si `Button` obliga a `'use client'` por ser `type="submit"`: no. La razón es que
  no usa estado ni manejadores de eventos propios; el `type` es irrelevante.
- Pedí el e2e a 390 px antes de pasar al paso 4: el panel de filtros solo estaba medido a
  mano.
- Señalé que no hay que instalar dependencias. El README prohíbe librerías de componentes
  de UI y CSS fuera de `globals.css`; no prohíbe instalar dependencias en general, así que
  no pasé una herramienta automática de accesibilidad (axe) por nuestro acuerdo de no
  añadir ninguna sin preguntar.

**Verificación:**

- [x] Prettier, tipos y lint limpios, 82 tests unitarios y 12 e2e.
- [x] Mediciones en Chromium (claro y oscuro, 320 a 1280 px, impresión con PDF) de estilos
      calculados, contraste (texto 7,03 como mínimo, borde de campos 4,83 y 3,91, placeholder
      7,56 y 7,89, anillos de foco 7,03 y 7,59), desbordamiento horizontal (0 en cinco páginas
      y cuatro anchos) y foco al tabular.
- [x] Mutaciones en cada paso, con los archivos restaurados (`diff -q`). Un mutante
      sobrevivió y llevó a un test nuevo: `Page` con `div` en vez de `main`.
- [x] Fallos de la IA encontrados por la medición: `content-visible` no existe en Tailwind
      4.3.3 (los filtros eran invisibles en escritorio); el hover del campo pisaba el estado de
      error; el modo oscuro se imprimía con texto claro sobre blanco; `transition-colors`
      animaba el anillo de foco; y sus dos tests de teclado tenían una carrera con la carga
      (se corrigió esperando al campo).
- [ ] Sin cubrir: Safari y Firefox, lector de pantalla, impresión real desde el navegador,
      navegadores sin `::details-content` y los estilos de jerarquía (tamaños, negritas).
- [ ] No se midió el contraste de todas las combinaciones (por ejemplo, el hover del botón
      es 5,16 en claro).

**Tiempo:** 21 min 31s

## Fase 11: esqueletos de carga

**Prompt:**
"Haz los esqueletos de carga"
"El skeleton queda un poco raro sin los botones de arriba, ¿no? Además, es el mismo que cuando vamos a una oferta; este loading debería ser diferente"
"Espera, ¿no podríamos tener más organizado components? Por lo menos skeleton. Y hay un bug derivado de meter skeletons en los filtros: cuando la llamada de getOffers tarda, se ven los filtros y puedes interactuar con ellos pero la lista aún no se ve; eso no debería ser así, creo"
"No, la decisión creo que es la apropiada; tampoco hay que poner tanto defensive coding si lo tenemos controlado con el Suspense"

**Resultado:**

1. **Lista:** cinco filas con la forma de una oferta (título, empresa y datos) en lugar de la
   línea «Cargando ofertas…». Es el fallback del `Suspense` al buscar o paginar.
2. **Home en la primera carga (`app/loading.tsx`):** el título real, un esqueleto de filtros
   (una barra en móvil; tres campos y el botón en escritorio) y la lista.
3. **Detalle (`app/offers/[offerId]/loading.tsx`):** esqueleto propio (título, empresa,
   tarjeta de datos y descripción), anunciado como «Cargando oferta…». Hasta entonces el
   `loading.tsx` raíz servía a las dos rutas y al abrir una oferta salía la lista.
4. **Accesibilidad:** cada esqueleto es un `role="status"` con `aria-busy` y un texto solo
   para lectores de pantalla; las barras van `aria-hidden` y no son `li`. El pulso usa
   `motion-safe:` y los colores salen de los tokens (`bg-border`), así que sirven en oscuro.
5. **Organización:** `Skeleton` y `SkeletonRegion` agrupan lo común, y las cuatro piezas
   (`Skeleton`, `FiltersLoading`, `OffersLoading`, `OfferLoading`) viven en
   `src/components/skeletons/`.

**Decisiones:**

- **Los filtros se quedan fuera del `Suspense`.** Mientras `getOffers` tarda se ven y se
  pueden usar, y solo la lista muestra el esqueleto. Lo pregunté como posible bug; no viene
  de los esqueletos (el `Suspense` ya envolvía solo la lista desde la fase 8) y se decidió
  dejarlo: los filtros no se mueven, conservan lo escrito y la `key` del `Suspense` sustituye
  la espera si se envía otra búsqueda. Ocultarlos hasta que llegue la lista obligaría a
  meterlos dentro del `Suspense` y a perder lo escrito. No se añade código defensivo (por
  ejemplo, deshabilitar el formulario mientras carga) porque el `Suspense` ya lo controla.
- **Un esqueleto por ruta**, no uno compartido: lo que se ve mientras carga debe parecerse a
  lo que va a aparecer.

**Corrección mía:**

- Señalé que el esqueleto de la home sin filtros quedaba raro y que el del detalle era el de
  la lista; ambas cosas venían del `loading.tsx` raíz único.
- Pedí ordenar `components`, que estaba plano con cuatro piezas de esqueleto mezcladas.
- Atribuí a los esqueletos un fallo de los filtros durante la carga. Se verificó: no
  venía de ellos, es el diseño del `Suspense`, y decidí mantenerlo.

**Verificación:**

- [x] Prettier, tipos y lint limpios y 84 tests unitarios (2 nuevos: el estado del detalle y
      el título de la home).
- [x] Chromium con la API retrasada 3 a 4 s y la caché en frío: la home muestra título,
      esqueleto de filtros y lista sin el buscador real; el detalle muestra su esqueleto
      («Cargando oferta…», cero `li`); animación `pulse` y `none` con `reduced-motion`
      (primera versión de la lista).
- [x] Mutaciones: quitar el texto o el `role` de la lista falla `loading.test.tsx`. Un
      mutante sobrevivió: si el detalle volvía a usar el esqueleto de la lista, el test
      (`/cargando oferta/i`) seguía pasando porque también casa con «ofertas»; se apretó a
      `/^cargando oferta…$/i` y ahora lo mata. Archivos restaurados (`diff -q`).
- [ ] Sin cubrir: las capturas en oscuro y en móvil de los esqueletos nuevos (el caso en frío
      a 390 px no se pudo capturar con la caché caliente); el esqueleto de filtros no copia al
      píxel los campos reales; y qué pasa si se envía una búsqueda mientras otra sigue
      cargando (no se midió). Los e2e se volvieron a ejecutar en la fase 12 (pasan).

**Tiempo:** 15 min 11s

## Fase 12: extras de diseño pendientes y campos desincronizados

**Prompt:**
"Revisa los extras en amarillos a ver cuál podríamos hacer"
Con los tokens y las variantes hechos, en vez de parar elegí seguir con el estado vacío:
"El estado vacío"
"Con el nuevo EmptyResults, el botón que ponemos con href=\"/\" hace que el browser tire hacia atrás y recupere el input con la última búsqueda del input; es un apunte"
"Mientras no tengamos que pasar nada a use client, podemos tirar y añadir los e2e para el nuevo flujo que has reproducido"
"Actualiza el ai-log. Como no tenemos page en la key cuando pasemos de página los filtros quedarán ahi, pero en cuanto cambiemos alguna parte de key se volvera a montar, ¿no?"

**Resultado:** de los cuatro extras de «Diseño y CSS» que estaban a medias, tres hechos; View
Transitions se deja fuera (es experimental en Next 16, necesita una flag y toca `Link` y las
páginas, y es el que menos pesa).

1. **Tokens de tipografía, espaciado y ancho** en `@theme`: `text-title`, `text-title-lg`,
   `text-section`, `text-lead`, `text-label` (con las mismas alturas de línea que Tailwind),
   `gutter` y `section` (espaciado) y `container-page` (ancho). Sustituyen a `text-2xl`,
   `text-3xl`, `text-xl`, `text-lg`, `text-sm`, `max-w-4xl`, `space-y-6`, `px-4` y `p-4`. El
   `px-4` del `Button` se queda porque es el relleno del botón, no un margen de panel.
2. **Variantes de `Button`:** `primary` y `secondary`. Las clases salen de `buttonClasses()` y
   las comparte `ButtonLink` (un `Link` con aspecto de botón), que usan «Anterior» y
   «Siguiente» de la paginación en lugar del subrayado. `enabled:hover:` pasó a
   `not-disabled:hover:` para que el hover también funcione en un enlace. La paginación
   admite saltos de línea y el texto de página no se parte (a 320 px se partía).
3. **Estado vacío:** `EmptyResults`, con el mensaje de siempre, una pista y un botón «Quitar
   filtros» que solo sale si hay algún filtro activo (con la API vacía y sin filtros no haría
   nada).
4. **Campos que no seguían la URL (fallo que encontré yo):** al pulsar «Quitar
   filtros» la URL pasaba a `/` pero el campo seguía mostrando lo último escrito; al volver
   atrás pasaba lo mismo. Causa: los campos no están controlados y usan `defaultValue`, que un
   campo ya modificado por el usuario ignora, y las navegaciones con `Link` reutilizan el
   mismo DOM. Arreglo: `key` en `SearchFilters` con `q`, `province` y `contractType` (sin
   `page`). Cuando cambia alguno, React desmonta y vuelve a montar el formulario, que toma el
   valor de la URL. Es el mismo mecanismo que ya usa el `Suspense` de la lista y no necesita
   `'use client'`. La `page` queda fuera a propósito: al paginar los filtros no cambian y así
   no se pierde el texto escrito pero aún no buscado.

**Decisiones:**

- **Sin `'use client'`:** el arreglo del campo se resolvió con una `key` en el servidor, no
  con campos controlados. El único Client Component sigue siendo `error.tsx`.
- **Los tokens son semánticos** (`gutter`, `section`, `lead`), no una copia de la escala de
  Tailwind: el nombre dice para qué sirve el valor.
- **View Transitions, fuera:** va a la respuesta 7 (qué mejoraría).

**Para repasar (la `key` de React):**

- Para decidir si remonta, compara el árbol nuevo con el anterior por **posición y tipo**. La
  documentación lo dice así: React preserva el estado mientras el componente se renderice en
  la misma posición, y lo descarta si se elimina o si aparece otro componente en esa posición.
- Una `key` pasa a formar parte de esa identidad: si cambia, React descarta el componente y
  monta uno nuevo. Por eso sirve para reiniciar un formulario.
- Lo más parecido a una `key` interna es el **índice** en las listas sin `key`; de ahí el aviso
  de React, porque el índice es una mala identidad si el orden cambia.
- Fuente: react.dev, «Preserving and Resetting State». No se consultó cómo guarda React la
  identidad internamente.

**Corrección mía:**

- La IA comprobó «Quitar filtros» cargando la URL directamente y salió bien. Era una prueba
  insuficiente: un campo que nadie ha tocado sí sigue a `defaultValue`. Solo reprodujo el fallo
  después de que yo lo señalara, escribiendo en el campo y buscando antes.
- Los primeros tests de selects de la IA tenían una carrera: esperaban a que apareciera «algún
  listitem» cuando la lista antigua ya estaba visible, y el formulario, al volver a montarse,
  devolvía «Madrid». Se pasó a esperar a la URL.

**Verificación:**

- [x] Prettier, tipos y lint limpios, 91 tests unitarios y 18 e2e (6 nuevos: texto y selects
      tras «Quitar filtros», volver atrás con texto, provincia y contrato, y paginar conserva
      lo escrito).
- [x] Tokens: instantánea de estilos calculados de la home, el detalle y el esqueleto (166
      elementos por ancho, a 390, 800 y 1280 px) antes y después: idéntica. Un valor de token
      cambiado y una clase mal escrita producen 778 líneas de diferencia, así que la medición
      detecta cambios.
- [x] Variantes: botón principal sin cambios (reposo, hover y deshabilitado); enlace
      secundario con borde de 1 px, hover y foco de 2 px; contraste del borde 4,83 en claro y
      3,91 en oscuro; sin desbordamiento de 320 a 1280 px.
- [x] Estado vacío: contraste de la pista 7,56 y 7,89; «Quitar filtros» lleva a `/` y la
      lista vuelve a salir.
- [x] Mutaciones: `EmptyResults` (quitar `province`, quitar `contractType`, condición siempre
      verdadera, cambiar el `href`, borrar la pista) y `ButtonLink` (quitar `{...props}`),
      todos matados. Sobre la `key`: quitar `province`, `contractType` o `q`, meter `page` o
      quitar la `key` hacen fallar cada vez el test esperado. Archivos restaurados (`diff -q`).
- [x] Paginar con un filtro activo (contrato Indefinido): la URL pasa a
      `?contractType=indefinido&page=2`, el selector sigue en «Indefinido» y las 5 ofertas de
      la página 2 son todas indefinidas. Medido a mano en Chromium; el e2e de paginar no
      lleva filtros.
- [ ] Sin cubrir: los dos tests de variantes en sí (jsdom no calcula estilos, solo lo cubre la
      medición en Chromium, que no está en el repo); las capturas en claro y en móvil del
      estado vacío; `role="status"` en el estado vacío (no se probó con lector de pantalla);
      el panel de filtros en móvil con la `key`; y un mensaje inexplicado de `pnpm lint` en
      `qa/web` («A new baseline file was created»), que no tiene script `lint`: no cambió
      ningún archivo.

**Tiempo:** 14 min 3s

## Ideas pospuestas

- `Number.isSafeInteger` en `parsePage` para rechazar números enormes.
- En producción, `error.tsx` no distingue un `TypeError` de red de un `ApiError`.
- El `loading.tsx` raíz hace que `/offers/<id inexistente>` responda 200 y no 404, que un
  `redirect` fuera de rango sea una redirección de cliente en vez de un 307, y que la home
  sin JavaScript solo muestre "Cargando ofertas…". Sin él: 404, 307 y formulario visible.
  Arreglo: llevar `loading.tsx` y `error.tsx` a un grupo de rutas solo para la home.
- "Volver a las ofertas" lleva siempre a `/` y pierde la página y los filtros de origen
  (pregunta 4 del README).
- El test de requisitos y beneficios podría agruparse por el `h2` de cada sección.
- Tests e2e del estado de error (con su "Reintentar") y del aviso de carga al navegar: se
  fuerzan con el escenario de `GET /offers` del servidor de mocks (`POST
/jobs/api/debug/scenarios`, con `scenarioId: "error"` o `delay`), porque la petición sale
  del servidor de Next y `page.route` no la intercepta. El escenario es global y
  persistente, así que irían en su propio archivo y en un proyecto de Playwright que se
  ejecute después de los demás (`dependencies`), restaurando el escenario en `afterEach`.
  Con la búsqueda cacheada 60 s, una respuesta anterior podría enmascarar el escenario:
  habría que pedir una URL que no esté en caché (por ejemplo, un `q` único).
- Revalidación bajo demanda (`revalidateTag`): hoy una provincia nueva tarda hasta 1 h en
  aparecer y una oferta modificada hasta 60 s. Hace falta algo que la dispare.
  A repasar como respuesta de entrevista a la pregunta 3 del README ("cuándo invalidarías"):
  la revalidación por tiempo (`revalidate`) ya está; la bajo demanda se haría con `tags` en
  los `fetch` y un `revalidateTag` disparado cuando cambie una oferta (un webhook de la
  fuente de datos, que aquí no existe), en una ruta protegida con un secreto. No se
  implementó porque no hay disparador real y sería código sin uso.
- Caché compartida entre pods (`cacheHandler` externo, p. ej. Redis): por defecto cada pod
  tiene la suya y dos usuarios pueden ver resultados con hasta 60 s de diferencia.
- Un `/api/ready` aparte que compruebe la API de ofertas, si se quisiera separar la
  readiness de la liveness.
- Estilos pendientes: View Transitions entre la lista y el detalle (experimental en Next 16,
  necesita una flag) y una comprobación automática de accesibilidad (axe) si se acepta una
  dependencia de desarrollo.
- `pageSize` en la URL (la API lo soporta): validado contra una lista cerrada (10, 20, 50) y
  con `page` a 1 al cambiarlo.
- `q` sin longitud máxima: acotarlo (unos 100 caracteres) y normalizar a minúsculas.
- En escritorio, el `<details>` de filtros sigue plegado en el árbol de accesibilidad
  aunque se vea (aparece como `group`); no se probó con lector de pantalla.
- `playwright.config.ts` no pasa `NEXT_PUBLIC_MOCKS_URL` ni los puertos a los `webServer`:
  si se cambian `WEB_PORT` o `MOCKS_PORT`, los tests de DevTools siguen apuntando al 5001.
- Para un despliegue real del manifiesto: `MOCKS_URL: http://mocks:5001/jobs` apunta a un
  Service `mocks` que no existe (los mocks no tienen imagen) y `jobs-web:latest` es una
  imagen local, no publicada en un registro. Valorar un `startupProbe` (hoy la readiness
  falla con `connection refused` los primeros segundos de cada pod) y medir los límites de
  recursos con `metrics-server`.
