import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Category } from "@/services/categoryService";
import Image from "next/image";
import { getFullImageUrl } from "@/utils/image";

interface SortableCategoryProps {
  category: Category;
}

export function SortableCategory({ category }: SortableCategoryProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-md p-4 flex items-center justify-between cursor-move"
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center space-x-4">
        <div className="text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </div>

        {category.imageUrl && (
          <div className="w-10 h-10 relative rounded-md overflow-hidden flex-shrink-0">
            <Image
              src={getFullImageUrl(category.imageUrl)}
              alt={category.name}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
        )}

        <div>
          <h3 className="font-medium">{category.name}</h3>
          <p className="text-sm text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
            /{category.slug}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {category.isActive === false ? (
          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
            Inactive
          </span>
        ) : (
          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
            Active
          </span>
        )}
      </div>
    </div>
  );
}
