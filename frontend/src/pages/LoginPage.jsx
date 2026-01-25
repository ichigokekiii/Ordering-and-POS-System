import { useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/login", { email, password });
      onLogin(res.data);
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <>

      <div className="mx-auto max-w-sm px-8 py-20">
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

          <button className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700">
            Login
          </button>
        </form>
        <p
          className="mt-4 cursor-pointer text-center text-sm text-blue-600 hover:underline"
          onClick={() => window.setPage("register")}
        >
          Don’t have an account? Register
        </p>

      </div>
    </>
  );
}

export default LoginPage;
