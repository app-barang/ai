export default function Loading() {
  return (
    <div className="min-h-[70vh] bg-bgalt">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-br from-orange-50 via-white to-pink-50">
        <div className="container-custom grid items-center gap-12 py-16 md:py-24 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="h-7 w-56 animate-pulse rounded-full bg-gray-200" />
            <div className="h-12 w-full max-w-md animate-pulse rounded-xl bg-gray-200" />
            <div className="h-12 w-3/4 animate-pulse rounded-xl bg-gray-200" />
            <div className="h-4 w-full animate-pulse rounded-lg bg-gray-200" />
            <div className="h-4 w-5/6 animate-pulse rounded-lg bg-gray-200" />
            <div className="flex gap-3">
              <div className="h-12 w-40 animate-pulse rounded-xl bg-gray-200" />
              <div className="h-12 w-40 animate-pulse rounded-xl bg-gray-200" />
            </div>
          </div>
          <div className="mx-auto aspect-square w-full max-w-md animate-pulse rounded-3xl bg-gray-200" />
        </div>
      </div>

      {/* Product grid skeleton */}
      <div className="container-custom py-16">
        <div className="mb-8 flex justify-center">
          <div className="h-10 w-64 animate-pulse rounded-full bg-gray-200" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl bg-white p-0 shadow-soft">
              <div className="aspect-square animate-pulse bg-gray-200" />
              <div className="space-y-2 p-4">
                <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}