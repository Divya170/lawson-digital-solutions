export interface Service {
  id: string;
  n: string;
  tag: string;
  name: string;
  short: string;
  outcome: string;
  purpose: string;
  problems: string[];
  considerations: string[];
  deliverables: string[];
  flow: string[];
  updatedAt: string;
}

export interface HeroDiagram {
  label: string;
  file: string;
  inputs: string[];
  core: string;
  rows: [string, string][];
  outputs: string[];
  json: string;
  goal: string;
  stage: number;
}

export interface Content {
  services: Service[];
  hero: HeroDiagram[];
  stages: string[];
  marquee: string[];
  challenges: { problem: string; approach: string; service: string }[];
  process: { name: string; text: string; you: string }[];
  principles: { name: string; text: string }[];
  values: { name: string; text: string }[];
  solutions: { name: string; service: string; summary: string; signs: string[]; approach: string }[];
  caseOutline: { name: string; text: string }[];
  scopeExample: { goal: string; users: string; items: { label: string; phase: string; checked: boolean }[] };
  prompts: { label: string; text: string }[];
  budgets: string[];
  timelines: string[];
}

export interface Site {
  businessName: string;
  contactName: string;
  email: string;
  mailto: string;
  phone: string;
  tel: string;
  street: string;
  locality: string;
  locationLabel: string;
  timezone: string;
  budgetRanges: string[];
  timelines: string[];
  updatedAt: string;
}

export interface CaseStudy {
  id: number;
  slug: string;
  title: string;
  client: string;
  serviceId: string;
  serviceName: string;
  summary: string;
  requirement: string;
  approach: string;
  delivered: string;
  results: string;
  coverImage: string;
  status: 'draft' | 'published';
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type EnquiryStatus = 'new' | 'in_review' | 'replied' | 'closed';

export interface Enquiry {
  id: string;
  status: EnquiryStatus;
  name: string;
  email: string;
  company: string;
  serviceId: string;
  serviceName: string;
  budget: string;
  timeline: string;
  url: string;
  description: string;
  staffNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffUser {
  id: number;
  email: string;
  name: string;
  lastLoginAt: string | null;
}

export interface AdminStats {
  enquiries: { total: number; new: number };
  caseStudies: { total: number; published: number; drafts: number };
}
