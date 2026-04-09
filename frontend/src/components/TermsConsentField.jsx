import { getTermsConfig } from "../utils/termsAndConditions";

function TermsConsentField({
  scope,
  checked,
  acknowledged,
  onToggle,
  onOpen,
  error,
}) {
  const terms = getTermsConfig(scope);

  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${
        error
          ? "border-red-200 bg-red-50/70 dark:border-red-400/30 dark:bg-red-950/30"
          : "border-gray-200 bg-gray-50/70 dark:border-slate-700 dark:bg-slate-900/70"
      }`}
    >
      <div className="mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Terms & Conditions *
        </p>
      </div>

      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onToggle(event.target.checked)}
          disabled={!acknowledged}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-[#4f6fa5] focus:ring-[#4f6fa5] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-950"
        />
        <div className="min-w-0">
          <p className="text-sm leading-relaxed text-gray-600">
            I agree to the{" "}
            <button
              type="button"
              onClick={onOpen}
              className="font-semibold text-[#4f6fa5] underline underline-offset-2 transition hover:text-[#3f5b89]"
            >
              {terms.title}
            </button>
            .
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-slate-400">
            {acknowledged
              ? "Confirmed in the modal. Keep this checked to continue."
              : "Open the terms link and use the confirmation button in the modal first."}
          </p>
          {error && <p className="mt-2 text-xs font-medium text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default TermsConsentField;
