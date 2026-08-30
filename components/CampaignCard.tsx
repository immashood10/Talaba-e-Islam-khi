'use client';

import type { StaticImageData } from 'next/image';
import { Campaign } from '@/lib/mock-data';

export interface CampaignCardProps {
  id: string;
  title: string;
  description: string;
  image: string | StaticImageData;
  currentAmount: number;
  goal: number;
  donors: number;
  daysLeft: number;
  category: string;
  slug: string;
  onDonate?: (campaign: Campaign) => void;
}

export default function CampaignCard({
  title,
  description,
  category,
}: CampaignCardProps) {
  return (
    <div className="card group hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <div className="flex-1 flex flex-col">
        <span className="inline-block w-fit bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold mb-3">
          {category}
        </span>
        <h3 className="text-lg font-bold text-secondary mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-text-light text-sm flex-1">
          {description}
        </p>
      </div>
    </div>
  );
}
