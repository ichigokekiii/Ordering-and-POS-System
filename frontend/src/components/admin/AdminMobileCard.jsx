export function AdminMobileCard({ children, onClick, className = "" }) {
  return (
    <div
      onClick={onClick}
      onKeyDown={onClick ? undefined : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`rounded-2xl border border-gray-100 bg-white p-4 shadow-sm ${
        onClick ? "cursor-pointer transition-colors hover:border-gray-200" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function AdminMobileCardRow({ label, value, className = "" }) {
  return (
    <div className={`flex justify-between gap-3 text-sm ${className}`}>
      <span className="font-medium text-gray-400">{label}</span>
      <span className="text-right font-semibold text-gray-900">{value}</span>
    </div>
  );
}
