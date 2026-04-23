export const PLAN_LIMITS = {
  free:     { conversions_per_day: 5,   max_chars: 3000 },
  pro:      { conversions_per_day: 100,  max_chars: 15000 },
  business: { conversions_per_day: 500,  max_chars: 50000 },
} as const;

export type Plan = keyof typeof PLAN_LIMITS;
