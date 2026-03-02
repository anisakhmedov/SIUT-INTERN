import React from 'react';

export default function CreatePage({ onSubmit, onCancel }) {
  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">New Internship</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">Title</label>
          <input
            name="title"
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-gray-700">Company</label>
          <input
            name="company"
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-gray-700">Dates</label>
          <input
            name="dates"
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-gray-700">Description</label>
          <textarea
            name="description"
            className="mt-1 block w-full border rounded px-3 py-2"
            rows={3}
          ></textarea>
        </div>
        <div>
          <label className="block text-gray-700">Role</label>
          <select
            name="role"
            className="mt-1 block w-full border rounded px-3 py-2"
          >
            <option value="">Select role</option>
            <option value="Intern">Intern</option>
            <option value="Mentor">Mentor</option>
            <option value="Tutee">Tutee</option>
          </select>
        </div>
        <div className="flex space-x-4">
          <button
            type="submit"
            className="py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Create
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
