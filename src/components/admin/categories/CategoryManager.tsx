"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Category } from "@/services/categoryService";
import categoryService from "@/services/categoryService";
import { SortableCategory } from "@/components/admin/categories/SortableCategory";
import { toast } from "react-toastify";

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Không thể tải danh sách danh mục");
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCategories((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const saveOrder = async () => {
    setSaving(true);
    try {
      // Tạo dữ liệu để gửi lên API
      const reorderData = categories.map((category, index) => ({
        categoryId: category.id,
        newOrder: index,
      }));

      // Sử dụng endpoint REORDER mới
      await categoryService.reorderCategories(reorderData);
      toast.success("Cập nhật thứ tự danh mục thành công");
    } catch (error) {
      console.error("Error saving category order:", error);
      toast.error("Không thể cập nhật thứ tự danh mục");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Quản lý danh mục</h2>
        <div className="space-x-2">
          <button
            onClick={fetchCategories}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
            disabled={saving}
          >
            Làm mới
          </button>
          <button
            onClick={saveOrder}
            className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition flex items-center"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full"></span>
                Đang lưu...
              </>
            ) : (
              "Lưu thứ tự"
            )}
          </button>
        </div>
      </div>

      <p className="text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 mb-4">
        Kéo và thả để sắp xếp thứ tự danh mục hiển thị.
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={categories.map((cat) => ({ id: cat.id }))}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {categories.map((category) => (
              <SortableCategory key={category.id} category={category} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
