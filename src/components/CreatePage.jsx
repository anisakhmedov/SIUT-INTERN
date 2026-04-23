import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search, X, Plus, MapPinned, LocateFixed, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { get, post } from '../utils/apiClient';
import { toast } from '../utils/toast';

const YANDEX_MAPS_API_KEY = import.meta.env.VITE_YANDEX_MAPS_API_KEY || '0c6b088f-d754-40c6-93a9-86a33b9f28ea';
const YANDEX_MAPS_SRC = YANDEX_MAPS_API_KEY
  ? `https://api-maps.yandex.ru/2.1/?lang=en_US&apikey=${YANDEX_MAPS_API_KEY}`
  : 'https://api-maps.yandex.ru/2.1/?lang=en_US';
const DEFAULT_MAP_CENTER = [41.3775, 69.1824]; // Center of Uzbekistan (Tashkent)

function formatCoordsLocation(coords) {
  const lat = Number(Number(coords[0]).toFixed(6));
  const lng = Number(Number(coords[1]).toFixed(6));
  return {
    label: `Selected point [${lat}, ${lng}]`,
    fullAddress: `Selected point [${lat}, ${lng}]`,
    street: '',
    city: '',
    country: '',
    coords: [lat, lng],
  };
}

function CustomDateRangePicker({ startDate, endDate, onChange, daysCount }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(startDate || new Date()));
  const [popupPosition, setPopupPosition] = useState('bottom');
  const pickerRef = useRef(null);
  const inputRef = useRef(null);
  const popupRef = useRef(null);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const dateToString = (date) => {
    return date.toISOString().split('T')[0];
  };

  const isDateInRange = (date) => {
    if (!startDate || !endDate) return false;
    const d = new Date(dateToString(date));
    const s = new Date(startDate + 'T00:00:00');
    const e = new Date(endDate + 'T00:00:00');
    return d >= s && d <= e;
  };

  const isDateSelected = (date) => {
    const dateStr = dateToString(date);
    return dateStr === startDate || dateStr === endDate;
  };

  const handleDateClick = (day) => {
    const selectedDate = dateToString(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));

    if (!startDate || (startDate && endDate)) {
      onChange({ startDate: selectedDate, endDate: '' });
    } else {
      const start = new Date(startDate + 'T00:00:00');
      const selected = new Date(selectedDate + 'T00:00:00');

      if (selected < start) {
        onChange({ startDate: selectedDate, endDate: startDate });
      } else {
        onChange({ startDate, endDate: selectedDate });
      }
      setIsOpen(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="cdrp-day-empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isSelected = isDateSelected(date);
      const isInRange = isDateInRange(date);

      days.push(
        <button
          key={day}
          type="button"
          className={`cdrp-day ${isSelected ? 'cdrp-day--selected' : ''} ${isInRange ? 'cdrp-day--range' : ''}`}
          onClick={() => handleDateClick(day)}
        >
          {day}
        </button>,
      );
    }

    return days;
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !inputRef.current || !popupRef.current) return;

    const calculatePosition = () => {
      const inputRect = inputRef.current.getBoundingClientRect();
      const popupHeight = popupRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;

      // Space available below the input
      const spaceBelow = viewportHeight - inputRect.bottom;
      // Space available above the input
      const spaceAbove = inputRect.top;

      // Add some padding (20px) to ensure visibility
      const padding = 20;

      if (spaceBelow < popupHeight + padding && spaceAbove > popupHeight + padding) {
        setPopupPosition('top');
      } else {
        setPopupPosition('bottom');
      }
    };

    // Calculate position after a small delay to ensure DOM is updated
    const timeoutId = setTimeout(calculatePosition, 0);
    return () => clearTimeout(timeoutId);
  }, [isOpen]);

  return (
    <div ref={pickerRef} className="custom-date-range-picker">
      <style>{`
        .custom-date-range-picker {
          position: relative;
        }
        .cdrp-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .cdrp-input {
          width: 100%;
          padding: 12px 16px 12px 40px;
          border-radius: 12px;
          border: 1.5px solid rgba(0,0,0,.10);
          background: rgba(0,0,0,.03);
          color: var(--t1, #0c0e18);
          font-family: 'Epilogue', system-ui, sans-serif;
          font-size: 14px;
          outline: none;
          cursor: pointer;
          transition: all .25s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-sizing: border-box;
        }
        .cdrp-input:hover {
          border-color: rgba(99,91,255,.2);
          background: rgba(99,91,255,.03);
        }
        .cdrp-input:focus {
          border-color: var(--a1, #635bff);
          box-shadow: 0 0 0 4px rgba(99,91,255,.14);
          background: rgba(99,91,255,.04);
        }
        .cdrp-icon {
          position: absolute;
          left: 12px;
          color: var(--a1, #635bff);
          pointer-events: none;
        }
        .cdrp-clear-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: var(--t3, #9ba3bb);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all .2s ease;
          border-radius: 6px;
        }
        .cdrp-clear-btn:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, .1);
        }
        .cdrp-popup {
          position: absolute;
          left: 0;
          background: rgba(255, 255, 255, .98);
          border: 1px solid rgba(0, 0, 0, .08);
          border-radius: 14px;
          box-shadow: 0 14px 44px rgba(99, 91, 255, .15);
          padding: 20px;
          z-index: 1000;
          backdrop-filter: blur(8px);
          min-width: 320px;
        }
        .cdrp-popup[data-position="bottom"] {
          top: 100%;
          margin-top: 8px;
          animation: cdrpSlideUp .25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .cdrp-popup[data-position="top"] {
          bottom: 100%;
          margin-bottom: 8px;
          animation: cdrpSlideDown .25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes cdrpSlideUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes cdrpSlideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .cdrp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .cdrp-month-year {
          font-weight: 700;
          font-size: 15px;
          color: var(--t1, #0c0e18);
        }
        .cdrp-nav-btn {
          background: rgba(99,91,255,.08);
          border: 1px solid rgba(99,91,255,.15);
          border-radius: 8px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--a1, #635bff);
          transition: all .2s ease;
          padding: 0;
        }
        .cdrp-nav-btn:hover {
          background: rgba(99,91,255,.15);
          border-color: rgba(99,91,255,.3);
          transform: scale(1.05);
        }
        .cdrp-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          margin-bottom: 8px;
          text-align: center;
        }
        .cdrp-weekday {
          font-size: 11px;
          font-weight: 700;
          color: var(--t3, #9ba3bb);
          padding: 8px 0;
          text-transform: uppercase;
          letter-spacing: .05em;
        }
        .cdrp-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }
        .cdrp-day-empty {
          height: 32px;
        }
        .cdrp-day {
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: 1px solid transparent;
          background: transparent;
          color: var(--t1, #0c0e18);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all .2s cubic-bezier(0.34, 1.56, 0.64, 1);
          padding: 0;
        }
        .cdrp-day:hover:not(.cdrp-day--selected) {
          background: rgba(99,91,255,.08);
          border-color: rgba(99,91,255,.15);
        }
        .cdrp-day--selected {
          background: linear-gradient(135deg, var(--a1, #635bff), var(--a2, #06c9a0));
          color: white;
          box-shadow: 0 4px 12px rgba(99,91,255,.25);
          border-color: transparent;
        }
        .cdrp-day--range {
          background: rgba(99,91,255,.08);
          border-color: rgba(99,91,255,.15);
        }
        .cdrp-info {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(0, 0, 0, .06);
          font-size: 12px;
          color: var(--t2, #5a6278);
        }
        .cdrp-range-text {
          font-weight: 600;
          color: var(--a1, #635bff);
          margin-bottom: 4px;
        }
      `}</style>

      <div className="cdrp-input-wrapper">
        <Calendar className="cdrp-icon" size={16} />
        <input
          ref={inputRef}
          type="text"
          className="cdrp-input"
          value={
            startDate && endDate
              ? `${startDate} → ${endDate}`
              : startDate
                ? `From ${startDate}`
                : 'Select date range'
          }
          placeholder="Select date range"
          readOnly
          onClick={() => setIsOpen(!isOpen)}
        />
        {(startDate || endDate) && (
          <button
            type="button"
            className="cdrp-clear-btn"
            onClick={() => {
              onChange({ startDate: '', endDate: '' });
              setIsOpen(false);
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && (
        <div ref={popupRef} className="cdrp-popup" data-position={popupPosition}>
          <div className="cdrp-header">
            <button type="button" className="cdrp-nav-btn" onClick={handlePrevMonth}>
              <ChevronLeft size={16} />
            </button>
            <span className="cdrp-month-year">
              {currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button type="button" className="cdrp-nav-btn" onClick={handleNextMonth}>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="cdrp-weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="cdrp-weekday">
                {day}
              </div>
            ))}
          </div>

          <div className="cdrp-days">{renderCalendar()}</div>

          {startDate && endDate && (
            <div className="cdrp-info">
              <div className="cdrp-range-text">
                {daysCount} days {daysCount === 1 ? 'selected' : 'selected'}
              </div>
              <div>
                {startDate} to {endDate}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MapPicker({ value, onChange }) {
  const mapRef = useRef(null);
  const placemarkRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const searchTimerRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const queryRef = useRef(value?.label || '');
  const initialCoordsRef = useRef(value?.coords || DEFAULT_MAP_CENTER);
  const initialLabelRef = useRef(value?.label || 'Selected place');
  const [query, setQuery] = useState(value?.label || '');
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [mapError, setMapError] = useState('');

  const buildLocationDetailsRef = useRef((geoObject, fallbackLabel = '') => {
    const components =
      geoObject?.properties?.get?.('metaDataProperty.GeocoderMetaData.Address.Components') ||
      geoObject?.properties?.get?.('metaDataProperty.GeocoderMetaData.Address.components') ||
      [];

    const text =
      geoObject?.getAddressLine?.() ||
      geoObject?.properties?.get?.('metaDataProperty.GeocoderMetaData.text') ||
      fallbackLabel ||
      'Selected place';

    const getComponent = (...kinds) => {
      const found = components.find((component) => kinds.includes(component.kind));
      return found?.name || '';
    };

    const street = [getComponent('street'), getComponent('house')].filter(Boolean).join(' ');
    const city = getComponent('locality', 'district', 'province');
    const country = getComponent('country');

    return {
      label: text,
      fullAddress: text,
      street,
      city,
      country,
    };
  });

  const updateSelectionRef = useRef((nextCoords, nextDetails) => {
    const normalizedCoords = [
      Number(Number(nextCoords[0]).toFixed(6)),
      Number(Number(nextCoords[1]).toFixed(6)),
    ];

    const details = nextDetails || formatCoordsLocation(normalizedCoords);

    onChangeRef.current({
      label: details.fullAddress || details.label || 'Selected place',
      fullAddress: details.fullAddress || details.label || 'Selected place',
      street: details.street || '',
      city: details.city || '',
      country: details.country || '',
      coords: normalizedCoords,
    });
  });

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const reverseGeocodeAsync = async (coords) => {
    if (!window.ymaps?.geocode) return null;
    const response = await window.ymaps.geocode(coords, { results: 1, kind: 'house' });
    const geoObject = response?.geoObjects?.get?.(0);
    if (!geoObject) return null;
    return buildLocationDetailsRef.current(geoObject, queryRef.current);
  };

  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const existingScript = document.querySelector('script[data-yandex-maps="true"]');
    const handleReady = () => {
      if (window.ymaps?.ready) {
        window.ymaps.ready(() => setReady(true));
      }
    };

    if (window.ymaps) {
      handleReady();
      return undefined;
    }

    if (existingScript) {
      existingScript.addEventListener('load', handleReady, { once: true });
      return () => existingScript.removeEventListener('load', handleReady);
    }

    const script = document.createElement('script');
    script.dataset.yandexMaps = 'true';
    script.async = true;
    script.src = YANDEX_MAPS_SRC;
    script.onload = handleReady;
    script.onerror = () => setMapError('Failed to load Yandex Maps.');
    document.head.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current || !window.ymaps || mapInstanceRef.current) return undefined;

    const map = new window.ymaps.Map(mapRef.current, {
      center: initialCoordsRef.current,
      zoom: 13,
      controls: ['zoomControl', 'fullscreenControl'],
    });

    const placemark = new window.ymaps.Placemark(
      initialCoordsRef.current,
      {
        balloonContent: initialLabelRef.current,
      },
      {
        preset: 'islands#redDotIcon',
        draggable: true,
      },
    );

    map.geoObjects.add(placemark);
    map.events.add('click', (event) => {
      const coords = event.get('coords');
      placemark.geometry.setCoordinates(coords);
      reverseGeocodeAsync(coords)
        .then((details) => {
          const nextDetails = details || formatCoordsLocation(coords);
          updateSelectionRef.current(coords, nextDetails);
          setQuery(nextDetails.fullAddress || nextDetails.label || '');
        })
        .catch(() => {
          const fallback = formatCoordsLocation(coords);
          updateSelectionRef.current(coords, fallback);
          setQuery(fallback.fullAddress);
        });
    });

    placemark.events.add('dragend', () => {
      const coords = placemark.geometry.getCoordinates();
      reverseGeocodeAsync(coords)
        .then((details) => {
          const nextDetails = details || formatCoordsLocation(coords);
          updateSelectionRef.current(coords, nextDetails);
          setQuery(nextDetails.fullAddress || nextDetails.label || '');
        })
        .catch(() => {
          const fallback = formatCoordsLocation(coords);
          updateSelectionRef.current(coords, fallback);
          setQuery(fallback.fullAddress);
        });
    });

    mapInstanceRef.current = map;
    placemarkRef.current = placemark;

    return () => {
      map.destroy();
      mapInstanceRef.current = null;
      placemarkRef.current = null;
    };
  }, [ready]);

  useEffect(() => {
    if (!mapInstanceRef.current || !placemarkRef.current) return;
    // Only update map center if coordinates actually changed and map already exists
    if (value?.coords && Array.isArray(value.coords) && value.coords.length === 2) {
      mapInstanceRef.current.setCenter(value.coords, mapInstanceRef.current.getZoom(), { duration: 250 });
      placemarkRef.current.geometry.setCoordinates(value.coords);
    }
  }, [value?.coords]);

  const runSearch = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed || !window.ymaps?.geocode) {
      setResults([]);
      return;
    }

    setLoading(true);
    setMapError('');
    try {
      const response = await window.ymaps.geocode(trimmed, { results: 5 });
      const found = response?.geoObjects?.toArray?.() || [];
      const mapped = found.map((item) => {
        const coords = item.geometry.getCoordinates();
        const details = buildLocationDetailsRef.current(item, trimmed);
        return {
          label: details.fullAddress,
          fullAddress: details.fullAddress,
          street: details.street,
          city: details.city,
          country: details.country,
          coords: [Number(coords[0].toFixed(6)), Number(coords[1].toFixed(6))],
        };
      });
      setResults(mapped);
      if (mapped[0]) {
        setQuery(mapped[0].label);
        onChangeRef.current(mapped[0]);
        updateSelectionRef.current(mapped[0].coords, mapped[0]);
      }
    } catch {
      setMapError('Could not search the place on Yandex Maps.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!query.trim()) return undefined;
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      runSearch(query);
    }, 450);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [query, runSearch]);

  const pickResult = (item) => {
    setQuery(item.label);
    setResults([]);
    onChangeRef.current(item);
  };

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'grid', gap: 10, marginBottom: 10 }}>
        <div style={{ position: 'relative' }}>
          <MapPinned size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--t3, #9ba3bb)' }} />
          <input
            type="text"
            className="form-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a location, street, or city"
            style={{ paddingLeft: 38 }}
          />
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => runSearch(query)} disabled={loading}>
          <LocateFixed size={14} /> {loading ? 'Searching...' : 'Search on Yandex Maps'}
        </button>
      </div>

      {mapError && (
        <div style={{ background: 'rgba(239,68,68,.1)', color: '#b91c1c', padding: '10px 12px', borderRadius: 10, marginBottom: 10, fontSize: 12 }}>
          {mapError}
        </div>
      )}

      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: 320,
          borderRadius: 16,
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,.1)',
          background: 'rgba(0,0,0,.04)',
        }}
      />

      <div style={{ marginTop: 10, fontSize: 12, color: 'var(--t2, #5a6278)', lineHeight: 1.5 }}>
        {value?.label ? (
          <div style={{ display: 'grid', gap: 4 }}>
            <div>
              Selected place: <strong style={{ color: 'var(--t1, #0c0e18)' }}>{value.fullAddress || value.label}</strong>
            </div>
            <div>
              Coordinates: <strong style={{ color: 'var(--t1, #0c0e18)' }}>[{value.coords?.[0]}, {value.coords?.[1]}]</strong>
            </div>
            {(value.street || value.city || value.country) && (
              <div>
                {value.street ? <span><strong>Street:</strong> {value.street}</span> : null}
                {value.city ? <span>{value.street ? ' | ' : ''}<strong>City:</strong> {value.city}</span> : null}
                {value.country ? <span>{value.street || value.city ? ' | ' : ''}<strong>Country:</strong> {value.country}</span> : null}
              </div>
            )}
          </div>
        ) : (
          'Select a point on the map or search for a place. The form will save coordinates as [lat, lng] and a full address.'
        )}
      </div>

      {results.length > 0 && (
        <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
          {results.map((item) => (
            <button
              type="button"
              key={`${item.label}-${item.coords.join(',')}`}
              onClick={() => pickResult(item)}
              style={{
                textAlign: 'left',
                borderRadius: 12,
                padding: '10px 12px',
                border: '1px solid rgba(0,0,0,.08)',
                background: 'rgba(255,255,255,.92)',
                cursor: 'pointer',
                fontSize: 12,
                color: 'var(--t1, #0c0e18)',
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 2 }}>{item.label}</div>
              <div style={{ color: 'var(--t2, #5a6278)' }}>
                {item.street || item.city || item.country ? [item.street, item.city, item.country].filter(Boolean).join(', ') : 'Address unavailable'}
              </div>
              <div style={{ color: 'var(--t2, #5a6278)', marginTop: 2 }}>[{item.coords[0]}, {item.coords[1]}]</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CreatePage({ onSubmit, onCancel, students = [], user = null }) { // Accept students as prop
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    location: '',
    locationYmaps: null,
    duration: { start: '', end: '' },
    status: 'Pending',
    plan: '',
    tutorID: '',
    days: []
  });

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState(''); // Add faculty filter state
  const [tutors, setTutors] = useState([]);
  const [loadingTutors, setLoadingTutors] = useState(false);

  // Fetch tutors and professors on component mount
  useEffect(() => {
    const canReadUsers = String(user?.role || '').toLowerCase() === 'admin';
    if (!canReadUsers) {
      setTutors([]);
      return;
    }

    const fetchTutors = async () => {
      try {
        setLoadingTutors(true);
        const data = await get('/usersInternship');
        const filtered = (Array.isArray(data) ? data : data.data || []).filter(
          user => user.role === 'Tutor' || user.role === 'Professor'
        );
        setTutors(filtered);
      } catch (err) {
        console.error('Error fetching tutors:', err);
      } finally {
        setLoadingTutors(false);
      }
    };
    
    fetchTutors();
  }, [user?.role]);

  // Get unique faculties from students
  const faculties = [...new Set(students.map(student => student.nameFaculty).filter(Boolean))];

  // Filter students based on search term and faculty
  const filteredStudents = students.filter(student => 
    (student.name && student.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (student.surname && student.surname.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (student.lastname && student.lastname.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (student.nameFaculty && student.nameFaculty.toLowerCase().includes(searchTerm.toLowerCase()))
  ).filter(student => 
    !selectedFaculty || student.nameFaculty === selectedFaculty
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

  const getDateRangeDays = () => {
    if (!formData.duration?.start || !formData.duration?.end) return 0;
    const start = new Date(formData.duration.start);
    const end = new Date(formData.duration.end);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    return Math.max(0, diffDays);
  };

  const generateDaysArray = () => {
    if (!formData.duration?.start || !formData.duration?.end) return [];
    
    const numDays = getDateRangeDays();
    const days = [];
    const startDate = new Date(formData.duration.start);
    
    for (let i = 0; i < numDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      const dateString = currentDate.toISOString().split('T')[0];
      
      days.push({
        dayNumber: String(i + 1),
        date: dateString,
        approved: false,
        shortReport: null,
        comments: [],
        images: []
      });
    }
    
    return days;
  };

  const formatDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return '';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end - start;
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${days} days (${startDate} to ${endDate})`;
  };

  const getDurationInputValue = () => {
    const start = formData.duration?.start;
    const end = formData.duration?.end;
    if (!start || !end) return '';
    return formatDateRange(start, end);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!Array.isArray(formData.locationYmaps?.coords) || formData.locationYmaps.coords.length !== 2) {
        throw new Error('Please choose a location on the Yandex map.');
      }

      if (!formData.duration?.start || !formData.duration?.end) {
        throw new Error('Please select both start and end dates.');
      }

      const daysArray = generateDaysArray();
      if (daysArray.length === 0) {
        throw new Error('Invalid date range. End date must be after start date.');
      }

      // Prepare the payload
      const payload = {
        ...formData,
        location: formData.locationYmaps?.label || formData.location,
        locationYmaps: formData.locationYmaps.coords,
        duration: {
          start: formData.duration.start,
          end: formData.duration.end,
        },
        days: daysArray,
        numberOfStudents: selectedStudents.map(s => ({
          _id: s._id,
          name: s.name,
          surname: s.surname,
          lastname: s.lastname,
          nameFaculty: s.nameFaculty
        }))
      };

      // Submit to the API
      const newFaculty = await post('/faculty', payload);
      onSubmit(newFaculty);
    } catch (err) {
      toast.error(err.message || 'Failed to create internship.');
      console.error('Error creating internship:', err);
    }
  };

  const addStudent = (student) => {
    // Add to selected students
    setSelectedStudents(prev => [...prev, student]);
    // Clear search term after adding a student
    setSearchTerm('');
  };

  const selectedMapLocation = useMemo(() => {
    const current = formData.locationYmaps;
    if (current?.label && Array.isArray(current?.coords) && current.coords.length === 2) {
      return current;
    }
    return null;
  }, [formData.locationYmaps]);

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
        .create-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 24px;
        }
        .create-title-row .create-title {
          margin: 0;
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
          padding: clamp(10px,2vw,12px) clamp(12px,2vw,16px);
          border-radius: 12px;
          border: 1.5px solid rgba(0,0,0,.10);
          background: rgba(0,0,0,.03);
          color: var(--t1, #0c0e18);
          font-family: 'Epilogue', system-ui, sans-serif;
          font-size: clamp(13px,2vw,14px);
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
          grid-template-columns: repeat(auto-fit, minmax(clamp(140px,40vw,1fr), 1fr));
          gap: clamp(12px,2vw,16px);
        }
        @media(max-width:640px){
          .form-row {
            grid-template-columns: 1fr;
          }
        }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: clamp(8px,1.5vw,10px) clamp(12px,2vw,16px);
          border-radius: 12px;
          font-family: 'Epilogue', system-ui, sans-serif;
          font-size: clamp(12px,2vw,13px);
          font-weight: 700;
          cursor: pointer;
          transition: transform .15s ease, box-shadow .2s ease, background .2s ease, border-color .2s ease;
          border: none;
          white-space: nowrap;
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
          transition: background-color 0.2s ease;
        }
        .student-item:hover {
          background-color: rgba(99,91,255, 0.05);
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
        .student-id {
          font-size: 11px;
          color: var(--t3, #9ba3bb);
          margin-top: 3px;
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
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s ease;
        }
        .add-btn:hover {
          background: rgba(6,201,160,.2);
          transform: translateY(-1px);
        }
        .selected-students-list {
          margin-top: 16px;
        }
        .selected-student {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          background: linear-gradient(135deg, rgba(99,91,255, 0.1), rgba(6,201,160, 0.05));
          border-radius: 8px;
          margin-bottom: 8px;
          font-size: 13px;
          border: 1px solid rgba(99,91,255, 0.15);
          transition: transform 0.2s ease;
        }
        .selected-student:hover {
          transform: translateX(2px);
        }
        .remove-btn {
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        .remove-btn:hover {
          background: rgba(239, 68, 68, 0.1);
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
        .student-count {
          display: inline-block;
          background: rgba(99,91,255, 0.1);
          color: var(--a1, #635bff);
          border-radius: 20px;
          padding: 3px 8px;
          font-size: 11px;
          font-weight: 600;
          margin-left: 8px;
        }
        .no-students {
          text-align: center;
          padding: 20px;
          color: var(--t3, #9ba3bb);
          font-style: italic;
        }
        @media (max-width: 900px) {
          .create-shell {
            grid-template-columns: 1fr;
          }
          .create-sidebar {
            max-height: 50vh;
            overflow-y: auto;
          }
          .create-title-row {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="create-shell">
        <div className="create-main">
          <div className="create-card">
            <div className="create-title-row">
              <h1 className="create-title">Create New Internship</h1>
            </div>
            
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
                <div style={{ marginTop: '10px' }}>
                  <MapPicker
                    value={selectedMapLocation}
                    onChange={(place) => {
                      setFormData((prev) => ({
                        ...prev,
                        location: place.label,
                        locationYmaps: place,
                      }));
                    }}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={getDurationInputValue()}
                    className="form-input"
                    readOnly
                    placeholder="Select dates to auto-calculate"
                    style={{ background: 'rgba(0,0,0,.05)', cursor: 'not-allowed' }}
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
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
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
              
              <div className="form-group">
                <label className="form-label">Internship Duration</label>
                <CustomDateRangePicker
                  startDate={formData.duration?.start}
                  endDate={formData.duration?.end}
                  daysCount={getDateRangeDays()}
                  onChange={(dates) => {
                    setFormData((prev) => {
                      const nextDuration = {
                        start: dates.startDate || '',
                        end: dates.endDate || '',
                      };

                      if (!nextDuration.start || !nextDuration.end) {
                        return {
                          ...prev,
                          duration: nextDuration,
                          days: [],
                        };
                      }

                      const start = new Date(nextDuration.start);
                      const end = new Date(nextDuration.end);
                      const diffTime = end - start;
                      const daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

                      if (daysCount <= 0) {
                        return {
                          ...prev,
                          duration: nextDuration,
                          days: [],
                        };
                      }

                      const days = [];
                      for (let i = 0; i < daysCount; i++) {
                        const currentDate = new Date(start);
                        currentDate.setDate(currentDate.getDate() + i);
                        const dateString = currentDate.toISOString().split('T')[0];

                        days.push({
                          dayNumber: String(i + 1),
                          date: dateString,
                          approved: false,
                          shortReport: null,
                          comments: [],
                          images: []
                        });
                      }

                      return {
                        ...prev,
                        duration: nextDuration,
                        days,
                      };
                    });
                  }}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Select Tutor or Professor</label>
                <select
                  name="tutorID"
                  value={formData.tutorID}
                  onChange={handleChange}
                  className="form-input"
                  disabled={loadingTutors}
                >
                  <option value="">-- Select a Tutor/Professor --</option>
                  {tutors.map(tutor => (
                    <option key={tutor._id} value={tutor._id}>
                      {tutor.name} {tutor.surname} ({tutor.role})
                    </option>
                  ))}
                </select>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 className="create-title" style={{ fontSize: '20px', marginBottom: 0 }}>Add Students</h2>
            <span className="student-count">{selectedStudents.length}</span>
          </div>
          
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
          
          {/* Faculty filter dropdown */}
          <div style={{ marginBottom: '16px' }}>
            <select
              className="form-input"
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
            >
              <option value="">All Faculties</option>
              {faculties.map(faculty => (
                <option key={faculty} value={faculty}>{faculty}</option>
              ))}
            </select>
          </div>
          
          {/* Show all students from API with improved UI */}
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
                    {student.studentId && (
                      <div className="student-id">
                        ID: {student.studentId}
                      </div>
                    )}
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
              <div className="no-students">
                {searchTerm || selectedFaculty ? 'No students found' : 'No students available'}
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
                    <strong>{student.name} {student.surname} {student.lastname}</strong>
                    <div style={{ fontSize: '12px', color: 'var(--t2, #5a6278)', marginTop: '2px' }}>
                      {student.nameFaculty} {student.studentId && `• ID: ${student.studentId}`}
                    </div>
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