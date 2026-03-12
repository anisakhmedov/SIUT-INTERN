import React, { useState } from 'react';

const API_URL = 'https://siut-internship-35635e91d124.herokuapp.com';

export default function CreatePage({ onSubmit, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    duration: '',
    plan: '',
    company: '',
    progressAll: '',
    status: 'Active',
    tutorID: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.location || !formData.duration || !formData.plan || !formData.company) {
      setError('Please fill all required fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/faculty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to create faculty');
      const newFaculty = await response.json();
      if (onSubmit) onSubmit(newFaculty);
    } catch (err) {
      setError(err.message);
      console.error('Create faculty error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">New Faculty</h2>
      {error && <div className="p-3 mb-4 bg-red-100 text-red-700 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-semibold">Name *</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">Company *</label>
          <input
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="mt-1 block w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">Location *</label>
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="mt-1 block w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">Duration *</label>
          <input
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            className="mt-1 block w-full border rounded px-3 py-2"
            placeholder="e.g., 3 months"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">Plan *</label>
          <input
            name="plan"
            value={formData.plan}
            onChange={handleChange}
            className="mt-1 block w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">Progress</label>
          <input
            name="progressAll"
            value={formData.progressAll}
            onChange={handleChange}
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full border rounded px-3 py-2"
          >
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">Tutor ID</label>
          <input
            name="tutorID"
            value={formData.tutorID}
            onChange={handleChange}
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="py-2 px-4 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
