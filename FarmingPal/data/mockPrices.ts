import { PriceSubmission } from '@/types';

export const MOCK_PRICES: PriceSubmission[] = [
  { id: '1', cropId: 'canola',       price: 14.64,  currency: 'CAD', elevatorName: 'Richardson Pioneer',  districtCode: 'SK-C', regionCode: 'SK', country: 'CA', submittedAt: '2026-05-18T08:00:00Z' },
  { id: '2', cropId: 'canola',       price: 14.54,  currency: 'CAD', elevatorName: 'Viterra',              districtCode: 'SK-C', regionCode: 'SK', country: 'CA', submittedAt: '2026-05-18T07:30:00Z' },
  { id: '3', cropId: 'wheat-hrs',    price: 8.45,   currency: 'CAD', elevatorName: 'G3 Canada',            districtCode: 'SK-S', regionCode: 'SK', country: 'CA', submittedAt: '2026-05-18T07:00:00Z' },
  { id: '4', cropId: 'wheat-hrs',    price: 8.52,   currency: 'CAD', elevatorName: 'Parrish & Heimbecker', districtCode: 'MB-C', regionCode: 'MB', country: 'CA', submittedAt: '2026-05-17T16:00:00Z' },
  { id: '5', cropId: 'barley',       price: 5.90,   currency: 'CAD', elevatorName: 'Richardson Pioneer',  districtCode: 'AB-C', regionCode: 'AB', country: 'CA', submittedAt: '2026-05-17T15:00:00Z' },
  { id: '6', cropId: 'corn',         price: 4.32,   currency: 'USD', elevatorName: 'ADM',                  districtCode: 'IA-C', regionCode: 'IA', country: 'US', submittedAt: '2026-05-18T09:00:00Z' },
  { id: '7', cropId: 'soybeans',     price: 10.85,  currency: 'USD', elevatorName: 'Bunge',                districtCode: 'IL-C', regionCode: 'IL', country: 'US', submittedAt: '2026-05-18T08:45:00Z' },
  { id: '8', cropId: 'soybeans',     price: 10.91,  currency: 'USD', elevatorName: 'Cargill',              districtCode: 'MN-S', regionCode: 'MN', country: 'US', submittedAt: '2026-05-18T08:15:00Z' },
  { id: '9', cropId: 'wheat-hrw',    price: 5.75,   currency: 'USD', elevatorName: 'Cargill',              districtCode: 'ND-E', regionCode: 'ND', country: 'US', submittedAt: '2026-05-17T14:00:00Z' },
  { id:'10', cropId: 'oats',         price: 3.95,   currency: 'USD', elevatorName: 'CHS Inc.',             districtCode: 'MN-N', regionCode: 'MN', country: 'US', submittedAt: '2026-05-17T13:00:00Z' },
];
