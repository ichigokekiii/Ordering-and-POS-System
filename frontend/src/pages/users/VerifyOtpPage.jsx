import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

function VerifyOtpPage() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { handleLogin } = useAuth();

  const email = location.state?.email;

  // Countdown timer effect
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/verify-otp", {
        email,
        otp,
      });

      // Store Sanctum token
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      // Determine user source (login or register)
      let userData = null;

      const pendingUser = localStorage.getItem("pendingUser");

      if (pendingUser) {
        userData = JSON.parse(pendingUser);
        localStorage.removeItem("pendingUser");
        setModalMessage("Login verified! Logging you in...");
      } else {
        userData = res.data.user;
        setModalMessage("Account verified successfully! Logging you in...");
      }

      // Properly log the user in using AuthContext
      handleLogin(userData);

      setShowModal(true);

      // Role-based redirect
      const role = (userData?.role || "").toLowerCase();

      setTimeout(() => {
        if (role === "admin" || role === "owner") {
          navigate("/admin");
        } else if (role === "staff") {
          navigate("/staff");
        } else {
          navigate("/");
        }
      }, 1500);

    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid or expired OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setResendLoading(true);
    setError("");

    try {
      await api.post("/resend-otp", { email });
      setCountdown(60);
      setModalMessage("OTP resent successfully!");
      setShowModal(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to resend OTP."
      );
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="mx-auto max-w-sm px-8 pt-28 pb-32">
        <h2 className="mb-4 text-xl font-semibold">Session expired</h2>
        <p className="mb-4 text-sm text-gray-600">
          Please register again.
        </p>
        <button
          onClick={() => navigate("/register")}
          className="w-full rounded bg-[#5C6F9E] py-2 text-white hover:bg-[#4E5F88]"
        >
          Go to Register
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-8 pt-28 pb-32">
      <h2 className="mb-6 text-2xl font-semibold">Verify Account</h2>

      <p className="mb-4 text-sm text-gray-600">
        Enter the 6-digit OTP sent to:
      </p>
      <p className="mb-6 text-sm font-medium text-gray-800">
        {email}
      </p>

      {error && (
        <p className="mb-4 text-sm text-red-500">
          {error}
        </p>
      )}

      <form onSubmit={handleVerify} className="space-y-4">
        <input
          type="text"
          maxLength="6"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          className="w-full rounded border border-gray-300 px-4 py-2 text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-[#5C6F9E] focus:border-[#5C6F9E] transition"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-[#5C6F9E] py-2 text-white hover:bg-[#4E5F88] disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>

      <div className="mt-4 text-center text-sm">
        {countdown > 0 ? (
          <p className="text-gray-500">
            Resend OTP in {countdown}s
          </p>
        ) : (
          <button
            onClick={handleResend}
            disabled={resendLoading}
            className="text-[#5C6F9E] hover:underline disabled:opacity-50"
          >
            {resendLoading ? "Resending..." : "Resend OTP"}
          </button>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm transform rounded-2xl bg-white p-6 text-center shadow-2xl transition-all animate-fade-in">
            
            {/* Success Icon */}
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-7 w-7 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            {/* Message */}
            <h3 className="mb-2 text-lg font-semibold text-gray-800">
              Success
            </h3>

            <p className="text-sm text-gray-600">
              {modalMessage}
            </p>

            {/* Loading indicator */}
            <div className="mt-4 flex justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#5C6F9E] border-t-transparent"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VerifyOtpPage;
