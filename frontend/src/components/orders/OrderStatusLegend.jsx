import { getOrderStatusLegend, getOrderStatusPillStyle } from "../../utils/orderStatus";

function OrderStatusLegend({
  statuses = [],
  title = "Status",
  className = "",
}) {
  const legendItems = getOrderStatusLegend(statuses);

  if (!legendItems.length) {
    return null;
  }

  return (
    <div className={`rounded-2xl border border-gray-100 bg-white p-4 shadow-sm ${className}`.trim()}>
      <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        {title}
      </p>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {legendItems.map((status) => (
          <div
            key={status.code}
            className="rounded-2xl border border-gray-100 bg-[#fcfaf9] px-3 py-3"
          >
            <span
              className="inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
              style={getOrderStatusPillStyle(status.code, legendItems)}
            >
              {status.label}
            </span>
            <p className="mt-2 text-xs leading-5 text-gray-500">
              {status.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderStatusLegend;
