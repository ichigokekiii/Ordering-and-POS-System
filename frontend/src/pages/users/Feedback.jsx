import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

function Feedback() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [rating, setRating]   = useState(0);
  const [hovered, setHovered] = useState(0);
  const [text, setText]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !text.trim()) return;

    setLoading(true);
    setError('');

    try {
      await api.post('/feedbacks', {
        feedback_rating: rating,
        feedback_text: text.trim(),
      });
      setSubmitted(true);
      setTimeout(() => navigate('/'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 relative">

      {/* Thank You Overlay */}
      {submitted && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="text-5xl mb-4">🎉💐</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank you for your feedback!</h2>
          <p className="text-gray-500 text-sm">Redirecting you to the homepage...</p>
        </div>
      )}

      <div className="w-full max-w-xl bg-white rounded-2xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Share Your Experience</h2>
        <p className="text-sm text-gray-500 mb-6">
          We'd love to hear what you think — your feedback helps us improve!
        </p>

        {user ? (
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Star Rating */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                How would you rate your experience?
              </label>
              <p className="text-xs text-gray-400 mb-2">Tap a star to leave your rating</p>
              <div className="flex gap-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1)}
                    onMouseEnter={() => setHovered(i + 1)}
                    onMouseLeave={() => setHovered(0)}
                    className="text-3xl transition-transform hover:scale-110 focus:outline-none"
                  >
                    <span className={(hovered || rating) > i ? 'text-yellow-400' : 'text-gray-200'}>
                      ★
                    </span>
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][rating]}
                </p>
              )}
            </div>

            {/* Feedback Text */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tell us more about your visit
              </label>
              <p className="text-xs text-gray-400 mb-2">
                What did you love? What could we do better?
              </p>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. The flowers were amazing and the staff was so friendly..."
                className="w-full p-3 border border-gray-200 rounded-xl resize-none h-32 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="text-right">
              <button
                type="submit"
                disabled={!rating || !text.trim() || loading}
                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>

          </form>
        ) : (
          <p className="text-sm text-gray-500">
            Please <a href="/login" className="text-blue-600 underline">log in</a> to leave feedback.
          </p>
        )}
      </div>
    </div>
  );
}

export default Feedback;