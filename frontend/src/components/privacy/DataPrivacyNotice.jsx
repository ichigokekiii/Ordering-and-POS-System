const PRIVACY_POINTS = [
  "We collect your name, contact details, email, delivery address, and order information so we can process, fulfill, and support your purchases.",
  "Your information is used for order updates, payment review, customer support, account security, and service improvements inside the Ordering and POS System.",
  "Reasonable administrative and technical safeguards are applied to protect stored customer data and limit access to authorized personnel only.",
];

function DataPrivacyNotice({
  checked,
  onToggle,
  error,
}) {
  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${
        error ? "border-red-200 bg-red-50/80" : "border-gray-200 bg-gray-50/70"
      }`}
    >
      <div className="mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Data Privacy Notice *
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm leading-6 text-gray-600">
          Petal Express PH uses the details you provide to fulfill orders, coordinate deliveries or pickups,
          send payment and status updates, and maintain account security.
        </p>

        <div className="space-y-2 rounded-2xl border border-white/70 bg-white/90 p-3">
          {PRIVACY_POINTS.map((point) => (
            <p key={point} className="text-xs leading-5 text-gray-500">
              {point}
            </p>
          ))}
        </div>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={checked}
            onChange={(event) => onToggle(event.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-[#4f6fa5] focus:ring-[#4f6fa5]"
          />
          <span className="text-sm leading-6 text-gray-600">
            I acknowledge this privacy notice and consent to the use of my information for order fulfillment,
            communication, and related service operations.
          </span>
        </label>

        {error ? <p className="text-xs font-medium text-red-500">{error}</p> : null}
      </div>
    </div>
  );
}

export default DataPrivacyNotice;
