import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";
import { Loader2, Eye, EyeOff } from "lucide-react";

// CMS IMPORTS
import { useContents } from "../../contexts/ContentContext";
import CmsEditableRegion from "../../components/admin/CmsEditableRegion";
import { getCmsField, getCmsAssetUrl, getContentValue as getCmsContentValue } from "../../cms/cmsRegistry";

function ResetPasswordPage({ cmsPreview }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";
  const otp = location.state?.otp || "";

  // CMS HELPERS
  const contentContext = useContents();
  const contents = contentContext?.contents || [];
  const getContentValue = (identifier, fallback = "") =>
    getCmsContentValue(contents, "auth", identifier, fallback);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cmsPreview?.enabled) return;

    setError("");

    if (!newPassword || !confirmPassword) {
      return setError("Please fill in all fields.");
    }
    if (newPassword.length < 8) {
      return setError("Password must be at least 8 characters.");
    }
    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);
    try {
      await api.post("/reset-password", {
        email,
        otp,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      localStorage.removeItem("pendingUser");
      navigate("/login", { state: { passwordReset: true } });
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfaf9] flex items-start justify-center pt-10 pb-4">
      <div className="w-full max-w-4xl min-h-[520px] md:min-h-[600px] bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden">

        {/* LEFT PANEL - CMS Editable Image & Title */}
        <div className="hidden md:flex w-1/2 relative overflow-hidden bg-gray-200">
          <CmsEditableRegion
            cmsPreview={cmsPreview}
            field={getCmsField("auth", "auth_reset_image")}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={getCmsAssetUrl(
                getContentValue(
                  "auth_reset_image",
                  "https://images.unsplash.com/photo-1555949963-aa79dcee981c"
                )
              )}
              alt="Reset Password decoration"
              className="absolute inset-0 w-full h-full object-cover brightness-110 contrast-110"
            />
          </CmsEditableRegion>

          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-12 text-center backdrop-blur-[3px] pointer-events-none">
            <CmsEditableRegion
              cmsPreview={cmsPreview}
              field={getCmsField("auth", "auth_reset_title")}
              className="inline-block w-fit pointer-events-auto mb-4"
            >
              <h2 className="text-4xl font-bold font-sans tracking-tight">
                {getContentValue("auth_reset_title", "Set New Password")}
              </h2>
            </CmsEditableRegion>

            <CmsEditableRegion
              cmsPreview={cmsPreview}
              field={getCmsField("auth", "auth_reset_subtitle")}
              className="inline-block w-fit pointer-events-auto mb-8"
            >
              <p className="text-blue-50 leading-relaxed max-w-sm text-lg">
                {getContentValue(
                  "auth_reset_subtitle",
                  "Choose a strong new password to keep your account secure."
                )}
              </p>
            </CmsEditableRegion>
          </div>
        </div>

        {/* RIGHT PANEL - Form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 sm:px-12 py-10 relative z-10 bg-white">
          <h2 className="text-3xl font-bold mb-4 text-gray-800 tracking-tight">
            Reset Password
          </h2>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            Enter and confirm your new password below. Make sure it's at least 8 characters long.
          </p>

          {error && (
            <p className="mb-6 text-sm text-red-500 bg-red-50 py-3 px-4 rounded-lg border border-red-100">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                className="w-full rounded-xl border border-gray-300 px-4 py-3.5 pr-12 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f6fa5] focus:border-transparent transition-all shadow-sm"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowNew((v) => !v)}
                className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                className="w-full rounded-xl border border-gray-300 px-4 py-3.5 pr-12 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f6fa5] focus:border-transparent transition-all shadow-sm"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password strength hints */}
            {newPassword.length > 0 && (
              <ul className="text-xs space-y-1 px-1">
                <li className={`flex items-center gap-1.5 ${newPassword.length >= 8 ? "text-emerald-600" : "text-gray-400"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${newPassword.length >= 8 ? "bg-emerald-500" : "bg-gray-300"}`} />
                  At least 8 characters
                </li>
                <li className={`flex items-center gap-1.5 ${/[A-Z]/.test(newPassword) ? "text-emerald-600" : "text-gray-400"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(newPassword) ? "bg-emerald-500" : "bg-gray-300"}`} />
                  One uppercase letter
                </li>
                <li className={`flex items-center gap-1.5 ${/[0-9]/.test(newPassword) ? "text-emerald-600" : "text-gray-400"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(newPassword) ? "bg-emerald-500" : "bg-gray-300"}`} />
                  One number
                </li>
                <li className={`flex items-center gap-1.5 ${confirmPassword && newPassword === confirmPassword ? "text-emerald-600" : "text-gray-400"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${confirmPassword && newPassword === confirmPassword ? "bg-emerald-500" : "bg-gray-300"}`} />
                  Passwords match
                </li>
              </ul>
            )}

            <button
              disabled={loading}
              className="w-full rounded-xl bg-[#4f6fa5] py-3.5 text-white font-semibold hover:bg-[#3f5b89] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2 !mt-6"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              Save New Password
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/login")}
              className="text-sm text-[#4f6fa5] font-semibold hover:underline inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;