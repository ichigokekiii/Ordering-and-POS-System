/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(null);   // null = not shown
  const [isLocked, setIsLocked] = useState(false);          // permanent lock
  const [countdown, setCountdown] = useState(0);            // seconds remaining in cooldown
  const timerRef = useRef(null);

  const navigate = useNavigate();

  // Live countdown ticker
  useEffect(() => {
    if (countdown <= 0) {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setError("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [countdown]);

  const formatCountdown = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (countdown > 0 || isLocked) return;

    setError("");
    setAttemptsLeft(null);

    try {
      const res = await api.post("/login", { email, password });

      const loggedInUser = res.data.user || res.data;

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      try {
        await api.post("/resend-otp", { email });
      } catch (otpErr) {
        console.warn("OTP sending failed", otpErr);
      }

      localStorage.setItem("pendingUser", JSON.stringify(loggedInUser));
      navigate("/verify-otp", { state: { email } });
    } catch (err) {
      const data = err.response?.data;
      const status = err.response?.status;

      if (status === 423 || data?.locked) {
        // Permanent account lock
        setIsLocked(true);
        setError(data?.message || "Your account has been locked. Please contact an administrator.");
        setAttemptsLeft(null);
      } else if (status === 429 || data?.cooldown) {
        // Temporary cooldown — start countdown timer
        const secs = data?.remaining_seconds ?? 120;
        setCountdown(secs);
        setAttemptsLeft(null);
        setError("");
      } else if (status === 401) {
        // Wrong credentials — show attempts remaining if provided
        setError("Invalid email or password.");
        if (data?.attempts_left !== undefined) {
          setAttemptsLeft(data.attempts_left);
        }
      } else {
        setError(data?.message || "Invalid credentials.");
      }
    }
  };

  const isCoolingDown = countdown > 0;
  const formDisabled = isCoolingDown || isLocked;

  return (
    <div className="mx-auto max-w-sm px-8 pt-28 pb-32">
      <h2 className="mb-6 text-2xl font-semibold">Login</h2>

      {/* Permanent lock banner */}
      {isLocked && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          🔒 <strong>Account Locked.</strong> Your account has been locked due to too many failed login attempts.
          Please contact an administrator to restore access.
        </div>
      )}

      {/* Cooldown banner */}
      {isCoolingDown && (
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold">Too many failed attempts.</p>
          <p>
            Please wait{" "}
            <span className="font-mono font-bold text-amber-900">
              {formatCountdown(countdown)}
            </span>{" "}
            before trying again.
          </p>
        </div>
      )}

      {/* Normal error */}
      {error && !isLocked && !isCoolingDown && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          <p>{error}</p>
          {attemptsLeft !== null && (
            <p className="mt-1 font-semibold">
              ⚠️ {attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} remaining before lockout.
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className={`w-full rounded border px-4 py-2 transition ${formDisabled ? "bg-gray-100 cursor-not-allowed opacity-60" : ""}`}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={formDisabled}
        />

        <input
          type="password"
          className={`w-full rounded border px-4 py-2 transition ${formDisabled ? "bg-gray-100 cursor-not-allowed opacity-60" : ""}`}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={formDisabled}
        />

        <button
          disabled={formDisabled}
          className={`w-full rounded py-2 text-white transition font-medium ${
            formDisabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#4f6fa5] hover:bg-[#3f5b89]"
          }`}
        >
          {isCoolingDown ? `Wait ${formatCountdown(countdown)}` : "Login"}
        </button>
      </form>

      {/* Register link */}
      <p className="mt-4 text-center text-sm">
        Don't have an account?{" "}
        <Link to="/register" className="text-[#4f6fa5] hover:underline">
          Register
        </Link>
      </p>

      {/* Forgot Password link */}
      <p className="mt-2 text-center text-sm">
        <Link to="/forgot-password" className="text-[#4f6fa5] hover:underline">
          Forgot Password?
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;

