/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Core SaaS Syndic Types

export type CategoryType = 'water' | 'electricity' | 'elevator' | 'insurance' | 'cleaning' | 'works' | 'other';

export interface CoOwner {
  id: string;
  name: string;
  email: string;
  phone: string;
  lotNumber: string; // e.g. "Lot 12 - Appt 3A"
  share: number; // in tantièmes/millièmes (out of 1000)
  balance: number; // relative to their calls for funds (negative means amount unpaid, positive is overpaid)
  status: 'up_to_date' | 'late' | 'warning';
  avatar?: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'expense' | 'income'; // income usually represent received co-owner fees (calls for funds)
  category: CategoryType;
  supplier?: string;
  receiptName?: string;
  status: 'paid' | 'pending';
}

export interface Incident {
  id: string;
  date: string;
  title: string;
  description: string;
  category: 'elevator' | 'plumbing' | 'electrical' | 'security' | 'cleaning' | 'structure' | 'other';
  status: 'reported' | 'in_progress' | 'resolved';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string; // contractor name
  cost?: number;
}

export interface Resolution {
  id: string;
  title: string;
  description: string;
  votesFor: number; // in tantièmes (e.g. 520)
  votesAgainst: number; // in tantièmes (e.g. 210)
  votesAbstain: number; // in tantièmes (e.g. 270)
  status: 'approved' | 'rejected' | 'pending';
}

export interface GeneralAssembly {
  id: string;
  date: string;
  time: string;
  title: string;
  location: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  agenda: string[];
  resolutions: Resolution[];
  pvGenerated: boolean;
}

export interface BuildingInfo {
  name: string;
  address: string;
  totalLots: number;
  fiscalYearStart: string;
  bankAccount: string;
  reserveFund: number;
  totalCash: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
