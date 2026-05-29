import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_SITE_STATUS, fetchSiteStatus, normalizeSiteStatus } from '../utils/siteStatusApi';

export function useSiteStatus(pollIntervalMs = 0) {
  const [status, setStatus] = useState({
    ...DEFAULT_SITE_STATUS,
    loading: true,
  });

  const refreshStatus = useCallback(async () => {
    try {
      const nextStatus = await fetchSiteStatus();
      setStatus({ ...nextStatus, loading: false });
    } catch (error) {
      console.error('status fetch failed', error);
      setStatus((current) => ({
        ...normalizeSiteStatus(current),
        live: true,
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    let active = true;
    let intervalId;

    const run = async () => {
      try {
        const nextStatus = await fetchSiteStatus();
        if (!active) return;
        setStatus({ ...nextStatus, loading: false });
      } catch (error) {
        console.error('status fetch failed', error);
        if (!active) return;
        setStatus((current) => ({
          ...normalizeSiteStatus(current),
          live: true,
          loading: false,
        }));
      }
    };

    run();

    if (pollIntervalMs > 0) {
      intervalId = window.setInterval(run, pollIntervalMs);
    }

    return () => {
      active = false;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [pollIntervalMs, refreshStatus]);

  return {
    ...status,
    refreshStatus,
    setStatus,
  };
}
