"use client";

//ung dung thuc te: trong trang chi tiet san pham, breadcrumb co the la: Trang chu > Danh muc > Ten san pham
import React from "react";
import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex text-sm text-gray-600 mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center flex-wrap">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <li className="mx-2">
                <FiChevronRight size={14} className="text-gray-400" />
              </li>
            )}
            <li>
              {index === items.length - 1 ? (
                <span className="font-medium text-gray-900">{item.label}</span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-amber-600 hover:underline"
                >
                  {item.label}
                </Link>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
