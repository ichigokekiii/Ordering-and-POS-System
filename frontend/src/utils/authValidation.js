export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const NAME_REGEX = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;
export const PHONE_REGEX = /^\d{11}$/;
export const OTP_REGEX = /^\d{6}$/;
export const PASSWORD_MIN_LENGTH = 6;
export const NAME_MAX_LENGTH = 50;
export const EMAIL_MAX_LENGTH = 255;
export const PHONE_MAX_LENGTH = 11;
export const ADDRESS_MAX_LENGTH = 255;
export const HOUSE_NUMBER_MAX_LENGTH = 20;
export const ZIP_CODE_LENGTH = 4;
export const FEEDBACK_MAX_LENGTH = 500;
export const GREETING_CARD_MAX_LENGTH = 150;
export const CHECKOUT_ADDRESS_MAX_LENGTH = 200;
export const PAYMENT_METHOD_MAX_LENGTH = 50;
export const REFERENCE_CODE_MAX_LENGTH = 30;
export const REFERENCE_CODE_REGEX = /^[A-Za-z0-9]{4,30}$/;
export const ADDRESS_TEXT_REGEX = /^[a-zA-Z0-9\s\-,.#+]+$/;
export const CITY_REGEX = /^[a-zA-Z\s'-]+$/;
export const HOUSE_NUMBER_REGEX = /^\d+$/;

export const hasNonWhitespace = (value = "") => /\S/.test(value);

export const normalizeEmail = (value = "") => value.trim();

export const normalizeName = (value = "") =>
  value
    .trim()
    .replace(/\s+/g, " ");

export const normalizePhoneNumber = (value = "") => value.replace(/\D+/g, "");

export const normalizeOtp = (value = "") => value.replace(/\D+/g, "").slice(0, 6);

export const normalizeReferenceCode = (value = "") =>
  value.replace(/[^a-zA-Z0-9]/g, "").slice(0, REFERENCE_CODE_MAX_LENGTH);

export const normalizeSearchInput = (value = "", maxLength = 100) =>
  value.replace(/\s+/g, " ").slice(0, maxLength);

export const validateEmail = (value = "") => {
  const normalizedValue = normalizeEmail(value);

  if (!normalizedValue) return "Email address is required.";
  if (normalizedValue.length > EMAIL_MAX_LENGTH) {
    return `Email address must not exceed ${EMAIL_MAX_LENGTH} characters.`;
  }
  if (!EMAIL_REGEX.test(normalizedValue)) {
    return "Please enter a valid email address.";
  }

  return "";
};

export const validateName = (value = "", label = "Name") => {
  const normalizedValue = normalizeName(value);

  if (!normalizedValue) return `${label} is required.`;
  if (normalizedValue.length < 2 || normalizedValue.length > NAME_MAX_LENGTH) {
    return `${label} must be between 2 and ${NAME_MAX_LENGTH} characters.`;
  }
  if (!NAME_REGEX.test(normalizedValue)) {
    return `${label} can only contain letters, spaces, apostrophes, and hyphens.`;
  }

  return "";
};

export const validatePhoneNumber = (value = "") => {
  const normalizedValue = normalizePhoneNumber(value);

  if (!normalizedValue) return "Phone number is required.";
  if (!PHONE_REGEX.test(normalizedValue)) {
    return "Phone number must be exactly 11 digits.";
  }

  return "";
};

export const validateOptionalPhoneNumber = (value = "") => {
  const normalizedValue = normalizePhoneNumber(value);
  if (!normalizedValue) return "";

  if (!PHONE_REGEX.test(normalizedValue)) {
    return "Phone number must be exactly 11 digits.";
  }

  return "";
};

export const validateOtp = (value = "", label = "OTP") => {
  const normalizedValue = normalizeOtp(value);
  if (!normalizedValue) return `${label} is required.`;
  if (!OTP_REGEX.test(normalizedValue)) return `${label} must be exactly 6 digits.`;
  return "";
};

export const validatePassword = (value = "", { label = "Password", required = true } = {}) => {
  if (!hasNonWhitespace(value)) {
    return required ? `${label} is required.` : "";
  }

  if (value.length < PASSWORD_MIN_LENGTH) {
    return `${label} must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }

  return "";
};

export const validatePasswordConfirmation = (password = "", confirmation = "") => {
  if (!hasNonWhitespace(confirmation)) {
    return "Password confirmation is required.";
  }

  if (password !== confirmation) {
    return "Password confirmation does not match.";
  }

  return "";
};

export const validateAddressField = (field, value = "") => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "This field is required.";
  }

  if (field === "house_number") {
    if (trimmedValue.length > HOUSE_NUMBER_MAX_LENGTH) {
      return `House / unit number must not exceed ${HOUSE_NUMBER_MAX_LENGTH} characters.`;
    }
    if (!HOUSE_NUMBER_REGEX.test(trimmedValue)) {
      return "House / unit number must contain digits only.";
    }
    return "";
  }

  if (field === "zip_code") {
    if (!new RegExp(`^\\d{${ZIP_CODE_LENGTH}}$`).test(trimmedValue)) {
      return `Zip code must be exactly ${ZIP_CODE_LENGTH} digits.`;
    }
    return "";
  }

  if (trimmedValue.length > ADDRESS_MAX_LENGTH) {
    return "This field must not exceed 255 characters.";
  }

  if (field === "city" && !CITY_REGEX.test(trimmedValue)) {
    return "City can only contain letters, spaces, apostrophes, and hyphens.";
  }

  if ((field === "street" || field === "barangay") && !ADDRESS_TEXT_REGEX.test(trimmedValue)) {
    return "This field contains invalid characters.";
  }

  return "";
};

export const validateCheckoutAddress = (value = "") => {
  const trimmedValue = value.trim();
  if (!trimmedValue) return "Delivery address is required.";
  if (trimmedValue.length < 10) return "Please enter a more complete address (min 10 characters).";
  if (trimmedValue.length > CHECKOUT_ADDRESS_MAX_LENGTH) {
    return `Delivery address must not exceed ${CHECKOUT_ADDRESS_MAX_LENGTH} characters.`;
  }
  return "";
};

export const validatePaymentMethod = (value = "") => {
  const trimmedValue = normalizeName(value);
  if (!trimmedValue) return "Payment method is required.";
  if (trimmedValue.length > PAYMENT_METHOD_MAX_LENGTH) {
    return `Payment method must not exceed ${PAYMENT_METHOD_MAX_LENGTH} characters.`;
  }
  return "";
};

export const validateReferenceCode = (value = "") => {
  const normalizedValue = normalizeReferenceCode(value);
  if (!normalizedValue) return "Reference code is required.";
  if (!REFERENCE_CODE_REGEX.test(normalizedValue)) {
    return "Reference code must be 4-30 alphanumeric characters.";
  }
  return "";
};

export const validateFeedbackText = (value = "") => {
  const normalizedValue = value.trim();
  if (!normalizedValue) return "Feedback is required.";
  if (normalizedValue.length > FEEDBACK_MAX_LENGTH) {
    return `Feedback must not exceed ${FEEDBACK_MAX_LENGTH} characters.`;
  }
  return "";
};

export const validateGreetingCardMessage = (value = "") => {
  const normalizedValue = value.trim();
  if (!normalizedValue) return "Please write a greeting card message or turn off the greeting card option.";
  if (normalizedValue.length > GREETING_CARD_MAX_LENGTH) {
    return `Greeting card message must not exceed ${GREETING_CARD_MAX_LENGTH} characters.`;
  }
  return "";
};
