'use client';

import { useCallback, useEffect, useState } from 'react';

interface IngestInfo {
  rtmpUrl: string;
  rtmpStreamKey: string;
  srtUrl: string;
  playerUrl: string;
  hlsUrl: string;
}

interface BroadcastState {
  serverRunning: boolean;
  status: { isLive: boolean; viewers: number } | null;
  ingest: IngestInfo | null;
}

export default function AdminBroadcastPage() {
  const [state, setState] = useState<BroadcastState | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [isEnding, setIsEnding] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/broadcast');
      if (res.ok) setState(await res.json());
    } catch (err) {
      console.error('Error fetching broadcast status:', err);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleEndLive = async () => {
    if (!confirm('Disconnect the incoming stream? If the encoder has auto-reconnect enabled, also stop it at the source.')) return;
    setIsEnding(true);
    try {
      await fetch('/api/admin/live/stop', { method: 'POST' });
      await fetchStatus();
    } catch (err) {
      console.error('Error ending stream:', err);
    } finally {
      setIsEnding(false);
    }
  };

  const handleCopy = async (value: string, which: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(which);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // clipboard unavailable - ignore
    }
  };

  const copyField = (label: string, value: string, id: string, masked = false) => (
    <div className="mb-3">
      <label className="block text-sm font-medium text-secondary mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          readOnly
          type={masked && !showKey ? 'password' : 'text'}
          value={value}
          className="input-field font-mono text-sm"
        />
        {masked && (
          <button onClick={() => setShowKey((v) => !v)} className="btn-secondary shrink-0">
            {showKey ? 'Hide' : 'Show'}
          </button>
        )}
        <button onClick={() => handleCopy(value, id)} className="btn-secondary shrink-0">
          {copied === id ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-secondary mb-2">Broadcast Studio</h1>
          <p className="text-text-light">
            Stream from professional cameras via OBS, ATEM Mini, or vMix into your own server
          </p>
        </div>

        {state === null ? (
          <div className="card animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        ) : !state.serverRunning ? (
          <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
            <h2 className="text-lg font-bold text-secondary mb-2">Streaming server is not running</h2>
            <p className="text-text-light text-sm mb-4">
              Start the MediaMTX streaming server, then this page will show your stream credentials.
            </p>
            <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm overflow-x-auto">
              docker compose up -d
            </pre>
            <p className="mt-3 text-xs text-text-light">
              Run this from the project root. Requires Docker Desktop to be running.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  {state.status?.isLive && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-3 w-3 ${state.status?.isLive ? 'bg-red-500' : 'bg-gray-300'}`}
                  />
                </span>
                <span className="font-medium text-secondary">
                  {state.status?.isLive ? 'LIVE — receiving stream' : 'Ready — waiting for a stream'}
                </span>
              </div>
              {state.status?.isLive && (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-text-light">
                    {state.status.viewers} watching directly
                  </span>
                  <button
                    onClick={handleEndLive}
                    disabled={isEnding}
                    className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
                  >
                    {isEnding ? 'Ending...' : 'End Stream'}
                  </button>
                </div>
              )}
            </div>

            {/* RTMP (OBS / ATEM / vMix) */}
            {state.ingest && (
              <>
                <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
                  <h2 className="text-lg font-bold text-secondary mb-1">RTMP — OBS Studio / ATEM Mini / vMix</h2>
                  <p className="text-sm text-text-light mb-4">
                    In OBS: Settings → Stream → Service: Custom. ATEM Mini and vMix use the same
                    server URL and key in their streaming settings.
                  </p>
                  {copyField('Server URL', state.ingest.rtmpUrl, 'rtmp-url')}
                  {copyField('Stream Key', state.ingest.rtmpStreamKey, 'rtmp-key', true)}
                  <p className="text-xs text-text-light">
                    The key contains the publish password &mdash; keep it private.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
                  <h2 className="text-lg font-bold text-secondary mb-1">SRT — lower latency, more resilient</h2>
                  <p className="text-sm text-text-light mb-4">
                    Supported by OBS 28+, vMix, and most hardware encoders. Use instead of RTMP when
                    the network is unreliable.
                  </p>
                  {copyField('SRT URL', state.ingest.srtUrl, 'srt-url', true)}
                </div>

                <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
                  <h2 className="text-lg font-bold text-secondary mb-1">Playback</h2>
                  <p className="text-sm text-text-light mb-4">
                    The public <a href="/live" className="text-primary hover:underline">/live</a> page
                    switches to this stream automatically whenever a feed is connected. Direct links:
                  </p>
                  {copyField('WebRTC player (low latency)', state.ingest.playerUrl, 'player-url')}
                  {copyField('HLS stream (wide compatibility)', state.ingest.hlsUrl, 'hls-url')}
                  <p className="mt-2 text-xs text-text-light">
                    Every broadcast is automatically recorded as an .mp4 file in the{' '}
                    <code className="bg-gray-100 px-1 rounded">recordings/live</code> folder on the
                    server, named by date and time.
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
