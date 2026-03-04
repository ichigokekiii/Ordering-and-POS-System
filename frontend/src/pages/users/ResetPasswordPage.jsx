import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }

    try {
      await api.post("/reset-password", {
        email,
        password
      });

      alert("Password updated successfully");

      navigate("/login");

    } catch {
      alert("Failed to reset password");
    }
  };

  return (
    <div className="mx-auto max-w-sm px-8 pt-28 pb-32">
      <h2 className="mb-6 text-2xl font-semibold">Reset Password</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          className="w-full rounded border px-4 py-2"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          className="w-full rounded border px-4 py-2"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <button className="w-full rounded bg-[#4f6fa5] py-2 text-white">
          Reset Password
        </button>
      </form>
    </div>
  );
}

export default ResetPasswordPage;