import { useState } from "react";
import api from "../../services/api";

function RegisterPage({ onRegister }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/register", {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      });

      onRegister(res.data);

    } catch (err) {
      console.log("Full error:", err.response);
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="mx-auto max-w-sm px-8 py-20">
      <h2 className="mb-6 text-2xl font-semibold">Create Account</h2>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full rounded border px-4 py-2"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />

        <input
          className="w-full rounded border px-4 py-2"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />

        <input
          type="email"
          className="w-full rounded border px-4 py-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          className="w-full rounded border px-4 py-2"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700">
          Register
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;
