import React from 'react';
import { Lucide } from 'lucide-react';

export default function Dashboard({ internships, feedbacks, removeInternship, onNewInternship, onView }) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Internships</h1>
        <button
          className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={onNewInternship}
        >
          New
        </button>
      </div>
      <ul className="space-y-2">
        {internships.map(i => (
          <li
            key={i.id}
            className="p-4 bg-white rounded shadow hover:bg-gray-100 cursor-pointer flex justify-between items-center"
            onClick={() => onView(i.id)}
          >
            <div>
              <div className="font-semibold">{i.title}</div>
              <div className="text-sm text-gray-600">{i.company}</div>
            </div>
            <button
              className="text-red-500 hover:text-red-700"
              onClick={e => {
                e.stopPropagation();
                removeInternship(i.id);
              }}
              title="Remove"
            >
              &times;
            </button>
          </li>
        ))}
      </ul>

      {/* feedback section stub, just to display earlier state */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Feedback</h2>
        <ul className="space-y-1">
          {feedbacks.map(f => (
            <li key={f.id} className="text-sm">
              {f.name}: {f.rating} – {f.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
