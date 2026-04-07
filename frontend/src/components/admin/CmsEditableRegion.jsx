import { useState } from "react";

function CmsEditableRegion({
  cmsPreview,
  field,
  children,
  className = "",
  overlayClassName = "",
  persistentHint = false,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const isEnabled =
    cmsPreview?.enabled &&
    field?.previewEnabled &&
    (!cmsPreview.activePage || field.page === cmsPreview.activePage);

  if (!isEnabled) {
    return <div className={className}>{children}</div>;
  }

  const isActive = persistentHint || isHovered;

  return (
    <div
      className={`relative ${className}`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        cmsPreview.onEditField(field);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          cmsPreview.onEditField(field);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Edit ${field.label}`}
    >
      {children}

      {/* Visual Overlay */}
      <div
        className={`pointer-events-none absolute inset-0 z-30 rounded-[inherit] border-2 border-dashed transition-all duration-300 ${
          persistentHint
            ? "border-[#4f6fa5]/45 bg-[#4f6fa5]/[0.03]"
            : "border-[#4f6fa5] bg-[#4f6fa5]/5"
        } ${overlayClassName}`}
        style={{
          opacity: isActive ? 1 : 0,
          borderColor:
            persistentHint && isHovered ? "rgb(79 111 165)" : undefined,
          backgroundColor:
            persistentHint && isHovered ? "rgb(79 111 165 / 0.10)" : undefined,
        }}
        aria-hidden="true"
      />

      {/* The Floating Label (Sleek pill design) */}
      <div
        className="pointer-events-none absolute left-3 top-3 z-40 flex items-center gap-1.5 rounded-full bg-[#4f6fa5] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg transition-all duration-300"
        style={{
          opacity: isActive ? 1 : 0,
          transform: isActive ? "translateY(0)" : "translateY(-0.25rem)",
        }}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
        {field.label}
      </div>
    </div>
  );
}

export default CmsEditableRegion;
