import Link from "next/link";
import Image from "next/image";

interface ProductCardProps {
  id: string | number;
  name: string;
  price: number;
  discountPrice?: number;
  imageUrl: string;
  slug: string;
}

export default function ProductCard({
  // id,
  name,
  price,
  discountPrice,
  imageUrl,
  slug,
}: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);

  const formattedDiscountPrice = discountPrice
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(discountPrice)
    : null;

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden transition-transform hover:-translate-y-1">
      <Link href={`/products/${slug}`} className="block relative h-64">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="bg-gray-100 h-full flex items-center justify-center">
            <span className="text-gray-400">Hình ảnh sản phẩm</span>
          </div>
        )}
      </Link>

      <div className="p-4">
        <Link href={`/products/${slug}`} className="block">
          <h3 className="text-lg font-medium text-gray-800 hover:text-amber-600 transition-colors mb-2">
            {name}
          </h3>
        </Link>

        <div className="flex items-center mb-4">
          <span className="text-lg font-bold text-amber-600">
            {discountPrice ? formattedDiscountPrice : formattedPrice}
          </span>

          {discountPrice && (
            <span className="text-sm text-gray-500 line-through ml-2">
              {formattedPrice}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center">
          <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md transition-colors">
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </div>
  );
}
