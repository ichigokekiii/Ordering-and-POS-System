export const normalizeWhitespace = (value = "") =>
  value.replace(/\s+/g, " ").trim();

export const hasMeaningfulText = (value = "", minLength = 1) =>
  normalizeWhitespace(value).length >= minLength;

export const flattenApiErrors = (errors = {}, fieldAliases = {}) => {
  const fieldErrors = {};

  Object.entries(errors || {}).forEach(([field, messages]) => {
    const normalizedField = fieldAliases[field] || field;
    const normalizedMessages = Array.isArray(messages)
      ? messages.filter(Boolean)
      : messages
        ? [messages]
        : [];

    if (!normalizedMessages.length) {
      return;
    }

    fieldErrors[normalizedField] = normalizedMessages[0];
  });

  return fieldErrors;
};

export const normalizeApiValidationErrors = (error, fieldAliases = {}) => {
  const status = error?.response?.status;
  const data = error?.response?.data || {};
  const rawErrors = data?.errors || {};
  const fieldErrors = flattenApiErrors(rawErrors, fieldAliases);
  const firstFieldError = Object.values(fieldErrors)[0] || "";
  const fallbackMessage =
    data?.error ||
    data?.message ||
    error?.message ||
    "Please review the highlighted fields.";

  return {
    status,
    fieldErrors,
    formError: firstFieldError ? "" : fallbackMessage,
    message: firstFieldError || fallbackMessage,
  };
};

export const getFirstInvalidFieldName = (fieldErrors = {}) =>
  Object.keys(fieldErrors).find((field) => fieldErrors[field]);

export const focusFirstInvalidField = (fieldRefs = {}, fieldErrors = {}) => {
  const firstField = getFirstInvalidFieldName(fieldErrors);
  if (!firstField) return;

  const target = fieldRefs[firstField]?.current || fieldRefs[firstField];
  if (!target || typeof target.focus !== "function") return;

  target.focus();

  if (typeof target.scrollIntoView === "function") {
    target.scrollIntoView({ block: "center", behavior: "smooth" });
  }
};

export const clearFieldError = (setFieldErrors, fieldName) => {
  setFieldErrors((prev) => {
    if (!prev?.[fieldName]) return prev;

    return {
      ...prev,
      [fieldName]: "",
    };
  });
};

export const sanitizeSearchTerm = (value = "", maxLength = 100) =>
  value.replace(/\s+/g, " ").slice(0, maxLength);
