import { AlertCircle } from 'lucide-react';

export default function SiteStatusBanner({ status }) {
  if (!status || status.loading || status.live) {
    return null;
  }

  const message = status.message || 'Сайт временно недоступен';
  const envLabel = status.env === 'development' ? 'development' : 'production';
  const sourceLabel = status.source === 'db' ? 'db' : 'env';

  return (
    <div className="site-status-banner" role="status" aria-live="polite">
      <div className="site-status-banner__icon" aria-hidden="true">
        <AlertCircle size={18} />
      </div>
      <div className="site-status-banner__content">
        <div className="site-status-banner__title">Maintenance mode</div>
        <div className="site-status-banner__message">{message}</div>
        <div className="site-status-banner__meta">
          <span className="site-status-banner__pill">{envLabel}</span>
          <span className="site-status-banner__pill">source: {sourceLabel}</span>
        </div>
      </div>
    </div>
  );
}
