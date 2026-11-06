const FILTERS = [
  {name: 'Texto libre', param: 'q', description: 'Busca por título de la oferta o nombre de la empresa.'},
  {name: 'Provincia', param: 'province', description: 'Id de provincia obtenido de /catalogs/provinces.'},
  {name: 'Tipo de contrato', param: 'contractType', description: 'Id obtenido de /catalogs/contract-types.'}
]

const ENDPOINTS = [
  {
    method: 'GET',
    path: '/offers?q=&province=&contractType=&page=1&pageSize=10',
    description: 'Búsqueda paginada. Devuelve { items, page, pageSize, total, totalPages }.',
    scenarios: 'default · empty · error'
  },
  {
    method: 'GET',
    path: '/offers/:offerId',
    description: 'Detalle de una oferta (ids de "of-0001" a "of-0060").',
    scenarios: 'default · notFound · error'
  },
  {method: 'GET', path: '/catalogs/provinces', description: 'Provincias disponibles.', scenarios: 'default · error'},
  {
    method: 'GET',
    path: '/catalogs/contract-types',
    description: 'Tipos de contrato disponibles.',
    scenarios: 'default · error'
  }
]

const DESIGN_EXTRA = {
  title: 'Diseño y CSS',
  details: [
    'Diseño responsive real (móvil, tablet y escritorio); por ejemplo, los filtros en un panel o cajón en móvil',
    'Modo oscuro con prefers-color-scheme, apoyado en tokens de diseño (colores, espaciados, tipografía) definidos en @theme',
    'Componentes reutilizables y accesibles (botón, input, select, tarjeta de oferta, paginación, chips) con sus variantes y estados: hover, focus, disabled y error',
    'Accesibilidad visual: foco visible, contraste AA, navegación por teclado y prefers-reduced-motion',
    'Estados bien diseñados: esqueletos de carga, estado vacío y estado de error con acción de reintentar',
    'Microinteracciones y transiciones sobrias (por ejemplo, View Transitions entre la lista y el detalle)',
    'Detalle de oferta cuidado: jerarquía tipográfica, información clave destacada (salario, contrato, teletrabajo) y versión para imprimir'
  ]
}

const EXTRAS = [
  {
    title: 'Dockerizar la aplicación para desplegarla en un clúster de Kubernetes',
    details: [
      'Dockerfile multi-stage para apps/web (imagen ligera, usuario no root, output standalone de Next.js)',
      'Configuración por variables de entorno (por ejemplo MOCKS_URL), sin valores hardcodeados en la imagen',
      'Un endpoint de salud para los probes de liveness/readiness'
    ]
  },
  DESIGN_EXTRA
]

const FINAL_QUESTIONS = [
  '¿Qué estado vive en el servidor, qué estado vive en el cliente y por qué? ¿Qué pondrías en la URL?',
  '¿Cómo gestionarías el estado en cliente si la aplicación creciera (useState, Context, Zustand, Redux…)? ¿Cuándo es necesario y cuándo no?',
  '¿Qué cachearías y dónde (caché de fetch de Next.js, caché de datos, React Query/SWR, CDN, navegador)? ¿Cómo y cuándo invalidarías o revalidarías?',
  '¿Cómo evitarías datos obsoletos al volver a una búsqueda o al navegar entre la lista y el detalle?',
  '¿Cómo plantearías las actualizaciones optimistas, por ejemplo guardar una oferta como favorita?',
  '¿Cómo gestionarías los errores y los reintentos en servidor y en cliente?',
  '¿Qué mejorarías o cambiarías si tuvieras más tiempo?'
]

const SERVER_FEATURES = [
  'Server Components y data fetching en servidor',
  'searchParams como fuente de verdad de filtros y paginación (URL compartible)',
  'Server Actions (p. ej. para enviar el formulario de filtros)',
  'loading.tsx / Suspense, error.tsx y not-found.tsx / notFound()',
  'generateMetadata para el detalle de la oferta',
  'Caché y revalidación de fetch'
]

export default function HomePage() {
  return (
    <main className="mx-auto max-w-4xl space-y-10 px-6 py-12">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Prueba técnica: buscador de ofertas</h1>
        <p className="text-gray-600">
          Bienvenido/a. En esta sesión vas a construir, sobre esta app de Next.js, un buscador de ofertas de empleo y la
          visualización del detalle de una oferta, consumiendo la API que sirve el servidor de mocks.
        </p>
      </header>

      <section aria-labelledby="que-hacer" className="space-y-3">
        <h2 id="que-hacer" className="text-xl font-semibold">
          Qué tienes que hacer
        </h2>
        <ol className="list-decimal space-y-2 pl-6">
          <li>
            Crear un <strong>buscador de ofertas</strong> con <strong>3 filtros distintos</strong> y{' '}
            <strong>paginación</strong> de los resultados.
          </li>
          <li>
            Permitir <strong>clicar en una oferta</strong> para ver su <strong>página de detalle</strong>.
          </li>
          <li>Gestionar los estados de carga, sin resultados y error (puedes forzarlos desde el DevTools).</li>
        </ol>
        <ul className="mt-2 divide-y rounded border">
          {FILTERS.map(filter => (
            <li key={filter.param} className="px-4 py-2">
              <strong>{filter.name}</strong> <code className="rounded bg-gray-100 px-1">{filter.param}</code> —{' '}
              {filter.description}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="que-valoramos" className="space-y-3">
        <h2 id="que-valoramos" className="text-xl font-semibold">
          Qué vamos a valorar
        </h2>
        <p>
          Valoraremos <strong>una arquitectura testeable y mantenible por encima del diseño visual</strong>. No hace
          falta que quede bonito: nos interesa cómo separas responsabilidades, cómo estructuras el código y cómo lo
          pruebas.
        </p>
        <p>
          También valoraremos el <strong>uso de las funcionalidades server-side de Next.js</strong>, por ejemplo:
        </p>
        <ul className="list-disc space-y-1 pl-6">
          {SERVER_FEATURES.map(feature => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="estilos" className="space-y-3">
        <h2 id="estilos" className="text-xl font-semibold">
          Estilos: usa Tailwind
        </h2>
        <p>
          Los estilos se tienen que hacer <strong>usando Tailwind CSS</strong> (v4, ya configurado en este proyecto):
          clases utilitarias en los componentes y, si necesitas valores propios, tokens en el bloque{' '}
          <code className="rounded bg-gray-100 px-1">@theme</code> de{' '}
          <code className="rounded bg-gray-100 px-1">app/globals.css</code>. No uses librerías de componentes de UI ni
          CSS propio fuera de ese fichero.
        </p>
        <p>
          Recuerda que el diseño visual pesa menos que la arquitectura, pero si lo trabajas se valorará la calidad del
          CSS: mantenible, sin duplicación y con tokens, no solo que quede bonito.
        </p>
      </section>

      <section aria-labelledby="extras" className="space-y-3">
        <h2 id="extras" className="text-xl font-semibold">
          Extras que suman puntos
        </h2>
        <p>
          No son obligatorios, pero si te sobra tiempo <strong>suman puntos</strong>. Es preferible tener lo principal
          bien resuelto antes que llegar a los extras.
        </p>
        <ul className="space-y-3">
          {EXTRAS.map(extra => (
            <li key={extra.title} className="rounded border px-4 py-3">
              <strong>{extra.title}</strong>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-gray-700">
                {extra.details.map(detail => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="api" className="space-y-3">
        <h2 id="api" className="text-xl font-semibold">
          API disponible
        </h2>
        <p>
          Base URL: <code className="rounded bg-gray-100 px-1">http://localhost:5001/jobs</code> (servidor de mocks).
          Desde el servidor de Next.js está disponible como{' '}
          <code className="rounded bg-gray-100 px-1">API_BASE_URL</code> en{' '}
          <code className="rounded bg-gray-100 px-1">src/lib/config.ts</code>.
        </p>
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2">Método</th>
                <th className="px-4 py-2">Endpoint</th>
                <th className="px-4 py-2">Descripción</th>
                <th className="px-4 py-2">Escenarios</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {ENDPOINTS.map(endpoint => (
                <tr key={endpoint.path}>
                  <td className="px-4 py-2 font-mono">{endpoint.method}</td>
                  <td className="px-4 py-2 font-mono">{endpoint.path}</td>
                  <td className="px-4 py-2">{endpoint.description}</td>
                  <td className="px-4 py-2 font-mono">{endpoint.scenarios}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="devtools" className="space-y-3">
        <h2 id="devtools" className="text-xl font-semibold">
          DevTools de mocks
        </h2>
        <p>
          En desarrollo, abajo a la derecha verás el botón <strong>DevTools</strong>. Desde la pestaña <em>Mocks</em>{' '}
          puedes ver todos los endpoints, cambiar el escenario de cada uno (<code>empty</code>, <code>error</code>,{' '}
          <code>notFound</code>…) y añadir un retardo. En <em>Mock Calls</em> verás el historial de llamadas con su
          respuesta.
        </p>
      </section>

      <section aria-labelledby="como-arrancar" className="space-y-3">
        <h2 id="como-arrancar" className="text-xl font-semibold">
          Cómo trabajar
        </h2>
        <pre className="overflow-x-auto rounded bg-gray-900 p-4 text-sm text-gray-100">
          {`pnpm install
pnpm dev          # app en :3000 y mocks en :5001
pnpm test         # tests unitarios (Vitest + Testing Library)
pnpm check-types && pnpm lint`}
        </pre>
        <p className="text-sm text-gray-600">
          Puedes usar la ayuda que quieras (documentación, buscador, IA), pero tendrás que explicar tus decisiones.
        </p>
      </section>

      <section aria-labelledby="preguntas-finales" className="space-y-3">
        <h2 id="preguntas-finales" className="text-xl font-semibold">
          Preguntas para resolver al final
        </h2>
        <p>
          Cuando termines (o cuando se acabe el tiempo) las comentaremos en voz alta. No hace falta implementarlas, pero
          ten en cuenta tus respuestas mientras desarrollas: queremos entender cómo razonas sobre la gestión del estado
          en cliente, la caché y los datos.
        </p>
        <ol className="list-decimal space-y-2 pl-6">
          {FINAL_QUESTIONS.map(question => (
            <li key={question}>{question}</li>
          ))}
        </ol>
      </section>
    </main>
  )
}
