import { AlertTriangle, Lock, Wrench } from 'lucide-react';

export default function SiteMaintenancePage({ message, env = 'production' }) {
  const text = message || 'Сайт на разработке. Доступ временно ограничен.';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background:
          'radial-gradient(circle at top, rgba(255,95,160,.18), transparent 34%), radial-gradient(circle at bottom right, rgba(6,201,160,.14), transparent 28%), linear-gradient(160deg, #090b14 0%, #121626 54%, #090b14 100%)',
        color: '#fff',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 640,
          borderRadius: 28,
          padding: '34px 28px',
          background: 'rgba(255,255,255,.05)',
          border: '1px solid rgba(255,255,255,.12)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 24px 70px rgba(0,0,0,.28)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(245,166,35,.24), rgba(255,95,160,.2))',
              color: '#f5a623',
              flexShrink: 0,
            }}
          >
            <Wrench size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,.48)' }}>
              Temporary access restriction
            </div>
            <h1 style={{ margin: '6px 0 0', fontSize: 'clamp(28px, 5vw, 42px)', lineHeight: 1.05 }}>
              Сайт на разработке
            </h1>
          </div>
        </div>

        <p style={{ margin: '0 0 18px', fontSize: 16, lineHeight: 1.6, color: 'rgba(255,255,255,.78)' }}>
          {text}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 22 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              borderRadius: 999,
              background: 'rgba(255,255,255,.08)',
              color: 'rgba(255,255,255,.8)',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            <Lock size={14} />
            Доступ только для admin и developer
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              borderRadius: 999,
              background: 'rgba(255,255,255,.08)',
              color: 'rgba(255,255,255,.8)',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            <AlertTriangle size={14} />
            source: {env}
          </span>
        </div>

        <div style={{ display: 'grid', gap: 12, color: 'rgba(255,255,255,.68)', fontSize: 14, lineHeight: 1.55 }}>
          <div>Пока сайт выключен, страницы и разделы недоступны для всех остальных ролей.</div>
          <div>Когда статус будет включен, приложение снова откроется без дополнительных действий.</div>
        </div>
      </div>
    </div>
  );
}