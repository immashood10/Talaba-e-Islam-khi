'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Campaign, Donation } from '@/lib/mock-data';

export default function CampaignNotFound() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-8xl mb-4">🔍</div>
          <h1 className="text-4xl font-bold text-secondary mb-4">
            Campaign Not Found
          </h1>
          <p className="text-text-light mb-8">
            The campaign you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <a href="/campaigns" className="btn-primary">
            Browse Campaigns
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
