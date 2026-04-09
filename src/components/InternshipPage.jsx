import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

const API_URL = 'http://localhost:7777'; // Change this to your actual API URL

export default function InternshipPage({ facultyId, onBack, user }) {
  const [faculty, setFaculty] = useState(null);
  const [dayIndex, setDayIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportImages, setReportImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showFeedbackView, setShowFeedbackView] = useState(false);
  const [isEditingReport, setIsEditingReport] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // 0-100 for progress tracking
  const [showAddDayModal, setShowAddDayModal] = useState(false);
  const [newDayDate, setNewDayDate] = useState(new Date().toISOString().slice(0, 10));
  const commentsSectionRef = useRef(null);
  const feedbackTimeoutRef = useRef(null);

  const fetchFaculty = useCallback(async () => {
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
  }, [facultyId]);

  useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

  const clearActionFeedback = useCallback(() => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = setTimeout(() => {
      setActionMessage('');
      setActionError('');
      feedbackTimeoutRef.current = null;
    }, 4000);
  }, []);

  const getDayId = useCallback((day) => {
    if (!day) return null;
    return day._id ?? day.id ?? null;
  }, []);

  const extractImageUrls = useCallback((day) => {
    if (!day) return [];

    const sourceImages = Array.isArray(day.images)
      ? day.images
      : (Array.isArray(day.shortReport?.images) ? day.shortReport.images : []);

    return sourceImages
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item.url === 'string') return item.url;
        return null;
      })
      .filter(Boolean);
  }, []);

  const days = faculty?.days || [];
  const currentDay = days[dayIndex];
  const currentDayImageUrls = useMemo(() => extractImageUrls(currentDay), [extractImageUrls, currentDay]);
  const currentDayCommentsCount = currentDay?.comments?.length || 0;
  const currentDayStatusLabel = currentDay
    ? (currentDay.shortReport ? (currentDay.approved ? 'Reported and approved' : 'Reported, pending review') : 'No report yet')
    : 'No day selected';
  const canWriteReport = user?.role === 'Tutor' || user?.role === 'Admin';
  const canApprove = user?.role === 'Admin';
  const canExport = user?.role === 'Admin';

  const updateDay = useCallback(async (day, payload, index = null) => {
    const dayId = getDayId(day) ?? (index != null ? String(index) : null);
    if (dayId == null) {
      setActionError('Day could not be identified. Try refreshing.');
      clearActionFeedback();
      return;
    }
    setSubmitting(true);
    setActionError('');
    setActionMessage('');
    try {
      const res = await fetch(`${API_URL}/faculty/${facultyId}/days/${dayId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Update failed');
      await fetchFaculty(); // Refresh the data
      setActionMessage('Saved.');
      clearActionFeedback();
    } catch (err) {
      setActionError(err.message || 'Something went wrong.');
      clearActionFeedback();
    } finally {
      setSubmitting(false);
    }
  }, [facultyId, getDayId, fetchFaculty, clearActionFeedback]);

  const handleWriteReportOpen = useCallback(() => {
    if (currentDay?.shortReport) {
      setReportTitle(currentDay.shortReport.title || '');
      setReportDescription(currentDay.shortReport.description || '');
      setIsEditingReport(true);
    } else {
      setReportTitle('');
      setReportDescription('');
      setIsEditingReport(false);
    }
    setReportImages([]);
    setImagePreviews([]);
    setShowReportForm(true);
  }, [currentDay]);

  const handleReportSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!currentDay) return;
    
    setSubmitting(true);
    setActionError('');
    setActionMessage('');
    setUploadProgress(0);
    
    try {
      const dayId = getDayId(currentDay);
      if (!dayId) throw new Error('Day could not be identified. Try refreshing.');

      const existingImageUrls = extractImageUrls(currentDay);

      const extractShortReportImageUrls = (day) => {
        const shortReportImages = Array.isArray(day?.shortReport?.images) ? day.shortReport.images : [];
        return shortReportImages
          .map((item) => {
            if (typeof item === 'string') return item;
            if (item && typeof item.url === 'string') return item.url;
            return null;
          })
          .filter(Boolean);
      };

      let uploadedUrls = [];

      // Step 1: Upload images in one multipart/form-data request
      if (reportImages && reportImages.length > 0) {
        const imageFormData = new FormData();

        // Recommended field: append every file under "images"
        reportImages.forEach((file) => {
          imageFormData.append('images', file);
        });

        // Backward compatibility: also send first file under "image"
        imageFormData.append('image', reportImages[0]);

        const uploadRes = await fetch(
          `${API_URL}/faculty/${facultyId}/days/${dayId}/images`,
          {
            method: 'POST',
            body: imageFormData,
          }
        );

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error(errorData.message || 'Failed to upload image(s).');
        }

        const uploadedData = await uploadRes.json();
        const responseUrls = [];

        if (Array.isArray(uploadedData?.images)) {
          uploadedData.images.forEach((item) => {
            if (typeof item === 'string') responseUrls.push(item);
            else if (item?.url) responseUrls.push(item.url);
          });
        }

        if (uploadedData?.image?.url) responseUrls.push(uploadedData.image.url);

        uploadedUrls = Array.from(new Set(responseUrls.filter(Boolean)));
        if (uploadedUrls.length === 0) {
          throw new Error('Upload succeeded but image URL is missing in response.');
        }
        setUploadProgress(100);

        // Step 2: Immediate verification via GET /faculty/:id
        const verifyAfterUploadRes = await fetch(`${API_URL}/faculty/${facultyId}`);
        if (!verifyAfterUploadRes.ok) throw new Error('Failed to verify uploaded image state.');
        const verifyAfterUploadFaculty = await verifyAfterUploadRes.json();
        const verifyDay = (verifyAfterUploadFaculty?.days || []).find((d) => (d?._id ?? d?.id ?? null) === dayId);
        if (!verifyDay) throw new Error('Uploaded image verification failed: day not found.');

        const shortReportUrlsAfterUpload = extractShortReportImageUrls(verifyDay);
        const hasUploadedUrlsInShortReport = uploadedUrls.every((url) => shortReportUrlsAfterUpload.includes(url));
        if (!hasUploadedUrlsInShortReport) {
          throw new Error('Uploaded image URL was not found in shortReport.images after upload.');
        }
      }

      const finalImageUrls = uploadedUrls.length > 0
        ? Array.from(new Set([...existingImageUrls, ...uploadedUrls]))
        : existingImageUrls;
      
      // Step 2: Create/update report with image URLs
      setActionMessage(`Uploading report (${reportImages.length} image${reportImages.length !== 1 ? 's' : ''} uploaded)...`);
      
      const reportPayload = {
        ...currentDay,
        images: finalImageUrls,
        shortReport: {
          title: reportTitle.trim() || 'Report',
          description: reportDescription.trim() || '',
          images: finalImageUrls,
          date: new Date().toISOString(),
        },
      };
      
      const method = isEditingReport ? 'PATCH' : 'POST';
      const endpoint = isEditingReport 
        ? `${API_URL}/faculty/${facultyId}/days/${dayId}`
        : `${API_URL}/faculty/${facultyId}/days/${dayId}/report`;
      
      const reportRes = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportPayload),
      });

      if (!reportRes.ok) {
        const errorData = await reportRes.json();
        throw new Error(errorData.message || `Failed to ${isEditingReport ? 'update' : 'submit'} report`);
      }

      // Step 3: Verify images remain after normal update flow
      if (uploadedUrls.length > 0) {
        const verifyAfterUpdateRes = await fetch(`${API_URL}/faculty/${facultyId}`);
        if (!verifyAfterUpdateRes.ok) throw new Error('Failed to verify images after report update.');
        const verifyAfterUpdateFaculty = await verifyAfterUpdateRes.json();
        const verifyDayAfterUpdate = (verifyAfterUpdateFaculty?.days || []).find((d) => (d?._id ?? d?.id ?? null) === dayId);
        if (!verifyDayAfterUpdate) throw new Error('Post-update verification failed: day not found.');

        const urlsAfterUpdate = extractImageUrls(verifyDayAfterUpdate);
        const allUploadedUrlsRemain = uploadedUrls.every((url) => urlsAfterUpdate.includes(url));
        if (!allUploadedUrlsRemain) {
          throw new Error('Image was uploaded but did not remain after report update.');
        }
      }

      await fetchFaculty(); // Refresh the data
      setActionMessage(`Report ${isEditingReport ? 'updated' : 'created'} with ${finalImageUrls.length} image(s).`);
      clearActionFeedback();
      setShowReportForm(false);
      setIsEditingReport(false);
      
      // Reset form fields
      setReportTitle('');
      setReportDescription('');
      setReportImages([]);
      setImagePreviews([]);
      setUploadProgress(0);
    } catch (err) {
      setActionError(err.message || 'Something went wrong.');
      clearActionFeedback();
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  }, [currentDay, reportTitle, reportDescription, reportImages, facultyId, getDayId, fetchFaculty, clearActionFeedback, isEditingReport, extractImageUrls]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    
    const newValidImages = files.filter(file => {
      if (!validImageTypes.includes(file.type)) {
        alert(`${file.name} is not a valid image file. Only JPEG, PNG, WebP and GIF are allowed.`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert(`${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      return true;
    });
    
    setReportImages(prev => [...prev, ...newValidImages]);
    
    // Create previews for the new images
    newValidImages.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreviews(prev => [...prev, { id: file.lastModified, src: reader.result, name: file.name }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (imageId) => {
    setReportImages(prev => prev.filter(img => img.lastModified !== imageId));
    setImagePreviews(prev => prev.filter(img => img.id !== imageId));
  };

  const handleApprove = useCallback(async () => {
    if (!currentDay) return;
    await updateDay(currentDay, { ...currentDay, approved: true }, dayIndex);
  }, [currentDay, updateDay, dayIndex]);

  const handlePostComment = useCallback(async (e) => {
    e.preventDefault();
    const text = newComment.trim();
    if (!text || !currentDay || !user) return;
    
    const newCommentObj = {
      text: text,
      date: new Date().toISOString(),
      userID: user.id || user._id || 'unknown'
    };
    
    const comments = [...(currentDay.comments || []), newCommentObj];
    await updateDay(currentDay, { ...currentDay, comments }, dayIndex);
    setNewComment('');
  }, [currentDay, newComment, updateDay, dayIndex, user]);

  const handleAddDayClick = useCallback(() => {
    setNewDayDate(new Date().toISOString().slice(0, 10));
    setShowAddDayModal(true);
  }, []);

  const handleAddDayConfirm = useCallback(async () => {
    setSubmitting(true);
    setActionError('');
    setActionMessage('');
    try {
      const newDay = {
        dayNumber: String((days.length || 0) + 1),
        date: newDayDate,
        approved: false,
        shortReport: null,
        comments: [],
      };
      const res = await fetch(`${API_URL}/faculty/${facultyId}/days`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDay),
      });
      if (!res.ok) throw new Error('Failed to add day');
      await fetchFaculty(); // Refresh the data
      setDayIndex(days.length);
      setActionMessage('Day added.');
      clearActionFeedback();
      setShowAddDayModal(false);
      setNewDayDate(new Date().toISOString().slice(0, 10));
    } catch (err) {
      setActionError(err.message || 'Failed to add day.');
      clearActionFeedback();
    } finally {
      setSubmitting(false);
    }
  }, [facultyId, days.length, newDayDate, fetchFaculty, clearActionFeedback]);

  const allComments = useMemo(() => {
    if (!faculty || !faculty.days) return [];
    return faculty.days.flatMap((day, index) => 
      (day.comments || []).map(comment => ({
        text: comment.text || comment,
        date: comment.date,
        userID: comment.userID,
        commentID: comment._id,
        dayIndex: index,
        dayNumber: day.dayNumber
      }))
    );
  }, [faculty]);

  const navigateToDay = useCallback((dayIndex) => {
    setDayIndex(dayIndex);
    setShowFeedbackView(false);
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="ip-page">
          <style>{ipStyles}</style>
          <div className="ip-shell">
            <button type="button" className="ip-back" onClick={onBack}>← Back to dashboard</button>
            <div className="ip-loading">Loading internship details…</div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="ip-page">
          <style>{ipStyles}</style>
          <div className="ip-shell">
            <button type="button" className="ip-back" onClick={onBack}>← Back to dashboard</button>
            <div className="ip-alert" role="alert">
              <span aria-hidden="true">⚠</span>
              <span>{error}</span>
            </div>
          </div>
        </div>
      );
    }

    if (!faculty) {
      return (
        <div className="ip-page">
          <style>{ipStyles}</style>
          <div className="ip-shell">
            <button type="button" className="ip-back" onClick={onBack}>← Back to dashboard</button>
            <div className="ip-empty">Internship not found.</div>
          </div>
        </div>
      );
    }

    return (
      <div className="ip-page">
        <style>{ipStyles}</style>
        <div className="ip-shell">
          <button type="button" className="ip-back" onClick={onBack}>
            ← Back to dashboard
          </button>

          <header className="ip-hero">
            <div className="ip-hero-top">
              <div className="ip-hero-copyblock">
                <span className="ip-eyebrow">Internship workspace</span>
                <h1 className="ip-hero-title">{faculty.name}</h1>
                <p className="ip-hero-copy">
                  Review daily progress, attach evidence, and keep the approval trail clear for everyone involved.
                </p>
              </div>
              <div className="ip-hero-statuslist" aria-label="Current internship status">
                <span className="ip-status-pill">{currentDay ? `Day ${currentDay.dayNumber}` : 'No day selected'}</span>
                <span className={`ip-status-pill ${currentDay?.approved ? 'ip-status-pill--ok' : 'ip-status-pill--warn'}`}>
                  {currentDay?.approved ? 'Approved' : 'Pending review'}
                </span>
                <span className="ip-status-pill">{canWriteReport ? 'Editable' : 'Read only'}</span>
              </div>
            </div>

            <div className="ip-hero-grid">
              <div className="ip-hero-item">
                <span className="ip-hero-label">Company</span>
                <span className="ip-hero-value">{faculty.company}</span>
              </div>
              <div className="ip-hero-item">
                <span className="ip-hero-label">Location</span>
                <span className="ip-hero-value">{faculty.location}</span>
              </div>
              <div className="ip-hero-item">
                <span className="ip-hero-label">Duration</span>
                <span className="ip-hero-value">{faculty.duration}</span>
              </div>
              <div className="ip-hero-item">
                <span className="ip-hero-label">Plan</span>
                <span className="ip-hero-value">{faculty.plan}</span>
              </div>
              <div className="ip-hero-item">
                <span className="ip-hero-label">Status</span>
                <span className="ip-hero-value">{faculty.status}</span>
              </div>
              {faculty.progressAll != null && (
                <div className="ip-hero-item">
                  <span className="ip-hero-label">Progress</span>
                  <span className="ip-hero-value">{faculty.progressAll}</span>
                </div>
              )}
            </div>

            <div className="ip-hero-summary" aria-label="Current day summary">
              <div className="ip-summary-card">
                <span className="ip-summary-label">Current day</span>
                <strong className="ip-summary-value">{currentDay ? `Day ${currentDay.dayNumber}` : 'None selected'}</strong>
              </div>
              <div className="ip-summary-card">
                <span className="ip-summary-label">Evidence</span>
                <strong className="ip-summary-value">{currentDayImageUrls.length}</strong>
              </div>
              <div className="ip-summary-card">
                <span className="ip-summary-label">Comments</span>
                <strong className="ip-summary-value">{currentDayCommentsCount}</strong>
              </div>
              <div className="ip-summary-card ip-summary-card--wide">
                <span className="ip-summary-label">Review state</span>
                <strong className="ip-summary-value">{currentDayStatusLabel}</strong>
              </div>
            </div>
          </header>

          {(actionMessage || actionError) && (
            <div className={actionError ? 'ip-alert' : 'ip-success'} style={{ marginBottom: 16 }}>
              <span aria-hidden="true">{actionError ? '⚠' : '✓'}</span>
              <span>{actionError || actionMessage}</span>
            </div>
          )}
          <div className="ip-actions">
            {canWriteReport && (
              <button
                type="button"
                className="ip-btn ip-btn--primary"
                disabled={!currentDay || submitting}
                onClick={handleWriteReportOpen}
              >
                Write report
              </button>
            )}
            {canApprove && (
              <button
                type="button"
                className="ip-btn ip-btn--primary"
                disabled={!currentDay || submitting || currentDay?.approved}
                onClick={handleApprove}
              >
                Approve report
              </button>
            )}
            {canExport && (
              <button type="button" className="ip-btn ip-btn--primary" onClick={() => window.print()}>
                Export PDF
              </button>
            )}
          </div>

          {showReportForm && currentDay && (
            <div className="ip-report-form-card">
              <div className="ip-report-form-header">
                <h4 className="ip-report-form-title">{isEditingReport ? 'Edit report' : 'Write report'} — Day {currentDay.dayNumber}</h4>
                <button 
                  type="button" 
                  className="ip-close-btn"
                  onClick={() => {
                    setShowReportForm(false);
                    // Reset form fields when cancelling
                    setReportTitle('');
                    setReportDescription('');
                    setReportImages([]);
                    setImagePreviews([]);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleReportSubmit} className="ip-report-form ip-report-form-wrapper">
                <div className="ip-form-section">
                  <div className="ip-field">
                    <label className="ip-label" htmlFor="ip-report-title">Title</label>
                    <input
                      id="ip-report-title"
                      type="text"
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                      className="ip-input"
                      placeholder="Report title"
                      required
                    />
                  </div>
                </div>

                <div className="ip-form-divider"></div>
                
                <div className="ip-form-section">
                  <div className="ip-field">
                    <label className="ip-label" htmlFor="ip-report-desc">Description</label>
                    <textarea
                      id="ip-report-desc"
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      className="ip-input ip-textarea"
                      placeholder="What was done today?"
                      rows={5}
                      required
                    />
                  </div>
                </div>

                <div className="ip-form-divider"></div>
                
                <div className="ip-form-section">
                  <label className="ip-label" htmlFor="ip-report-images">Attachments</label>
                  <div className="ip-image-upload-container">
                    <label htmlFor="ip-report-images" className="ip-image-upload-area">
                      <input
                        id="ip-report-images"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="ip-image-input"
                      />
                      <div className="ip-upload-content">
                        <div className="ip-upload-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                          </svg>
                        </div>
                        <p className="ip-upload-text">Click to upload or drag and drop</p>
                        <p className="ip-upload-hint">SVG, PNG, JPG, GIF (max. 5MB)</p>
                      </div>
                    </label>
                    
                    {/* Preview of selected images */}
                    {imagePreviews.length > 0 && (
                      <div className="ip-image-previews-grid">
                        {imagePreviews.map((preview) => (
                          <div key={preview.id} className="ip-image-preview-item">
                            <img src={preview.src} alt={preview.name} className="ip-image-preview" />
                            <button 
                              type="button" 
                              className="ip-remove-image-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(preview.id);
                              }}
                              aria-label="Remove image"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="ip-form-actions">
                  {submitting && reportImages.length > 0 && uploadProgress > 0 && (
                    <div className="ip-progress-bar">
                      <div className="ip-progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  )}
                  <button 
                    type="button" 
                    className="ip-btn ip-btn--secondary"
                    onClick={() => {
                      setShowReportForm(false);
                      // Reset form fields when cancelling
                      setReportTitle('');
                      setReportDescription('');
                      setReportImages([]);
                      setImagePreviews([]);
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="ip-btn ip-btn--primary" 
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="ip-spinner"></span>
                        {reportImages.length > 0 && uploadProgress > 0 && uploadProgress < 100 
                          ? `Uploading (${uploadProgress}%)`
                          : (isEditingReport ? 'Updating…' : 'Saving…')
                        }
                      </>
                    ) : (isEditingReport ? 'Update Report' : 'Save Report')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {days.length > 0 ? (
            <div className="ip-days">
              <div className="ip-day-carousel-wrapper">
                <button
                  type="button"
                  className="ip-carousel-btn ip-carousel-btn--prev"
                  disabled={dayIndex === 0}
                  onClick={() => setDayIndex(Math.max(0, dayIndex - 1))}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                
                <div className="ip-carousel">
                  <div className="ip-carousel-track" style={{ transform: `translateX(calc(-${dayIndex} * (100% + 16px)))` }}>
                    {days.map((day, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`ip-carousel-item ${dayIndex === idx ? 'ip-carousel-item--active' : ''}`}
                        onClick={() => setDayIndex(idx)}
                      >
                        <span className="ip-carousel-day-number">Day {day.dayNumber}</span>
                        <span className="ip-carousel-day-date">{day.date || 'No date'}</span>
                        {day.approved && (
                          <span className="ip-carousel-approved-badge">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Approved
                          </span>
                        )}
                      </button>
                    ))}
                    
                    {canWriteReport && (
                      <button
                        type="button"
                        className="ip-carousel-add-day"
                        onClick={handleAddDayClick}
                        disabled={submitting}
                        title="Add a new internship day"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span className="ip-carousel-add-day-text">Add day</span>
                      </button>
                    )}
                  </div>
                </div>
                
                <button
                  type="button"
                  className="ip-carousel-btn ip-carousel-btn--next"
                  disabled={dayIndex >= days.length - 1 && !canWriteReport}
                  onClick={() => setDayIndex(Math.min(days.length, dayIndex + 1))}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>

              {currentDay && (
                <div className="ip-day-card">
                  <div className="ip-day-header">
                    <div>
                      <span className="ip-day-title">Day {currentDay.dayNumber}</span>
                      <div className="ip-day-subtitle">{currentDay.date || 'No date'}</div>
                    </div>
                    <span className={`ip-day-badge ${currentDay.approved ? 'ip-day-badge--ok' : 'ip-day-badge--pending'}`}>
                      {currentDay.approved ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                          Approved
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                          Pending
                        </>
                      )}
                    </span>
                  </div>

                  {currentDay.shortReport && (
                    <div className="ip-report">
                      <h4 className="ip-report-title">{currentDay.shortReport.title || 'Untitled'}</h4>
                      <p className="ip-report-desc">{currentDay.shortReport.description}</p>
                      {currentDayImageUrls.length > 0 && (
                        <div className="ip-report-images">
                          {currentDayImageUrls.map((img, idx) => (
                            <img key={idx} src={img} alt={`Report ${idx + 1}`} className="ip-report-img" />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {(currentDay.comments?.length > 0 || canWriteReport) && (
                    <div className="ip-comments" ref={commentsSectionRef}>
                      <h4 className="ip-comments-title">Comments ({currentDay.comments?.length || 0})</h4>
                      {currentDay.comments && currentDay.comments.length > 0 && (
                        <ul className="ip-comments-list">
                          {currentDay.comments.map((comment, idx) => {
                            const user = typeof comment.userID === 'object' ? comment.userID : null;
                            const userName = user ? `${user.name} ${user.surname}` : 'Unknown User';
                            const userRole = user ? user.role : '';
                            return (
                              <li key={comment._id || idx} className="ip-comment">
                                <div className="ip-comment-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', fontSize: '12px', color: 'var(--t3, #9ba3bb)' }}>
                                  <div>
                                    <div style={{ fontWeight: 600, color: 'var(--t1, #0c0e18)', marginBottom: '4px' }}>{userName} {userRole && <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--a1, #635bff)' }}>({userRole})</span>}</div>
                                    <div>{new Date(comment.date).toLocaleDateString()} {new Date(comment.date).toLocaleTimeString()}</div>
                                  </div>
                                </div>
                                <p style={{ margin: 0 }}>{comment.text}</p>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                      {canWriteReport && (
                        <form className="ip-comment-form" onSubmit={handlePostComment}>
                          <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment…"
                            className="ip-input"
                          />
                          <button type="submit" className="ip-btn ip-btn--primary" disabled={submitting || !newComment.trim()}>
                            Post
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="ip-empty-card">
              <p style={{ margin: '0 0 16px 0' }}>No days recorded for this internship yet.</p>
              {canWriteReport && (
                <button
                  type="button"
                  className="ip-btn ip-btn--primary"
                  disabled={submitting}
                  onClick={handleAddDayClick}
                >
                  {submitting ? 'Adding…' : 'Add first day'}
                </button>
              )}
            </div>
          )}
          
          {showFeedbackView && (
            <div className="ip-feedback-view">
              <div className="ip-feedback-header">
                <h3 className="ip-feedback-title">All Comments</h3>
                <button 
                  type="button" 
                  className="ip-btn ip-btn--secondary"
                  onClick={() => setShowFeedbackView(false)}
                >
                  Back to Days
                </button>
              </div>
              
              {allComments.length > 0 ? (
                <ul className="ip-comments-list">
                  {allComments.map((comment, idx) => {
                    const user = typeof comment.userID === 'object' ? comment.userID : null;
                    const userName = user ? `${user.name} ${user.surname}` : 'Unknown User';
                    const userRole = user ? user.role : '';
                    return (
                      <li key={comment.commentID || idx} className="ip-comment">
                        <div className="ip-comment-header">
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, color: 'var(--t1, #0c0e18)', marginBottom: '4px' }}>{userName} {userRole && <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--a1, #635bff)' }}>({userRole})</span>}</div>
                            <span className="ip-comment-day">Day {comment.dayNumber} • {new Date(comment.date).toLocaleDateString()} {new Date(comment.date).toLocaleTimeString()}</span>
                          </div>
                          <button 
                            type="button" 
                            className="ip-comment-navigate-btn"
                            onClick={() => navigateToDay(comment.dayIndex)}
                          >
                            Go to day
                          </button>
                        </div>
                        <p className="ip-comment-text">{comment.text}</p>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="ip-empty-state">No comments found</div>
              )}
            </div>
          )}

          {showAddDayModal && (
            <div className="ip-modal-overlay" onClick={() => setShowAddDayModal(false)}>
              <div className="ip-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="ip-modal-header">
                  <h3 className="ip-modal-title">Add New Day</h3>
                  <button 
                    type="button" 
                    className="ip-close-btn"
                    onClick={() => setShowAddDayModal(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <div className="ip-modal-body">
                  <label className="ip-label" htmlFor="new-day-date">Select date for the new day</label>
                  <input
                    id="new-day-date"
                    type="date"
                    value={newDayDate}
                    onChange={(e) => setNewDayDate(e.target.value)}
                    className="ip-input ip-date-input"
                  />
                </div>
                <div className="ip-modal-footer">
                  <button 
                    type="button" 
                    className="ip-btn ip-btn--secondary"
                    onClick={() => setShowAddDayModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="ip-btn ip-btn--primary"
                    onClick={handleAddDayConfirm}
                    disabled={submitting}
                  >
                    {submitting ? 'Adding…' : 'Add Day'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  };

  return renderContent();
}

const ipStyles = `
  .ip-page {
    min-height: calc(100vh - 64px);
    padding: clamp(16px, 3vw, 44px);
    background:
      radial-gradient(1200px 600px at 10% 0%, rgba(99,91,255,.12), transparent 60%),
      radial-gradient(900px 520px at 90% 10%, rgba(6,201,160,.10), transparent 55%),
      linear-gradient(180deg, rgba(241,244,250,.92), rgba(255,255,255,1));
  }
  .ip-shell { width: 100%; max-width: 880px; margin: 0 auto; }
  .ip-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(99,91,255,.08);
    color: var(--a1, #635bff);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: .08em;
    text-transform: uppercase;
  }
  .ip-back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 20px;
    padding: 8px 0;
    border: none;
    background: none;
    color: var(--a1, #635bff);
    font-family: 'Epilogue', system-ui, sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: color .2s ease;
  }
  .ip-back:hover { color: var(--a2, #06c9a0); }
  .ip-loading, .ip-empty {
    background: rgba(255,255,255,.92);
    border: 1px solid rgba(0,0,0,.08);
    border-radius: 22px;
    padding: 56px 24px;
    text-align: center;
    color: var(--t2, #5a6278);
    font-size: 15px;
    box-shadow: 0 18px 50px rgba(99,91,255,.10);
  }
  .ip-alert {
    display: flex;
    align-items: center;
    gap: 10px;
    border-radius: 14px;
    border: 1px solid rgba(255,0,0,.18);
    background: rgba(255,0,0,.05);
    color: #8a1f1f;
    padding: 14px 16px;
    font-size: 13px;
  }
  .ip-success {
    display: flex;
    align-items: center;
    gap: 10px;
    border-radius: 14px;
    border: 1px solid rgba(6,201,160,.3);
    background: rgba(6,201,160,.08);
    color: #047857;
    padding: 14px 16px;
    font-size: 13px;
  }
  .ip-report-form-card {
    background: rgba(255,255,255,.92);
    border: 1px solid rgba(0,0,0,.08);
    border-radius: 22px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 18px 50px rgba(99,91,255,.10);
    backdrop-filter: blur(18px);
  }
  .ip-report-form-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--t1, #0c0e18);
    margin: 0 0 16px 0;
  }
  .ip-field { margin-bottom: 14px; }
  .ip-label {
    display: block;
    font-size: 12px;
    font-weight: 700;
    color: var(--t2, #5a6278);
    margin-bottom: 6px;
  }
  .ip-form-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid rgba(99,91,255,.1);
    justify-content: flex-end;
    flex-wrap: wrap;
    width: 100%;
  }
  .ip-form-actions .ip-progress-bar {
    width: 100%;
    flex-basis: 100%;
    margin: 0 0 12px 0;
  }
  .ip-hero {
    position: relative;
    overflow: hidden;
    background: linear-gradient(180deg, rgba(255,255,255,.96), rgba(255,255,255,.84));
    border: 1px solid rgba(0,0,0,.08);
    border-radius: 24px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 18px 60px rgba(99,91,255,.10);
    backdrop-filter: blur(18px);
  }
  .ip-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(600px 220px at 10% 0%, rgba(99,91,255,.10), transparent 60%);
    pointer-events: none;
  }
  .ip-hero-top,
  .ip-hero-summary {
    position: relative;
    z-index: 1;
  }
  .ip-hero-top {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    align-items: flex-start;
    margin-bottom: 20px;
  }
  .ip-hero-copyblock { max-width: 560px; }
  .ip-hero-copy {
    margin: 12px 0 0;
    color: var(--t2, #5a6278);
    font-size: 14px;
    line-height: 1.6;
  }
  .ip-hero-statuslist {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;
  }
  .ip-status-pill {
    display: inline-flex;
    align-items: center;
    min-height: 32px;
    padding: 0 12px;
    border-radius: 999px;
    background: rgba(99,91,255,.08);
    color: var(--a1, #635bff);
    border: 1px solid rgba(99,91,255,.12);
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
  }
  .ip-status-pill--ok { background: rgba(6,201,160,.10); color: #047857; border-color: rgba(6,201,160,.18); }
  .ip-status-pill--warn { background: rgba(245,166,35,.12); color: #b45309; border-color: rgba(245,166,35,.18); }
  .ip-hero-title {
    font-family: 'Syne', system-ui, sans-serif;
    font-size: clamp(24px, 4vw, 36px);
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--t1, #0c0e18);
    margin: 0;
  }
  .ip-hero-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px 18px;
    position: relative;
    z-index: 1;
  }
  .ip-hero-item {
    min-height: 76px;
    padding: 16px;
    border-radius: 16px;
    background: rgba(248,250,255,.92);
    border: 1px solid rgba(99,91,255,.08);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.8);
  }
  .ip-hero-item--full { grid-column: 1 / -1; }
  .ip-hero-label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .05em;
    color: var(--t3, #9ba3bb);
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .ip-hero-value { font-size: 14px; color: var(--t1, #0c0e18); }
  .ip-hero-summary {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-top: 18px;
  }
  .ip-summary-card {
    padding: 14px 16px;
    border-radius: 16px;
    background: rgba(248,250,255,.95);
    border: 1px solid rgba(99,91,255,.08);
  }
  .ip-summary-card--wide { grid-column: span 2; }
  .ip-summary-label {
    display: block;
    margin-bottom: 6px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: var(--t3, #9ba3bb);
  }
  .ip-summary-value {
    display: block;
    color: var(--t1, #0c0e18);
    font-size: 14px;
    line-height: 1.35;
  }
  .ip-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 24px;
    position: sticky;
    top: 12px;
    z-index: 5;
    padding: 12px;
    border-radius: 18px;
    background: rgba(255,255,255,.72);
    border: 1px solid rgba(0,0,0,.06);
    backdrop-filter: blur(18px);
  }
  .ip-btn {
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
  }
  .ip-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }
  .ip-btn--primary {
    border: 1px solid rgba(99,91,255,.18);
    background: linear-gradient(135deg, var(--a1, #635bff), var(--a2, #06c9a0));
    color: #fff;
    box-shadow: 0 10px 30px rgba(99,91,255,.25);
  }
  .ip-btn--primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 16px 44px rgba(99,91,255,.30);
  }
  .ip-btn--secondary {
    border: 1px solid rgba(0,0,0,.12);
    background: rgba(255,255,255,.8);
    color: var(--t1, #0c0e18);
  }
  .ip-btn--secondary:hover:not(:disabled) { background: rgba(0,0,0,.04); }
  .ip-days { margin-bottom: 24px; }
  .ip-day-nav {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }
  .ip-day-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--t2, #5a6278);
  }
  .ip-select {
    padding: 10px 14px;
    border-radius: 12px;
    border: 1.5px solid rgba(0,0,0,.10);
    background: rgba(0,0,0,.03);
    color: var(--t1, #0c0e18);
    font-family: 'Epilogue', system-ui, sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color .2s ease, box-shadow .2s ease;
  }
  .ip-select:focus {
    border-color: rgba(99,91,255,.55);
    box-shadow: 0 0 0 4px rgba(99,91,255,.14);
  }
  .ip-day-btns { display: flex; gap: 8px; }
  .ip-day-card {
    background: rgba(255,255,255,.94);
    border: 1px solid rgba(0,0,0,.08);
    border-radius: 22px;
    padding: 24px;
    box-shadow: 0 18px 50px rgba(99,91,255,.10);
    backdrop-filter: blur(18px);
  }
  .ip-day-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(0,0,0,.06);
  }
  .ip-day-title {
    font-family: 'Syne', system-ui, sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: var(--t1, #0c0e18);
  }
  .ip-day-subtitle {
    margin-top: 4px;
    font-size: 12px;
    color: var(--t3, #9ba3bb);
  }
  .ip-day-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    padding: 7px 14px;
    border-radius: 10px;
    transition: all .2s cubic-bezier(0.34, 1.56, 0.64, 1);
    white-space: nowrap;
  }
  .ip-day-badge svg {
    flex-shrink: 0;
  }
  .ip-day-badge--ok {
    background: linear-gradient(135deg, rgba(6,201,160,.12), rgba(6,201,160,.06));
    color: #047857;
    border: 1px solid rgba(6,201,160,.3);
    box-shadow: inset 0 1px 2px rgba(6,201,160,.1), 0 2px 6px rgba(6,201,160,.08);
  }
  .ip-day-badge--ok:hover {
    background: linear-gradient(135deg, rgba(6,201,160,.15), rgba(6,201,160,.08));
    border-color: rgba(6,201,160,.5);
    box-shadow: inset 0 1px 2px rgba(6,201,160,.1), 0 4px 12px rgba(6,201,160,.12);
    transform: translateY(-1px);
  }
  .ip-day-badge--pending {
    background: linear-gradient(135deg, rgba(245,166,35,.12), rgba(245,166,35,.06));
    color: #b45309;
    border: 1px solid rgba(245,166,35,.3);
    box-shadow: inset 0 1px 2px rgba(245,166,35,.1), 0 2px 6px rgba(245,166,35,.08);
  }
  .ip-day-badge--pending:hover {
    background: linear-gradient(135deg, rgba(245,166,35,.15), rgba(245,166,35,.08));
    border-color: rgba(245,166,35,.5);
    box-shadow: inset 0 1px 2px rgba(245,166,35,.1), 0 4px 12px rgba(245,166,35,.12);
    transform: translateY(-1px);
  }
  .ip-day-badge--pending svg {
    animation: pulse-info 2s ease-in-out infinite;
  }
  @keyframes pulse-info {
    0%, 100% { opacity: 1; }
    50% { opacity: .6; }
  }
  .ip-report {
    margin-bottom: 20px;
    padding: 18px;
    background: linear-gradient(180deg, rgba(99,91,255,.05), rgba(6,201,160,.03));
    border-radius: 14px;
    border: 1px solid rgba(0,0,0,.06);
  }
  .ip-report-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--t1, #0c0e18);
    margin: 0 0 8px 0;
  }
  .ip-report-desc { font-size: 14px; color: var(--t2, #5a6278); margin: 0; line-height: 1.5; }
  .ip-report-images {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
    margin-top: 14px;
  }
  .ip-report-img {
    width: 100%;
    height: 100px;
    object-fit: cover;
    border-radius: 10px;
    border: 1px solid rgba(0,0,0,.08);
  }
  .ip-comments { margin-top: 20px; }
  .ip-comments-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--t1, #0c0e18);
    margin: 0 0 12px 0;
  }
  .ip-comments-list { list-style: none; margin: 0; padding: 0; }
  .ip-comment {
    padding: 14px 16px;
    background: rgba(255,255,255,.95);
    border: 1px solid rgba(0,0,0,.06);
    border-radius: 16px;
    font-size: 13px;
    color: var(--t2, #5a6278);
    margin-bottom: 8px;
    box-shadow: 0 8px 24px rgba(15,23,42,.04);
  }
  .ip-comment-form {
    display: flex;
    gap: 10px;
    margin-top: 14px;
    align-items: stretch;
  }
  .ip-input {
    padding: 12px 14px;
    border-radius: 14px;
    border: 1.5px solid rgba(0,0,0,.08);
    background: linear-gradient(135deg, rgba(99,91,255,.02), rgba(255,255,255,.8));
    color: var(--t1, #0c0e18);
    font-family: 'Epilogue', system-ui, sans-serif;
    font-size: 14px;
    outline: none;
    transition: all .25s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-sizing: border-box;
    width: 100%;
  }
  .ip-comment-form .ip-input {
    flex: 1;
  }
  .ip-input::placeholder { color: rgba(90,98,120,.5); }
  .ip-input:focus {
    border-color: rgba(99,91,255,.45);
    box-shadow: 0 0 0 5px rgba(99,91,255,.08), inset 0 0 0 1px rgba(99,91,255,.1);
    background: linear-gradient(135deg, rgba(99,91,255,.04), rgba(255,255,255,.95));
  }
  .ip-input:hover:not(:focus) {
    border-color: rgba(99,91,255,.2);
  }
  .ip-empty-card {
    background: rgba(255,255,255,.92);
    border: 1px solid rgba(0,0,0,.08);
    border-radius: 22px;
    padding: 44px 24px;
    text-align: center;
    color: var(--t2, #5a6278);
    font-size: 14px;
    box-shadow: 0 18px 50px rgba(99,91,255,.10);
  }
  .ip-image-upload-container { margin-top: 12px; }
  .ip-image-upload-area {
    display: block;
    position: relative;
    border: 2px dashed rgba(99,91,255,.25);
    border-radius: 14px;
    padding: 28px 24px;
    text-align: center;
    cursor: pointer;
    background: linear-gradient(135deg, rgba(99,91,255,.04), rgba(6,201,160,.02));
    transition: all .3s cubic-bezier(0.34, 1.56, 0.64, 1);
    overflow: hidden;
  }
  .ip-image-upload-area:hover {
    border-color: rgba(99,91,255,.4);
    background: linear-gradient(135deg, rgba(99,91,255,.08), rgba(6,201,160,.05));
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(99,91,255,.12);
  }
  .ip-image-input { display: none; }
  .ip-upload-content {
    pointer-events: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .ip-upload-icon {
    font-size: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, rgba(99,91,255,.15), rgba(6,201,160,.08));
    border-radius: 10px;
    margin: 0 auto 6px auto;
    color: var(--a1, #635bff);
  }
  .ip-upload-text {
    margin: 0;
    color: var(--a1, #635bff);
    font-weight: 600;
    font-size: 14px;
  }
  .ip-upload-hint {
    margin: 0;
    color: var(--t3, #9ba3bb);
    font-size: 12px;
  }
  .ip-image-previews-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
    margin-top: 16px;
  }
  .ip-image-preview-item {
    position: relative;
    border-radius: 10px;
    overflow: hidden;
    background: rgba(0,0,0,.05);
    border: 1px solid rgba(0,0,0,.08);
    aspect-ratio: 1;
    transition: all .2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .ip-image-preview-item:hover {
    box-shadow: 0 6px 18px rgba(99,91,255,.12);
    transform: translateY(-2px) scale(1.03);
  }
  .ip-image-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .ip-remove-image-btn {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,.95);
    border: 1px solid rgba(0,0,0,.12);
    border-radius: 8px;
    cursor: pointer;
    color: #ef4444;
    padding: 0;
    transition: all .2s cubic-bezier(0.34, 1.56, 0.64, 1);
    opacity: 0;
    box-shadow: 0 2px 8px rgba(0,0,0,.1);
  }
  .ip-image-preview-item:hover .ip-remove-image-btn {
    opacity: 1;
  }
  .ip-remove-image-btn:hover {
    background: #ef4444;
    color: #fff;
    transform: scale(1.15);
    box-shadow: 0 4px 12px rgba(239, 68, 68, .3);
  }
  .ip-report-form-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  .ip-close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--t2, #5a6278);
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: all .2s ease;
  }
  .ip-close-btn:hover {
    background: rgba(0,0,0,.05);
    color: var(--t1, #0c0e18);
  }
  .ip-report-form-wrapper {
    max-width: 560px;
    margin: 0 auto;
  }
  .ip-report-form {
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .ip-form-section {
    padding: 20px 0;
  }
  .ip-form-section:first-child {
    padding-top: 0;
  }
  .ip-form-section:last-child {
    padding-bottom: 0;
  }
  .ip-form-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(99,91,255,.15), transparent);
    margin: 0;
  }
  .ip-textarea {
    resize: vertical;
    font-family: 'Epilogue', system-ui, sans-serif;
    min-height: 140px;
  }
  .ip-spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255,255,255,.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin .8s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .ip-feedback-view {
    background: rgba(255,255,255,.86);
    border: 1px solid rgba(0,0,0,.08);
    border-radius: 18px;
    padding: 24px;
    box-shadow: 0 14px 44px rgba(99,91,255,.10);
  }
  .ip-feedback-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
    padding-bottom: 14px;
    border-bottom: 1px solid rgba(0,0,0,.06);
  }
  .ip-feedback-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--t1, #0c0e18);
    margin: 0;
  }
  .ip-comment-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
  }
  .ip-comment-day {
    font-size: 12px;
    font-weight: 600;
    color: var(--t3, #9ba3bb);
  }
  .ip-comment-navigate-btn {
    padding: 4px 10px;
    border-radius: 8px;
    border: 1px solid rgba(99,91,255,.2);
    background: rgba(99,91,255,.08);
    color: var(--a1, #635bff);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all .2s ease;
  }
  .ip-comment-navigate-btn:hover {
    background: rgba(99,91,255,.15);
    border-color: rgba(99,91,255,.4);
  }
  .ip-comment-text { margin: 0; }
  .ip-empty-state {
    text-align: center;
    color: var(--t3, #9ba3bb);
    font-size: 14px;
    padding: 24px;
  }
  .ip-day-carousel-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
  }
  .ip-carousel-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: 1px solid rgba(99,91,255,.2);
    background: rgba(99,91,255,.08);
    border-radius: 10px;
    cursor: pointer;
    color: var(--a1, #635bff);
    transition: all .2s ease;
    padding: 0;
    flex-shrink: 0;
  }
  .ip-carousel-btn:hover:not(:disabled) {
    background: rgba(99,91,255,.15);
    border-color: rgba(99,91,255,.4);
    transform: scale(1.05);
  }
  .ip-carousel-btn:disabled {
    opacity: .4;
    cursor: not-allowed;
  }
  .ip-carousel {
    flex: 1;
    overflow: hidden;
    border-radius: 14px;
    background: rgba(255,255,255,.4);
    padding: 8px;
  }
  .ip-carousel-track {
    display: flex;
    gap: 16px;
    transition: transform .4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .ip-carousel-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 12px 16px;
    border-radius: 12px;
    border: 1.5px solid rgba(99,91,255,.1);
    background: rgba(255,255,255,.7);
    cursor: pointer;
    transition: all .3s cubic-bezier(0.34, 1.56, 0.64, 1);
    min-width: 100%;
    max-width: 100%;
    text-align: center;
    position: relative;
    flex: 0 0 100%;
  }
  .ip-carousel-item:hover {
    border-color: rgba(99,91,255,.3);
    background: rgba(255,255,255,.95);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(99,91,255,.1);
  }
  .ip-carousel-item--active {
    border-color: rgba(99,91,255,.5);
    background: linear-gradient(135deg, rgba(99,91,255,.12), rgba(6,201,160,.08));
    box-shadow: 0 8px 24px rgba(99,91,255,.15);
  }
  .ip-carousel-day-number {
    font-size: 13px;
    font-weight: 700;
    color: var(--a1, #635bff);
  }
  .ip-carousel-day-date {
    font-size: 11px;
    color: var(--t3, #9ba3bb);
  }
  .ip-carousel-approved-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-size: 10px;
    font-weight: 700;
    background: linear-gradient(135deg, rgba(6,201,160,.15), rgba(6,201,160,.08));
    color: #047857;
    padding: 4px 8px;
    border-radius: 6px;
    border: 1px solid rgba(6,201,160,.25);
    margin-top: 4px;
    white-space: nowrap;
    box-shadow: 0 2px 4px rgba(6,201,160,.08);
    transition: all .2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .ip-carousel-item:hover .ip-carousel-approved-badge {
    background: linear-gradient(135deg, rgba(6,201,160,.2), rgba(6,201,160,.12));
    border-color: rgba(6,201,160,.4);
    box-shadow: 0 4px 8px rgba(6,201,160,.12);
  }
  .ip-carousel-item--active .ip-carousel-approved-badge {
    background: linear-gradient(135deg, rgba(6,201,160,.25), rgba(6,201,160,.15));
    border-color: rgba(6,201,160,.5);
    box-shadow: 0 4px 12px rgba(6,201,160,.15);
  }
  .ip-carousel-add-day {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 16px;
    border-radius: 12px;
    border: 2px dashed rgba(99,91,255,.25);
    background: linear-gradient(135deg, rgba(99,91,255,.06), rgba(6,201,160,.03));
    cursor: pointer;
    transition: all .3s cubic-bezier(0.34, 1.56, 0.64, 1);
    min-width: 100%;
    max-width: 100%;
    text-align: center;
    position: relative;
    flex: 0 0 100%;
    color: var(--a1, #635bff);
    font-size: 13px;
    font-weight: 600;
  }
  .ip-carousel-add-day:hover:not(:disabled) {
    border-color: rgba(99,91,255,.4);
    background: linear-gradient(135deg, rgba(99,91,255,.1), rgba(6,201,160,.06));
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(99,91,255,.15);
  }
  .ip-carousel-add-day:disabled {
    opacity: .5;
    cursor: not-allowed;
  }
  .ip-carousel-add-day svg {
    width: 20px;
    height: 20px;
    color: var(--a1, #635bff);
  }
  .ip-carousel-add-day-text {
    font-size: 12px;
    font-weight: 600;
    color: var(--a1, #635bff);
  }
  .ip-progress-bar {
    width: 100%;
    height: 6px;
    background: rgba(0,0,0,.08);
    border-radius: 999px;
    overflow: hidden;
    margin-top: 12px;
  }
  .ip-progress-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--a1, #635bff), var(--a2, #06c9a0));
    border-radius: 999px;
    transition: width .3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 0 10px rgba(99,91,255,.3);
  }
  .ip-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn .2s ease;
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .ip-modal-content {
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    max-width: 400px;
    width: 90%;
    animation: slideUp .3s cubic-bezier(0.34, 1.56, 0.64, 1);
    overflow: hidden;
  }
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .ip-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }
  .ip-modal-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--t1, #0c0e18);
    margin: 0;
  }
  .ip-modal-body {
    padding: 24px 20px;
  }
  .ip-modal-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding: 16px 20px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
  }
  .ip-date-input {
    width: 100%;
    padding: 12px 14px;
    border-radius: 12px;
    border: 1.5px solid rgba(0, 0, 0, 0.08);
    background: linear-gradient(135deg, rgba(99, 91, 255, 0.02), rgba(255, 255, 255, 0.8));
    color: var(--t1, #0c0e18);
    font-family: 'Epilogue', system-ui, sans-serif;
    font-size: 14px;
    margin-top: 8px;
    box-sizing: border-box;
    outline: none;
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .ip-date-input:focus {
    border-color: rgba(99, 91, 255, 0.45);
    box-shadow: 0 0 0 5px rgba(99, 91, 255, 0.08), inset 0 0 0 1px rgba(99, 91, 255, 0.1);
    background: linear-gradient(135deg, rgba(99, 91, 255, 0.04), rgba(255, 255, 255, 0.95));
  }
  .ip-date-input:hover:not(:focus) {
    border-color: rgba(99, 91, 255, 0.2);
  }
  @media (min-width: 640px) {
    .ip-hero-title { font-size: 32px; }
    .ip-hero { padding: 28px; }
    .ip-hero-grid { grid-template-columns: repeat(3, 1fr); }
    .ip-hero-item--full { grid-column: 1 / -1; }
    .ip-image-previews-grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); }
  }
  @media (max-width: 760px) {
    .ip-hero-top { flex-direction: column; }
    .ip-hero-statuslist { justify-content: flex-start; }
    .ip-hero-summary { grid-template-columns: 1fr 1fr; }
    .ip-summary-card--wide { grid-column: 1 / -1; }
    .ip-actions { position: static; }
    .ip-comment-form { flex-direction: column; }
  }
`;