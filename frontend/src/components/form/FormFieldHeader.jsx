function FormFieldHeader({
  label,
  required = false,
  error = "",
  hint = "",
  count,
  max,
  htmlFor,
  className = "",
}) {
  return (
    <div className={`mb-1.5 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <label
          htmlFor={htmlFor}
          className={`block text-[10px] font-bold uppercase tracking-widest ${
            error ? "text-rose-600" : "text-gray-500"
          }`}
        >
          {label}
          {required ? <span className="text-rose-500"> *</span> : null}
        </label>
        {typeof max === "number" ? (
          <span
            className={`text-[10px] font-bold tracking-widest uppercase ${
              typeof count === "number" && count > max ? "text-rose-500" : "text-gray-400"
            }`}
          >
            {typeof count === "number" ? count : 0}/{max}
          </span>
        ) : null}
      </div>
      {hint && !error ? (
        <p className="mt-1 text-[10px] font-medium text-gray-400">{hint}</p>
      ) : null}
      {error ? (
        <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-rose-500">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default FormFieldHeader;
