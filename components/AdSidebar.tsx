'use client';

import { useEffect, useState } from 'react';
import type { Ad } from '@/lib/ad-store';

const AD_DISMISSED_KEY = 'tik-ad-sidebar-dismissed';
const ROTATE_INTERVAL_MS = 6000;

export default function AdSidebar() {
  const [isVisible, setIsVisible] = useState(true);
  const [ads, setAds] = useState<Ad[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (window.sessionStorage.getItem(AD_DISMISSED_KEY) === 'true') {
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    fetch('/api/ads')
      .then((res) => (res.ok ? res.json() : { ads: [] }))
      .then((data) => setAds(data.ads ?? []))
      .catch(() => setAds([]));
  }, []);

  useEffect(() => {
    if (ads.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % ads.length);
    }, ROTATE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [ads.length]);

  const dismiss = () => {
    setIsVisible(false);
    window.sessionStorage.setItem(AD_DISMISSED_KEY, 'true');
  };

  if (!isVisible) return null;

  const activeAd = ads[activeIndex];

  return (
    <>
      {/* Desktop: small floating sidebar widget */}
      <div className="fixed right-4 top-48 bottom-16 z-40 hidden w-40 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-soft-lg xl:flex dark:border-slate-700 dark:bg-slate-900">
        <div className="flex shrink-0 items-center justify-between bg-gray-50 px-3 py-1.5 dark:bg-slate-800">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            Advertisement
          </span>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Close advertisement"
            className="rounded-full p-0.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {activeAd ? (
          <a
            key={activeAd.id}
            href={activeAd.linkUrl}
            target="_blank"
            rel="noreferrer sponsored"
            className="flex flex-1 flex-col overflow-hidden animate-fade-in"
          >
            <div className="relative w-full flex-1 overflow-hidden bg-gray-100 dark:bg-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element -- admin-provided arbitrary image URL */}
              <img
                src={activeAd.imageUrl}
                alt={activeAd.advertiserName}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <span className="shrink-0 truncate bg-gray-50 px-2 py-1 text-center text-[11px] font-medium text-text-light dark:bg-slate-800 dark:text-slate-400">
              {activeAd.advertiserName}
            </span>
          </a>
        ) : (
          <a
            href="/contact"
            className="flex flex-1 flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/5 to-amber-50 px-4 text-center transition-colors hover:from-primary/10 dark:to-slate-800"
          >
            <span className="text-sm font-semibold text-primary">Your Ad Here</span>
            <span className="text-xs text-text-light">Advertise with Talaba e Islam Karachi</span>
          </a>
        )}
      </div>

      {/* Mobile/tablet: full-screen interstitial, only when there's a real ad to show */}
      {activeAd && (
        <div className="fixed inset-0 z-[150] flex flex-col bg-black xl:hidden animate-fade-in">
          <a
            key={activeAd.id}
            href={activeAd.linkUrl}
            target="_blank"
            rel="noreferrer sponsored"
            className="relative flex-1"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- admin-provided arbitrary image URL */}
            <img
              src={activeAd.imageUrl}
              alt={activeAd.advertiserName}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </a>

          <div className="flex shrink-0 items-center justify-between bg-black/90 px-4 py-3">
            <div className="min-w-0">
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-white/50">
                Advertisement
              </span>
              <span className="block truncate text-sm font-medium text-white">{activeAd.advertiserName}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={dismiss}
            aria-label="Close advertisement"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
