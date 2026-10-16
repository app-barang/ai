export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-bgalt py-8 md:py-10">
      <div className="container-custom">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Sidebar skeleton */}
          <aside className="h-fit rounded-3xl border border-gray-100 bg-white p-4 shadow-soft">
            <div className="mb-4 flex items-center gap-3 px-2">
              <div className="h-11 w-11 animate-pulse rounded-xl bg-gray-200" />
              <div className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
            <div className="space-y-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-11 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          </aside>

          {/* Content skeleton */}
          <div className="space-y-6">
            <div>
              <div className="h-8 w-56 animate-pulse rounded-xl bg-gray-200" />
              <div className="mt-2 h-4 w-40 animate-pulse rounded bg-gray-200" />
            </div>

            {/* Stats cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card-soft space-y-3">
                  <div className="h-10 w-10 animate-pulse rounded-xl bg-gray-200" />
                  <div className="h-7 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
                </div>
              ))}
            </div>

            {/* Table/list skeleton */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
              <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
              <div className="mt-5 space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-10 w-10 animate-pulse rounded-xl bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200" />
                      <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}