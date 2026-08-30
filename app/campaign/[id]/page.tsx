'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProgressBar from '@/components/ProgressBar';
import DonationModal from '@/components/DonationModal';
import { Campaign, Donation } from '@/lib/mock-data';

export default function CampaignDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchCampaignAndDonations();
  }, [id]);

  const fetchCampaignAndDonations = async () => {
    try {
      const res = await fetch(`/api/campaign/${id}`);
      const data = await res.json();

      if (data.success === false) {
        console.error('Campaign not found');
        return;
      }

      setCampaign(data.campaign);
      setDonations(data.donations || []);
    } catch (error) {
      console.error('Error fetching campaign:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDonate = (amount: number, name: string) => {
    if (!campaign) return;
    console.log(`Donation received: $${amount} from ${name} for ${campaign.title}`);
  };

  const openDonationModalHandler = () => {
    if (campaign) {
      setSelectedCampaign(campaign);
      setIsModalOpen(true);
    }
  };

  const shareCampaign = async () => {
    if (!campaign) return;
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: campaign.title,
          text: campaign.description,
          url: url,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-text-light">Loading campaign...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="text-8xl mb-4">😔</div>
            <h1 className="text-4xl font-bold text-secondary mb-4">
              Initiative Not Found
            </h1>
            <p className="text-text-light mb-8">
              The initiative you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link href="/campaigns" className="btn-primary">
              View Our Initiatives
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Image */}
        <div className="relative h-96 lg:h-[500px] overflow-hidden">
          <Image
            src={campaign.image}
            alt={campaign.title}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Share Button */}
          <div className="absolute top-6 right-6">
            <button
              onClick={shareCampaign}
              className="bg-white/10 backdrop-blur-sm p-3 rounded-full text-white hover:bg-white/20 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 animate-fade-in">
              {/* Category Tag */}
              <span className="inline-block bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
                {campaign.category}
              </span>

              {/* Title */}
              <h1 className="text-4xl lg:text-5xl font-bold text-secondary mb-6 leading-tight">
                {campaign.title}
              </h1>

              {/* Organiser */}
              <div className="flex items-center gap-3 mb-6">
                <Image
                  src={campaign.organiser.avatar}
                  alt={campaign.organiser.name}
                  width={48}
                  height={48}
                  className="rounded-full border-2 border-primary"
                />
                <div>
                  <p className="text-sm text-text-light">
                    Led by
                  </p>
                  <p className="font-semibold text-secondary">
                    {campaign.organiser.name}
                  </p>
                </div>
              </div>

              {/* Story */}
              <div className="prose prose-lg max-w-none mb-10">
                <h2 className="text-2xl font-bold text-secondary mb-4">
                  About This Initiative
                </h2>
                <p className="text-text-light leading-relaxed whitespace-pre-line">
                  {campaign.story}
                </p>
              </div>

              {/* Contributions List */}
              {donations.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-2xl font-bold text-secondary mb-6">
                    Recent Contributions
                  </h2>
                  <div className="space-y-4">
                    {donations.map((donation) => (
                      <div
                        key={donation.id}
                        className="bg-white p-5 rounded-xl border border-gray-100 shadow-soft"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center text-white font-bold">
                                {donation.donorName.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-semibold text-secondary">
                                {donation.donorName}
                              </span>
                            </div>
                            {donation.message && (
                              <p className="text-text-light mt-2 ml-12">
                                &ldquo;{donation.message}&rdquo;
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-primary">
                              ${donation.amount}
                            </div>
                            <div className="text-xs text-text-light">
                              {new Date(donation.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Donation Card */}
            <div className="lg:col-span-1 animate-slide-up">
              <div className="sticky top-24 bg-white rounded-2xl shadow-soft-lg p-6 border border-gray-100">
                {/* Progress */}
                <div className="mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <div className="text-4xl font-bold text-primary">
                        ${campaign.currentAmount.toLocaleString()}
                      </div>
                      <div className="text-text-light">
                        raised of ${campaign.goal.toLocaleString()} goal
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-secondary">
                        {((campaign.currentAmount / campaign.goal) * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-text-light">funded</div>
                    </div>
                  </div>
                  <ProgressBar current={campaign.currentAmount} goal={campaign.goal} size="md" />
                </div>

                {/* Stats */}
                <div className="flex justify-center gap-8 mb-6 py-4 border-y border-gray-100">
                  <div className="text-center">
                    <div className="text-xl font-bold text-secondary">
                      {campaign.donors}
                    </div>
                    <div className="text-sm text-text-light">Supporters</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-secondary">
                      {campaign.daysLeft}
                    </div>
                    <div className="text-sm text-text-light">Days Left</div>
                  </div>
                </div>

                {/* Support Button */}
                <button
                  onClick={openDonationModalHandler}
                  className="btn-primary w-full py-4 text-lg mb-3"
                >
                  Support This Initiative
                </button>

                {/* Share Buttons */}
                <button
                  onClick={shareCampaign}
                  className="w-full py-3 border-2 border-gray-200 rounded-lg font-semibold hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  Share This Initiative
                </button>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex justify-center gap-4 text-2xl">
                    <span title="Secure Contribution" className="cursor-help">
                      🔒
                    </span>
                    <span title="Verified Initiative" className="cursor-help">
                      ✓
                    </span>
                    <span title="Full Transparency" className="cursor-help">
                      💰
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
