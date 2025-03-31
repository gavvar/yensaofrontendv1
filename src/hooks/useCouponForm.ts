import { useState, useEffect } from "react";
import { CouponInput } from "@/types/coupon";

interface UseCouponFormProps {
  initialData?: CouponInput;
  isEditing?: boolean;
  onSubmit: (data: CouponInput) => Promise<void>;
}

interface CouponFormState {
  formData: CouponInput;
  startDateObj: Date | null;
  endDateObj: Date | null;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isFormValid: boolean;
}

interface CouponFormActions {
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleStartDateChange: (date: Date | null) => void;
  handleEndDateChange: (date: Date | null) => void;
  handleSubmit: (e: React.FormEvent) => void;
  resetForm: () => void;
  validateForm: () => boolean;
}

const defaultFormData: CouponInput = {
  code: "",
  type: "percentage",
  value: 10,
  minOrderValue: 0,
  maxDiscount: null,
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Default: 30 days from now
  usageLimit: null,
  userLimit: null,
  active: true,
  description: "",
  userId: null,
  appliedProducts: null,
  appliedCategories: null,
};

export const useCouponForm = ({
  initialData,
  isEditing = false,
  onSubmit,
}: UseCouponFormProps): [CouponFormState, CouponFormActions] => {
  // Form state
  const [formData, setFormData] = useState<CouponInput>(
    initialData || defaultFormData
  );
  const [startDateObj, setStartDateObj] = useState<Date | null>(null);
  const [endDateObj, setEndDateObj] = useState<Date | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Initialize dates from ISO strings
  useEffect(() => {
    if (formData.startDate) {
      setStartDateObj(new Date(formData.startDate));
    }
    if (formData.endDate) {
      setEndDateObj(new Date(formData.endDate));
    }
  }, []);

  // Update form validation status when formData or errors change
  useEffect(() => {
    const isValid = Object.keys(errors).length === 0;
    setIsFormValid(isValid);
  }, [formData, errors]);

  // When initialData changes (e.g. when editing a different coupon)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      if (initialData.startDate) {
        setStartDateObj(new Date(initialData.startDate));
      }
      if (initialData.endDate) {
        setEndDateObj(new Date(initialData.endDate));
      }
    }
  }, [initialData]);

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        [name]: checkbox.checked,
      }));
    } else if (
      name === "value" ||
      name === "minOrderValue" ||
      name === "maxDiscount" ||
      name === "usageLimit" ||
      name === "userLimit"
    ) {
      const numValue = value === "" ? null : Number(value);
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle date changes
  const handleStartDateChange = (date: Date | null) => {
    setStartDateObj(date);
    if (date) {
      setFormData((prev) => ({
        ...prev,
        startDate: date.toISOString(),
      }));

      // Clear error for this field if it exists
      if (errors.startDate) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.startDate;
          return newErrors;
        });
      }
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDateObj(date);
    if (date) {
      setFormData((prev) => ({
        ...prev,
        endDate: date.toISOString(),
      }));

      // Clear error for this field if it exists
      if (errors.endDate) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.endDate;
          return newErrors;
        });
      }
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Code validation
    if (!formData.code.trim()) {
      newErrors.code = "Mã giảm giá không được để trống";
    } else if (!/^[A-Za-z0-9-_]+$/.test(formData.code.trim())) {
      newErrors.code =
        "Mã giảm giá chỉ được chứa chữ cái, số, dấu gạch ngang và gạch dưới";
    }

    // Value validation
    if (formData.value === null) {
      newErrors.value = "Giá trị giảm giá không được để trống";
    } else if (
      formData.type === "percentage" &&
      (formData.value < 0 || formData.value > 100)
    ) {
      newErrors.value = "Giá trị phần trăm phải từ 0 đến 100";
    } else if (formData.type === "fixed_amount" && formData.value < 0) {
      newErrors.value = "Giá trị giảm phải lớn hơn hoặc bằng 0";
    }

    // Min order value validation
    if (formData.minOrderValue === null) {
      newErrors.minOrderValue =
        "Giá trị đơn hàng tối thiểu không được để trống";
    } else if (formData.minOrderValue < 0) {
      newErrors.minOrderValue =
        "Giá trị đơn hàng tối thiểu phải lớn hơn hoặc bằng 0";
    }

    // Max discount validation (only for percentage type)
    if (
      formData.type === "percentage" &&
      formData.maxDiscount !== null &&
      formData.maxDiscount !== undefined &&
      formData.maxDiscount < 0
    ) {
      newErrors.maxDiscount = "Giảm giá tối đa phải lớn hơn hoặc bằng 0";
    }

    // Date validation
    if (!formData.startDate) {
      newErrors.startDate = "Ngày bắt đầu không được để trống";
    }

    if (!formData.endDate) {
      newErrors.endDate = "Ngày kết thúc không được để trống";
    }

    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) >= new Date(formData.endDate)
    ) {
      newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    }

    // Usage limits validation
    if (
      formData.usageLimit !== null &&
      formData.usageLimit !== undefined &&
      formData.usageLimit < 0
    ) {
      newErrors.usageLimit = "Số lần sử dụng phải lớn hơn hoặc bằng 0";
    }

    if (
      formData.userLimit !== null &&
      formData.userLimit !== undefined &&
      formData.userLimit < 0
    ) {
      newErrors.userLimit = "Giới hạn người dùng phải lớn hơn hoặc bằng 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);

      try {
        await onSubmit(formData);
        // If not editing, reset the form after successful submission
        if (!isEditing) {
          resetForm();
        }
      } catch (err) {
        // Error is handled by the component using this hook
        console.error("Form submission error:", err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Reset form to default or initial data
  const resetForm = () => {
    setFormData(initialData || defaultFormData);
    setErrors({});

    if (initialData?.startDate) {
      setStartDateObj(new Date(initialData.startDate));
    } else {
      setStartDateObj(new Date());
    }

    if (initialData?.endDate) {
      setEndDateObj(new Date(initialData.endDate));
    } else {
      setEndDateObj(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    }
  };

  return [
    {
      formData,
      startDateObj,
      endDateObj,
      errors,
      isSubmitting,
      isFormValid,
    },
    {
      handleChange,
      handleStartDateChange,
      handleEndDateChange,
      handleSubmit,
      resetForm,
      validateForm,
    },
  ];
};

export default useCouponForm;
