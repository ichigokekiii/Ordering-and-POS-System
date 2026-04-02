import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { Loader2 } from "lucide-react";

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;
  const otp = location.state?.otp; // Needed for backend resetting typically

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      // Backend expects email and new password normally, sometimes OTP.
      await api.post("/reset-password", {
        email,
        password,
        password_confirmation: confirm, // Usually Laravel expects this
        otp // If backend uses it.
      });

      setShowModal(true);

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-6 pb-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Invalid Request</h2>
          <p className="mb-6 text-sm text-gray-600">You must verify an OTP before resetting your password.</p>
          <button onClick={() => navigate("/forgot-password")} className="w-full rounded-lg bg-[#4f6fa5] py-3 text-white hover:bg-[#3f5b89] transition-all">
            Go to Forgot Password
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-6 pb-4">
      <div className="w-full max-w-4xl min-h-[520px] md:min-h-[600px] bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT PANEL - Image Placeholder */}
        <div className="hidden md:flex w-1/2 relative overflow-hidden bg-gray-200">
          <img 
            src="/placeholder.jpg"
            alt="Authentication decoration"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white p-10 text-center backdrop-blur-[2px]">
            <h2 className="text-3xl font-bold mb-4 font-sans tracking-tight">Reset Your Password</h2>
            <p className="text-blue-50 leading-relaxed text-lg">
              Secure your account by setting a new password. Make sure it’s strong and easy for you to remember.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL - Form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 sm:px-12 py-10 relative z-10 bg-white">
          
          <div className="mb-2 w-12 h-12 rounded-full bg-[#e8f1ff] flex items-center justify-center text-[#4f6fa5] mb-6 shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>

          <h2 className="text-3xl font-bold mb-2 text-gray-800 tracking-tight">Set New Password</h2>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            You verified your identity via OTP. Please enter your new password below.
          </p>

          {error && <p className="mb-6 text-sm text-red-500 bg-red-50 py-3 px-4 rounded-lg border border-red-100">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="password"
              className="w-full rounded-xl border border-gray-300 px-4 py-3.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f6fa5] focus:border-transparent transition-all shadow-sm"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength="8"
            />

            <input
              type="password"
              className="w-full rounded-xl border border-gray-300 px-4 py-3.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f6fa5] focus:border-transparent transition-all shadow-sm"
              placeholder="Confirm New Password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              disabled={loading}
              minLength="8"
            />

            <button
              disabled={loading}
              className="w-full rounded-xl bg-[#4f6fa5] py-3.5 text-white font-semibold hover:bg-[#3f5b89] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              Reset Password
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/login" className="text-sm text-[#4f6fa5] font-semibold hover:underline inline-flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Go to Login Page
            </Link>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-xs transform rounded-2xl bg-white p-6 text-center shadow-2xl drop-shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-800">Success</h3>
            <p className="text-sm text-gray-600 font-medium mb-4">Password reset successfully!</p>
            <div className="flex justify-center mb-2">
              <Loader2 className="h-5 w-5 animate-spin text-[#4f6fa5]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResetPasswordPage;