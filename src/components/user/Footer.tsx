import Link from "next/link";
import { useState } from "react";
import {
  FiFacebook,
  FiInstagram,
  FiYoutube,
  FiMapPin,
  FiPhone,
  FiMail,
} from "react-icons/fi";
import { toast } from "react-toastify";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this to your API
    toast.success("Đã đăng ký nhận tin thành công!");
    setEmail("");
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold mb-4">Yến Sào VN</h3>
            <p className="text-gray-400 mb-4">
              Chuyên cung cấp các sản phẩm yến sào tự nhiên, nguyên chất, đảm
              bảo chất lượng.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FiFacebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FiInstagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FiYoutube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/products"
                  className="text-gray-400 hover:text-white transition"
                >
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-white transition"
                >
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-gray-400 hover:text-white transition"
                >
                  Bài viết
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-gray-400 hover:text-white transition"
                >
                  Câu hỏi thường gặp
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Liên hệ</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FiMapPin className="mt-1 mr-3 text-gray-400" />
                <span className="text-gray-400">
                  123 Đường Nguyễn Huệ, Quận 1, TP.HCM
                </span>
              </li>
              <li className="flex items-center">
                <FiPhone className="mr-3 text-gray-400" />
                <a
                  href="tel:+84123456789"
                  className="text-gray-400 hover:text-white transition"
                >
                  +84 123 456 789
                </a>
              </li>
              <li className="flex items-center">
                <FiMail className="mr-3 text-gray-400" />
                <a
                  href="mailto:info@yensaovn.com"
                  className="text-gray-400 hover:text-white transition"
                >
                  info@yensaovn.com
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Đăng ký nhận tin</h4>
            <p className="text-gray-400 mb-4">
              Nhận thông báo về sản phẩm mới và các chương trình khuyến mãi
            </p>
            <form
              onSubmit={handleNewsletterSubmit}
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                type="email"
                placeholder="Email của bạn"
                className="bg-gray-800 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors"
              >
                Đăng ký
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} Yến Sào VN. Tất cả quyền được bảo
            lưu.
          </p>
        </div>
      </div>
    </footer>
  );
}
