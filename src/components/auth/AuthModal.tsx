"use client";

import React, { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useAuth } from "@/contexts/authContext";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { FiX, FiMail, FiLock, FiUser, FiEye, FiEyeOff } from "react-icons/fi";
import Image from "next/image";
import axios from "axios";
import * as authService from "@/services/authService";

type AuthType = "login" | "register" | "forgot-password";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: AuthType;
  redirectPath?: string;
}

export default function AuthModal({
  isOpen,
  onClose,
  initialView = "login",
}: AuthModalProps) {
  const {
    login,
    register,
    isAuthenticated,
    error: authError,
    clearError,
  } = useAuth();
  const [currentView, setCurrentView] = useState<AuthType>(initialView);
  const t = useTranslations("user");
  const tc = useTranslations("common");

  // Form states
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [error, setError] = useState<string | null>(null);

  // Update current view when initialView changes
  useEffect(() => {
    if (initialView) {
      setCurrentView(initialView);
    }
  }, [initialView]);

  // Reset form when changing views
  useEffect(() => {
    clearError();
    setValidationErrors({});
    setEmail("");
    setPassword("");
    setFullName("");
    setConfirmPassword("");
    setRememberMe(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [currentView, clearError]);

  // Đóng modal nếu đã đăng nhập thành công
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      toast.success(
        currentView === "login" ? t("loginSuccess") : t("registerSuccess")
      );
      onClose();
    }
  }, [isAuthenticated, isOpen, onClose, currentView, t]);

  // Log for debugging
  useEffect(() => {
    console.log("AuthModal rendered with props:", {
      isOpen,
      initialView,
      currentView,
    });
  }, [isOpen, initialView, currentView]);

  // Form validation
  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    // Only validate name for register form
    if (currentView === "register") {
      // Validate name
      if (fullName.trim().length < 2) {
        errors.fullName = t("validation.nameRequired");
      }

      // Validate confirmation password
      if (password !== confirmPassword) {
        errors.confirmPassword = t("validation.passwordMismatch");
      }

      // Validate password strength
      if (password.length < 6) {
        errors.password = t("validation.passwordMinLength");
      } else if (!/[A-Z]/.test(password)) {
        errors.password = t("validation.passwordUppercase");
      } else if (!/[0-9]/.test(password)) {
        errors.password = t("validation.passwordNumber");
      }
    }

    // Validate email format for all forms
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = t("validation.emailInvalid");
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      console.log("Attempting login with:", { email, password, rememberMe });
      await login(email, password, rememberMe);
    } catch (err) {
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      console.log("Attempting registration with:", {
        fullName,
        email,
        password,
      });
      await register(fullName, email, password);
    } catch (err) {
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Gọi API để yêu cầu đặt lại mật khẩu
      await authService.forgotPassword({ email });

      // Hiển thị thông báo thành công
      toast.success(t("passwordResetEmailSent"));

      // Chuyển về trang đăng nhập sau thông báo thành công
      setTimeout(() => {
        setCurrentView("login");
      }, 2000);
    } catch (err: unknown) {
      console.error("Password reset error:", err);

      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            t("somethingWentWrong")
        );
      } else {
        setError(t("somethingWentWrong"));
      }
    } finally {
      setLoading(false);
    }
  };

  // Title cho dialog dựa theo view
  const getTitleByView = () => {
    switch (currentView) {
      case "login":
        return t("login");
      case "register":
        return t("registerAccount");
      case "forgot-password":
        return t("forgotPassword");
    }
  };

  // Content cho từng view
  const renderContent = () => {
    switch (currentView) {
      case "login":
        return (
          <form className="mt-6 space-y-6" onSubmit={handleLogin}>
            {authError && (
              <div className="p-3 bg-red-50/90 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm border border-red-200 dark:border-red-800 backdrop-blur-sm">
                {authError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email-address"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {t("email")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                      validationErrors.email
                        ? "border-red-300 dark:border-red-700"
                        : "border-gray-300 dark:border-gray-600"
                    } rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 
                      dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-amber-500 
                      focus:border-amber-500 sm:text-sm transition-colors backdrop-blur-sm bg-white/80 dark:bg-gray-700/90`}
                    placeholder={t("email")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {validationErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {t("password")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className={`appearance-none block w-full pl-10 pr-10 py-2 border ${
                      validationErrors.password
                        ? "border-red-300 dark:border-red-700"
                        : "border-gray-300 dark:border-gray-600"
                    } rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 
                      dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-amber-500 
                      focus:border-amber-500 sm:text-sm transition-colors backdrop-blur-sm bg-white/80 dark:bg-gray-700/90`}
                    placeholder={t("password")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 focus:outline-none"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <FiEyeOff className="h-5 w-5" />
                      ) : (
                        <FiEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                {validationErrors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {validationErrors.password}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 dark:border-gray-600 rounded"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                >
                  {t("rememberMe")}
                </label>
              </div>

              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => setCurrentView("forgot-password")}
                  className="font-medium text-amber-600 hover:text-amber-500 dark:text-amber-500 dark:hover:text-amber-400 transition-colors"
                >
                  {t("forgotPassword")}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent 
                  text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                  shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {t("loginProcessing")}
                  </div>
                ) : (
                  t("login")
                )}
              </button>
            </div>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setCurrentView("register")}
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
              >
                {t("dontHaveAccount")}
              </button>
            </div>
          </form>
        );

      case "register":
        return (
          <form className="mt-6 space-y-6" onSubmit={handleRegister}>
            {authError && (
              <div className="p-3 bg-red-50/90 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm border border-red-200 dark:border-red-800 backdrop-blur-sm">
                {authError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {t("fullName")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                      validationErrors.fullName
                        ? "border-red-300 dark:border-red-700"
                        : "border-gray-300 dark:border-gray-600"
                    } rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 
                      dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-amber-500 
                      focus:border-amber-500 sm:text-sm transition-colors backdrop-blur-sm bg-white/80 dark:bg-gray-700/90`}
                    placeholder={t("fullName")}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                {validationErrors.fullName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {validationErrors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email-address"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {t("email")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                      validationErrors.email
                        ? "border-red-300 dark:border-red-700"
                        : "border-gray-300 dark:border-gray-600"
                    } rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 
                      dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-amber-500 
                      focus:border-amber-500 sm:text-sm transition-colors backdrop-blur-sm bg-white/80 dark:bg-gray-700/90`}
                    placeholder={t("email")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {validationErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {t("password")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className={`appearance-none block w-full pl-10 pr-10 py-2 border ${
                      validationErrors.password
                        ? "border-red-300 dark:border-red-700"
                        : "border-gray-300 dark:border-gray-600"
                    } rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 
                      dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-amber-500 
                      focus:border-amber-500 sm:text-sm transition-colors backdrop-blur-sm bg-white/80 dark:bg-gray-700/90`}
                    placeholder={t("password")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 focus:outline-none"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <FiEyeOff className="h-5 w-5" />
                      ) : (
                        <FiEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                {validationErrors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {validationErrors.password}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {t("confirmPassword")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    className={`appearance-none block w-full pl-10 pr-10 py-2 border ${
                      validationErrors.confirmPassword
                        ? "border-red-300 dark:border-red-700"
                        : "border-gray-300 dark:border-gray-600"
                    } rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 
                      dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-amber-500 
                      focus:border-amber-500 sm:text-sm transition-colors backdrop-blur-sm bg-white/80 dark:bg-gray-700/90`}
                    placeholder={t("confirmPassword")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 focus:outline-none"
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <FiEyeOff className="h-5 w-5" />
                      ) : (
                        <FiEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                {validationErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {validationErrors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent 
                  text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                  shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {t("loginProcessing")}
                  </>
                ) : (
                  t("register")
                )}
              </button>
            </div>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setCurrentView("login")}
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
              >
                {t("alreadyHaveAccount")}
              </button>
            </div>
          </form>
        );

      case "forgot-password":
        return (
          <form className="mt-6 space-y-6" onSubmit={handleForgotPassword}>
            {error && (
              <div className="p-3 bg-red-50/90 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm border border-red-200 dark:border-red-800 backdrop-blur-sm">
                {error}
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {t("forgotPasswordInstructions")}
              </p>
              <label
                htmlFor="email-reset"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {t("email")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="email-reset"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 
                    dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 
                    dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-amber-500 
                    focus:border-amber-500 sm:text-sm transition-colors backdrop-blur-sm bg-white/80 dark:bg-gray-700/90"
                  placeholder={t("email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {validationErrors.email}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent 
                  text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                  shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {t("processing")}
                  </div>
                ) : (
                  t("resetPassword")
                )}
              </button>
            </div>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setCurrentView("login")}
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
              >
                {t("backToLogin")}
              </button>
            </div>
          </form>
        );
    }
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={onClose}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm dark:bg-opacity-60" />
          </Transition.Child>

          {/* Trick để căn giữa modal */}
          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95 translate-y-4"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 scale-95 translate-y-4"
          >
            <div
              className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform
            bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700
            backdrop-blur-sm bg-white/90 dark:bg-gray-800/90"
            >
              <div className="absolute top-3 right-3">
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 
                    focus:outline-none bg-white/50 dark:bg-gray-700/50 rounded-full p-1.5
                    hover:bg-white dark:hover:bg-gray-700 transition-colors"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-col items-center mb-6 pt-2">
                <div className="w-16 h-16 mb-4 relative">
                  <Image
                    src="/images/logo.jpg"
                    alt={tc("brandName")}
                    width={64}
                    height={64}
                    className="object-contain rounded-full"
                  />
                </div>
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-bold text-gray-900 dark:text-white text-center"
                >
                  {getTitleByView()}
                </Dialog.Title>
                <div className="w-16 h-1 bg-amber-500 rounded-full mt-2"></div>
              </div>

              {renderContent()}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
