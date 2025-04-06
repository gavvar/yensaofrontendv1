"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
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
import type { Category } from "@/services/categoryService";
import { useCart } from "@/contexts/CartContext";
import MiniCart from "./MiniCart";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Locale } from "@/i18n";

/**
 * Navigation component for the application.
 * Handles responsive navigation, user authentication, shopping cart,
 * dark mode toggle, and language switching.
 */
export default function Navbar() {
  // Auth and cart context
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();

  // UI state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Refs
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Navigation hooks
  const router = useRouter();

  // Internationalization
  const params = useParams();
  const locale = (
    typeof params?.locale === "string" ? params.locale : "vi"
  ) as Locale;
  const t = useTranslations("common");
  const tNav = useTranslations("navigation");
  const tUser = useTranslations("user");

  // Derived values
  const cartCount = getCartCount();

  // Helper function for localized URLs
  const getLocalizedUrl = useCallback(
    (path: string): string => {
      const normalizedPath = path.startsWith("/") ? path : `/${path}`;
      return `/${locale}${normalizedPath}`;
    },
    [locale]
  );

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const rootCategories = await categoryService.getRootCategories();
        setCategories(rootCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Redirect admin users
  useEffect(() => {
    if (user?.role === "admin") {
      router.push(getLocalizedUrl("/admin"));
    }
  }, [user, router, getLocalizedUrl]);

  // Handle click outside user menu
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

  // Event handlers
  const handleLogout = () => {
    logout();
    toast.success(tUser("logoutSuccess"));
    router.push(getLocalizedUrl("/login"));
    setIsMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        getLocalizedUrl(`/products?search=${encodeURIComponent(searchQuery)}`)
      );
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  // Do not render navbar for admin users
  if (user?.role === "admin") {
    return null;
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 ${
          isScrolled ? "shadow-md" : "shadow-sm"
        } transition-shadow duration-300`}
      >
        <div className="container mx-auto px-4">
          {/* Top Navbar - Logo & Main Nav */}
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href={getLocalizedUrl("/")} className="flex items-center">
              <Image
                src="/images/logo.jpg"
                alt={t("brandName")}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover mr-3"
              />
              <span className="text-xl font-bold text-amber-600 dark:text-amber-500">
                {t("brandName")}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href={getLocalizedUrl("/")}
                className="flex items-center text-gray-700 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400 font-medium"
              >
                <FiHome className="mr-1" size={16} />
                {tNav("home")}
              </Link>

              <div className="relative group">
                <button className="flex items-center text-gray-700 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400 font-medium">
                  <FiPackage className="mr-1" size={16} />
                  {tNav("products")}
                  <FiChevronDown className="ml-1" size={14} />
                </button>
                <div className="absolute left-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <Link
                    href={getLocalizedUrl("/products")}
                    className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-gray-700 hover:text-amber-600 dark:hover:text-amber-400"
                  >
                    {tNav("allProducts")}
                  </Link>
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={getLocalizedUrl(`/categories/${category.slug}`)}
                      className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-gray-700 hover:text-amber-600 dark:hover:text-amber-400"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                href={getLocalizedUrl("/about")}
                className="flex items-center text-gray-700 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400 font-medium"
              >
                <FiInfo className="mr-1" size={16} />
                {tNav("about")}
              </Link>

              <Link
                href={getLocalizedUrl("/contact")}
                className="flex items-center text-gray-700 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400 font-medium"
              >
                <FiMail className="mr-1" size={16} />
                {tNav("contact")}
              </Link>
            </nav>

            {/* Desktop Right Icons */}
            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label={t("search")}
              >
                <FiSearch size={20} />
              </button>

              <DarkModeToggle />

              {/* Language Switcher */}
              <LanguageSwitcher />

              <Link
                href={getLocalizedUrl("/favorites")}
                className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label={tUser("favorites")}
              >
                <FiHeart size={20} />
              </Link>

              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 relative"
                aria-label={t("cart")}
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
                    className="flex items-center p-1 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-white font-bold mr-1">
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
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 z-10 border border-gray-100 dark:border-gray-700">
                      <div className="px-4 py-2 border-b dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-200 truncate">
                          {user.email}
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-500">
                          {tUser("customer")}
                        </p>
                      </div>

                      <Link
                        href={getLocalizedUrl("/account")}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-gray-700 hover:text-amber-600 dark:hover:text-amber-400"
                      >
                        <FiUser className="mr-3" size={16} />
                        {tUser("myAccount")}
                      </Link>

                      <Link
                        href={getLocalizedUrl("/account/orders")}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-gray-700 hover:text-amber-600 dark:hover:text-amber-400"
                      >
                        <FiPackage className="mr-3" size={16} />
                        {tUser("myOrders")}
                      </Link>

                      <Link
                        href={getLocalizedUrl("/favorites")}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-gray-700 hover:text-amber-600 dark:hover:text-amber-400"
                      >
                        <FiHeart className="mr-3" size={16} />
                        {tUser("favorites")}
                      </Link>

                      <div className="border-t dark:border-gray-700 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <FiLogOut className="mr-3" size={16} />
                        {tUser("logout")}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={getLocalizedUrl("/login")}
                  className="flex items-center px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-700 text-white transition-colors"
                >
                  <FiUser className="mr-2" size={16} />
                  {tUser("login")}
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center space-x-2">
              <DarkModeToggle />

              <LanguageSwitcher />

              <Link
                href={getLocalizedUrl("/cart")}
                className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 relative"
                aria-label={t("cart")}
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
                className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label={isMenuOpen ? tNav("closeMenu") : tNav("openMenu")}
              >
                {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>

          {/* Search Bar (Desktop) */}
          {isSearchOpen && (
            <div className="hidden md:block py-3 border-t dark:border-gray-800">
              <form onSubmit={handleSearch} className="max-w-lg mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t("searchPlaceholder")}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="absolute right-0 top-0 h-full px-3 text-amber-600 dark:text-amber-400"
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
          <div className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-800 shadow-lg">
            <div className="container mx-auto px-4 py-2">
              {/* Search Form */}
              <form onSubmit={handleSearch} className="mb-4 pt-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t("searchPlaceholder")}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="absolute right-0 top-0 h-full px-3 text-amber-600 dark:text-amber-400"
                  >
                    <FiSearch size={18} />
                  </button>
                </div>
              </form>

              {/* Navigation Links */}
              <nav className="space-y-1 pb-4">
                <Link
                  href={getLocalizedUrl("/")}
                  className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-gray-800 hover:text-amber-600 dark:hover:text-amber-400 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiHome size={18} className="mr-3 text-amber-500" />
                  {tNav("home")}
                </Link>
                <Link
                  href={getLocalizedUrl("/products")}
                  className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-gray-800 hover:text-amber-600 dark:hover:text-amber-400 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiPackage size={18} className="mr-3 text-amber-500" />
                  {tNav("products")}
                </Link>
                <Link
                  href={getLocalizedUrl("/about")}
                  className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-gray-800 hover:text-amber-600 dark:hover:text-amber-400 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiInfo size={18} className="mr-3 text-amber-500" />
                  {tNav("about")}
                </Link>
                <Link
                  href={getLocalizedUrl("/contact")}
                  className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-gray-800 hover:text-amber-600 dark:hover:text-amber-400 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiMail size={18} className="mr-3 text-amber-500" />
                  {tNav("contact")}
                </Link>

                {/* Categories */}
                <div className="pl-4 border-t dark:border-gray-800 pt-2 mt-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                    {tNav("productCategories")}:
                  </p>
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={getLocalizedUrl(`/categories/${category.slug}`)}
                      className="block px-4 py-2 ml-4 text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-gray-800 hover:text-amber-600 dark:hover:text-amber-400 rounded-md text-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>

                {/* Auth */}
                <div className="border-t dark:border-gray-800 pt-2 mt-2">
                  {user ? (
                    <>
                      <div className="px-4 py-2 text-sm">
                        <p className="font-semibold text-gray-700 dark:text-gray-200">
                          {user.email}
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-500">
                          {tUser("customer")}
                        </p>
                      </div>
                      <Link
                        href={getLocalizedUrl("/account")}
                        className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-gray-800 hover:text-amber-600 dark:hover:text-amber-400 rounded-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FiUser size={18} className="mr-3 text-amber-500" />
                        {tUser("myAccount")}
                      </Link>
                      <Link
                        href={getLocalizedUrl("/account/orders")}
                        className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-gray-800 hover:text-amber-600 dark:hover:text-amber-400 rounded-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FiPackage size={18} className="mr-3 text-amber-500" />
                        {tUser("myOrders")}
                      </Link>
                      <Link
                        href={getLocalizedUrl("/favorites")}
                        className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-gray-800 hover:text-amber-600 dark:hover:text-amber-400 rounded-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FiHeart size={18} className="mr-3 text-amber-500" />
                        {tUser("favorites")}
                      </Link>
                      <button
                        className="flex items-center w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                        onClick={handleLogout}
                      >
                        <FiLogOut size={18} className="mr-3" />
                        {tUser("logout")}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href={getLocalizedUrl("/login")}
                        className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-gray-800 hover:text-amber-600 dark:hover:text-amber-400 rounded-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FiUser size={18} className="mr-3 text-amber-500" />
                        {tUser("login")}
                      </Link>
                      <Link
                        href={getLocalizedUrl("/register")}
                        className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-gray-800 hover:text-amber-600 dark:hover:text-amber-400 rounded-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FiUser size={18} className="mr-3 text-amber-500" />
                        {tUser("register")}
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Spacer có cùng chiều cao với Navbar */}
      <div className="h-16 w-full flex-shrink-0" aria-hidden="true"></div>

      {/* MiniCart */}
      <MiniCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
