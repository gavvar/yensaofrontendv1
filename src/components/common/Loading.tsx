export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-amber-200 border-t-amber-600 animate-spin"></div>
        <p className="mt-4 text-amber-600 font-medium">Đang tải...</p>
      </div>
    </div>
  );
}
