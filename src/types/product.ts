export interface ProductImage {
  id?: number; // Thêm trường id kiểu number
  url: string;
  isFeatured?: boolean;
  altText?: string;
  sortOrder: number;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
}

// Interface đầy đủ cho chi tiết sản phẩm
export interface Product {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  description?: string;
  content?: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  unit?: string;
  status: "active" | "inactive";
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  viewCount?: number;
  saleCount?: number;
  sku: string;
  weight?: number;
  origin?: string;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
  category?: ProductCategory;
}

// Interface cho danh sách sản phẩm (bớt fields)
export interface ProductSummary {
  id: number;
  categoryId?: number; // Optional for backwards compatibility
  name: string;
  slug: string;
  description?: string;
  price: number;
  discountPrice?: number;
  quantity?: number; // Optional for backwards compatibility
  unit?: string;
  status: "active" | "inactive";
  isFeatured: boolean;
  sku: string;
  images: ProductImage[];
  category?: ProductCategory;

  // Thêm các trường còn thiếu
  viewCount?: number; // Optional
  saleCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductInput {
  categoryId: number;
  name: string;
  description?: string;
  content?: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  unit?: string;
  status: "active" | "inactive";
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  sku: string;
  weight?: number;
  origin?: string;
  images?: Array<{
    url: string;
    isFeatured?: boolean;
    altText?: string;
  }>;
  // Thêm trường này để xử lý ảnh tạm khi upload
  tempImages?: TempImage[];
}

export interface TempImage {
  file: File;
  preview: string;
  isFeatured: boolean;
}

export interface ProductFilter {
  category?: number | string;
  categorySlug?: string;
  price_min?: number | string;
  price_max?: number | string;
  status?: "active" | "inactive";
}

// Cập nhật lại interface ProductsResponse trong file types/product.ts
export interface ProductsResponse {
  success: boolean; // Thêm trường này
  data: {
    rows: Product[];
    count: number;
    totalPages: number;
    currentPage: number;
  };
}

// Trong file types/product.ts hoặc tương tự
export interface ApiProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface ProductResponse {
  success: boolean;
  data: {
    product: Product;
  };
}

// Thêm các interface này vào types/product.ts
export interface ApiSuccessResponse {
  success: boolean;
  message?: string;
}

export interface ProductImageResponse {
  success: boolean;
  data: {
    images: ProductImage[];
  };
  message?: string;
}

export interface ProductViewResponse {
  success: boolean;
  data: {
    viewCount: number;
  };
}
