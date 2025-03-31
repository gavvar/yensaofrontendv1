"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import { FiSave, FiX, FiUpload, FiTrash2 } from "react-icons/fi";
import Image from "next/image";
import productService from "@/services/productService";
import categoryService, { Category } from "@/services/categoryService";
import { Product, ProductInput } from "@/types/product";
import axios from "axios";
interface TempImage {
  file: File;
  preview: string;
  isFeatured: boolean;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = Number(params.id);

  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploading, setUploading] = useState(false);
  const [tempImages, setTempImages] = useState<TempImage[]>([]);
  const [, setProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState<Partial<ProductInput>>({
    categoryId: 0,
    name: "",
    description: "",
    content: "",
    price: 0,
    discountPrice: undefined,
    quantity: 0,
    unit: "",
    status: "active",
    isFeatured: false,
    metaTitle: "",
    metaDescription: "",
    sku: "",
    weight: undefined,
    origin: "",
    images: [],
  });

  const [errors, setErrors] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingProduct(true);
        // Fetch product and categories in parallel
        const [productData, categoriesData] = await Promise.all([
          productService.getProductById(productId),
          categoryService.getAllCategories(),
        ]);

        setProduct(productData);
        setCategories(categoriesData);

        // Set form data from product
        setFormData({
          categoryId: productData.categoryId,
          name: productData.name,
          description: productData.description || "",
          content: productData.content || "",
          price:
            typeof productData.price === "string"
              ? parseFloat(productData.price)
              : productData.price,
          discountPrice: productData.discountPrice
            ? typeof productData.discountPrice === "string"
              ? parseFloat(productData.discountPrice)
              : productData.discountPrice
            : undefined,
          quantity: productData.quantity,
          unit: productData.unit || "",
          status: productData.status,
          isFeatured: productData.isFeatured,
          metaTitle: productData.metaTitle || "",
          metaDescription: productData.metaDescription || "",
          sku: productData.sku,
          weight: productData.weight
            ? typeof productData.weight === "string"
              ? parseFloat(productData.weight)
              : productData.weight
            : undefined,
          origin: productData.origin || "",
          images: productData.images || [],
        });

        setLoadingProduct(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Không thể tải thông tin sản phẩm");
        setLoadingProduct(false);
      }
    };

    if (productId) {
      fetchData();
    }
  }, [productId]);

  // Cleanup object URLs when unmounting
  useEffect(() => {
    return () => {
      tempImages.forEach((img) => {
        URL.revokeObjectURL(img.preview);
      });
    };
  }, [tempImages]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name) newErrors.name = "Tên sản phẩm không được để trống";
    if (!formData.categoryId) newErrors.categoryId = "Vui lòng chọn danh mục";
    if (!formData.price || formData.price <= 0)
      newErrors.price = "Giá sản phẩm phải lớn hơn 0";
    if (
      formData.discountPrice !== undefined &&
      formData.price &&
      formData.discountPrice >= formData.price
    ) {
      newErrors.discountPrice = "Giá khuyến mãi phải nhỏ hơn giá gốc";
    }
    if (!formData.sku) newErrors.sku = "Mã sản phẩm không được để trống";
    if (formData.quantity !== undefined && formData.quantity < 0) {
      newErrors.quantity = "Số lượng không được âm";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      setFormData({
        ...formData,
        [name]: value ? parseFloat(value) : undefined,
      });
    } else if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else if (name === "categoryId") {
      setFormData({
        ...formData,
        [name]: value ? parseInt(value, 10) : 0,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const newTempImages: TempImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.error(`"${file.name}" không phải là hình ảnh`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`"${file.name}" vượt quá 5MB`);
          continue;
        }

        // Create preview URL
        const preview = URL.createObjectURL(file);

        // Add to temp images
        newTempImages.push({
          file,
          preview,
          isFeatured:
            tempImages.length === 0 &&
            i === 0 &&
            (!formData.images ||
              !formData.images.some((img) => img.isFeatured)),
        });
      }

      setTempImages([...tempImages, ...newTempImages]);
    } catch (error) {
      console.error("Error handling images:", error);
      toast.error("Không thể xử lý ảnh");
    } finally {
      setUploading(false);
    }
  };

  const removeTempImage = (index: number) => {
    //ham nay de xoa anh tam thoi
    if (index < 0 || index >= tempImages.length) return;

    const newTempImages = [...tempImages];

    // Release object URL
    URL.revokeObjectURL(newTempImages[index].preview);

    // Check if it was the featured image
    const wasFeatured = newTempImages[index].isFeatured;

    // Remove the image
    newTempImages.splice(index, 1);

    // If removed featured image and there are other images, set the first one as featured
    if (
      wasFeatured &&
      newTempImages.length > 0 &&
      (!formData.images || !formData.images.some((img) => img.isFeatured))
    ) {
      newTempImages[0].isFeatured = true;
    }

    setTempImages(newTempImages);
  };

  const removeExistingImage = async (index: number) => {
    if (!formData.images || index >= formData.images.length) return;

    try {
      setLoading(true);

      const imageToDelete = formData.images[index];

      // Kiểm tra id tồn tại và là số
      if (
        imageToDelete &&
        "id" in imageToDelete &&
        typeof imageToDelete.id === "number"
      ) {
        const response = await productService.deleteProductImage(
          productId,
          imageToDelete.id
        );

        if (response.success) {
          // Cập nhật state sau khi xóa thành công
          const newImages = [...formData.images];
          newImages.splice(index, 1);

          setFormData({
            ...formData,
            images: newImages,
          });

          toast.success("Xóa ảnh thành công");
        } else {
          toast.error("Không thể xóa ảnh");
        }
      } else {
        // Nếu không có ID, chỉ cần cập nhật state
        const newImages = [...formData.images];
        newImages.splice(index, 1);

        setFormData({
          ...formData,
          images: newImages,
        });
      }
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error("Có lỗi xảy ra khi xóa ảnh");
    } finally {
      setLoading(false);
    }
  };

  const setExistingImageAsThumbnail = async (index: number) => {
    if (!formData.images || index >= formData.images.length) return;

    try {
      setLoading(true);

      const imageToSetAsThumbnail = formData.images[index];

      // Kiểm tra id tồn tại và là số
      if (
        imageToSetAsThumbnail &&
        "id" in imageToSetAsThumbnail &&
        typeof imageToSetAsThumbnail.id === "number"
      ) {
        const response = await productService.setProductThumbnail(
          productId,
          imageToSetAsThumbnail.id
        );

        if (response.success) {
          // Cập nhật state sau khi đặt thumbnail thành công
          const newImages = formData.images.map((img, i) => ({
            ...img,
            isFeatured: i === index,
          }));

          setFormData({
            ...formData,
            images: newImages,
          });

          // Cập nhật ảnh tạm nếu cần
          if (tempImages.some((img) => img.isFeatured)) {
            setTempImages(
              tempImages.map((img) => ({
                ...img,
                isFeatured: false,
              }))
            );
          }

          toast.success("Đặt ảnh đại diện thành công");
        } else {
          toast.error("Không thể đặt ảnh làm ảnh đại diện");
        }
      } else {
        // Nếu không có ID, chỉ cập nhật state
        const newImages = formData.images.map((img, i) => ({
          ...img,
          isFeatured: i === index,
        }));

        setFormData({
          ...formData,
          images: newImages,
        });

        // Cập nhật ảnh tạm nếu cần
        if (tempImages.some((img) => img.isFeatured)) {
          setTempImages(
            tempImages.map((img) => ({
              ...img,
              isFeatured: false,
            }))
          );
        }
      }
    } catch (error) {
      console.error("Error setting thumbnail:", error);
      toast.error("Có lỗi xảy ra khi đặt ảnh đại diện");
    } finally {
      setLoading(false);
    }
  };

  const setTempImageAsThumbnail = (index: number) => {
    if (index < 0 || index >= tempImages.length) return;

    // Update temp images
    const newTempImages = tempImages.map((img, i) => ({
      ...img,
      isFeatured: i === index,
    }));

    setTempImages(newTempImages);

    // If there are existing images with featured, update those too
    if (formData.images && formData.images.some((img) => img.isFeatured)) {
      setFormData({
        ...formData,
        images: formData.images.map((img) => ({
          ...img,
          isFeatured: false,
        })),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin sản phẩm");
      return;
    }

    setLoading(true);

    try {
      // Nếu có ảnh mới được upload, sử dụng FormData
      if (tempImages.length > 0) {
        const productData = new FormData();

        // Cách mới: Gửi tất cả dữ liệu sản phẩm trong một trường JSON duy nhất
        const productInfo = {
          name: formData.name,
          categoryId: formData.categoryId,
          price: formData.price,
          description: formData.description || "",
          content: formData.content || "",
          discountPrice: formData.discountPrice,
          quantity: formData.quantity,
          unit: formData.unit || "",
          status: formData.status || "active",
          isFeatured: formData.isFeatured || false,
          metaTitle: formData.metaTitle || "",
          metaDescription: formData.metaDescription || "",
          sku: formData.sku || "",
          weight: formData.weight,
          origin: formData.origin || "",
        };

        // Thêm vào FormData dưới dạng một trường JSON duy nhất
        productData.append("productData", JSON.stringify(productInfo));

        // Thêm ảnh mới
        const featuredTempImage = tempImages.find((img) => img.isFeatured);
        if (featuredTempImage) {
          productData.append("thumbnail", featuredTempImage.file);
        }

        // Thêm các ảnh khác
        tempImages.forEach((img) => {
          if (!img.isFeatured) {
            productData.append("images", img.file);
          }
        });

        // Log để debug
        console.log("FormData entries:");
        for (const pair of productData.entries()) {
          // Chỉ log các trường không phải file để tránh log quá dài
          if (pair[0] === "productData") {
            console.log(pair[0] + ": " + pair[1]);
          } else {
            console.log(pair[0] + ": [File data]");
          }
        }

        // Gọi API cập nhật sản phẩm với FormData
        await productService.updateProduct(productId, productData);
      } else {
        // Nếu không có file mới, gọi API với dữ liệu JSON thông thường
        const productInfo = {
          name: formData.name,
          categoryId: formData.categoryId,
          price: formData.price,
          description: formData.description || "",
          content: formData.content || "",
          discountPrice: formData.discountPrice,
          quantity: formData.quantity,
          unit: formData.unit || "",
          status: formData.status || "active",
          isFeatured: formData.isFeatured || false,
          metaTitle: formData.metaTitle || "",
          metaDescription: formData.metaDescription || "",
          sku: formData.sku || "",
          weight: formData.weight,
          origin: formData.origin || "",
        };

        await productService.updateProduct(productId, productInfo);
      }

      toast.success("Cập nhật sản phẩm thành công!");
      router.push("/admin/products");
    } catch (error) {
      console.error("Error updating product:", error);

      // Hiển thị thông báo lỗi chi tiết hơn nếu có
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage =
          error.response.data?.error || "Có lỗi xảy ra khi cập nhật sản phẩm";
        toast.error(errorMessage);
      } else {
        toast.error("Có lỗi xảy ra khi cập nhật sản phẩm");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Chỉnh sửa sản phẩm</h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            <FiX className="inline mr-2" />
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:bg-amber-300"
          >
            {loading ? (
              <span className="inline-block animate-spin h-4 w-4 border-t-2 border-white rounded-full mr-2"></span>
            ) : (
              <FiSave className="inline mr-2" />
            )}
            Lưu thay đổi
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Thông tin cơ bản */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-700 border-b pb-2">
                Thông tin cơ bản
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập tên sản phẩm"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danh mục <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId || ""}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.categoryId ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.categoryId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả ngắn
                </label>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Nhập mô tả ngắn về sản phẩm"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nội dung chi tiết
                </label>
                <textarea
                  name="content"
                  value={formData.content || ""}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Nhập nội dung chi tiết về sản phẩm"
                ></textarea>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isFeatured"
                  name="isFeatured"
                  checked={formData.isFeatured || false}
                  onChange={(e) =>
                    setFormData({ ...formData, isFeatured: e.target.checked })
                  }
                  className="h-4 w-4 text-amber-600 border-gray-300 rounded"
                />
                <label
                  htmlFor="isFeatured"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Sản phẩm nổi bật (hiển thị ở trang chủ)
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  name="status"
                  value={formData.status || "active"}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="active">Đang bán</option>
                  <option value="inactive">Ngừng bán</option>
                </select>
              </div>
            </div>

            {/* Thông tin giá & kho */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-700 border-b pb-2">
                Giá & Kho hàng
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã sản phẩm (SKU) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.sku ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập mã sản phẩm"
                />
                {errors.sku && (
                  <p className="mt-1 text-sm text-red-500">{errors.sku}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá gốc <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="price"
                    value={formData.price || ""}
                    onChange={handleChange}
                    min="0"
                    step="1000"
                    className={`w-full px-3 py-2 pl-8 border rounded-md ${
                      errors.price ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Nhập giá gốc"
                  />
                  <span className="absolute left-3 top-2 text-gray-900">đ</span>
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-500">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá khuyến mãi
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="discountPrice"
                    value={formData.discountPrice || ""}
                    onChange={handleChange}
                    min="0"
                    step="1000"
                    className={`w-full px-3 py-2 pl-8 border rounded-md ${
                      errors.discountPrice
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Nhập giá khuyến mãi (nếu có)"
                  />
                  <span className="absolute left-3 top-2 text-gray-900">đ</span>
                </div>
                {errors.discountPrice && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.discountPrice}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số lượng
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity || 0}
                    onChange={handleChange}
                    min="0"
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.quantity ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Nhập số lượng"
                  />
                  {errors.quantity && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.quantity}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Đơn vị tính
                  </label>
                  <input
                    type="text"
                    name="unit"
                    value={formData.unit || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Hộp, chai, lọ..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trọng lượng (gram)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight || ""}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Nhập trọng lượng"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Xuất xứ
                  </label>
                  <input
                    type="text"
                    name="origin"
                    value={formData.origin || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Ví dụ: Việt Nam"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề SEO
                </label>
                <input
                  type="text"
                  name="metaTitle"
                  value={formData.metaTitle || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Tiêu đề hiển thị trên Google"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả SEO
                </label>
                <textarea
                  name="metaDescription"
                  value={formData.metaDescription || ""}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Mô tả hiển thị trên Google"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Hình ảnh sản phẩm */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-700 border-b pb-2 mb-4">
              Hình ảnh sản phẩm
            </h2>

            <div className="mb-4">
              <label className="inline-block px-4 py-2 border border-gray-300 rounded-md bg-white cursor-pointer hover:bg-gray-50">
                <FiUpload className="inline-block mr-2" />
                Chọn ảnh sản phẩm
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
              <span className="ml-3 text-sm text-gray-900">
                Bạn có thể chọn nhiều ảnh (tối đa 5MB/ảnh)
              </span>
            </div>

            {uploading && (
              <div className="mb-4 flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-l-2 border-amber-500 mr-2"></div>
                <span className="text-sm text-gray-900">Đang xử lý ảnh...</span>
              </div>
            )}

            {/* Hiển thị ảnh hiện tại từ server */}
            {formData.images && formData.images.length > 0 && (
              <>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Ảnh hiện tại
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                  {formData.images.map((img, index) => (
                    <div
                      key={`existing-${index}`}
                      className="relative group border rounded-md p-2"
                    >
                      <div className="relative h-32 w-full">
                        <Image
                          src={img.url}
                          alt={img.altText || `Ảnh sản phẩm ${index + 1}`}
                          fill
                          sizes="(max-width: 768px) 50vw, 20vw"
                          className="object-contain"
                        />
                      </div>

                      <div className="mt-2 flex justify-between items-center">
                        <button
                          type="button"
                          onClick={() => setExistingImageAsThumbnail(index)}
                          className={`px-2 py-1 text-xs rounded ${
                            img.isFeatured
                              ? "bg-amber-100 text-amber-800"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                        >
                          {img.isFeatured ? "Ảnh chính" : "Đặt làm ảnh chính"}
                        </button>

                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Hiển thị ảnh tạm thời đã upload */}
            {tempImages.length > 0 && (
              <>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Ảnh mới thêm
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {tempImages.map((img, index) => (
                    <div
                      key={`temp-${index}`}
                      className="relative group border rounded-md p-2"
                    >
                      <div className="relative h-32 w-full">
                        <Image
                          src={img.preview}
                          alt={`Ảnh sản phẩm mới ${index + 1}`}
                          fill
                          sizes="(max-width: 768px) 50vw, 20vw"
                          className="object-contain"
                        />
                      </div>

                      <div className="mt-2 flex justify-between items-center">
                        <button
                          type="button"
                          onClick={() => setTempImageAsThumbnail(index)}
                          className={`px-2 py-1 text-xs rounded ${
                            img.isFeatured
                              ? "bg-amber-100 text-amber-800"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                        >
                          {img.isFeatured ? "Ảnh chính" : "Đặt làm ảnh chính"}
                        </button>

                        <button
                          type="button"
                          onClick={() => removeTempImage(index)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
