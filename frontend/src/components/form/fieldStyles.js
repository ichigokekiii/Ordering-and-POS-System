export const getValidationInputClassName = ({
  hasError,
  baseClassName = "",
  validClassName = "border-gray-300 bg-gray-50 focus:border-[#4f6fa5] focus:ring-[#4f6fa5]/15",
  invalidClassName = "border-rose-400 bg-rose-50 focus:border-rose-500 focus:ring-rose-100",
}) =>
  `${baseClassName} ${hasError ? invalidClassName : validClassName}`.trim();
