import { createPortal } from "react-dom";

import { getTermsConfig } from "../utils/termsAndConditions";

function TermsAndConditionsModal({ open, scope, onClose, onAcknowledge }) {
  if (!open) return null;

  const terms = getTermsConfig(scope);

  const modal = (
    <div className="fixed inset-0 z-[800] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="flex max-h-[84vh] w-full max-w-xl flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-gray-100 pb-4 dark:border-slate-700">
          <div className="min-w-0">
            <h2 className="text-2xl font-playfair font-bold text-gray-900">
              Terms & Conditions
            </h2>
            <p className="mt-2 text-sm font-medium text-gray-500">
              {terms.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close terms and conditions"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition hover:bg-[#4f6fa5]/10 hover:text-[#4f6fa5] dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-blue-500/15 dark:hover:text-blue-200"
          >
            ✕
          </button>
        </div>

        <div className="nice-scrollbar space-y-5 overflow-y-auto pr-2 text-sm text-gray-600 md:pr-3 dark:text-slate-300">
          <div>
            <p className="text-sm leading-relaxed text-gray-500 dark:text-slate-400">{terms.intro}</p>
          </div>

          {terms.sections.map((section, index) => (
            <div key={section.heading}>
              <p className="font-semibold text-gray-800 dark:text-slate-100">
                {index + 1}. {section.heading}
              </p>
              <p className="mt-1 leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-gray-100 pt-4 dark:border-slate-700">
          <button
            type="button"
            onClick={onAcknowledge}
            className="w-full rounded-2xl bg-gray-900 px-6 py-4 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#4f6fa5] dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            I have read and understood
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return modal;

  return createPortal(modal, document.body);
}

export default TermsAndConditionsModal;
