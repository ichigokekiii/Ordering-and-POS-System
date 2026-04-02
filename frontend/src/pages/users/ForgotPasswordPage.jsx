import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { Loader2 } from "lucide-react";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/forgot-password", { email });

      navigate("/verify-otp", {
        state: { email, purpose: "reset-password" }
      });

    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-10 pb-4">
      <div className="w-full max-w-4xl min-h-[520px] md:min-h-[600px] bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT PANEL - Image Placeholder */}
        <div className="hidden md:flex w-1/2 relative overflow-hidden bg-gray-200">
          <div className="absolute top-0 left-0 w-full h-full opacity-50">
            <svg className="absolute w-[400px] h-[400px] text-[#b3d4ff] -top-20 -left-20" fill="currentColor" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50"></circle></svg>
            <svg className="absolute w-[300px] h-[300px] text-[#cce3ff] bottom-10 -right-20" fill="currentColor" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50"></circle></svg>
          </div>
          
          {/* TODO: Replace with CMS-managed image (currently using local placeholder from /public/placeholder.jpg) */}
          <img 
            src="/placeholder.jpg"
            alt="Forgot Password"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="z-10 mt-8 text-center px-4">
            <h3 className="text-xl font-bold text-[#2a4365] mb-2">Account Recovery</h3>
            <p className="text-sm text-[#4a6b9a]">Enter your email and we'll help you get back into your account safely.</p>
          </div>
        </div>

        {/* RIGHT PANEL - Form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 sm:px-12 py-10 relative z-10 bg-white">
          

          <h2 className="text-3xl font-bold mb-4 text-gray-800 tracking-tight">Forgot Password</h2>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            Please enter your registered email address. We'll send you a 6-digit OTP to verify your identity.
          </p>

          {error && <p className="mb-6 text-sm text-red-500 bg-red-50 py-3 px-4 rounded-lg border border-red-100">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="email"
              className="w-full rounded-xl border border-gray-300 px-4 py-3.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f6fa5] focus:border-transparent transition-all shadow-sm"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />

            <button
              disabled={loading}
              className="w-full rounded-xl bg-[#4f6fa5] py-3.5 text-white font-semibold hover:bg-[#3f5b89] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              Send OTP
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-[#4f6fa5] font-semibold hover:underline inline-flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Back to Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;