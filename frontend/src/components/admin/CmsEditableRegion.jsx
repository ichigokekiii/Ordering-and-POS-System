import { useState } from "react";

function CmsEditableRegion({
  cmsPreview,
  field,
  children,
  className = "",
  overlayClassName = "",
  actionLabel,
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  const isEnabled =
    cmsPreview?.enabled &&
    field?.previewEnabled &&
    (!cmsPreview.activePage || field.page === cmsPreview.activePage);

  if (!isEnabled || !field) {
    return <div className={className}>{children}</div>;
  }

  const regionActionLabel = actionLabel || (cmsPreview?.readOnly ? "View" : "Edit");

  // Smart positioning: If className already defines positioning, don't force 'relative'
  const positioning = className.includes("absolute") || className.includes("fixed") ? "" : "relative";

  return (
    <div
      className={`group/region ${positioning} ${className} cursor-pointer`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        cmsPreview.onEditField(field);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={`${regionActionLabel} ${field?.label || "Region"}`}
    >
      {children}

      {/* Animated Background Tint & Border */}
      <div
        className={`pointer-events-none absolute inset-0 z-[50] rounded-[inherit] transition-all duration-300 ease-out ${overlayClassName}`}
        style={{
          border: isHovered ? "2px solid #4f6fa5" : "2px solid transparent",
          backgroundColor: isHovered ? "rgba(79, 111, 165, 0.12)" : "transparent",
          transform: isHovered ? "scale(1.03)" : "scale(1)",
          opacity: isHovered ? 1 : 0,
        }}
      />

      {/* Bouncing/Popping Edit Label */}
      <div
        className="pointer-events-none absolute right-2 top-2 z-[60] flex items-center gap-1.5 rounded bg-[#4f6fa5] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg transition-all duration-300 ease-out"
        style={{
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? "translateY(0) scale(1)" : "translateY(4px) scale(0.9)",
        }}
      >
        <svg className="w-3.5 h-3.5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        {regionActionLabel} {field.label}
      </div>
    </div>
  );
}

export default CmsEditableRegion;
