import React, { useState, useEffect } from 'react';

const API_URL = 'https://siut-internship-35635e91d124.herokuapp.com';

export default function Dashboard({ onNewFaculty, onView, user }) {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/faculty`);
      if (!response.ok) throw new Error('Failed to fetch faculties');
      const data = await response.json();
      setFaculties(data);
      setError('');
    } catch (err) {
      setError(err.message);
      console.error('Error fetching faculties:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFaculty = async (id) => {
    if (!window.confirm('Are you sure you want to delete this faculty?')) return;
    try {
      const response = await fetch(`${API_URL}/faculty/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      setFaculties(faculties.filter(f => f._id !== id));
    } catch (err) {
      setError('Failed to delete faculty');
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Faculties</h1>
        <button
          className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={onNewFaculty}
        >
          New Faculty
        </button>
      </div>

      {error && <div className="p-4 mb-4 bg-red-100 text-red-700 rounded">{error}</div>}

      {loading ? (
        <div className="text-center py-8">Loading faculties...</div>
      ) : faculties.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No faculties found</div>
      ) : (
        <ul className="space-y-3">
          {faculties.map(faculty => (
            <li
              key={faculty._id}
              className="p-4 bg-white rounded shadow hover:bg-gray-50 cursor-pointer flex justify-between items-center"
              onClick={() => onView(faculty._id)}
            >
              <div className="flex-1">
                <div className="font-semibold">{faculty.name}</div>
                <div className="text-sm text-gray-600">{faculty.company} • {faculty.location}</div>
                <div className="text-xs text-gray-500 mt-1">Plan: {faculty.plan} • Status: {faculty.status}</div>
              </div>
              <button
                className="text-red-500 hover:text-red-700 ml-4"
                onClick={e => {
                  e.stopPropagation();
                  removeFaculty(faculty._id);
                }}
                title="Remove"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
