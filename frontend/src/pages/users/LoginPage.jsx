/* eslint-disable no-unused-vars */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/login", { email, password });

      const loggedInUser = res.data.user || res.data;

      // Store Sanctum token if returned
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      // Trigger OTP sending for login verification
      try {
        await api.post("/resend-otp", { email });
      } catch (otpErr) {
        console.warn("OTP sending failed", otpErr);
      }

      // Temporarily store user so we can finish login after OTP verification
      localStorage.setItem("pendingUser", JSON.stringify(loggedInUser));

      // Redirect to OTP page
      navigate("/verify-otp", { state: { email } });
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="mx-auto max-w-sm px-8 pt-28 pb-32">
      <h2 className="mb-6 text-2xl font-semibold">Login</h2>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full rounded border px-4 py-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full rounded border px-4 py-2"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full rounded bg-[#4f6fa5] py-2 text-white hover:bg-[#3f5b89] transition">
          Login
        </button>
      </form>

      {/* Register link */}
      <p className="mt-4 text-center text-sm">
        Don’t have an account?{" "}
        <Link
          to="/register"
          className="text-[#4f6fa5] hover:underline"
        >
          Register
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;
