import Link from "next/link";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiFacebook,
  FiInstagram,
  FiYoutube,
  FiTwitter,
} from "react-icons/fi";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Company */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-amber-500">YẾN SÀO</h3>
            <p className="text-gray-900 mb-6">
              Chuyên cung cấp các sản phẩm yến sào chất lượng cao, nguồn gốc rõ
              ràng, đảm bảo dinh dưỡng và an toàn cho sức khỏe gia đình bạn.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-amber-600 h-10 w-10 rounded-full flex items-center justify-center transition duration-300"
                aria-label="Facebook"
              >
                <FiFacebook />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-amber-600 h-10 w-10 rounded-full flex items-center justify-center transition duration-300"
                aria-label="Instagram"
              >
                <FiInstagram />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-amber-600 h-10 w-10 rounded-full flex items-center justify-center transition duration-300"
                aria-label="Youtube"
              >
                <FiYoutube />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-amber-600 h-10 w-10 rounded-full flex items-center justify-center transition duration-300"
                aria-label="Twitter"
              >
                <FiTwitter />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/products"
                  className="text-gray-900 hover:text-amber-500 transition duration-300 flex items-center"
                >
                  <span className="mr-2">›</span>Sản phẩm
                </Link>
              </li>
              <li>
                <Link
                  href="/products/raw-nest"
                  className="text-gray-900 hover:text-amber-500 transition duration-300 flex items-center"
                >
                  <span className="mr-2">›</span>Yến thô
                </Link>
              </li>
              <li>
                <Link
                  href="/products/processed-nest"
                  className="text-gray-900 hover:text-amber-500 transition duration-300 flex items-center"
                >
                  <span className="mr-2">›</span>Yến tinh chế
                </Link>
              </li>
              <li>
                <Link
                  href="/products/ready-to-eat"
                  className="text-gray-900 hover:text-amber-500 transition duration-300 flex items-center"
                >
                  <span className="mr-2">›</span>Yến chưng sẵn
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-900 hover:text-amber-500 transition duration-300 flex items-center"
                >
                  <span className="mr-2">›</span>Về chúng tôi
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-900 hover:text-amber-500 transition duration-300 flex items-center"
                >
                  <span className="mr-2">›</span>Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Thông tin liên hệ</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <FiMapPin className="text-amber-500 mt-1.5 mr-3 flex-shrink-0" />
                <span className="text-gray-900">
                  123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh
                </span>
              </li>
              <li className="flex items-center">
                <FiPhone className="text-amber-500 mr-3 flex-shrink-0" />
                <a
                  href="tel:0901234567"
                  className="text-gray-900 hover:text-amber-500 transition duration-300"
                >
                  090 123 4567
                </a>
              </li>
              <li className="flex items-center">
                <FiMail className="text-amber-500 mr-3 flex-shrink-0" />
                <a
                  href="mailto:info@yensao.vn"
                  className="text-gray-900 hover:text-amber-500 transition duration-300"
                >
                  info@yensao.vn
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Đăng ký nhận tin</h3>
            <p className="text-gray-900 mb-4">
              Nhận thông tin về sản phẩm mới, khuyến mãi và bài viết hữu ích về
              yến sào
            </p>
            <form className="mt-4">
              <div className="flex mb-3">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="w-full p-3 bg-gray-800 rounded-l-md focus:outline-none focus:ring-1 focus:ring-amber-500 text-gray-200"
                  required
                />
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-700 px-4 rounded-r-md transition duration-300"
                >
                  Đăng ký
                </button>
              </div>
              <p className="text-xs text-gray-900">
                * Chúng tôi sẽ không gửi spam. Xem chính sách bảo mật của chúng
                tôi.
              </p>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-900 text-sm">
            © {currentYear} YẾN SÀO. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link
              href="/privacy-policy"
              className="text-gray-900 hover:text-amber-500 text-sm transition duration-300"
            >
              Chính sách bảo mật
            </Link>
            <Link
              href="/terms"
              className="text-gray-900 hover:text-amber-500 text-sm transition duration-300"
            >
              Điều khoản sử dụng
            </Link>
            <Link
              href="/shipping-policy"
              className="text-gray-900 hover:text-amber-500 text-sm transition duration-300"
            >
              Chính sách vận chuyển
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
