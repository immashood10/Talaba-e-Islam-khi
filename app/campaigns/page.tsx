'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CampaignCard from '@/components/CampaignCard';
import DonationModal from '@/components/DonationModal';
import { Campaign } from '@/lib/mock-data';

function CampaignsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/campaigns');
      const data = await res.json();
      setCampaigns(data.campaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCampaigns =
    selectedCategory === 'all'
      ? campaigns
      : campaigns.filter((c) => c.category.toLowerCase() === selectedCategory);

  const handleDonate = (amount: number, name: string) => {
    if (!selectedCampaign) return;
    console.log(`Donation received: $${amount} from ${name} for ${selectedCampaign.title}`);
  };

  const openDonationModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Campaigns Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-xl mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                  <div className="h-2 bg-gray-200 rounded mb-2" />
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-secondary mb-2">
                No initiatives found
              </h3>
              <p className="text-text-light">
                Check back soon for new initiatives in this category.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCampaigns.map((campaign, index) => (
                <div
                  key={campaign.id}
                  className="opacity-0 animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CampaignCard
                    {...campaign}
                    onDonate={openDonationModal}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Donation Modal */}
      {selectedCampaign && (
        <DonationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          campaignTitle={selectedCampaign.title}
          onDonate={handleDonate}
        />
      )}
    </div>
  );
}

export default function CampaignsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-text-light">Loading...</p>
        </div>
      </div>
    }>
      <CampaignsContent />
    </Suspense>
  );
}
