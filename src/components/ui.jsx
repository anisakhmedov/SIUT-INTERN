import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Calendar as CalendarIcon } from 'lucide-react';

/* ── CustomSelect ── */
export function CustomSelect({ value, onChange, options, placeholder, hasError, disabled, style }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  const handleToggle = () => {
    if (disabled) return;
    if (open) { setOpen(false); return; }
    const r = triggerRef.current?.getBoundingClientRect();
    if (r) {
      const left = Math.min(r.left, window.innerWidth - r.width - 8);
      setPos({ top: r.bottom + 6, left: Math.max(left, 8), width: r.width });
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onClose = (e) => {
      if (!triggerRef.current?.contains(e.target) && !panelRef.current?.contains(e.target))
        setOpen(false);
    };
    const onScroll = () => setOpen(false);
    document.addEventListener('mousedown', onClose);
    document.addEventListener('touchstart', onClose);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('mousedown', onClose);
      document.removeEventListener('touchstart', onClose);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open]);

  const selected = options.find((o) => String(o.value) === String(value));
  const hasErr = hasError && !value;

  return (
    <div style={{ position: 'relative', ...style }}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '11px 14px', borderRadius: 10, gap: 8,
          border: `1.5px solid ${open ? 'var(--a1)' : hasErr ? '#ef4444' : 'rgba(0,0,0,.12)'}`,
          background: disabled ? 'rgba(0,0,0,.04)' : '#fff',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit', fontSize: 14,
          color: selected ? 'var(--t1)' : 'var(--t3)',
          textAlign: 'left',
          boxShadow: open ? '0 0 0 3px rgba(99,91,255,.12)' : 'none',
          transition: 'border-color .18s, box-shadow .18s',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s', flexShrink: 0, color: 'var(--t3)' }}
        />
      </button>

      {open && createPortal(
        <div
          ref={panelRef}
          style={{
            position: 'fixed',
            top: pos.top, left: pos.left, width: pos.width,
            zIndex: 99999,
            background: '#fff', borderRadius: 12,
            border: '1.5px solid rgba(99,91,255,.18)',
            boxShadow: '0 8px 32px rgba(0,0,0,.18)',
            maxHeight: 260, overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {options.map((o) => {
            const isSel = String(o.value) === String(value);
            return (
              <button
                key={o.value}
                type="button"
                onMouseEnter={() => setHovered(o.value)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => { onChange(o.value); setOpen(false); setHovered(null); }}
                style={{
                  width: '100%', padding: '11px 16px', border: 'none',
                  background: isSel ? 'rgba(99,91,255,.1)' : hovered === o.value ? 'rgba(99,91,255,.04)' : 'transparent',
                  textAlign: 'left', cursor: 'pointer', fontSize: 14,
                  color: isSel ? 'var(--a1)' : 'var(--t1)',
                  fontWeight: isSel ? 600 : 400,
                  transition: 'background .1s',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>{o.label}</span>
                {o.badge && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, flexShrink: 0,
                    background: 'rgba(6,201,160,.12)', color: '#06c9a0',
                    borderRadius: 999, padding: '2px 8px',
                  }}>{o.badge}</span>
                )}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}

/* ── CustomDatePicker ── */
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW_LABELS = ['Mo','Tu','We','Th','Fr','Sa','Su'];

export function CustomDatePicker({ value, onChange, hasError, disabled, placeholder = 'Select date', style }) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => (value ? new Date(value + 'T00:00:00').getFullYear() : new Date().getFullYear()));
  const [viewMonth, setViewMonth] = useState(() => (value ? new Date(value + 'T00:00:00').getMonth() : new Date().getMonth()));
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  const display = value
    ? new Date(value + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';

  const handleToggle = () => {
    if (disabled) return;
    if (open) { setOpen(false); return; }
    if (value) {
      const d = new Date(value + 'T00:00:00');
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
    const r = triggerRef.current?.getBoundingClientRect();
    if (r) {
      const panelW = 280;
      let left = r.left;
      if (left + panelW > window.innerWidth - 8) left = window.innerWidth - panelW - 8;
      left = Math.max(8, left);
      const spaceBelow = window.innerHeight - r.bottom;
      const top = spaceBelow > 320 ? r.bottom + 4 : r.top - 324;
      setPos({ top, left });
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onClose = (e) => {
      if (!triggerRef.current?.contains(e.target) && !panelRef.current?.contains(e.target))
        setOpen(false);
    };
    document.addEventListener('mousedown', onClose);
    document.addEventListener('touchstart', onClose);
    return () => {
      document.removeEventListener('mousedown', onClose);
      document.removeEventListener('touchstart', onClose);
    };
  }, [open]);

  const todayTs = (() => { const d = new Date(); d.setHours(0,0,0,0); return d.getTime(); })();
  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const startOffset = firstDow === 0 ? 6 : firstDow - 1;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = Array(startOffset).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  const selectedTs = value ? new Date(value + 'T00:00:00').getTime() : null;

  const prevMonth = () => { if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); } else setViewMonth(m => m + 1); };
  const selectDay = (day) => {
    onChange(`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
    setOpen(false);
  };

  const hasErr = hasError && !value;
  const navBtn = { background: 'none', border: 'none', cursor: 'pointer', padding: '4px 10px', borderRadius: 8, fontSize: 18, color: 'var(--t2)', lineHeight: 1 };

  return (
    <div style={{ position: 'relative', ...style }}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '11px 14px', borderRadius: 10, gap: 8,
          border: `1.5px solid ${open ? 'var(--a1)' : hasErr ? '#ef4444' : 'rgba(0,0,0,.12)'}`,
          background: disabled ? 'rgba(0,0,0,.04)' : '#fff',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit', fontSize: 14,
          color: value ? 'var(--t1)' : 'var(--t3)',
          boxShadow: open ? '0 0 0 3px rgba(99,91,255,.12)' : 'none',
          transition: 'border-color .18s, box-shadow .18s',
        }}
      >
        <span style={{ flex: 1, textAlign: 'left' }}>{display || placeholder}</span>
        <CalendarIcon size={15} style={{ flexShrink: 0, color: 'var(--t3)' }} />
      </button>

      {open && createPortal(
        <div
          ref={panelRef}
          style={{
            position: 'fixed', top: pos.top, left: pos.left, width: 280,
            zIndex: 99999, background: '#fff', borderRadius: 14,
            border: '1.5px solid rgba(99,91,255,.18)',
            boxShadow: '0 8px 32px rgba(0,0,0,.18)', padding: 12,
            userSelect: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <button type="button" onClick={prevMonth} style={navBtn}>‹</button>
            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--t1)' }}>{MONTHS[viewMonth]} {viewYear}</span>
            <button type="button" onClick={nextMonth} style={navBtn}>›</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
            {DOW_LABELS.map((d) => (
              <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'var(--t3)', padding: '2px 0' }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const ts = new Date(viewYear, viewMonth, day).getTime();
              const isSel = ts === selectedTs;
              const isToday = ts === todayTs;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectDay(day)}
                  style={{
                    width: '100%', aspectRatio: '1', border: 'none', borderRadius: 7,
                    background: isSel ? 'var(--a1)' : isToday ? 'rgba(99,91,255,.12)' : 'transparent',
                    color: isSel ? '#fff' : isToday ? 'var(--a1)' : 'var(--t1)',
                    fontWeight: isSel || isToday ? 700 : 400,
                    fontSize: 12, cursor: 'pointer', transition: 'background .1s',
                  }}
                >{day}</button>
              );
            })}
          </div>
          {value && (
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); }}
              style={{ marginTop: 8, width: '100%', padding: '7px', border: '1px solid rgba(0,0,0,.1)', borderRadius: 8, background: 'transparent', fontSize: 12, color: 'var(--t2)', cursor: 'pointer' }}
            >Clear</button>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
