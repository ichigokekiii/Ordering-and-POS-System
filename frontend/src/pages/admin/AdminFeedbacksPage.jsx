import { useEffect, useState, useRef, useMemo } from "react";
import api from "../../services/api";
import {
  Search,
  ChevronDown,
  Filter,
  SlidersHorizontal,
  Loader2,
  MessageSquare,
  Star,
} from "lucide-react";

const RatingPill = ({ rating }) => {
  const colors = {
    1: "bg-rose-100 text-rose-700 border-rose-200",
    2: "bg-orange-100 text-orange-700 border-orange-200",
    3: "bg-amber-100 text-amber-700 border-amber-200",
    4: "bg-blue-100 text-blue-700 border-blue-200",
    5: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 w-fit ${colors[rating] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
      <Star className="w-3 h-3 fill-current" />
      {rating} / 5
    </span>
  );
};

const StarDisplay = ({ rating }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"}`}
        />
      ))}
    </div>
  );
};

function AdminFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [viewingFeedback, setViewingFeedback] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [filterRating, setFilterRating] = useState("all");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const sortRef = useRef(null);
  const filterRef = useRef(null);

  useEffect(() => {
    api.get("/feedbacks")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.feedbacks ?? [];
        setFeedbacks(data);
      })
      .catch((err) => console.error("Failed to fetch feedbacks:", err))
      .finally(() => setLoading(false));

    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilterMenu(false);
      if (sortRef.current && !sortRef.current.contains(e.target)) setShowSortMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredFeedbacks = useMemo(() => {
    let result = [...feedbacks];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((f) => {
        const fullName = `${f.user?.first_name || ""} ${f.user?.last_name || ""}`.toLowerCase();
        const text = (f.feedback_text || "").toLowerCase();
        return fullName.includes(q) || text.includes(q);
      });
    }

    if (filterRating !== "all") {
      result = result.filter((f) => String(f.feedback_rating) === filterRating);
    }

    result.sort((a, b) => {
      if (sortBy === "created_at") return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === "created_at_asc") return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === "rating_desc") return b.feedback_rating - a.feedback_rating;
      if (sortBy === "rating_asc") return a.feedback_rating - b.feedback_rating;
      return 0;
    });

    return result;
  }, [feedbacks, searchQuery, filterRating, sortBy]);

  const sortOptions = [
    { key: "created_at", label: "Newest first" },
    { key: "created_at_asc", label: "Oldest first" },
    { key: "rating_desc", label: "Highest rating" },
    { key: "rating_asc", label: "Lowest rating" },
  ];

  const avgRating = feedbacks.length
    ? (feedbacks.reduce((sum, f) => sum + f.feedback_rating, 0) / feedbacks.length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen flex flex-col px-8 py-8 bg-white rounded-lg relative font-sans">

      {/* HEADER */}
      <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-gray-900 tracking-tight">Feedback</h1>
          <p className="mt-1.5 max-w-2xl text-sm font-medium text-gray-500">
            Browse all customer feedback and ratings submitted through the platform.
          </p>
        </div>

        {avgRating && (
          <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-[#f8fafc] px-5 py-3 shadow-sm self-start lg:self-auto">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Avg. Rating</p>
              <p className="text-2xl font-playfair font-bold text-gray-900">{avgRating}</p>
            </div>
            <StarDisplay rating={Math.round(avgRating)} />
          </div>
        )}
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer name or feedback content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-gray-100 rounded-2xl pl-11 pr-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#eaf2ff] transition-all"
          />
        </div>

        <div className="flex gap-3">
          {/* SORT DROPDOWN */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 hover:border-gray-900 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#eaf2ff]"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Sort
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showSortMenu ? "rotate-180" : ""}`} />
            </button>
            {showSortMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-2 animate-in fade-in zoom-in duration-100">
                {sortOptions.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => { setSortBy(key); setShowSortMenu(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors ${sortBy === key ? "bg-[#eaf2ff] text-[#4f6fa5]" : "text-gray-600 hover:bg-[#eaf2ff] hover:text-[#4f6fa5]"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* FILTER DROPDOWN */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 hover:border-gray-900 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#eaf2ff]"
            >
              <Filter className="w-4 h-4" />
              Filter
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilterMenu ? "rotate-180" : ""}`} />
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-4 animate-in fade-in zoom-in duration-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Filter by Rating</p>
                <div className="space-y-1">
                  <button
                    onClick={() => setFilterRating("all")}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold transition-colors ${filterRating === "all" ? "bg-[#eaf2ff] text-[#4f6fa5]" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    All Ratings
                  </button>
                  {[5, 4, 3, 2, 1].map((r) => (
                    <button
                      key={r}
                      onClick={() => setFilterRating(String(r))}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 ${filterRating === String(r) ? "bg-[#eaf2ff] text-[#4f6fa5]" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {r} Star{r !== 1 ? "s" : ""}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MAIN TABLE */}
      <div className="flex-1 rounded-[1.5rem] border border-gray-100 bg-white shadow-sm overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-400 py-40">
            <Loader2 className="w-8 h-8 animate-spin text-[#4f6fa5]" />
            <span className="text-xs font-bold uppercase tracking-widest">Loading Feedbacks...</span>
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400 py-40">
            <MessageSquare className="w-10 h-10 opacity-20 mb-2" />
            <span className="text-sm font-bold text-gray-500">
              {feedbacks.length === 0 ? "No feedback has been submitted yet." : "No feedback matches your search or filters."}
            </span>
            {feedbacks.length > 0 && (
              <button
                onClick={() => { setSearchQuery(""); setFilterRating("all"); }}
                className="text-xs font-bold text-[#4f6fa5] hover:underline mt-1"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-50 bg-[#f8fafc]">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">Customer</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">Rating</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">Feedback</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">Date Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredFeedbacks.map((f) => (
                  <tr
                    key={f.feedback_id}
                    onClick={() => setViewingFeedback(f)}
                    className="group hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-[#4f6fa5] font-bold shrink-0">
                          {f.user?.first_name?.charAt(0) || "?"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 tracking-tight whitespace-nowrap">
                            {f.user?.first_name ? `${f.user.first_name} ${f.user.last_name}` : "Anonymous"}
                          </p>
                          <p className="text-xs font-medium text-gray-400">ID: #{f.feedback_id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1.5">
                        <RatingPill rating={f.feedback_rating} />
                        <StarDisplay rating={f.feedback_rating} />
                      </div>
                    </td>

                    <td className="px-6 py-5 max-w-sm">
                      <p className="text-sm text-gray-600 line-clamp-2 font-medium leading-relaxed">
                        {f.feedback_text}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-gray-900 whitespace-nowrap">
                        {new Date(f.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                      <p className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(f.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VIEW FEEDBACK MODAL */}
      {viewingFeedback && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl border border-white/20 p-8 animate-in zoom-in-95 duration-200">

            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="rounded-full bg-[#eaf2ff] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#4f6fa5] mb-3 inline-block">
                  Feedback #{viewingFeedback.feedback_id}
                </span>
                <h2 className="text-2xl font-playfair font-bold text-gray-900">Feedback Details</h2>
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">Read Only</span>
            </div>

            {/* Customer Info */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 mb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Customer</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-[#4f6fa5] font-bold text-lg shrink-0">
                  {viewingFeedback.user?.first_name?.charAt(0) || "?"}
                </div>
                <div>
                  <p className="font-bold text-gray-900">
                    {viewingFeedback.user?.first_name
                      ? `${viewingFeedback.user.first_name} ${viewingFeedback.user.last_name}`
                      : "Anonymous"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(viewingFeedback.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    {" · "}
                    {new Date(viewingFeedback.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 mb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Rating</p>
              <div className="flex items-center gap-4">
                <StarDisplay rating={viewingFeedback.feedback_rating} />
                <RatingPill rating={viewingFeedback.feedback_rating} />
              </div>
            </div>

            {/* Feedback Text */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 mb-6 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Message</p>
              <p className="text-sm font-playfair italic text-gray-800 leading-relaxed">
                "{viewingFeedback.feedback_text}"
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setViewingFeedback(null)}
                className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-bold text-white border-2 border-gray-900 hover:bg-transparent hover:text-gray-900 transition-all duration-300 shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminFeedbacksPage;