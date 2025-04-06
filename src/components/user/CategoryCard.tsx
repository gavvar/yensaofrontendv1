import Link from "next/link";
import Image from "next/image";

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  children?: Category[];
  productCount?: number;
}

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const defaultImage = "/images/category-placeholder.jpg";

  return (
    <Link href={`/products?category=${category.slug}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
        {/* Category image */}
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            {category.name}
          </h3>
          <p className="text-gray-800 dark:text-gray-300 text-sm">
            {category.description}
          </p>
        </div>
      </div>
      <div className="relative h-60 group overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
        {/* Category Image with overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10 opacity-70"></div>
        <Image
          src={category.imageUrl || defaultImage}
          alt={category.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, 33vw"
        />

        {/* Category content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
          <h3 className="text-xl font-semibold mb-1">{category.name}</h3>

          {category.description && (
            <p className="text-sm text-gray-900 dark:text-gray-100100 mb-2 line-clamp-2">
              {category.description}
            </p>
          )}

          {/* Show children categories if available */}
          {category.children && category.children.length > 0 && (
            <div className="mt-2 space-x-2">
              {category.children.slice(0, 3).map((child) => (
                <span
                  key={child.id}
                  className="inline-block text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded"
                >
                  {child.name}
                </span>
              ))}

              {category.children.length > 3 && (
                <span className="inline-block text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded">
                  +{category.children.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Show product count if available */}
          {category.productCount !== undefined && (
            <div className="mt-3 flex items-center">
              <span className="text-sm bg-amber-600/80 px-2 py-0.5 rounded">
                {category.productCount} sản phẩm
              </span>
            </div>
          )}

          <div className="absolute bottom-0 right-0 p-4">
            <div className="bg-white text-amber-600 rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
