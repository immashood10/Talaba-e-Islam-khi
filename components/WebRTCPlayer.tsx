'use client';

// Native WHEP (WebRTC playback) player for the self-hosted MediaMTX stream.
// Rendering into a real <video> element (instead of MediaMTX's iframe page)
// lets the page's own control bar drive play/pause/volume directly.

import { useEffect, useRef, type RefObject } from 'react';

interface WebRTCPlayerProps {
  whepUrl: string;
  className?: string;
  // Optional external ref so the parent can control playback/volume
  videoRef?: RefObject<HTMLVideoElement | null>;
}

export default function WebRTCPlayer({ whepUrl, className, videoRef }: WebRTCPlayerProps) {
  const internalRef = useRef<HTMLVideoElement | null>(null);
  const ref = videoRef ?? internalRef;

  useEffect(() => {
    let pc: RTCPeerConnection | null = null;
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    async function connect() {
      pc = new RTCPeerConnection();

      // Receive-only: without explicit transceivers the offer carries no
      // media sections and the WHEP endpoint rejects it.
      pc.addTransceiver('video', { direction: 'recvonly' });
      pc.addTransceiver('audio', { direction: 'recvonly' });

      pc.ontrack = (event) => {
        if (ref.current && event.streams[0]) {
          ref.current.srcObject = event.streams[0];
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Wait for ICE gathering so the offer includes all candidates
      await new Promise<void>((resolve) => {
        if (pc!.iceGatheringState === 'complete') return resolve();
        const timeout = setTimeout(resolve, 2000);
        pc!.addEventListener('icegatheringstatechange', () => {
          if (pc!.iceGatheringState === 'complete') {
            clearTimeout(timeout);
            resolve();
          }
        });
      });

      const res = await fetch(whepUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/sdp' },
        body: pc.localDescription?.sdp,
      });
      if (!res.ok) throw new Error(`WHEP request failed (${res.status})`);

      const answer = await res.text();
      if (cancelled) return;
      await pc.setRemoteDescription({ type: 'answer', sdp: answer });
    }

    function start() {
      connect().catch(() => {
        pc?.close();
        // The stream may still be warming up (e.g. OBS just connected) - retry
        if (!cancelled) retryTimer = setTimeout(start, 3000);
      });
    }

    start();

    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
      pc?.close();
    };
  }, [whepUrl, ref]);

  return <video ref={ref} autoPlay playsInline muted className={className} />;
}
