import { PriceSubmission } from '@/types';

export const MOCK_PRICES: PriceSubmission[] = [
  // ── CANOLA — SK ──────────────────────────────────────────────────────────
  { id: 'c001', cropId: 'canola', grade: 'No. 1',              price: 13.85, currency: 'CAD', elevatorName: 'Richardson Pioneer',  districtCode: 'SK-C', regionCode: 'SK', country: 'CA', submittedAt: '2026-02-20T08:00:00Z' },
  { id: 'c002', cropId: 'canola', grade: 'No. 1',              price: 13.92, currency: 'CAD', elevatorName: 'Viterra',              districtCode: 'SK-C', regionCode: 'SK', country: 'CA', submittedAt: '2026-02-28T09:00:00Z' },
  { id: 'c003', cropId: 'canola', grade: 'No. 2',              price: 14.10, currency: 'CAD', elevatorName: 'G3 Canada',            districtCode: 'SK-S', regionCode: 'SK', country: 'CA', submittedAt: '2026-03-08T08:30:00Z' },
  { id: 'c004', cropId: 'canola', grade: 'No. 1',              price: 14.05, currency: 'CAD', elevatorName: 'Parrish & Heimbecker', districtCode: 'SK-W', regionCode: 'SK', country: 'CA', submittedAt: '2026-03-15T10:00:00Z' },
  { id: 'c005', cropId: 'canola', grade: 'No. 2',              price: 14.22, currency: 'CAD', elevatorName: 'Cargill',              districtCode: 'SK-N', regionCode: 'SK', country: 'CA', submittedAt: '2026-03-22T08:00:00Z' },
  { id: 'c006', cropId: 'canola', grade: 'No. 1',              price: 14.35, currency: 'CAD', elevatorName: 'Richardson Pioneer',  districtCode: 'SK-E', regionCode: 'SK', country: 'CA', submittedAt: '2026-04-01T09:00:00Z' },
  { id: 'c007', cropId: 'canola', grade: 'No. 1',              price: 14.48, currency: 'CAD', elevatorName: 'Viterra',              districtCode: 'SK-C', regionCode: 'SK', country: 'CA', submittedAt: '2026-04-10T08:00:00Z' },
  { id: 'c008', cropId: 'canola', grade: 'No. 3',              price: 14.39, currency: 'CAD', elevatorName: 'Louis Dreyfus',        districtCode: 'SK-S', regionCode: 'SK', country: 'CA', submittedAt: '2026-04-18T10:30:00Z' },
  { id: 'c009', cropId: 'canola', grade: 'No. 1',              price: 14.55, currency: 'CAD', elevatorName: 'G3 Canada',            districtCode: 'SK-C', regionCode: 'SK', country: 'CA', submittedAt: '2026-04-25T08:00:00Z' },
  { id: 'c010', cropId: 'canola', grade: 'No. 2',              price: 14.62, currency: 'CAD', elevatorName: 'Cargill',              districtCode: 'SK-W', regionCode: 'SK', country: 'CA', submittedAt: '2026-05-02T09:00:00Z' },
  { id: 'c011', cropId: 'canola', grade: 'No. 1',              price: 14.64, currency: 'CAD', elevatorName: 'Richardson Pioneer',  districtCode: 'SK-C', regionCode: 'SK', country: 'CA', submittedAt: '2026-05-10T08:00:00Z' },
  { id: 'c012', cropId: 'canola', grade: 'No. 1',              price: 14.71, currency: 'CAD', elevatorName: 'Viterra',              districtCode: 'SK-S', regionCode: 'SK', country: 'CA', submittedAt: '2026-05-15T09:00:00Z' },
  { id: 'c013', cropId: 'canola', grade: 'No. 2',              price: 14.78, currency: 'CAD', elevatorName: 'Parrish & Heimbecker', districtCode: 'SK-N', regionCode: 'SK', country: 'CA', submittedAt: '2026-05-18T08:00:00Z' },
  { id: 'c014', cropId: 'canola', grade: 'No. 1',              price: 14.82, currency: 'CAD', elevatorName: 'G3 Canada',            districtCode: 'SK-E', regionCode: 'SK', country: 'CA', submittedAt: '2026-05-20T07:00:00Z' },

  // ── CANOLA — AB ──────────────────────────────────────────────────────────
  { id: 'c020', cropId: 'canola', grade: 'No. 1',              price: 13.70, currency: 'CAD', elevatorName: 'Viterra',              districtCode: 'AB-C', regionCode: 'AB', country: 'CA', submittedAt: '2026-02-20T09:00:00Z' },
  { id: 'c021', cropId: 'canola', grade: 'No. 2',              price: 14.00, currency: 'CAD', elevatorName: 'Richardson Pioneer',  districtCode: 'AB-N', regionCode: 'AB', country: 'CA', submittedAt: '2026-03-10T08:00:00Z' },
  { id: 'c022', cropId: 'canola', grade: 'No. 1',              price: 14.30, currency: 'CAD', elevatorName: 'Cargill',              districtCode: 'AB-S', regionCode: 'AB', country: 'CA', submittedAt: '2026-04-05T09:00:00Z' },
  { id: 'c023', cropId: 'canola', grade: 'No. 3',              price: 14.55, currency: 'CAD', elevatorName: 'Federated Co-op',      districtCode: 'AB-PE', regionCode: 'AB', country: 'CA', submittedAt: '2026-04-28T10:00:00Z' },
  { id: 'c024', cropId: 'canola', grade: 'No. 1',              price: 14.68, currency: 'CAD', elevatorName: 'Viterra',              districtCode: 'AB-C', regionCode: 'AB', country: 'CA', submittedAt: '2026-05-18T08:00:00Z' },

  // ── CANOLA — MB ──────────────────────────────────────────────────────────
  { id: 'c030', cropId: 'canola', grade: 'No. 1',              price: 13.95, currency: 'CAD', elevatorName: 'Parrish & Heimbecker', districtCode: 'MB-C', regionCode: 'MB', country: 'CA', submittedAt: '2026-03-01T08:00:00Z' },
  { id: 'c031', cropId: 'canola', grade: 'No. 2',              price: 14.40, currency: 'CAD', elevatorName: 'Richardson Pioneer',  districtCode: 'MB-S', regionCode: 'MB', country: 'CA', submittedAt: '2026-04-15T09:00:00Z' },
  { id: 'c032', cropId: 'canola', grade: 'No. 1',              price: 14.72, currency: 'CAD', elevatorName: 'G3 Canada',            districtCode: 'MB-IN', regionCode: 'MB', country: 'CA', submittedAt: '2026-05-18T08:00:00Z' },

  // ── HARD RED SPRING WHEAT — SK ───────────────────────────────────────────
  { id: 'w001', cropId: 'wheat-hrs', grade: 'No. 1',           price: 7.90, currency: 'CAD', elevatorName: 'G3 Canada',            districtCode: 'SK-C', regionCode: 'SK', country: 'CA', submittedAt: '2026-02-20T08:00:00Z' },
  { id: 'w002', cropId: 'wheat-hrs', grade: 'No. 2',           price: 8.05, currency: 'CAD', elevatorName: 'Richardson Pioneer',  districtCode: 'SK-S', regionCode: 'SK', country: 'CA', submittedAt: '2026-03-05T09:00:00Z' },
  { id: 'w003', cropId: 'wheat-hrs', grade: 'No. 1',           price: 8.10, currency: 'CAD', elevatorName: 'Viterra',              districtCode: 'SK-W', regionCode: 'SK', country: 'CA', submittedAt: '2026-03-20T08:00:00Z' },
  { id: 'w004', cropId: 'wheat-hrs', grade: 'No. 3',           price: 8.22, currency: 'CAD', elevatorName: 'Cargill',              districtCode: 'SK-N', regionCode: 'SK', country: 'CA', submittedAt: '2026-04-01T09:00:00Z' },
  { id: 'w005', cropId: 'wheat-hrs', grade: 'No. 1',           price: 8.30, currency: 'CAD', elevatorName: 'Parrish & Heimbecker', districtCode: 'SK-E', regionCode: 'SK', country: 'CA', submittedAt: '2026-04-12T08:00:00Z' },
  { id: 'w006', cropId: 'wheat-hrs', grade: 'No. 2',           price: 8.38, currency: 'CAD', elevatorName: 'G3 Canada',            districtCode: 'SK-C', regionCode: 'SK', country: 'CA', submittedAt: '2026-04-22T09:00:00Z' },
  { id: 'w007', cropId: 'wheat-hrs', grade: 'No. 1',           price: 8.45, currency: 'CAD', elevatorName: 'Richardson Pioneer',  districtCode: 'SK-S', regionCode: 'SK', country: 'CA', submittedAt: '2026-05-01T08:00:00Z' },
  { id: 'w008', cropId: 'wheat-hrs', grade: 'No. 1',           price: 8.48, currency: 'CAD', elevatorName: 'Viterra',              districtCode: 'SK-C', regionCode: 'SK', country: 'CA', submittedAt: '2026-05-10T08:30:00Z' },
  { id: 'w009', cropId: 'wheat-hrs', grade: 'No. 2',           price: 8.52, currency: 'CAD', elevatorName: 'G3 Canada',            districtCode: 'SK-W', regionCode: 'SK', country: 'CA', submittedAt: '2026-05-18T07:00:00Z' },
  { id: 'w010', cropId: 'wheat-hrs', grade: 'No. 1',           price: 8.58, currency: 'CAD', elevatorName: 'Parrish & Heimbecker', districtCode: 'SK-N', regionCode: 'SK', country: 'CA', submittedAt: '2026-05-20T08:00:00Z' },

  // ── HRS WHEAT — MB & AB ──────────────────────────────────────────────────
  { id: 'w020', cropId: 'wheat-hrs', grade: 'No. 2',           price: 8.10, currency: 'CAD', elevatorName: 'Parrish & Heimbecker', districtCode: 'MB-C', regionCode: 'MB', country: 'CA', submittedAt: '2026-03-10T09:00:00Z' },
  { id: 'w021', cropId: 'wheat-hrs', grade: 'No. 1',           price: 8.35, currency: 'CAD', elevatorName: 'Richardson Pioneer',  districtCode: 'MB-S', regionCode: 'MB', country: 'CA', submittedAt: '2026-04-20T08:00:00Z' },
  { id: 'w022', cropId: 'wheat-hrs', grade: 'No. 1',           price: 8.52, currency: 'CAD', elevatorName: 'G3 Canada',            districtCode: 'MB-IN', regionCode: 'MB', country: 'CA', submittedAt: '2026-05-17T16:00:00Z' },
  { id: 'w023', cropId: 'wheat-hrs', grade: 'No. 3',           price: 8.15, currency: 'CAD', elevatorName: 'Viterra',              districtCode: 'AB-C', regionCode: 'AB', country: 'CA', submittedAt: '2026-03-25T08:00:00Z' },
  { id: 'w024', cropId: 'wheat-hrs', grade: 'No. 2',           price: 8.40, currency: 'CAD', elevatorName: 'Cargill',              districtCode: 'AB-N', regionCode: 'AB', country: 'CA', submittedAt: '2026-05-05T09:00:00Z' },

  // ── BARLEY — SK & AB ─────────────────────────────────────────────────────
  { id: 'b001', cropId: 'barley', grade: 'No. 1',              price: 5.40, currency: 'CAD', elevatorName: 'Viterra',              districtCode: 'SK-C', regionCode: 'SK', country: 'CA', submittedAt: '2026-02-20T08:00:00Z' },
  { id: 'b002', cropId: 'barley', grade: 'No. 2',              price: 5.55, currency: 'CAD', elevatorName: 'Richardson Pioneer',  districtCode: 'SK-S', regionCode: 'SK', country: 'CA', submittedAt: '2026-03-10T09:00:00Z' },
  { id: 'b003', cropId: 'barley', grade: 'No. 1',              price: 5.62, currency: 'CAD', elevatorName: 'G3 Canada',            districtCode: 'SK-W', regionCode: 'SK', country: 'CA', submittedAt: '2026-03-28T08:00:00Z' },
  { id: 'b004', cropId: 'barley', grade: 'No. 3',              price: 5.70, currency: 'CAD', elevatorName: 'Cargill',              districtCode: 'AB-C', regionCode: 'AB', country: 'CA', submittedAt: '2026-04-10T08:00:00Z' },
  { id: 'b005', cropId: 'barley', grade: 'No. 1',              price: 5.80, currency: 'CAD', elevatorName: 'Federated Co-op',      districtCode: 'AB-PE', regionCode: 'AB', country: 'CA', submittedAt: '2026-04-20T09:00:00Z' },
  { id: 'b006', cropId: 'barley', grade: 'No. 2',              price: 5.90, currency: 'CAD', elevatorName: 'Richardson Pioneer',  districtCode: 'AB-C', regionCode: 'AB', country: 'CA', submittedAt: '2026-05-01T08:00:00Z' },
  { id: 'b007', cropId: 'barley', grade: 'No. 1',              price: 5.95, currency: 'CAD', elevatorName: 'Viterra',              districtCode: 'AB-N', regionCode: 'AB', country: 'CA', submittedAt: '2026-05-10T09:00:00Z' },
  { id: 'b008', cropId: 'barley', grade: 'No. 1',              price: 6.05, currency: 'CAD', elevatorName: 'Cargill',              districtCode: 'SK-C', regionCode: 'SK', country: 'CA', submittedAt: '2026-05-18T08:00:00Z' },
  { id: 'b009', cropId: 'barley', grade: 'No. 2',              price: 6.10, currency: 'CAD', elevatorName: 'G3 Canada',            districtCode: 'AB-S', regionCode: 'AB', country: 'CA', submittedAt: '2026-05-20T09:00:00Z' },

  // ── OATS — SK & MB ───────────────────────────────────────────────────────
  { id: 'o001', cropId: 'oats', grade: 'No. 1',                price: 3.85, currency: 'CAD', elevatorName: 'Richardson Pioneer',  districtCode: 'SK-C', regionCode: 'SK', country: 'CA', submittedAt: '2026-02-28T08:00:00Z' },
  { id: 'o002', cropId: 'oats', grade: 'No. 2',                price: 4.00, currency: 'CAD', elevatorName: 'Viterra',              districtCode: 'SK-N', regionCode: 'SK', country: 'CA', submittedAt: '2026-03-20T09:00:00Z' },
  { id: 'o003', cropId: 'oats', grade: 'No. 1',                price: 4.10, currency: 'CAD', elevatorName: 'Parrish & Heimbecker', districtCode: 'MB-C', regionCode: 'MB', country: 'CA', submittedAt: '2026-04-15T08:00:00Z' },
  { id: 'o004', cropId: 'oats', grade: 'No. 3',                price: 4.22, currency: 'CAD', elevatorName: 'G3 Canada',            districtCode: 'SK-S', regionCode: 'SK', country: 'CA', submittedAt: '2026-05-01T09:00:00Z' },
  { id: 'o005', cropId: 'oats', grade: 'No. 1',                price: 4.35, currency: 'CAD', elevatorName: 'Richardson Pioneer',  districtCode: 'MB-S', regionCode: 'MB', country: 'CA', submittedAt: '2026-05-15T08:00:00Z' },
  { id: 'o006', cropId: 'oats', grade: 'No. 2',                price: 4.40, currency: 'CAD', elevatorName: 'Viterra',              districtCode: 'SK-C', regionCode: 'SK', country: 'CA', submittedAt: '2026-05-20T09:00:00Z' },

  // ── PEAS — SK ─────────────────────────────────────────────────────────────
  { id: 'p001', cropId: 'peas', grade: 'No. 1',                price: 6.20, currency: 'CAD', elevatorName: 'Richardson Pioneer',  districtCode: 'SK-S', regionCode: 'SK', country: 'CA', submittedAt: '2026-02-20T09:00:00Z' },
  { id: 'p002', cropId: 'peas', grade: 'No. 2',                price: 6.35, currency: 'CAD', elevatorName: 'Viterra',              districtCode: 'SK-C', regionCode: 'SK', country: 'CA', submittedAt: '2026-03-10T08:00:00Z' },
  { id: 'p003', cropId: 'peas', grade: 'No. 1',                price: 6.50, currency: 'CAD', elevatorName: 'G3 Canada',            districtCode: 'SK-W', regionCode: 'SK', country: 'CA', submittedAt: '2026-04-01T09:00:00Z' },
  { id: 'p004', cropId: 'peas', grade: 'Split vs Broken',      price: 6.60, currency: 'CAD', elevatorName: 'Parrish & Heimbecker', districtCode: 'SK-N', regionCode: 'SK', country: 'CA', submittedAt: '2026-04-20T08:00:00Z' },
  { id: 'p005', cropId: 'peas', grade: 'No. 1',                price: 6.75, currency: 'CAD', elevatorName: 'Louis Dreyfus',        districtCode: 'SK-E', regionCode: 'SK', country: 'CA', submittedAt: '2026-05-05T09:00:00Z' },
  { id: 'p006', cropId: 'peas', grade: 'Organic vs Conventional', price: 6.88, currency: 'CAD', elevatorName: 'Richardson Pioneer', districtCode: 'SK-C', regionCode: 'SK', country: 'CA', submittedAt: '2026-05-18T08:00:00Z' },
  { id: 'p007', cropId: 'peas', grade: 'No. 2',                price: 6.95, currency: 'CAD', elevatorName: 'Viterra',              districtCode: 'AB-C', regionCode: 'AB', country: 'CA', submittedAt: '2026-05-20T09:00:00Z' },

  // ── LENTILS — SK ──────────────────────────────────────────────────────────
  { id: 'l001', cropId: 'lentils', grade: 'No. 1',             price: 14.50, currency: 'CAD', elevatorName: 'Richardson Pioneer',  districtCode: 'SK-S', regionCode: 'SK', country: 'CA', submittedAt: '2026-02-20T10:00:00Z' },
  { id: 'l002', cropId: 'lentils', grade: 'No. 2',             price: 15.00, currency: 'CAD', elevatorName: 'Viterra',              districtCode: 'SK-C', regionCode: 'SK', country: 'CA', submittedAt: '2026-03-10T09:00:00Z' },
  { id: 'l003', cropId: 'lentils', grade: 'No. 1',             price: 15.40, currency: 'CAD', elevatorName: 'Louis Dreyfus',        districtCode: 'SK-W', regionCode: 'SK', country: 'CA', submittedAt: '2026-04-01T08:00:00Z' },
  { id: 'l004', cropId: 'lentils', grade: 'Organic vs Conventional', price: 15.75, currency: 'CAD', elevatorName: 'G3 Canada',     districtCode: 'SK-S', regionCode: 'SK', country: 'CA', submittedAt: '2026-04-20T09:00:00Z' },
  { id: 'l005', cropId: 'lentils', grade: 'No. 1',             price: 16.10, currency: 'CAD', elevatorName: 'Richardson Pioneer',  districtCode: 'SK-C', regionCode: 'SK', country: 'CA', submittedAt: '2026-05-05T08:00:00Z' },
  { id: 'l006', cropId: 'lentils', grade: 'No. 2',             price: 16.40, currency: 'CAD', elevatorName: 'Parrish & Heimbecker', districtCode: 'SK-N', regionCode: 'SK', country: 'CA', submittedAt: '2026-05-18T09:00:00Z' },
  { id: 'l007', cropId: 'lentils', grade: 'No. 1',             price: 16.55, currency: 'CAD', elevatorName: 'Viterra',              districtCode: 'SK-E', regionCode: 'SK', country: 'CA', submittedAt: '2026-05-20T08:00:00Z' },

  // ── HRW WHEAT — SK & AB ───────────────────────────────────────────────────
  { id: 'hrw01', cropId: 'wheat-hrw', grade: 'No. 1',          price: 7.20, currency: 'CAD', elevatorName: 'Viterra',              districtCode: 'SK-S', regionCode: 'SK', country: 'CA', submittedAt: '2026-03-01T08:00:00Z' },
  { id: 'hrw02', cropId: 'wheat-hrw', grade: 'No. 2',          price: 7.45, currency: 'CAD', elevatorName: 'G3 Canada',            districtCode: 'AB-C', regionCode: 'AB', country: 'CA', submittedAt: '2026-04-10T09:00:00Z' },
  { id: 'hrw03', cropId: 'wheat-hrw', grade: 'No. 1',          price: 7.68, currency: 'CAD', elevatorName: 'Richardson Pioneer',  districtCode: 'SK-C', regionCode: 'SK', country: 'CA', submittedAt: '2026-05-15T08:00:00Z' },
  { id: 'hrw04', cropId: 'wheat-hrw', grade: 'No. 3',          price: 7.75, currency: 'CAD', elevatorName: 'Cargill',              districtCode: 'AB-S', regionCode: 'AB', country: 'CA', submittedAt: '2026-05-20T09:00:00Z' },

  // ── CORN — US (Iowa, Illinois, Indiana, Ohio) ─────────────────────────────
  { id: 'us01', cropId: 'corn', grade: 'Grade A (Premium)',     price: 3.85, currency: 'USD', elevatorName: 'ADM',          districtCode: 'IA-C',  regionCode: 'IA', country: 'US', submittedAt: '2026-02-20T09:00:00Z' },
  { id: 'us02', cropId: 'corn', grade: 'Grade B (Standard)',    price: 3.92, currency: 'USD', elevatorName: 'Bunge',         districtCode: 'IA-S',  regionCode: 'IA', country: 'US', submittedAt: '2026-03-05T08:00:00Z' },
  { id: 'us03', cropId: 'corn', grade: 'Grade A (Premium)',     price: 4.01, currency: 'USD', elevatorName: 'Cargill',       districtCode: 'IL-C',  regionCode: 'IL', country: 'US', submittedAt: '2026-03-15T09:00:00Z' },
  { id: 'us04', cropId: 'corn', grade: 'Grade B (Standard)',    price: 4.08, currency: 'USD', elevatorName: 'CHS Inc.',      districtCode: 'IL-N',  regionCode: 'IL', country: 'US', submittedAt: '2026-03-28T08:00:00Z' },
  { id: 'us05', cropId: 'corn', grade: 'Grade A (Premium)',     price: 4.15, currency: 'USD', elevatorName: 'Gavilon',       districtCode: 'IA-N',  regionCode: 'IA', country: 'US', submittedAt: '2026-04-05T09:00:00Z' },
  { id: 'us06', cropId: 'corn', grade: 'Grade C (Commercial)',  price: 4.20, currency: 'USD', elevatorName: 'ADM',           districtCode: 'IN-C',  regionCode: 'IN', country: 'US', submittedAt: '2026-04-15T08:00:00Z' },
  { id: 'us07', cropId: 'corn', grade: 'Grade B (Standard)',    price: 4.18, currency: 'USD', elevatorName: 'Louis Dreyfus', districtCode: 'OH-NW', regionCode: 'OH', country: 'US', submittedAt: '2026-04-22T09:00:00Z' },
  { id: 'us08', cropId: 'corn', grade: 'Grade A (Premium)',     price: 4.25, currency: 'USD', elevatorName: 'Bunge',         districtCode: 'IL-S',  regionCode: 'IL', country: 'US', submittedAt: '2026-04-30T08:00:00Z' },
  { id: 'us09', cropId: 'corn', grade: 'Grade A (Premium)',     price: 4.28, currency: 'USD', elevatorName: 'Cargill',       districtCode: 'IA-C',  regionCode: 'IA', country: 'US', submittedAt: '2026-05-08T09:00:00Z' },
  { id: 'us10', cropId: 'corn', grade: 'Grade B (Standard)',    price: 4.32, currency: 'USD', elevatorName: 'ADM',           districtCode: 'IA-C',  regionCode: 'IA', country: 'US', submittedAt: '2026-05-15T08:00:00Z' },
  { id: 'us11', cropId: 'corn', grade: 'Grade A (Premium)',     price: 4.35, currency: 'USD', elevatorName: 'Gavilon',       districtCode: 'IL-C',  regionCode: 'IL', country: 'US', submittedAt: '2026-05-18T09:00:00Z' },
  { id: 'us12', cropId: 'corn', grade: 'Grade C (Commercial)',  price: 4.38, currency: 'USD', elevatorName: 'CHS Inc.',      districtCode: 'IN-N',  regionCode: 'IN', country: 'US', submittedAt: '2026-05-20T08:00:00Z' },

  // ── SOYBEANS — US ────────────────────────────────────────────────────────
  { id: 'sb01', cropId: 'soybeans', grade: 'Grade A (Premium)',    price: 10.05, currency: 'USD', elevatorName: 'Bunge',         districtCode: 'IL-C', regionCode: 'IL', country: 'US', submittedAt: '2026-02-20T08:00:00Z' },
  { id: 'sb02', cropId: 'soybeans', grade: 'Grade B (Standard)',   price: 10.22, currency: 'USD', elevatorName: 'Cargill',       districtCode: 'IA-S', regionCode: 'IA', country: 'US', submittedAt: '2026-03-05T09:00:00Z' },
  { id: 'sb03', cropId: 'soybeans', grade: 'Grade A (Premium)',    price: 10.35, currency: 'USD', elevatorName: 'ADM',           districtCode: 'MN-S', regionCode: 'MN', country: 'US', submittedAt: '2026-03-18T08:00:00Z' },
  { id: 'sb04', cropId: 'soybeans', grade: 'Grade B (Standard)',   price: 10.48, currency: 'USD', elevatorName: 'Louis Dreyfus', districtCode: 'IN-C', regionCode: 'IN', country: 'US', submittedAt: '2026-04-01T09:00:00Z' },
  { id: 'sb05', cropId: 'soybeans', grade: 'Grade A (Premium)',    price: 10.55, currency: 'USD', elevatorName: 'Bunge',         districtCode: 'IL-N', regionCode: 'IL', country: 'US', submittedAt: '2026-04-10T08:00:00Z' },
  { id: 'sb06', cropId: 'soybeans', grade: 'Organic vs Conventional', price: 10.62, currency: 'USD', elevatorName: 'Gavilon',   districtCode: 'IA-C', regionCode: 'IA', country: 'US', submittedAt: '2026-04-20T09:00:00Z' },
  { id: 'sb07', cropId: 'soybeans', grade: 'Grade A (Premium)',    price: 10.70, currency: 'USD', elevatorName: 'Cargill',       districtCode: 'MN-C', regionCode: 'MN', country: 'US', submittedAt: '2026-05-01T08:00:00Z' },
  { id: 'sb08', cropId: 'soybeans', grade: 'Grade B (Standard)',   price: 10.78, currency: 'USD', elevatorName: 'ADM',           districtCode: 'IL-C', regionCode: 'IL', country: 'US', submittedAt: '2026-05-08T09:00:00Z' },
  { id: 'sb09', cropId: 'soybeans', grade: 'Grade A (Premium)',    price: 10.85, currency: 'USD', elevatorName: 'Bunge',         districtCode: 'IL-C', regionCode: 'IL', country: 'US', submittedAt: '2026-05-15T08:00:00Z' },
  { id: 'sb10', cropId: 'soybeans', grade: 'Grade A (Premium)',    price: 10.91, currency: 'USD', elevatorName: 'Cargill',       districtCode: 'MN-S', regionCode: 'MN', country: 'US', submittedAt: '2026-05-18T08:15:00Z' },
  { id: 'sb11', cropId: 'soybeans', grade: 'Grade C (Commercial)', price: 10.98, currency: 'USD', elevatorName: 'Louis Dreyfus', districtCode: 'IA-N', regionCode: 'IA', country: 'US', submittedAt: '2026-05-20T09:00:00Z' },

  // ── HRW WHEAT — US (ND, KS, OK) ─────────────────────────────────────────
  { id: 'uw01', cropId: 'wheat-hrw', grade: 'No. 1',            price: 5.20, currency: 'USD', elevatorName: 'Gavilon',  districtCode: 'KS-C',  regionCode: 'KS', country: 'US', submittedAt: '2026-02-20T09:00:00Z' },
  { id: 'uw02', cropId: 'wheat-hrw', grade: 'No. 2',            price: 5.35, currency: 'USD', elevatorName: 'CHS Inc.', districtCode: 'ND-W',  regionCode: 'ND', country: 'US', submittedAt: '2026-03-08T08:00:00Z' },
  { id: 'uw03', cropId: 'wheat-hrw', grade: 'No. 1',            price: 5.48, currency: 'USD', elevatorName: 'Cargill',  districtCode: 'ND-C',  regionCode: 'ND', country: 'US', submittedAt: '2026-03-20T09:00:00Z' },
  { id: 'uw04', cropId: 'wheat-hrw', grade: 'No. 3',            price: 5.55, currency: 'USD', elevatorName: 'ADM',      districtCode: 'KS-N',  regionCode: 'KS', country: 'US', submittedAt: '2026-04-05T08:00:00Z' },
  { id: 'uw05', cropId: 'wheat-hrw', grade: 'No. 1',            price: 5.62, currency: 'USD', elevatorName: 'Gavilon',  districtCode: 'OK-N',  regionCode: 'OK', country: 'US', submittedAt: '2026-04-18T09:00:00Z' },
  { id: 'uw06', cropId: 'wheat-hrw', grade: 'No. 2',            price: 5.68, currency: 'USD', elevatorName: 'CHS Inc.', districtCode: 'ND-E',  regionCode: 'ND', country: 'US', submittedAt: '2026-04-28T08:00:00Z' },
  { id: 'uw07', cropId: 'wheat-hrw', grade: 'No. 1',            price: 5.75, currency: 'USD', elevatorName: 'Cargill',  districtCode: 'ND-E',  regionCode: 'ND', country: 'US', submittedAt: '2026-05-10T09:00:00Z' },
  { id: 'uw08', cropId: 'wheat-hrw', grade: 'No. 2',            price: 5.80, currency: 'USD', elevatorName: 'Gavilon',  districtCode: 'KS-S',  regionCode: 'KS', country: 'US', submittedAt: '2026-05-18T08:00:00Z' },
  { id: 'uw09', cropId: 'wheat-hrw', grade: 'No. 1',            price: 5.88, currency: 'USD', elevatorName: 'ADM',      districtCode: 'ND-RV', regionCode: 'ND', country: 'US', submittedAt: '2026-05-20T09:00:00Z' },

  // ── OATS — US (MN, WI) ───────────────────────────────────────────────────
  { id: 'uo01', cropId: 'oats', grade: 'No. 1',                 price: 3.50, currency: 'USD', elevatorName: 'CHS Inc.', districtCode: 'MN-N',  regionCode: 'MN', country: 'US', submittedAt: '2026-02-28T08:00:00Z' },
  { id: 'uo02', cropId: 'oats', grade: 'No. 2',                 price: 3.62, currency: 'USD', elevatorName: 'ADM',      districtCode: 'MN-C',  regionCode: 'MN', country: 'US', submittedAt: '2026-03-20T09:00:00Z' },
  { id: 'uo03', cropId: 'oats', grade: 'No. 1',                 price: 3.72, currency: 'USD', elevatorName: 'Gavilon',  districtCode: 'WI-N',  regionCode: 'WI', country: 'US', submittedAt: '2026-04-12T08:00:00Z' },
  { id: 'uo04', cropId: 'oats', grade: 'No. 3',                 price: 3.85, currency: 'USD', elevatorName: 'CHS Inc.', districtCode: 'MN-RV', regionCode: 'MN', country: 'US', submittedAt: '2026-05-01T09:00:00Z' },
  { id: 'uo05', cropId: 'oats', grade: 'No. 1',                 price: 3.95, currency: 'USD', elevatorName: 'ADM',      districtCode: 'MN-N',  regionCode: 'MN', country: 'US', submittedAt: '2026-05-17T13:00:00Z' },
  { id: 'uo06', cropId: 'oats', grade: 'No. 2',                 price: 4.02, currency: 'USD', elevatorName: 'CHS Inc.', districtCode: 'WI-S',  regionCode: 'WI', country: 'US', submittedAt: '2026-05-20T08:00:00Z' },

  // ── HRS WHEAT — US (MN, ND) ──────────────────────────────────────────────
  { id: 'uhrs1', cropId: 'wheat-hrs', grade: 'No. 1',           price: 6.20, currency: 'USD', elevatorName: 'CHS Inc.', districtCode: 'MN-RV', regionCode: 'MN', country: 'US', submittedAt: '2026-03-01T08:00:00Z' },
  { id: 'uhrs2', cropId: 'wheat-hrs', grade: 'No. 2',           price: 6.38, currency: 'USD', elevatorName: 'Gavilon',  districtCode: 'ND-C',  regionCode: 'ND', country: 'US', submittedAt: '2026-04-01T09:00:00Z' },
  { id: 'uhrs3', cropId: 'wheat-hrs', grade: 'No. 1',           price: 6.52, currency: 'USD', elevatorName: 'ADM',      districtCode: 'MN-N',  regionCode: 'MN', country: 'US', submittedAt: '2026-05-01T08:00:00Z' },
  { id: 'uhrs4', cropId: 'wheat-hrs', grade: 'No. 3',           price: 6.65, currency: 'USD', elevatorName: 'CHS Inc.', districtCode: 'ND-RV', regionCode: 'ND', country: 'US', submittedAt: '2026-05-18T09:00:00Z' },
  { id: 'uhrs5', cropId: 'wheat-hrs', grade: 'No. 1',           price: 6.72, currency: 'USD', elevatorName: 'Gavilon',  districtCode: 'MN-S',  regionCode: 'MN', country: 'US', submittedAt: '2026-05-20T08:00:00Z' },
];
