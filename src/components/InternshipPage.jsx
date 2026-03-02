import React, { useState } from 'react';

export default function InternshipPage({ internship, onBack }) {
  // dummy detail state
  const [dayIndex, setDayIndex] = useState(0);
  const days = internship?.details?.days || [];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="mb-4 text-blue-600 hover:underline"
      >
        &larr; Back to dashboard
      </button>

      {/* top actions */}
      <div className="flex space-x-4 mb-6">
        <button className="btn">Write comment</button>
        <button className="btn">Approve report</button>
        <button className="btn">Export PDF</button>
        <button className="btn">Check comments</button>
      </div>

      {/* main information */}
      <div className="space-y-4">
        <div>
          <span className="font-semibold">Tutor:</span> {internship.details.tutor}
        </div>

        <div>
          <span className="font-semibold">Day:</span>{' '}
          {days.length > 0 ? (
            <select
              value={dayIndex}
              onChange={e => setDayIndex(Number(e.target.value))}
              className="border rounded px-2 py-1"
            >
              {days.map((d, idx) => (
                <option key={idx} value={idx}>
                  Day {d.day} - {d.date}
                </option>
              ))}
            </select>
          ) : (
            'N/A'
          )}
        </div>

        <div>
          <span className="font-semibold">Description:</span>
          <p className="mt-1">
            {days[dayIndex]?.description || internship.details.description}
          </p>
        </div>

        <div>
          <span className="font-semibold">Photos:</span>
          {days[dayIndex]?.photos?.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {days[dayIndex].photos.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt={`photo-${idx}`}
                  className="w-full h-24 object-cover rounded"
                />
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 mt-1">No photos</div>
          )}
        </div>
      </div>
    </div>
  );
}
