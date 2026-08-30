import type { StaticImageData } from 'next/image';

export interface Campaign {
  id: string;
  title: string;
  description: string;
  story: string;
  image: string | StaticImageData;
  currentAmount: number;
  goal: number;
  donors: number;
  daysLeft: number;
  category: string;
  slug: string;
  createdAt: string;
  organiser: {
    name: string;
    avatar: string | StaticImageData;
  };
}

export interface Donation {
  id: string;
  campaignId: string;
  amount: number;
  donorName: string;
  message?: string;
  createdAt: string;
}

export const mockDonations: Donation[] = [
  {
    id: '1',
    campaignId: '1',
    amount: 100,
    donorName: 'Anonymous',
    message: 'May Allah bless these students with success.',
    createdAt: '2024-01-11T14:30:00Z',
  },
  {
    id: '2',
    campaignId: '1',
    amount: 50,
    donorName: 'A well-wisher',
    message: 'Proud to support our future leaders.',
    createdAt: '2024-01-11T15:45:00Z',
  },
  {
    id: '3',
    campaignId: '2',
    amount: 200,
    donorName: 'Anonymous',
    createdAt: '2024-01-09T09:20:00Z',
  },
  {
    id: '4',
    campaignId: '3',
    amount: 500,
    donorName: 'Karachi Supporter',
    message: 'Praying for all the affected families. Stay strong.',
    createdAt: '2024-01-06T11:00:00Z',
  },
  {
    id: '5',
    campaignId: '4',
    amount: 75,
    donorName: 'Community member',
    createdAt: '2024-01-02T16:30:00Z',
  },
];

export const categories = [
  {
    id: 'education',
    label: 'Education',
    icon: '📚',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'health',
    label: 'Health',
    icon: '🏥',
    color: 'bg-red-100 text-red-600',
  },
  {
    id: 'relief',
    label: 'Relief',
    icon: '🚨',
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    id: 'welfare',
    label: 'Welfare',
    icon: '🤲',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    id: 'youth affairs',
    label: 'Youth Affairs',
    icon: '🎓',
    color: 'bg-green-100 text-green-600',
  },
  {
    id: 'community',
    label: 'Community',
    icon: '🕌',
    color: 'bg-orange-100 text-orange-600',
  },
];
