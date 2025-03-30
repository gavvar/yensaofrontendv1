"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/authContext";
import { toast } from "react-toastify";
import {
  FiShoppingCart,
  FiUser,
  FiSearch,
  FiMenu,
  FiX,
  FiChevronDown,
  FiLogOut,
  FiPackage,
  FiInfo,
  FiHome,
  FiMail,
  FiHeart,
} from "react-icons/fi";
import categoryService from "@/services/categoryService";
import { Category } from "@/services/categoryService";
import { useCart } from "@/contexts/CartContext";
import MiniCart from "./MiniCart";

// Thay đổi cách lấy cart count
export default function Navbar() {
  const { user, logout } = useAuth();
  const { getCartCount } = useCart(); // Chỉ lấy getCartCount

  // Tạo state isCartOpen ở cấp component
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Lấy cart count từ context
  const cartCount = getCartCount();

  useEffect(() => {
    // Add scroll listener for navbar styling
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Fetch categories
    const fetchCategories = async () => {
      try {
        const rootCategories = await categoryService.getRootCategories();
        setCategories(rootCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [user]);

  // Redirect to admin dashboard if admin
  useEffect(() => {
    if (user?.role === "admin") {
      router.push("/admin");
    }
  }, [user, router]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    console.log("Cart open state changed:", isCartOpen);
  }, [isCartOpen]);

  const handleLogout = () => {
    logout();
    toast.success("Đăng xuất thành công!");
    router.push("/login");
    setIsMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navLinkClasses =
    "px-3 py-2 hover:text-amber-500 transition-colors font-medium";

  // Nếu user là admin, không hiển thị navbar này
  if (user?.role === "admin") {
    return null;
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition duration-300 ${
          isScrolled ? "bg-white shadow-md py-2" : "bg-transparent py-4"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full ${
                  isScrolled ? "bg-amber-100" : "bg-white/20"
                } flex items-center justify-center mr-3 overflow-hidden`}
              >
                <Image
                  src="/images/logo.jpg"
                  alt="Yến Sào Thủ Đức"
                  width={40}
                  height={40}
                  className="object-cover w-full h-full rounded-full scale-110"
                />
              </div>
              <span
                className={`text-xl font-bold ${
                  isScrolled ? "text-amber-600" : "text-white"
                }`}
              >
                Yến Sào Thủ Đức
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                href="/"
                className={`${navLinkClasses} ${
                  isScrolled ? "text-gray-800" : "text-white"
                }`}
              >
                <span className="flex items-center">
                  <FiHome className="mr-1" size={16} />
                  Trang chủ
                </span>
              </Link>

              <div className="relative group">
                <button
                  className={`${navLinkClasses} flex items-center ${
                    isScrolled ? "text-gray-800" : "text-white"
                  }`}
                >
                  <FiPackage className="mr-1" size={16} />
                  Sản phẩm <FiChevronDown className="ml-1" size={14} />
                </button>
                <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <Link
                    href="/product"
                    className="block px-4 py-2 text-gray-800 hover:bg-amber-50 hover:text-amber-600"
                  >
                    Tất cả sản phẩm
                  </Link>
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/categories/${category.slug}`}
                      className="block px-4 py-2 text-gray-800 hover:bg-amber-50 hover:text-amber-600"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                href="/about"
                className={`${navLinkClasses} ${
                  isScrolled ? "text-gray-800" : "text-white"
                }`}
              >
                <span className="flex items-center">
                  <FiInfo className="mr-1" size={16} />
                  Giới thiệu
                </span>
              </Link>

              <Link
                href="/contact"
                className={`${navLinkClasses} ${
                  isScrolled ? "text-gray-800" : "text-white"
                }`}
              >
                <span className="flex items-center">
                  <FiMail className="mr-1" size={16} />
                  Liên hệ
                </span>
              </Link>
            </nav>

            {/* Desktop Right Icons */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`p-2 rounded-full hover:bg-white/20 ${
                  isScrolled ? "text-gray-800" : "text-white"
                } transition-colors`}
                aria-label="Tìm kiếm"
              >
                <FiSearch size={20} />
              </button>

              <Link
                href="/favorites"
                className={`p-2 rounded-full hover:bg-white/20 ${
                  isScrolled ? "text-gray-800" : "text-white"
                } transition-colors`}
                aria-label="Sản phẩm yêu thích"
              >
                <FiHeart size={20} />
              </Link>

              <button
                onClick={(e) => {
                  e.stopPropagation(); // Ngăn event bubbling
                  console.log(
                    "Cart button clicked, setting isCartOpen to true"
                  );
                  setIsCartOpen(true);
                }}
                className={`p-2 rounded-full hover:bg-white/20 relative ${
                  isScrolled ? "text-gray-800" : "text-white"
                } transition-colors`}
                aria-label="Giỏ hàng"
              >
                <FiShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">
                    {cartCount}
                  </span>
                )}
              </button>

              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={`flex items-center p-1 rounded-full ${
                      isScrolled
                        ? "text-gray-800 hover:bg-gray-100"
                        : "text-white hover:bg-white/20"
                    } transition-colors`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-1 ${
                        isScrolled
                          ? "bg-gradient-to-tr from-amber-600 to-yellow-400"
                          : "bg-white/30"
                      }`}
                    >
                      {user.email ? user.email.charAt(0).toUpperCase() : "U"}
                    </div>
                    <FiChevronDown
                      className={`transition-transform duration-300 ${
                        isUserMenuOpen ? "rotate-180" : ""
                      }`}
                      size={16}
                    />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-10 transition-all duration-300 animate-fadeIn">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user.email}
                        </p>
                        <p className="text-xs text-amber-600">Khách hàng</p>
                      </div>

                      <Link
                        href="/account"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                      >
                        <FiUser className="mr-3" size={16} />
                        Tài khoản của tôi
                      </Link>

                      <Link
                        href="/orders"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                      >
                        <FiPackage className="mr-3" size={16} />
                        Đơn hàng của tôi
                      </Link>

                      <Link
                        href="/favorites"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                      >
                        <FiHeart className="mr-3" size={16} />
                        Sản phẩm yêu thích
                      </Link>

                      <div className="border-t my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                      >
                        <FiLogOut className="mr-3" size={16} />
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className={`px-4 py-2 rounded-md flex items-center ${
                    isScrolled
                      ? "bg-amber-600 text-white hover:bg-amber-700"
                      : "bg-white text-gray-900 hover:bg-gray-100"
                  } transition-colors`}
                >
                  <FiUser className="mr-2" size={16} />
                  Đăng nhập
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center space-x-3">
              <Link
                href="/cart"
                className={`p-2 rounded-full hover:bg-white/20 relative ${
                  isScrolled ? "text-gray-800" : "text-white"
                } transition-colors`}
                aria-label="Giỏ hàng"
              >
                <FiShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">
                    {cartCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 rounded-full hover:bg-white/20 ${
                  isScrolled ? "text-gray-800" : "text-white"
                } transition-colors`}
                aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}
              >
                {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>

          {/* Search Bar (Desktop) */}
          {isSearchOpen && (
            <div className="hidden md:block absolute left-0 right-0 mt-2 px-4 pb-4">
              <form onSubmit={handleSearch} className="max-w-lg mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    className="w-full bg-white border rounded-full pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="absolute right-0 top-0 h-full px-3 text-amber-600"
                  >
                    <FiSearch size={18} />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t shadow-lg animate-fadeIn">
            <div className="container mx-auto px-4 py-2">
              {/* Search Form */}
              <form onSubmit={handleSearch} className="mb-4 pt-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    className="w-full bg-gray-100 border rounded-full pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="absolute right-0 top-0 h-full px-3 text-amber-600"
                  >
                    <FiSearch size={18} />
                  </button>
                </div>
              </form>

              {/* Navigation Links */}
              <nav className="space-y-1 pb-4">
                <Link
                  href="/"
                  className="flex items-center px-4 py-2 hover:bg-amber-50 hover:text-amber-600 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiHome size={18} className="mr-3 text-amber-500" />
                  Trang chủ
                </Link>
                <Link
                  href="/products"
                  className="flex items-center px-4 py-2 hover:bg-amber-50 hover:text-amber-600 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiPackage size={18} className="mr-3 text-amber-500" />
                  Sản phẩm
                </Link>
                <Link
                  href="/about"
                  className="flex items-center px-4 py-2 hover:bg-amber-50 hover:text-amber-600 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiInfo size={18} className="mr-3 text-amber-500" />
                  Giới thiệu
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center px-4 py-2 hover:bg-amber-50 hover:text-amber-600 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiMail size={18} className="mr-3 text-amber-500" />
                  Liên hệ
                </Link>

                {/* Categories */}
                <div className="pl-4 border-t pt-2 mt-2">
                  <p className="text-sm text-gray-500 mb-1">
                    Danh mục sản phẩm:
                  </p>
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/categories/${category.slug}`}
                      className="block px-4 py-2 ml-4 hover:bg-amber-50 hover:text-amber-600 rounded-md text-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>

                {/* Auth */}
                <div className="border-t pt-2 mt-2">
                  {user ? (
                    <>
                      <div className="px-4 py-2 text-sm">
                        <p className="font-semibold text-gray-900">
                          {user.email}
                        </p>
                        <p className="text-xs text-amber-600">Khách hàng</p>
                      </div>
                      <Link
                        href="/account"
                        className="flex items-center px-4 py-2 hover:bg-amber-50 hover:text-amber-600 rounded-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FiUser size={18} className="mr-3 text-amber-500" />
                        Tài khoản của tôi
                      </Link>
                      <Link
                        href="/orders"
                        className="flex items-center px-4 py-2 hover:bg-amber-50 hover:text-amber-600 rounded-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FiPackage size={18} className="mr-3 text-amber-500" />
                        Đơn hàng của tôi
                      </Link>
                      <Link
                        href="/favorites"
                        className="flex items-center px-4 py-2 hover:bg-amber-50 hover:text-amber-600 rounded-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FiHeart size={18} className="mr-3 text-amber-500" />
                        Sản phẩm yêu thích
                      </Link>
                      <button
                        className="flex items-center w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-md"
                        onClick={handleLogout}
                      >
                        <FiLogOut size={18} className="mr-3" />
                        Đăng xuất
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="flex items-center px-4 py-2 hover:bg-amber-50 hover:text-amber-600 rounded-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FiUser size={18} className="mr-3 text-amber-500" />
                        Đăng nhập
                      </Link>
                      <Link
                        href="/register"
                        className="flex items-center px-4 py-2 hover:bg-amber-50 hover:text-amber-600 rounded-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FiUser size={18} className="mr-3 text-amber-500" />
                        Đăng ký
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Spacer to account for fixed header */}
      <div className={`${isScrolled ? "h-16" : "h-20"}`}></div>

      {/* Add Mini Cart */}
      <MiniCart
        isOpen={isCartOpen}
        onClose={() => {
          console.log("Closing MiniCart");
          setIsCartOpen(false);
        }}
      />
    </>
  );
}
