import React, { useState, useEffect } from 'react';

const API_URL = 'https://siut-internship-35635e91d124.herokuapp.com';

export default function InternshipPage({ facultyId, onBack, user }) {
  const [faculty, setFaculty] = useState(null);
  const [dayIndex, setDayIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchFaculty();
  }, [facultyId]);

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/faculty/${facultyId}`);
      if (!response.ok) throw new Error('Failed to fetch faculty');
      const data = await response.json();
      setFaculty(data);
      setError('');
    } catch (err) {
      setError(err.message);
      console.error('Error fetching faculty:', err);
    } finally {
      setLoading(false);
    }
  };

  const days = faculty?.days || [];
  const currentDay = days[dayIndex];
  // Role-based access
  const canWriteReport = user?.role === 'Tutor' || user?.role === 'Admin';
  const canApprove = user?.role === 'Admin';
  const canExport = user?.role === 'Admin';
  const canViewComments = ['Admin', 'Rector', 'Professor'].includes(user?.role);

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <button onClick={onBack} className="mb-4 text-blue-600 hover:underline">
          ← Back to dashboard
        </button>
        <div className="text-center py-8">Loading faculty details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <button onClick={onBack} className="mb-4 text-blue-600 hover:underline">
          ← Back to dashboard
        </button>
        <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>
      </div>
    );
  }

  if (!faculty) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <button onClick={onBack} className="mb-4 text-blue-600 hover:underline">
          ← Back to dashboard
        </button>
        <div className="text-center py-8">Faculty not found</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button onClick={onBack} className="mb-4 text-blue-600 hover:underline">
        ← Back to dashboard
      </button>

      <div className="mb-6 p-4 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-2">{faculty.name}</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="font-semibold">Company:</span> {faculty.company}</div>
          <div><span className="font-semibold">Location:</span> {faculty.location}</div>
          <div><span className="font-semibold">Duration:</span> {faculty.duration}</div>
          <div><span className="font-semibold">Status:</span> {faculty.status}</div>
          <div><span className="font-semibold">Plan:</span> {faculty.plan}</div>
          <div><span className="font-semibold">Progress:</span> {faculty.progressAll}</div>
          {faculty.tutorID && <div className="col-span-2"><span className="font-semibold">Tutor ID:</span> {faculty.tutorID}</div>}
        </div>
      </div>

      {/* top actions */}
      <div className="flex flex-wrap gap-2 mb-6">
        {canWriteReport && (
          <button className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => alert('Write report clicked!')}>Write report</button>
        )}
        {canApprove && (
          <button className="py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700" onClick={() => alert('Report approved!')}>Approve report</button>
        )}
        {canExport && (
          <button className="py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700" onClick={() => window.print()}>Export PDF</button>
        )}
        {canViewComments && (
          <button className="py-2 px-4 bg-orange-600 text-white rounded hover:bg-orange-700" onClick={() => alert('Comments section')}>View comments</button>
        )}
      </div>

      {/* Days navigation */}
      {days.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <label className="font-semibold">Select Day:</label>
            <select
              value={dayIndex}
              onChange={e => setDayIndex(Number(e.target.value))}
              className="border rounded px-3 py-2"
            >
              {days.map((d, idx) => (
                <option key={idx} value={idx}>
                  Day {d.dayNumber} - {d.date || 'No date'}
                </option>
              ))}
            </select>
            <button
              className="py-1 px-3 bg-gray-200 rounded disabled:opacity-50"
              disabled={dayIndex === 0}
              onClick={() => setDayIndex(dayIndex - 1)}
            >
              ← Previous
            </button>
            <button
              className="py-1 px-3 bg-gray-200 rounded disabled:opacity-50"
              disabled={dayIndex === days.length - 1}
              onClick={() => setDayIndex(dayIndex + 1)}
            >
              Next →
            </button>
          </div>

          {currentDay && (
            <div className="p-4 bg-gray-50 rounded space-y-4">
              <div>
                <span className="font-semibold">Day {currentDay.dayNumber} - {currentDay.date || 'No date'}</span>
                <div className="text-sm text-gray-600 mt-1">Approved: {currentDay.approved ? '✓' : '✗'}</div>
              </div>

              {currentDay.shortReport && (
                <div className="p-3 bg-white rounded border">
                  <h4 className="font-semibold mb-2">Report: {currentDay.shortReport.title || 'Untitled'}</h4>
                  <p className="text-sm text-gray-700">{currentDay.shortReport.description}</p>
                  {currentDay.shortReport.images && currentDay.shortReport.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {currentDay.shortReport.images.map((img, idx) => (
                        <img key={idx} src={img} alt={`report-${idx}`} className="w-full h-24 object-cover rounded" />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {currentDay.comments && currentDay.comments.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Comments ({currentDay.comments.length})</h4>
                  <div className="space-y-2">
                    {currentDay.comments.map((comment, idx) => (
                      <div key={idx} className="p-2 bg-white rounded border text-sm">
                        {comment}
                      </div>
                    ))}
                  </div>
                  {canWriteReport && (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 border rounded px-2 py-1 text-sm"
                      />
                      <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                        Post
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500">No days recorded for this faculty</div>
      )}
    </div>
  );
}
