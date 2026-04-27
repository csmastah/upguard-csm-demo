import { LucideIcon } from 'lucide-react';

export type HealthGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export type AccountStage = 'Onboarding' | 'Adopted' | 'Expanding' | 'At Risk' | 'Churn Risk' | 'Renewal Due';

export interface AccountNews {
  id: string;
  type: 'Executive Departure' | 'Expansion Opportunity' | 'Successful QBR' | 'Technical Debt' | 'Security Alert' | 'Data Breach' | 'Regulatory Change' | 'Funding Round' | 'CISO Hire' | 'Supply Chain Incident' | 'Renewal Alert';
  title: string;
  description: string;
  time: string;
  variant: 'error' | 'primary' | 'success' | 'warning';
}

export interface Account {
  id: string;
  name: string;
  shortName: string;
  region: string;
  industry: string;
  healthScore: number;
  grade: HealthGrade;
  stage: AccountStage;
  arr: number;
  nrr: number;
  renewalDays: number;
  renewalDate: string;
  adoptionDepth: number;
  lastActivity: string;
  csm: string;
  intervention: string;
  news: AccountNews[];
  metrics: {
    loginFrequency: number;
    featureAdoption: number;
    supportVolume: 'Low' | 'Moderate' | 'High' | 'Critical';
    csmEngagement: number;
    vendorRisk: boolean;
    breachRisk: boolean;
    questionnaires: number;
    riskAutomations: boolean;
  };
}

export type Theme = 'dark' | 'upguard';
