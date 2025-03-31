import React from "react";
//file nay la de xuat hien header cho admin page
interface AdminPageHeaderProps {
  title: string;
  description?: string;
}

const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  description,
}) => {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
      {description && (
        <p className="mt-2 text-sm text-gray-900">{description}</p>
      )}
    </div>
  );
};

export default AdminPageHeader;
