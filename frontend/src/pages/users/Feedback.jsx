import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import FormFieldHeader from "../../components/form/FormFieldHeader";
import { getValidationInputClassName } from "../../components/form/fieldStyles";
import { FEEDBACK_MAX_LENGTH, validateFeedbackText } from "../../utils/authValidation";
import { normalizeApiValidationErrors } from "../../utils/formValidation";

function Feedback() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [rating, setRating]   = useState(0);
  const [hovered, setHovered] = useState(0);
  const [text, setText]       = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ feedback_rating: '', feedback_text: '' });
  const [formError, setFormError]     = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextFieldErrors = {
      feedback_rating: !rating ? 'A rating is required.' : '',
      feedback_text: validateFeedbackText(text),
    };

    setFieldErrors(nextFieldErrors);
    setFormError('');

    if (Object.values(nextFieldErrors).some(Boolean)) return;

    setLoading(true);

    try {
      await api.post('/feedbacks', {
        feedback_rating: rating,
        feedback_text: text.trim(),
      });
      setSubmitted(true);
      setTimeout(() => navigate('/'), 2500);
    } catch (err) {
      const normalizedError = normalizeApiValidationErrors(err);
      setFieldErrors((prev) => ({ ...prev, ...normalizedError.fieldErrors }));
      setFormError(normalizedError.formError || 'Failed to submit feedback.');
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
              <FormFieldHeader
                label="How would you rate your experience?"
                required
                error={fieldErrors.feedback_rating}
                hint="Tap a star to leave your rating"
                className="mb-2"
              />
              <div className="flex gap-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setRating(i + 1);
                      setFieldErrors((prev) => ({ ...prev, feedback_rating: '' }));
                    }}
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
              <FormFieldHeader
                label="Tell us more!"
                required
                error={fieldErrors.feedback_text}
                hint="What did you love? What could we do better?"
                count={text.length}
                max={FEEDBACK_MAX_LENGTH}
                className="mb-2"
              />
              <textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value.slice(0, FEEDBACK_MAX_LENGTH));
                  setFieldErrors((prev) => ({ ...prev, feedback_text: '' }));
                  setFormError('');
                }}
                placeholder="e.g. The flowers were amazing and the staff was so friendly..."
                maxLength={FEEDBACK_MAX_LENGTH}
                className={getValidationInputClassName({
                  hasError: !!fieldErrors.feedback_text,
                  baseClassName:
                    "w-full p-3 border rounded-xl resize-none h-32 text-sm focus:outline-none focus:ring-2",
                  validClassName: "border-gray-200 bg-white focus:border-blue-300 focus:ring-blue-200",
                  invalidClassName: "border-rose-400 bg-rose-50 focus:border-rose-500 focus:ring-rose-100",
                })}
              />
            </div>

            {formError && <p className="text-red-500 text-sm">{formError}</p>}

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
