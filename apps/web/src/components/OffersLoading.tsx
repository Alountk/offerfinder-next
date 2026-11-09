const SKELETON_ROWS = 5

export function OffersLoading() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Cargando ofertas…</span>
      <div aria-hidden="true" className="divide-y divide-border rounded border border-border motion-safe:animate-pulse">
        {Array.from({length: SKELETON_ROWS}, (_, row) => (
          <div key={row} className="space-y-2 px-4 py-3">
            <div className="h-5 w-2/3 rounded bg-border" />
            <div className="h-4 w-1/3 rounded bg-border" />
            <div className="h-4 w-1/2 rounded bg-border" />
          </div>
        ))}
      </div>
    </div>
  )
}