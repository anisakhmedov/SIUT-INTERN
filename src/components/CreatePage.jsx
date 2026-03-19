import React, { useState, useEffect } from 'react';
import { Search, X, Plus } from 'lucide-react';

const API_URL = 'https://siut-internship-35635e91d124.herokuapp.com';

export default function CreatePage({ onSubmit, onCancel, students = [] }) { // Accept students as prop
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    location: '',
    duration: '',
    status: 'Active',
    plan: '',
    startDate: '',
    endDate: '',
    tutorID: '',
    days: []
  });

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // This will now be used to filter the displayed students
  const [error, setError] = useState('');

  // Filter students based on search term
  const filteredStudents = students.filter(student => 
    (student.name && student.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (student.surname && student.surname.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (student.lastname && student.lastname.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (student.nameFaculty && student.nameFaculty.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Filter out already selected students from the filtered list
  const unselectedStudents = filteredStudents.filter(student => 
    !selectedStudents.some(selected => selected._id === student._id)
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Prepare the payload
      const payload = {
        ...formData,
        students: selectedStudents.map(s => ({
          _id: s._id,
          name: s.name,
          surname: s.surname,
          lastname: s.lastname,
          nameFaculty: s.nameFaculty
        }))
      };

      // Submit to the API
      const response = await fetch(`${API_URL}/faculty`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create internship');
      }

      const newFaculty = await response.json();
      onSubmit(newFaculty);
    } catch (err) {
      setError(err.message);
      console.error('Error creating internship:', err);
    }
  };

  const addStudent = (student) => {
    // Add to selected students
    setSelectedStudents(prev => [...prev, student]);
    // Clear search term after adding a student
    setSearchTerm('');
  };

  const removeStudent = (studentId) => {
    setSelectedStudents(prev => prev.filter(s => s._id !== studentId));
  };

  return (
    <div className="create-page">
      <style>{`
        .create-page {
          min-height: calc(100vh - 64px);
          padding: clamp(16px, 3vw, 44px);
          background:
            radial-gradient(1200px 600px at 10% 0%, rgba(99,91,255,.10), transparent 60%),
            radial-gradient(900px 520px at 90% 10%, rgba(6,201,160,.10), transparent 55%),
            linear-gradient(180deg, rgba(240,241,247,.65), rgba(255,255,255,1));
        }
        .create-shell {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 24px;
        }
        .create-main {
          width: 100%;
        }
        .create-sidebar {
          background: rgba(255,255,255,.86);
          border: 1px solid rgba(0,0,0,.08);
          border-radius: 18px;
          padding: 24px;
          height: fit-content;
          box-shadow: 0 14px 44px rgba(99,91,255,.10);
        }
        .create-card {
          background: rgba(255,255,255,.86);
          border: 1px solid rgba(0,0,0,.08);
          border-radius: 18px;
          padding: 28px;
          margin-bottom: 24px;
          box-shadow: 0 14px 44px rgba(99,91,255,.10);
        }
        .create-title {
          font-family: 'Syne', system-ui, sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: var(--t1, #0c0e18);
          margin: 0 0 24px 0;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .05em;
          color: var(--t3, #9ba3bb);
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .form-input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1.5px solid rgba(0,0,0,.10);
          background: rgba(0,0,0,.03);
          color: var(--t1, #0c0e18);
          font-family: 'Epilogue', system-ui, sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color .2s ease, box-shadow .2s ease;
          box-sizing: border-box;
        }
        .form-input:focus {
          border-color: var(--a1, #635bff);
          box-shadow: 0 0 0 4px rgba(99,91,255,.14);
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 12px;
          font-family: 'Epilogue', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: transform .15s ease, box-shadow .2s ease, background .2s ease, border-color .2s ease;
          border: none;
        }
        .btn-primary {
          border: 1px solid rgba(99,91,255,.18);
          background: linear-gradient(135deg, var(--a1, #635bff), var(--a2, #06c9a0));
          color: #fff;
          box-shadow: 0 10px 30px rgba(99,91,255,.25);
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 16px 44px rgba(99,91,255,.30);
        }
        .btn-secondary {
          border: 1px solid rgba(0,0,0,.12);
          background: rgba(255,255,255,.8);
          color: var(--t1, #0c0e18);
        }
        .btn-danger {
          border: 1px solid rgba(220, 38, 38, 0.2);
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }
        .btn:disabled { 
          opacity: .5; 
          cursor: not-allowed; 
          transform: none; 
        }
        .search-container {
          position: relative;
          margin-bottom: 16px;
        }
        .search-input {
          width: 100%;
          padding: 10px 14px 10px 40px;
          border-radius: 12px;
          border: 1.5px solid rgba(0,0,0,.10);
          background: rgba(0,0,0,.03);
          color: var(--t1, #0c0e18);
          font-family: 'Epilogue', system-ui, sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color .2s ease, box-shadow .2s ease;
          box-sizing: border-box;
        }
        .search-input:focus {
          border-color: var(--a1, #635bff);
          box-shadow: 0 0 0 4px rgba(99,91,255,.14);
        }
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--t3, #9ba3bb);
        }
        .student-list {
          max-height: 400px;
          overflow-y: auto;
          border: 1px solid rgba(0,0,0,.08);
          border-radius: 12px;
          background: rgba(0,0,0,.03);
        }
        .student-item {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(0,0,0,.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .student-item:last-child {
          border-bottom: none;
        }
        .student-info {
          flex: 1;
        }
        .student-name {
          font-weight: 600;
          color: var(--t1, #0c0e18);
          margin-bottom: 2px;
        }
        .student-details {
          font-size: 12px;
          color: var(--t2, #5a6278);
        }
        .add-btn {
          background: rgba(6,201,160,.1);
          color: #06c9a0;
          border: none;
          border-radius: 6px;
          padding: 6px 10px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
        }
        .add-btn:hover {
          background: rgba(6,201,160,.2);
        }
        .selected-students-list {
          margin-top: 16px;
        }
        .selected-student {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: rgba(99,91,255,.1);
          border-radius: 8px;
          margin-bottom: 8px;
          font-size: 13px;
        }
        .remove-btn {
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          padding: 4px;
        }
        .loading {
          text-align: center;
          padding: 10px;
          color: var(--t2, #5a6278);
          font-size: 13px;
        }
        .error {
          color: #ef4444;
          font-size: 13px;
          margin-top: 4px;
        }
        @media (max-width: 900px) {
          .create-shell {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="create-shell">
        <div className="create-main">
          <div className="create-card">
            <h1 className="create-title">Create New Internship</h1>
            
            {error && (
              <div className="error" style={{ 
                backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                padding: '12px', 
                borderRadius: '8px', 
                marginBottom: '16px',
                color: '#ef4444'
              }}>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Internship Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Upcoming">Upcoming</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Plan</label>
                <textarea
                  name="plan"
                  value={formData.plan}
                  onChange={handleChange}
                  className="form-input"
                  rows="4"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Tutor ID</label>
                <input
                  type="text"
                  name="tutorID"
                  value={formData.tutorID}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              
              <div className="form-group" style={{ marginTop: '30px' }}>
                <button type="submit" className="btn btn-primary">
                  Create Internship
                </button>
                <button type="button" onClick={onCancel} className="btn btn-secondary" style={{ marginLeft: '10px' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="create-sidebar">
          <h2 className="create-title" style={{ fontSize: '20px', marginBottom: '16px' }}>Add Students</h2>
          
          <div className="search-container">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Search students by name/faculty..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Show all students from API */}
          <div className="student-list">
            {unselectedStudents.length > 0 ? (
              unselectedStudents.map(student => (
                <div key={student._id} className="student-item">
                  <div className="student-info">
                    <div className="student-name">
                      {student.name} {student.surname} {student.lastname}
                    </div>
                    <div className="student-details">
                      Faculty: {student.nameFaculty}
                    </div>
                  </div>
                  <button 
                    className="add-btn" 
                    onClick={() => addStudent(student)}
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--t3, #9ba3bb)' }}>
                {searchTerm ? 'No students found' : 'No students available'}
              </div>
            )}
          </div>
          
          {selectedStudents.length > 0 && (
            <div className="selected-students-list">
              <h3 style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--t1, #0c0e18)' }}>
                Selected Students ({selectedStudents.length})
              </h3>
              {selectedStudents.map(student => (
                <div key={student._id} className="selected-student">
                  <span>
                    {student.name} {student.surname} {student.lastname} 
                    <small style={{ color: 'var(--t3, #9ba3bb)', marginLeft: '5px' }}>
                      ({student.nameFaculty})
                    </small>
                  </span>
                  <button 
                    className="remove-btn" 
                    onClick={() => removeStudent(student._id)}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}