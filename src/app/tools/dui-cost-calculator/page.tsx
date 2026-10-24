"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

/* ── State DUI data ── */
interface StateInfo {
  name: string;
  term: string; // DUI, DWI, OVI, OWI, OUI, DUII, OVUII
  fineMin: number; fineMax: number;
  totalFineMultiplier: number; // surcharges/assessments multiplier on base fine
  jailMin: number; jailMax: number; // days
  suspensionDays: number;
  iidMonths: number; // 0 = not required for standard 1st
  iidMonthlyRent: number; // ~$70-150/month
  communityServiceHours: number;
  duiSchoolHours: number;
  insIncreasePercent: number; // avg insurance rate increase %
  sr22Years: number;
  lookbackYears: number; // 0 = lifetime
  enhancedBAC: number; // threshold for enhanced penalties
  // Second offense
  fine2Min: number; fine2Max: number;
  jail2Min: number; jail2Max: number;
  suspension2Days: number;
  notes?: string;
}

const STATES: Record<string, StateInfo> = {
  AL: { name: "Alabama", term: "DUI", fineMin: 600, fineMax: 2100, totalFineMultiplier: 1.5, jailMin: 0, jailMax: 365, suspensionDays: 90, iidMonths: 0, iidMonthlyRent: 80, communityServiceHours: 0, duiSchoolHours: 0, insIncreasePercent: 80, sr22Years: 3, lookbackYears: 5, enhancedBAC: 0.15, fine2Min: 1100, fine2Max: 5100, jail2Min: 5, jail2Max: 365, suspension2Days: 365 },
  AK: { name: "Alaska", term: "DUI", fineMin: 1500, fineMax: 25000, totalFineMultiplier: 1.2, jailMin: 3, jailMax: 365, suspensionDays: 90, iidMonths: 6, iidMonthlyRent: 100, communityServiceHours: 0, duiSchoolHours: 0, insIncreasePercent: 80, sr22Years: 5, lookbackYears: 0, enhancedBAC: 0.15, fine2Min: 3000, fine2Max: 25000, jail2Min: 20, jail2Max: 365, suspension2Days: 365 },
  AZ: { name: "Arizona", term: "DUI", fineMin: 1250, fineMax: 1250, totalFineMultiplier: 2.0, jailMin: 1, jailMax: 180, suspensionDays: 90, iidMonths: 6, iidMonthlyRent: 80, communityServiceHours: 0, duiSchoolHours: 16, insIncreasePercent: 65, sr22Years: 3, lookbackYears: 7, enhancedBAC: 0.15, fine2Min: 3000, fine2Max: 3000, jail2Min: 30, jail2Max: 180, suspension2Days: 365, notes: "Extreme DUI (0.15+): 30 days jail min, $2,500+ fines. Super Extreme (0.20+): 45 days jail min." },
  AR: { name: "Arkansas", term: "DWI", fineMin: 150, fineMax: 1000, totalFineMultiplier: 2.0, jailMin: 1, jailMax: 365, suspensionDays: 180, iidMonths: 0, iidMonthlyRent: 80, communityServiceHours: 0, duiSchoolHours: 0, insIncreasePercent: 80, sr22Years: 3, lookbackYears: 5, enhancedBAC: 0.15, fine2Min: 400, fine2Max: 3000, jail2Min: 7, jail2Max: 365, suspension2Days: 730 },
  CA: { name: "California", term: "DUI", fineMin: 390, fineMax: 1000, totalFineMultiplier: 4.0, jailMin: 2, jailMax: 180, suspensionDays: 180, iidMonths: 4, iidMonthlyRent: 80, communityServiceHours: 0, duiSchoolHours: 30, insIncreasePercent: 125, sr22Years: 3, lookbackYears: 10, enhancedBAC: 0.15, fine2Min: 390, fine2Max: 1000, jail2Min: 90, jail2Max: 365, suspension2Days: 730, notes: "Base fines are low but penalty assessments multiply total to $3,600-$4,000+. DUI school: 3-month (standard) or 9-month (high BAC)." },
  CO: { name: "Colorado", term: "DUI", fineMin: 600, fineMax: 1000, totalFineMultiplier: 2.0, jailMin: 5, jailMax: 365, suspensionDays: 270, iidMonths: 8, iidMonthlyRent: 80, communityServiceHours: 48, duiSchoolHours: 24, insIncreasePercent: 70, sr22Years: 3, lookbackYears: 0, enhancedBAC: 0.15, fine2Min: 600, fine2Max: 1500, jail2Min: 10, jail2Max: 365, suspension2Days: 365 },
  CT: { name: "Connecticut", term: "DUI", fineMin: 500, fineMax: 1000, totalFineMultiplier: 1.5, jailMin: 0, jailMax: 180, suspensionDays: 45, iidMonths: 6, iidMonthlyRent: 100, communityServiceHours: 0, duiSchoolHours: 16, insIncreasePercent: 80, sr22Years: 3, lookbackYears: 10, enhancedBAC: 0.16, fine2Min: 1000, fine2Max: 4000, jail2Min: 120, jail2Max: 730, suspension2Days: 45 },
  DE: { name: "Delaware", term: "DUI", fineMin: 500, fineMax: 1500, totalFineMultiplier: 1.5, jailMin: 0, jailMax: 180, suspensionDays: 365, iidMonths: 0, iidMonthlyRent: 80, communityServiceHours: 0, duiSchoolHours: 16, insIncreasePercent: 80, sr22Years: 0, lookbackYears: 0, enhancedBAC: 0.15, fine2Min: 750, fine2Max: 2500, jail2Min: 60, jail2Max: 540, suspension2Days: 365 },
  DC: { name: "District of Columbia", term: "DUI", fineMin: 0, fineMax: 1000, totalFineMultiplier: 2.0, jailMin: 0, jailMax: 180, suspensionDays: 180, iidMonths: 6, iidMonthlyRent: 100, communityServiceHours: 0, duiSchoolHours: 0, insIncreasePercent: 80, sr22Years: 3, lookbackYears: 15, enhancedBAC: 0.20, fine2Min: 0, fine2Max: 2500, jail2Min: 10, jail2Max: 365, suspension2Days: 365 },
  FL: { name: "Florida", term: "DUI", fineMin: 500, fineMax: 1000, totalFineMultiplier: 2.0, jailMin: 0, jailMax: 180, suspensionDays: 180, iidMonths: 0, iidMonthlyRent: 80, communityServiceHours: 50, duiSchoolHours: 12, insIncreasePercent: 80, sr22Years: 3, lookbackYears: 5, enhancedBAC: 0.15, fine2Min: 1000, fine2Max: 2000, jail2Min: 10, jail2Max: 270, suspension2Days: 180, notes: "FR-44 required (higher insurance minimums). Vehicle impounded 10 days." },
  GA: { name: "Georgia", term: "DUI", fineMin: 300, fineMax: 1000, totalFineMultiplier: 2.0, jailMin: 1, jailMax: 365, suspensionDays: 120, iidMonths: 0, iidMonthlyRent: 80, communityServiceHours: 40, duiSchoolHours: 20, insIncreasePercent: 112, sr22Years: 3, lookbackYears: 10, enhancedBAC: 0.15, fine2Min: 600, fine2Max: 1000, jail2Min: 2, jail2Max: 365, suspension2Days: 540 },
  HI: { name: "Hawaii", term: "OVUII", fineMin: 150, fineMax: 1000, totalFineMultiplier: 2.0, jailMin: 2, jailMax: 5, suspensionDays: 365, iidMonths: 12, iidMonthlyRent: 100, communityServiceHours: 72, duiSchoolHours: 14, insIncreasePercent: 115, sr22Years: 3, lookbackYears: 10, enhancedBAC: 0.15, fine2Min: 500, fine2Max: 1500, jail2Min: 5, jail2Max: 30, suspension2Days: 365 },
  ID: { name: "Idaho", term: "DUI", fineMin: 0, fineMax: 1000, totalFineMultiplier: 2.0, jailMin: 0, jailMax: 180, suspensionDays: 90, iidMonths: 0, iidMonthlyRent: 80, communityServiceHours: 0, duiSchoolHours: 0, insIncreasePercent: 80, sr22Years: 3, lookbackYears: 10, enhancedBAC: 0.20, fine2Min: 0, fine2Max: 2000, jail2Min: 10, jail2Max: 365, suspension2Days: 365 },
  IL: { name: "Illinois", term: "DUI", fineMin: 0, fineMax: 2500, totalFineMultiplier: 1.5, jailMin: 0, jailMax: 364, suspensionDays: 180, iidMonths: 0, iidMonthlyRent: 80, communityServiceHours: 0, duiSchoolHours: 10, insIncreasePercent: 70, sr22Years: 3, lookbackYears: 0, enhancedBAC: 0.16, fine2Min: 0, fine2Max: 2500, jail2Min: 5, jail2Max: 364, suspension2Days: 1825, notes: "BAC >= 0.16: $500 mandatory min fine + 100 hours community service." },
  IN: { name: "Indiana", term: "OWI", fineMin: 0, fineMax: 5000, totalFineMultiplier: 1.5, jailMin: 0, jailMax: 60, suspensionDays: 90, iidMonths: 0, iidMonthlyRent: 80, communityServiceHours: 0, duiSchoolHours: 0, insIncreasePercent: 80, sr22Years: 3, lookbackYears: 0, enhancedBAC: 0.15, fine2Min: 0, fine2Max: 10000, jail2Min: 5, jail2Max: 1095, suspension2Days: 180 },
  IA: { name: "Iowa", term: "OWI", fineMin: 1250, fineMax: 1250, totalFineMultiplier: 1.5, jailMin: 2, jailMax: 365, suspensionDays: 180, iidMonths: 6, iidMonthlyRent: 80, communityServiceHours: 0, duiSchoolHours: 12, insIncreasePercent: 80, sr22Years: 3, lookbackYears: 12, enhancedBAC: 0.15, fine2Min: 1875, fine2Max: 1875, jail2Min: 7, jail2Max: 730, suspension2Days: 365 },
  KS: { name: "Kansas", term: "DUI", fineMin: 750, fineMax: 1000, totalFineMultiplier: 2.0, jailMin: 2, jailMax: 180, suspensionDays: 30, iidMonths: 6, iidMonthlyRent: 80, communityServiceHours: 100, duiSchoolHours: 0, insIncreasePercent: 80, sr22Years: 3, lookbackYears: 0, enhancedBAC: 0.15, fine2Min: 1250, fine2Max: 1750, jail2Min: 4, jail2Max: 365, suspension2Days: 365 },
  KY: { name: "Kentucky", term: "DUI", fineMin: 200, fineMax: 500, totalFineMultiplier: 2.0, jailMin: 2, jailMax: 30, suspensionDays: 30, iidMonths: 6, iidMonthlyRent: 80, communityServiceHours: 0, duiSchoolHours: 20, insIncreasePercent: 80, sr22Years: 0, lookbackYears: 10, enhancedBAC: 0.15, fine2Min: 350, fine2Max: 500, jail2Min: 7, jail2Max: 180, suspension2Days: 365 },
  LA: { name: "Louisiana", term: "DWI", fineMin: 300, fineMax: 1000, totalFineMultiplier: 1.5, jailMin: 0, jailMax: 180, suspensionDays: 90, iidMonths: 6, iidMonthlyRent: 100, communityServiceHours: 32, duiSchoolHours: 0, insIncreasePercent: 80, sr22Years: 3, lookbackYears: 10, enhancedBAC: 0.15, fine2Min: 750, fine2Max: 1000, jail2Min: 30, jail2Max: 180, suspension2Days: 730 },
  ME: { name: "Maine", term: "OUI", fineMin: 500, fineMax: 2000, totalFineMultiplier: 1.5, jailMin: 0, jailMax: 364, suspensionDays: 150, iidMonths: 0, iidMonthlyRent: 80, communityServiceHours: 0, duiSchoolHours: 0, insIncreasePercent: 80, sr22Years: 3, lookbackYears: 10, enhancedBAC: 0.15, fine2Min: 700, fine2Max: 3000, jail2Min: 7, jail2Max: 364, suspension2Days: 1095 },
  MD: { name: "Maryland", term: "DUI", fineMin: 0, fineMax: 1000, totalFineMultiplier: 2.0, jailMin: 0, jailMax: 365, suspensionDays: 180, iidMonths: 6, iidMonthlyRent: 80, communityServiceHours: 0, duiSchoolHours: 12, insIncreasePercent: 80, sr22Years: 3, lookbackYears: 5, enhancedBAC: 0.15, fine2Min: 0, fine2Max: 2000, jail2Min: 5, jail2Max: 730, suspension2Days: 365 },
  MA: { name: "Massachusetts", term: "OUI", fineMin: 500, fineMax: 5000, totalFineMultiplier: 1.5, jailMin: 0, jailMax: 912, suspensionDays: 365, iidMonths: 24, iidMonthlyRent: 100, communityServiceHours: 0, duiSchoolHours: 16, insIncreasePercent: 80, sr22Years: 3, lookbackYears: 0, enhancedBAC: 0.15, fine2Min: 600, fine2Max: 10000, jail2Min: 30, jail2Max: 912, suspension2Days: 730 },
  MI: { name: "Michigan", term: "OWI", fineMin: 100, fineMax: 500, totalFineMultiplier: 3.0, jailMin: 0, jailMax: 93, suspensionDays: 30, iidMonths: 0, iidMonthlyRent: 80, communityServiceHours: 0, duiSchoolHours: 0, insIncreasePercent: 115, sr22Years: 3, lookbackYears: 7, enhancedBAC: 0.17, fine2Min: 200, fine2Max: 1000, jail2Min: 5, jail2Max: 365, suspension2Days: 365 },
  MN: { name: "Minnesota", term: "DWI", fineMin: 0, fineMax: 1000, totalFineMultiplier: 2.0, jailMin: 0, jailMax: 90, suspensionDays: 90, iidMonths: 0, iidMonthlyRent: 80, communityServiceHours: 0, duiSchoolHours: 0, insIncreasePercent: 112, sr22Years: 0, lookbackYears: 10, enhancedBAC: 0.16, fine2Min: 0, fine2Max: 3000, jail2Min: 30, jail2Max: 365, suspension2Days: 365 },
  MS: { name: "Mississippi", term: "DUI", fineMin: 250, fineMax: 1000, totalFineMultiplier: 1.5, jailMin: 0, jailMax: 2, suspensionDays: 90, iidMonths: 0, iidMonthlyRent: 80, communityServiceHours: 0, duiSchoolHours: 0, insIncreasePercent: 80, sr22Years: 3, lookbackYears: 5, enhancedBAC: 0.15, fine2Min: 600, fine2Max: 1500, jail2Min: 0, jail2Max: 365, suspension2Days: 730 },
  MO: { name: "Missouri", term: "DWI", fineMin: 0, fineMax: 500, totalFineMultiplier: 2.0, jailMin: 0, jailMax: 180, suspensionDays: 30, iidMonths: 0, iidMonthlyRent: 80, communityServiceHours: 0, duiSchoolHours: 0, insIncreasePercent: 80, sr22Years: 3, lookbackYears: 5, enhancedBAC: 0.15, fine2Min: 0, fine2Max: 1000, jail2Min: 0, jail2Max: 365, suspension2Days: 1825 },
  MT: { name: "Montana", term: "DUI", fineMin: 600, fineMax: 1000, totalFineMultiplier: 1.5, jailMin: 1, jailMax: 180, suspensionDays: 180, iidMonths: 0, iidMonthlyRent: 80, communityServiceHours: 0, duiSchoolHours: 16, insIncreasePercent: 80, sr22Years: 3, lookbackYears: 10, enhancedBAC: 0.16, fine2Min: 1200, fine2Max: 2000, jail2Min: 7, jail2Max: 180, suspension2Days: 365 },
  NE: { name: "Nebraska", term: "DUI", fineMin: 500, fineMax: 500, totalFineMultiplier: 2.0, jailMin: 0, jailMax: 60, suspensionDays: 180, iidMonths: 6, iidMonthlyRent: 80, communityServiceHours: 0, duiSchoolHours: 0, insIncreasePercent: 80, sr22Years: 3, lookbackYears: 15, enhancedBAC: 0.15, fine2Min: 500, fine2Max: 500, jail2Min: 30, jail2Max: 180, suspension2Days: 540 },
  NV: { name: "Nevada", term: "DUI", fineMin: 400, fineMax: 1000, totalFineMultiplier: 2.0, jailMin: 2, jailMax: 180, suspensionDays: 185, iidMonths: 3, iidMonthlyRent: 80, communityServiceHours: 48, duiSchoolHours: 8, insIncreasePercent: 80, sr22Years: 3, lookbackYears: 7, enhancedBAC: 0.18, fine2Min: 750, fine2Max: 1000, jail2Min: 10, jail2Max: 180, suspension2Days: 365 },
  NH: { name: "New Hampshire", term: "DWI", fineMin: 500, fineMax: 1200, totalFineMultiplier: 1.5, jailMin: 0, jailMax: 0, suspensionDays: 270, iidMonths: 12, iidMonthlyRent: 100, communityServiceHours: 0, duiSchoolHours: 20, insIncreasePercent: 80, sr22Years: 3, lookbackYears: 10, enhancedBAC: 0.16, fine2Min: 750, fine2Max: 2000, jail2Min: 21, jail2Max: 365, suspension2Days: 1095 },
  NJ: { name: "New Jersey", term: "DWI", fineMin: 250, fineMax: 500, totalFineMultiplier: 1.5, jailMin: 0, jailMax: 30, suspensionDays: 90, iidMonths: 3, iidMonthlyRent: 100, communityServiceHours: 0, duiSchoolHours: 12, insIncreasePercent: 60, sr22Years: 3, lookbackYears: 10, enhancedBAC: 0.10, fine2Min: 500, fine2Max: 1000, jail2Min: 2, jail2Max: 90, suspension2Days: 365, notes: "$3,000 state surcharge ($1,000/year for 3 years). Among highest total costs." },
  NM: { name: "New Mexico", term: "DWI", fineMin: 500, fineMax: 500, totalFineMultiplier: 2.0, jailMin: 0, jailMax: 90, suspensionDays: 365, iidMonths: 12, iidMonthlyRent: 80, communityServiceHours: 24, duiSchoolHours: 0, insIncreasePercent: 80, sr22Years: 0, lookbackYears: 0, enhancedBAC: 0.16, fine2Min: 500, fine2Max: 1000, jail2Min: 3, jail2Max: 364, suspension2Days: 730 },
  NY: { name: "New York", term: "DWI", fineMin: 500, fineMax: 1000, totalFineMultiplier: 2.0, jailMin: 0, jailMax: 365, suspensionDays: 180, iidMonths: 6, iidMonthlyRent: 100, communityServiceHours: 0, duiSchoolHours: 16, insIncreasePercent: 87, sr22Years: 3, lookbackYears: 10, enhancedBAC: 0.18, fine2Min: 1000, fine2Max: 5000, jail2Min: 5, jail2Max: 1460, suspension2Days: 365, notes: "$250/year Driver Responsibility Assessment for 3 years ($750 total). Aggravated DWI (0.18+): $1,000-$2,500 fine." },
  NC: { name: "North Carolina", term: "DWI", fineMin: 200, fineMax: 4000, totalFineMultiplier: 1.5, jailMin: 1, jailMax: 730, suspensionDays: 365, iidMonths: 0, iidMonthlyRent: 80, communityServiceHours: 24, duiSchoolHours: 16, insIncreasePercent: 350, sr22Years: 3, lookbackYears: 7, enhancedBAC: 0.15, fine2Min: 200, fine2Max: 4000, jail2Min: 7, jail2Max: 730, suspension2Days: 1460, notes: "Largest insurance increase in the nation (300-400%+). Sentencing levels I-V based on aggravating/mitigating factors." },
  ND: { name: "North Dakota", term: "DUI", fineMin: 500, fineMax: 1500, totalFineMultiplier: 1.5, jailMin: 0, jailMax: 30, suspensionDays: 91, iidMonths: 6, iidMonthlyRent: 80, communityServiceHours: 0, duiSchoolHours: 0, insIncreasePercent: 80, sr22Years: 3, lookbackYears: 7, enhancedBAC: 0.16, fine2Min: 1500, fine2Max: 3500, jail2Min: 10, jail2Max: 365, suspension2Days: 365 },
  OH: { name: "Ohio", term: "OVI", fineMin: 375, fineMax: 1075, totalFineMultiplier: 2.0, jailMin: 3, jailMax: 180, suspensionDays: 365, iidMonths: 0, iidMonthlyRent: 80, communityServiceHours: 0, duiSchoolHours: 3, insIncreasePercent: 70, sr22Years: 3, lookbackYears: 10, enhancedBAC: 0.17, fine2Min: 525, fine2Max: 1625, jail2Min: 10, jail2Max: 180, suspension2Days: 365, notes: "BAC >= 0.17: mandatory yellow plates, 6-day jail min, mandatory IID." },
  OK: { name: "Oklahoma", term: "DUI", fineMin: 0, fineMax: 1000, totalFineMultiplier: 2.0, jailMin: 0, jailMax: 365, suspensionDays: 180, iidMonths: 18, iidMonthlyRent: 80, communityServiceHours: 0, duiSchoolHours: 10, insIncreasePercent: 80, sr22Years: 3, lookbackYears: 10, enhancedBAC: 0.15, fine2Min: 0, fine2Max: 2500, jail2Min: 365, jail2Max: 1825, suspension2Days: 365, notes: "SB 54 (eff. Nov 2025): some first-offense DUIs now felonies." },
  OR: { name: "Oregon", term: "DUII", fineMin: 1000, fineMax: 6250, totalFineMultiplier: 1.5, jailMin: 2, jailMax: 365, suspensionDays: 365, iidMonths: 12, iidMonthlyRent: 80, communityServiceHours: 80, duiSchoolHours: 0, insIncreasePercent: 80, sr22Years: 3, lookbackYears: 0, enhancedBAC: 0.15, fine2Min: 1000, fine2Max: 6250, jail2Min: 2, jail2Max: 365, suspension2Days: 1095 },
  PA: { name: "Pennsylvania", term: "DUI", fineMin: 0, fineMax: 5000, totalFineMultiplier: 1.5, jailMin: 0, jailMax: 180, suspensionDays: 0, iidMonths: 0, iidMonthlyRent: 80, communityServiceHours: 0, duiSchoolHours: 12, insIncreasePercent: 40, sr22Years: 0, lookbackYears: 10, enhancedBAC: 0.10, fine2Min: 300, fine2Max: 10000, jail2Min: 5, jail2Max: 1825, suspension2Days: 365, notes: "Tiered by BAC: 0.08-0.099 (general), 0.10-0.159 (high), 0.16+ (highest). Lowest insurance increase nationally." },
  RI: { name: "Rhode Island", term: "DUI", fineMin: 100, fineMax: 300, totalFineMultiplier: 3.0, jailMin: 0, jailMax: 365, suspensionDays: 30, iidMonths: 0, iidMonthlyRent: 80, communityServiceHours: 10, duiSchoolHours: 0, insIncreasePercent: 80, sr22Years: 3, lookbackYears: 5, enhancedBAC: 0.15, fine2Min: 400, fine2Max: 1000, jail2Min: 10, jail2Max: 365, suspension2Days: 365 },
  SC: { name: "South Carolina", term: "DUI", fineMin: 400, fineMax: 400, totalFineMultiplier: 2.5, jailMin: 2, jailMax: 30, suspensionDays: 180, iidMonths: 6, iidMonthlyRent: 80, communityServiceHours: 0, duiSchoolHours: 10, insIncreasePercent: 80, sr22Years: 3, lookbackYears: 10, enhancedBAC: 0.15, fine2Min: 2100, fine2Max: 5100, jail2Min: 5, jail2Max: 365, suspension2Days: 365 },
  SD: { name: "South Dakota", term: "DUI", fineMin: 0, fineMax: 2000, totalFineMultiplier: 1.5, jailMin: 0, jailMax: 365, suspensionDays: 30, iidMonths: 0, iidMonthlyRent: 80, communityServiceHours: 0, duiSchoolHours: 0, insIncreasePercent: 80, sr22Years: 3, lookbackYears: 10, enhancedBAC: 0.17, fine2Min: 0, fine2Max: 2000, jail2Min: 0, jail2Max: 365, suspension2Days: 365 },
  TN: { name: "Tennessee", term: "DUI", fineMin: 350, fineMax: 1500, totalFineMultiplier: 2.0, jailMin: 2, jailMax: 364, suspensionDays: 365, iidMonths: 12, iidMonthlyRent: 80, communityServiceHours: 0, duiSchoolHours: 0, insIncreasePercent: 80, sr22Years: 3, lookbackYears: 10, enhancedBAC: 0.20, fine2Min: 600, fine2Max: 3500, jail2Min: 45, jail2Max: 364, suspension2Days: 730 },
  TX: { name: "Texas", term: "DWI", fineMin: 0, fineMax: 2000, totalFineMultiplier: 3.0, jailMin: 3, jailMax: 180, suspensionDays: 90, iidMonths: 6, iidMonthlyRent: 80, communityServiceHours: 24, duiSchoolHours: 12, insIncreasePercent: 85, sr22Years: 3, lookbackYears: 0, enhancedBAC: 0.15, fine2Min: 0, fine2Max: 4000, jail2Min: 30, jail2Max: 365, suspension2Days: 180, notes: "BAC >= 0.15: Class A Misdemeanor, fines up to $4,000, jail up to 1 year. Total costs with surcharges can reach $6,000+." },
  UT: { name: "Utah", term: "DUI", fineMin: 1310, fineMax: 1310, totalFineMultiplier: 1.5, jailMin: 2, jailMax: 180, suspensionDays: 120, iidMonths: 18, iidMonthlyRent: 80, communityServiceHours: 48, duiSchoolHours: 16, insIncreasePercent: 80, sr22Years: 3, lookbackYears: 10, enhancedBAC: 0.16, fine2Min: 1560, fine2Max: 1560, jail2Min: 10, jail2Max: 180, suspension2Days: 730, notes: "Utah has the lowest BAC limit in the nation: 0.05." },
  VT: { name: "Vermont", term: "DUI", fineMin: 0, fineMax: 750, totalFineMultiplier: 2.0, jailMin: 0, jailMax: 730, suspensionDays: 90, iidMonths: 12, iidMonthlyRent: 100, communityServiceHours: 0, duiSchoolHours: 0, insIncreasePercent: 110, sr22Years: 3, lookbackYears: 0, enhancedBAC: 0.16, fine2Min: 0, fine2Max: 1500, jail2Min: 0, jail2Max: 730, suspension2Days: 540 },
  VA: { name: "Virginia", term: "DUI", fineMin: 250, fineMax: 2500, totalFineMultiplier: 1.5, jailMin: 0, jailMax: 365, suspensionDays: 365, iidMonths: 12, iidMonthlyRent: 80, communityServiceHours: 0, duiSchoolHours: 20, insIncreasePercent: 75, sr22Years: 4, lookbackYears: 10, enhancedBAC: 0.15, fine2Min: 500, fine2Max: 2500, jail2Min: 10, jail2Max: 365, suspension2Days: 1095, notes: "BAC 0.15-0.20: 5-day mandatory jail. BAC > 0.20: 10-day mandatory jail. FR-44 required (higher insurance)." },
  WA: { name: "Washington", term: "DUI", fineMin: 991, fineMax: 5000, totalFineMultiplier: 1.5, jailMin: 1, jailMax: 364, suspensionDays: 90, iidMonths: 12, iidMonthlyRent: 80, communityServiceHours: 15, duiSchoolHours: 16, insIncreasePercent: 65, sr22Years: 3, lookbackYears: 7, enhancedBAC: 0.15, fine2Min: 1246, fine2Max: 5000, jail2Min: 30, jail2Max: 364, suspension2Days: 730, notes: "DUI stays on record for 99 years. Cannot be expunged." },
  WV: { name: "West Virginia", term: "DUI", fineMin: 100, fineMax: 500, totalFineMultiplier: 2.0, jailMin: 0, jailMax: 180, suspensionDays: 180, iidMonths: 0, iidMonthlyRent: 80, communityServiceHours: 0, duiSchoolHours: 0, insIncreasePercent: 80, sr22Years: 3, lookbackYears: 10, enhancedBAC: 0.15, fine2Min: 1000, fine2Max: 3000, jail2Min: 180, jail2Max: 365, suspension2Days: 3650 },
  WI: { name: "Wisconsin", term: "OWI", fineMin: 150, fineMax: 300, totalFineMultiplier: 3.0, jailMin: 0, jailMax: 0, suspensionDays: 180, iidMonths: 12, iidMonthlyRent: 80, communityServiceHours: 0, duiSchoolHours: 0, insIncreasePercent: 80, sr22Years: 3, lookbackYears: 0, enhancedBAC: 0.15, fine2Min: 300, fine2Max: 1100, jail2Min: 5, jail2Max: 180, suspension2Days: 365, notes: "First offense OWI is a civil infraction (not criminal) in Wisconsin — the only state where this is the case." },
  WY: { name: "Wyoming", term: "DUI", fineMin: 0, fineMax: 750, totalFineMultiplier: 2.0, jailMin: 0, jailMax: 180, suspensionDays: 90, iidMonths: 0, iidMonthlyRent: 80, communityServiceHours: 0, duiSchoolHours: 0, insIncreasePercent: 80, sr22Years: 3, lookbackYears: 10, enhancedBAC: 0.15, fine2Min: 0, fine2Max: 750, jail2Min: 7, jail2Max: 180, suspension2Days: 365 },
};

const COMPARE_STATES = ["CA", "TX", "NY", "FL", "IL", "AZ", "PA", "GA", "NC", "CO", "VA", "OH"];

const AVG_ANNUAL_INSURANCE = 2000; // rough national avg
const ATTORNEY_FEE_LOW = 2500;
const ATTORNEY_FEE_HIGH = 10000;
const IID_INSTALL = 150;
const TOWING_IMPOUND = 500;
const BAIL_BOND = 500;

export default function Page() {
  const [state, setState] = useState("CA");
  const [offense, setOffense] = useState<"first" | "second">("first");
  const [bac, setBac] = useState(0.12);
  const [annualInsurance, setAnnualInsurance] = useState(2000);
  const [includeAttorney, setIncludeAttorney] = useState(true);

  const stateInfo = STATES[state];

  const result = useMemo(() => {
    const si = STATES[state];
    const isFirst = offense === "first";
    const isHighBAC = bac >= si.enhancedBAC;

    // Fines
    const baseFineMin = isFirst ? si.fineMin : si.fine2Min;
    const baseFineMax = isFirst ? si.fineMax : si.fine2Max;
    const totalFineMin = Math.round(baseFineMin * si.totalFineMultiplier);
    const totalFineMax = Math.round(baseFineMax * si.totalFineMultiplier);

    // Jail
    const jailMinDays = isFirst ? si.jailMin : si.jail2Min;
    const jailMaxDays = isFirst ? si.jailMax : si.jail2Max;

    // Suspension
    const suspDays = isFirst ? si.suspensionDays : si.suspension2Days;

    // IID
    const iidMo = isFirst ? si.iidMonths : Math.max(si.iidMonths * 2, 12);
    const iidCost = iidMo > 0 ? IID_INSTALL + (iidMo * si.iidMonthlyRent) : 0;

    // Insurance increase
    const insIncreasePct = isFirst ? si.insIncreasePercent : Math.min(si.insIncreasePercent * 1.5, 500);
    const annualIncrease = annualInsurance * (insIncreasePct / 100);
    const insYears = si.sr22Years > 0 ? si.sr22Years : 3;
    const totalInsIncrease = annualIncrease * insYears;

    // DUI school
    const duiSchoolCost = si.duiSchoolHours > 0 ? Math.max(250, si.duiSchoolHours * 25) : 0;

    // Community service (lost wages equivalent, ~$15/hr)
    const csHours = si.communityServiceHours;

    // Attorney
    const attorneyLow = includeAttorney ? ATTORNEY_FEE_LOW : 0;
    const attorneyHigh = includeAttorney ? ATTORNEY_FEE_HIGH : 0;

    // Total cost ranges
    const totalLow = totalFineMin + iidCost + totalInsIncrease + duiSchoolCost + TOWING_IMPOUND + BAIL_BOND + attorneyLow;
    const totalHigh = totalFineMax + iidCost + totalInsIncrease + duiSchoolCost + TOWING_IMPOUND + BAIL_BOND + attorneyHigh;

    // Breakdown
    const breakdown = [
      { label: "Fines & Court Costs", low: totalFineMin, high: totalFineMax },
      { label: `Insurance Increase (${insYears} years)`, low: Math.round(totalInsIncrease), high: Math.round(totalInsIncrease) },
      ...(iidCost > 0 ? [{ label: `IID (${iidMo} months)`, low: iidCost, high: iidCost }] : []),
      ...(duiSchoolCost > 0 ? [{ label: "DUI School/Education", low: duiSchoolCost, high: duiSchoolCost }] : []),
      { label: "Towing & Impound", low: TOWING_IMPOUND, high: TOWING_IMPOUND },
      { label: "Bail/Bond", low: BAIL_BOND, high: BAIL_BOND },
      ...(includeAttorney ? [{ label: "Attorney Fees", low: attorneyLow, high: attorneyHigh }] : []),
    ];

    // Comparisons
    const comparisons = COMPARE_STATES
      .filter(s => s !== state)
      .slice(0, 7)
      .map(s => {
        const csi = STATES[s];
        const cFineMax = isFirst ? csi.fineMax : csi.fine2Max;
        const cTotalFine = Math.round(cFineMax * csi.totalFineMultiplier);
        const cIID = isFirst ? csi.iidMonths : Math.max(csi.iidMonths * 2, 12);
        const cIIDCost = cIID > 0 ? IID_INSTALL + cIID * csi.iidMonthlyRent : 0;
        const cInsPct = isFirst ? csi.insIncreasePercent : Math.min(csi.insIncreasePercent * 1.5, 500);
        const cInsTotal = annualInsurance * (cInsPct / 100) * (csi.sr22Years > 0 ? csi.sr22Years : 3);
        const cSchool = csi.duiSchoolHours > 0 ? Math.max(250, csi.duiSchoolHours * 25) : 0;
        const cTotal = cTotalFine + cIIDCost + cInsTotal + cSchool + TOWING_IMPOUND + BAIL_BOND + (includeAttorney ? ATTORNEY_FEE_HIGH : 0);
        return { state: s, name: csi.name, term: csi.term, total: Math.round(cTotal), insIncrease: Math.round(cInsPct) };
      });

    return { totalLow: Math.round(totalLow), totalHigh: Math.round(totalHigh), breakdown, jailMinDays, jailMaxDays, suspDays, iidMo, csHours, insIncreasePct: Math.round(insIncreasePct), isHighBAC, comparisons, totalInsIncrease: Math.round(totalInsIncrease) };
  }, [state, offense, bac, annualInsurance, includeAttorney]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 text-sm";
  const labelCls = "block text-sm text-zinc-400 mb-1";
  const cardCls = "bg-zinc-900 border border-zinc-800 rounded-xl p-4";

  return (
    <ToolLayout
      title="DUI Cost Calculator"
      description={`Estimate the total cost of a DUI/${stateInfo.term} in all 50 states. Includes fines, insurance increases, IID costs, attorney fees, license suspension, and jail time for first and second offenses.`}
      slug="dui-cost-calculator"
      category="Finance"
      keywords={["dui cost calculator", "dui cost", "how much does a dui cost", "dui fine calculator", "dwi cost calculator", "dui penalties by state", "cost of dui"]}
      faqs={[
        { question: "How much does a DUI cost?", answer: "A first-offense DUI typically costs $10,000-$25,000+ when you include fines, court costs, insurance increases, IID costs, DUI school, attorney fees, towing, and bail. The insurance increase alone averages $5,000-$15,000 over 3-5 years. North Carolina has the highest insurance impact (300-400% increase) while Pennsylvania has the lowest (30-50%)." },
        { question: "How much does car insurance go up after a DUI?", answer: "Nationally, insurance rates increase about 88% on average after a DUI. North Carolina has the largest increase at 300-400%+. California, Georgia, Hawaii, and Michigan see 100-130% increases. Pennsylvania has the lowest at 30-50%. The increase typically lasts 3-5 years and can add $5,000-$25,000+ to your total insurance costs." },
        { question: "Do I need a lawyer for a DUI?", answer: "While not required, a DUI attorney can often negotiate reduced charges, alternative sentencing, or dismissal. Attorney fees range from $2,500 for a simple plea to $10,000+ for trial. Studies suggest represented defendants get better outcomes in 70-80% of cases. For first offenses with low BAC and no aggravating factors, some people handle it themselves." },
        { question: "How long does a DUI stay on your record?", answer: "It varies by state. 11 states (including Alaska, Colorado, Kansas, Massachusetts, Oregon, and Texas) have lifetime lookback periods — meaning a DUI from decades ago still counts as a prior. Other states range from 5 years (Alabama, Mississippi, Missouri) to 15 years (DC, Nebraska). Most states use a 10-year lookback." },
        { question: "What is an ignition interlock device (IID)?", answer: "An IID is a breathalyzer wired into your vehicle's ignition. You must blow into it and register below a set BAC (usually 0.02-0.04) before the car will start. It also requires random retests while driving. Cost: ~$70-150/month rental plus $100-200 installation. 34 states + DC require IID for all first-offense DUI convictions." },
        { question: "What is SR-22 insurance?", answer: "SR-22 is a certificate of financial responsibility filed by your insurance company with the DMV, proving you carry minimum required coverage. It is NOT a type of insurance — it's a filing. Most states require it for 3 years after a DUI. Any lapse resets the clock. The filing fee is $15-50, but the real cost is the higher insurance premiums during the SR-22 period." },
        { question: "What is Utah's 0.05 BAC law?", answer: "Utah lowered its legal BAC limit from 0.08 to 0.05 effective December 30, 2018, making it the strictest in the nation. All other states use 0.08. For reference, a 180-pound man may reach 0.05 after just 2 drinks in one hour." },
        { question: "Is a first DUI a felony?", answer: "In most states, a standard first-offense DUI is a misdemeanor. However, certain aggravating factors can elevate it to a felony: causing serious injury or death, having a minor passenger, extremely high BAC, or multiple prior offenses. Oklahoma's SB 54 (effective November 2025) made some first-offense DUIs felonies. A second or third DUI is a felony in many states." },
      ]}
      relatedTools={[
        { name: "Personal Injury Calculator", href: "/tools/personal-injury-calculator" },
        { name: "Budget Calculator", href: "/tools/budget-calculator" },
        { name: "Income Tax Calculator", href: "/tools/income-tax-calculator" },
      ]}
    >
      {/* Disclaimer */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
        <p className="text-sm text-yellow-400 font-medium mb-1">Important Disclaimer</p>
        <p className="text-sm text-zinc-400">
          This calculator provides cost estimates only. Actual penalties depend on your specific case, BAC level, judge, and circumstances. This is not legal advice — consult a DUI attorney.
        </p>
      </div>

      {/* Inputs */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className={labelCls}>State</label>
          <select value={state} onChange={e => setState(e.target.value)} className={inputCls}>
            {Object.entries(STATES)
              .sort((a, b) => a[1].name.localeCompare(b[1].name))
              .map(([code, s]) => (
                <option key={code} value={code}>{s.name} ({s.term})</option>
              ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Offense</label>
          <div className="flex gap-2">
            <button onClick={() => setOffense("first")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${offense === "first" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>1st</button>
            <button onClick={() => setOffense("second")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${offense === "second" ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>2nd</button>
          </div>
        </div>
        <div>
          <label className={labelCls}>BAC Level</label>
          <input type="number" value={bac} onChange={e => setBac(Math.max(0, Math.min(0.40, +e.target.value)))} className={inputCls} min={0.01} max={0.40} step={0.01} />
          <p className="text-xs mt-1 text-zinc-500">{bac >= stateInfo.enhancedBAC ? `Above ${stateInfo.enhancedBAC} — enhanced penalties` : `Below ${stateInfo.enhancedBAC} — standard penalties`}</p>
        </div>
        <div>
          <label className={labelCls}>Current Annual Insurance ($)</label>
          <input type="number" value={annualInsurance} onChange={e => setAnnualInsurance(Math.max(0, +e.target.value))} className={inputCls} min={0} step={100} />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
          <input type="checkbox" checked={includeAttorney} onChange={e => setIncludeAttorney(e.target.checked)} className="accent-blue-500" />
          Include attorney fees ($2,500-$10,000)
        </label>
      </div>

      {/* Primary Result */}
      <div className={cardCls + " text-center mb-6"}>
        <p className="text-sm text-zinc-400 mb-2">Estimated Total Cost of {stateInfo.term}</p>
        <p className="text-4xl font-bold text-red-400 mb-1">{fmtC(result.totalLow)} — {fmtC(result.totalHigh)}</p>
        <p className="text-sm text-zinc-500">{offense === "first" ? "First" : "Second"} offense in {stateInfo.name}</p>
        {result.isHighBAC && <p className="text-xs text-yellow-400 mt-1">Enhanced penalties apply (BAC &ge; {stateInfo.enhancedBAC})</p>}
      </div>

      {/* Criminal penalties */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className={cardCls + " text-center"}>
          <p className="text-xs text-zinc-500">Jail Time</p>
          <p className="text-lg font-bold text-zinc-100">{result.jailMinDays > 0 ? `${result.jailMinDays}-${result.jailMaxDays}` : `Up to ${result.jailMaxDays}`}</p>
          <p className="text-xs text-zinc-500">days</p>
        </div>
        <div className={cardCls + " text-center"}>
          <p className="text-xs text-zinc-500">License Suspension</p>
          <p className="text-lg font-bold text-zinc-100">{result.suspDays > 0 ? (result.suspDays >= 365 ? `${Math.round(result.suspDays / 365)} year${result.suspDays >= 730 ? "s" : ""}` : `${result.suspDays} days`) : "None"}</p>
        </div>
        <div className={cardCls + " text-center"}>
          <p className="text-xs text-zinc-500">IID Required</p>
          <p className="text-lg font-bold text-zinc-100">{result.iidMo > 0 ? `${result.iidMo} months` : "No"}</p>
        </div>
        <div className={cardCls + " text-center"}>
          <p className="text-xs text-zinc-500">Insurance Increase</p>
          <p className="text-lg font-bold text-zinc-100">+{result.insIncreasePct}%</p>
          <p className="text-xs text-zinc-500">{fmtC(result.totalInsIncrease)} over {stateInfo.sr22Years || 3} yrs</p>
        </div>
      </div>

      {/* Cost breakdown */}
      <div className={cardCls + " mb-6"}>
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">Cost Breakdown</h3>
        <div className="space-y-2">
          {result.breakdown.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b border-zinc-800/50">
              <span className="text-sm text-zinc-400">{item.label}</span>
              <span className="text-sm font-medium text-zinc-200">{item.low === item.high ? fmtC(item.low) : `${fmtC(item.low)} - ${fmtC(item.high)}`}</span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-700">
            <span className="text-sm font-semibold text-zinc-200">Total Estimated Cost</span>
            <span className="text-sm font-bold text-red-400">{fmtC(result.totalLow)} - {fmtC(result.totalHigh)}</span>
          </div>
        </div>
      </div>

      {/* State notes */}
      {stateInfo.notes && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
          <p className="text-sm text-zinc-400">{stateInfo.notes}</p>
        </div>
      )}

      {/* State comparison */}
      <div className={cardCls + " mb-6"}>
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">State Comparison (High Estimate)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs">
                <th className="text-left px-3 py-2 font-medium">State</th>
                <th className="text-right px-3 py-2 font-medium">Ins. Increase</th>
                <th className="text-right px-3 py-2 font-medium">Est. Total Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-800 bg-blue-500/10">
                <td className="px-3 py-2 text-blue-400 font-medium">{stateInfo.name} (selected)</td>
                <td className="px-3 py-2 text-right text-blue-400">+{result.insIncreasePct}%</td>
                <td className="px-3 py-2 text-right text-blue-400 font-medium">{fmtC(result.totalHigh)}</td>
              </tr>
              {result.comparisons.map(c => (
                <tr key={c.state} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="px-3 py-2 text-zinc-300">{c.name}</td>
                  <td className="px-3 py-2 text-right text-zinc-400">+{c.insIncrease}%</td>
                  <td className="px-3 py-2 text-right text-zinc-300">{fmtC(c.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom disclaimer */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 text-center">
        <p className="text-xs text-zinc-500 leading-relaxed">
          This calculator provides cost estimates based on state DUI/DWI statutes and average insurance data.
          Actual costs depend on your specific case, BAC level, judge, attorney, and insurance provider.
          Fines shown include estimated surcharges and penalty assessments. Insurance increases are averages and vary by provider.
          Always consult a DUI attorney for case-specific guidance.
        </p>
      </div>
    </ToolLayout>
  );
}
