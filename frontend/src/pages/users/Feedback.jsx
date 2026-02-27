import React, { useState } from 'react';

function Feedback() {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);

  const submit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setComments((c) => [{ id: Date.now(), text: comment.trim() }, ...c]);
    setComment('');
  };

  return (
    <div className="min-h-screen flex items-start justify-center p-6 bg-gray-50">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Feedback</h2>

        <form onSubmit={submit} className="mb-4">
          <label className="sr-only">Comment</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your comment..."
            className="w-full p-3 border rounded resize-none h-28 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <div className="mt-3 text-right">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
              disabled={!comment.trim()}
            >
              Submit
            </button>
          </div>
        </form>

        <div>
          <h3 className="text-sm font-medium mb-2">Comments</h3>
          {comments.length === 0 ? (
            <div className="text-sm text-gray-500">No comments yet.</div>
          ) : (
            <ul className="space-y-3">
              {comments.map((c) => (
                <li key={c.id} className="p-3 border rounded bg-gray-50 text-sm">
                  {c.text}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Feedback;
