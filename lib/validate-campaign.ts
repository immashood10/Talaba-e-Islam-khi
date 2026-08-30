// Shared request-body validation for campaign create/update routes.
// Server-only (imported only from API routes).

import type { CampaignInput } from './campaign-store';

export type ValidateCampaignResult = { ok: true; data: CampaignInput } | { ok: false; error: string };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function validateCampaignInput(body: unknown): ValidateCampaignResult {
  const b = (body ?? {}) as Record<string, unknown>;

  if (!isNonEmptyString(b.title) || b.title.trim().length < 2) {
    return { ok: false, error: 'Please enter a title' };
  }
  if (!isNonEmptyString(b.description)) {
    return { ok: false, error: 'Please enter a short description' };
  }
  if (!isNonEmptyString(b.story)) {
    return { ok: false, error: 'Please enter the full story' };
  }
  if (!isNonEmptyString(b.image)) {
    return { ok: false, error: 'Please upload an image' };
  }
  if (typeof b.currentAmount !== 'number' || Number.isNaN(b.currentAmount) || b.currentAmount < 0) {
    return { ok: false, error: 'Please enter a valid raised amount' };
  }
  if (typeof b.goal !== 'number' || Number.isNaN(b.goal) || b.goal <= 0) {
    return { ok: false, error: 'Please enter a valid goal amount' };
  }
  if (typeof b.donors !== 'number' || Number.isNaN(b.donors) || b.donors < 0) {
    return { ok: false, error: 'Please enter a valid number of supporters' };
  }
  if (typeof b.daysLeft !== 'number' || Number.isNaN(b.daysLeft) || b.daysLeft < 0) {
    return { ok: false, error: 'Please enter a valid number of days left' };
  }
  if (!isNonEmptyString(b.category)) {
    return { ok: false, error: 'Please choose a category' };
  }

  const organiser = (b.organiser ?? {}) as Record<string, unknown>;
  if (!isNonEmptyString(organiser.name)) {
    return { ok: false, error: "Please enter the organiser's name" };
  }
  if (!isNonEmptyString(organiser.avatar)) {
    return { ok: false, error: 'Please upload an organiser photo' };
  }

  return {
    ok: true,
    data: {
      title: b.title.trim(),
      description: b.description.trim(),
      story: (b.story as string).trim(),
      image: b.image as string,
      currentAmount: b.currentAmount,
      goal: b.goal,
      donors: b.donors,
      daysLeft: b.daysLeft,
      category: b.category.trim(),
      organiser: {
        name: (organiser.name as string).trim(),
        avatar: organiser.avatar as string,
      },
      slug: isNonEmptyString(b.slug) ? b.slug.trim() : undefined,
    },
  };
}
