"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Category } from "@/services/categoryService";

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/category/${category.slug}`}>
      <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="relative h-48 w-full">
          {category.imageUrl ? (
            <Image
              src={category.imageUrl}
              alt={category.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-black font-medium">Không có hình ảnh</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-bold text-black mb-1">{category.name}</h3>
          {category.description && (
            <p className="text-black font-medium text-sm line-clamp-2">
              {category.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
