import dynamic from "next/dynamic";
import { Suspense } from "react";

// Lazy load ProductFilters component
const ProductFilters = dynamic(
  () => import("@/components/product/ProductFilters"),
  {
    loading: () => (
      <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
    ),
  }
);

// Lazy load ProductList component
const ProductList = dynamic(() => import("@/components/product/ProductList"), {
  loading: () => (
    <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
  ),
});

// Use suspense for loading state
export default function ProductsPage() {
  // ...các state và hook khác

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Sản phẩm</h1>

      <div className="flex flex-col md:flex-row gap-6">
        <Suspense
          fallback={
            <div className="w-64 bg-gray-100 animate-pulse rounded-lg"></div>
          }
        >
          <ProductFilters
            onFilterChange={handleFilterChange}
            initialFilters={filter}
          />
        </Suspense>

        <div className="flex-1">
          <Suspense
            fallback={
              <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
            }
          >
            <ProductList products={products} loading={loading} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
