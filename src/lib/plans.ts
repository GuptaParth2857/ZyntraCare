export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface Plan {
  id: 'free' | 'premium-monthly' | 'premium-yearly';
  name: string;
  tagline: string;
  price: number;
  period: 'forever' | 'month' | 'year';
  priceDisplay: string;
  popular: boolean;
  color: string;
  border: string;
  features: PlanFeature[];
  coverage: string;
  consultsPerDay: number;
  consultsPerMonth: number;
  familyMembers: number;
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Pay-per-consult basic access',
    price: 0,
    period: 'forever',
    priceDisplay: '0',
    popular: false,
    color: 'from-gray-500 to-gray-600',
    border: 'border-white/10',
    coverage: '1 (self)',
    consultsPerDay: 0,
    consultsPerMonth: 0,
    familyMembers: 0,
    features: [
      { text: 'Pay-per-use online consultations', included: true },
      { text: 'AI symptom checker & health risk assessment', included: true },
      { text: 'Personal health records vault', included: true },
      { text: 'Medicine reminders', included: true },
      { text: 'Family member profiles', included: false },
      { text: 'Unlimited consultations', included: false },
      { text: 'Priority doctor access', included: false },
    ],
  },
  {
    id: 'premium-monthly',
    name: 'Premium Monthly',
    tagline: 'Unlimited family consultations',
    price: 499,
    period: 'month',
    priceDisplay: '499',
    popular: true,
    color: 'from-blue-500 to-purple-600',
    border: 'border-blue-500/50',
    coverage: 'Up to 3 members',
    consultsPerDay: 5,
    consultsPerMonth: 15,
    familyMembers: 3,
    features: [
      { text: 'Unlimited online consultations', included: true },
      { text: 'Priority doctor access', included: true },
      { text: 'Premium health records vault', included: true },
      { text: '24/7 priority support', included: true },
      { text: 'AI-powered health insights', included: true },
      { text: 'Medicine reminders', included: true },
      { text: 'Family member profiles', included: true },
      { text: 'Annual health checkup voucher', included: false },
      { text: 'Free medicine delivery', included: false },
    ],
  },
  {
    id: 'premium-yearly',
    name: 'Premium Yearly',
    tagline: 'Complete care for the whole family',
    price: 4999,
    period: 'year',
    priceDisplay: '4,999',
    popular: false,
    color: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-500/50',
    coverage: 'Up to 6 members',
    consultsPerDay: 10,
    consultsPerMonth: 40,
    familyMembers: 6,
    features: [
      { text: 'Everything in Premium Monthly', included: true },
      { text: '2 months free', included: true },
      { text: 'Annual health checkup voucher', included: true },
      { text: 'Free medicine delivery', included: true },
      { text: 'Exclusive health tips', included: true },
      { text: 'Early access to new features', included: true },
      { text: 'Priority customer support', included: true },
    ],
  },
];

export const PLAN_BY_NAME: Record<string, Plan> = Object.fromEntries(
  PLANS.map((plan) => [plan.name, plan])
);