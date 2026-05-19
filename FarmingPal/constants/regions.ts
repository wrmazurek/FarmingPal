import { Region, District } from '@/types';

export const REGIONS: Region[] = [
  // ── Canada ──────────────────────────────────────────────────────────────
  { code: 'AB', name: 'Alberta',            country: 'CA' },
  { code: 'SK', name: 'Saskatchewan',       country: 'CA' },
  { code: 'MB', name: 'Manitoba',           country: 'CA' },
  { code: 'ON', name: 'Ontario',            country: 'CA' },
  { code: 'QC', name: 'Quebec',             country: 'CA' },
  { code: 'BC', name: 'British Columbia',   country: 'CA' },
  { code: 'PE', name: 'Prince Edward Island', country: 'CA' },

  // ── United States ────────────────────────────────────────────────────────
  // Corn Belt
  { code: 'IA', name: 'Iowa',               country: 'US' },
  { code: 'IL', name: 'Illinois',           country: 'US' },
  { code: 'IN', name: 'Indiana',            country: 'US' },
  { code: 'OH', name: 'Ohio',               country: 'US' },
  { code: 'MO', name: 'Missouri',           country: 'US' },
  { code: 'WI', name: 'Wisconsin',          country: 'US' },
  { code: 'MI', name: 'Michigan',           country: 'US' },
  // Northern Plains
  { code: 'MN', name: 'Minnesota',          country: 'US' },
  { code: 'ND', name: 'North Dakota',       country: 'US' },
  { code: 'SD', name: 'South Dakota',       country: 'US' },
  { code: 'NE', name: 'Nebraska',           country: 'US' },
  { code: 'KS', name: 'Kansas',             country: 'US' },
  // Southern Plains
  { code: 'OK', name: 'Oklahoma',           country: 'US' },
  { code: 'TX', name: 'Texas',              country: 'US' },
  // Mid-South
  { code: 'AR', name: 'Arkansas',           country: 'US' },
  { code: 'MS', name: 'Mississippi',        country: 'US' },
  { code: 'TN', name: 'Tennessee',          country: 'US' },
  { code: 'KY', name: 'Kentucky',           country: 'US' },
  // Mountain / Pacific Northwest
  { code: 'MT', name: 'Montana',            country: 'US' },
  { code: 'CO', name: 'Colorado',           country: 'US' },
  { code: 'WA', name: 'Washington',         country: 'US' },
  { code: 'OR', name: 'Oregon',             country: 'US' },
  { code: 'ID', name: 'Idaho',              country: 'US' },
];

// Placeholder districts — user will define real boundaries later
export const DISTRICTS: District[] = [
  // Alberta
  { code: 'AB-N',  name: 'Northern Alberta',        regionCode: 'AB' },
  { code: 'AB-C',  name: 'Central Alberta',          regionCode: 'AB' },
  { code: 'AB-S',  name: 'Southern Alberta',         regionCode: 'AB' },
  { code: 'AB-PE', name: 'Peace River / NW Alberta', regionCode: 'AB' },
  // Saskatchewan
  { code: 'SK-N',  name: 'Northern Saskatchewan',    regionCode: 'SK' },
  { code: 'SK-C',  name: 'Central Saskatchewan',     regionCode: 'SK' },
  { code: 'SK-S',  name: 'Southern Saskatchewan',    regionCode: 'SK' },
  { code: 'SK-E',  name: 'Eastern Saskatchewan',     regionCode: 'SK' },
  { code: 'SK-W',  name: 'Western Saskatchewan',     regionCode: 'SK' },
  // Manitoba
  { code: 'MB-N',  name: 'Northern Manitoba',        regionCode: 'MB' },
  { code: 'MB-C',  name: 'Central Manitoba',         regionCode: 'MB' },
  { code: 'MB-S',  name: 'Southern Manitoba',        regionCode: 'MB' },
  { code: 'MB-IN', name: 'Interlake',                regionCode: 'MB' },
  // Ontario
  { code: 'ON-SW', name: 'Southwestern Ontario',     regionCode: 'ON' },
  { code: 'ON-SE', name: 'Southeastern Ontario',     regionCode: 'ON' },
  { code: 'ON-C',  name: 'Central Ontario',          regionCode: 'ON' },
  { code: 'ON-N',  name: 'Northern Ontario',         regionCode: 'ON' },
  // Quebec
  { code: 'QC-SW', name: 'Southwestern Quebec',      regionCode: 'QC' },
  { code: 'QC-E',  name: 'Eastern Quebec',           regionCode: 'QC' },
  // British Columbia
  { code: 'BC-PR', name: 'Peace River Region',       regionCode: 'BC' },
  // Prince Edward Island
  { code: 'PE-W',  name: 'Western PEI',              regionCode: 'PE' },
  { code: 'PE-E',  name: 'Eastern PEI',              regionCode: 'PE' },

  // Iowa
  { code: 'IA-N',  name: 'Northern Iowa',            regionCode: 'IA' },
  { code: 'IA-C',  name: 'Central Iowa',             regionCode: 'IA' },
  { code: 'IA-S',  name: 'Southern Iowa',            regionCode: 'IA' },
  // Illinois
  { code: 'IL-N',  name: 'Northern Illinois',        regionCode: 'IL' },
  { code: 'IL-C',  name: 'Central Illinois',         regionCode: 'IL' },
  { code: 'IL-S',  name: 'Southern Illinois',        regionCode: 'IL' },
  // Indiana
  { code: 'IN-N',  name: 'Northern Indiana',         regionCode: 'IN' },
  { code: 'IN-C',  name: 'Central Indiana',          regionCode: 'IN' },
  { code: 'IN-S',  name: 'Southern Indiana',         regionCode: 'IN' },
  // Ohio
  { code: 'OH-NW', name: 'Northwestern Ohio',        regionCode: 'OH' },
  { code: 'OH-C',  name: 'Central Ohio',             regionCode: 'OH' },
  { code: 'OH-S',  name: 'Southern Ohio',            regionCode: 'OH' },
  // Missouri
  { code: 'MO-N',  name: 'Northern Missouri',        regionCode: 'MO' },
  { code: 'MO-C',  name: 'Central Missouri',         regionCode: 'MO' },
  { code: 'MO-S',  name: 'Southern Missouri',        regionCode: 'MO' },
  // Wisconsin
  { code: 'WI-N',  name: 'Northern Wisconsin',       regionCode: 'WI' },
  { code: 'WI-S',  name: 'Southern Wisconsin',       regionCode: 'WI' },
  // Michigan
  { code: 'MI-LP', name: 'Lower Peninsula',          regionCode: 'MI' },
  { code: 'MI-UP', name: 'Upper Peninsula',          regionCode: 'MI' },
  // Minnesota
  { code: 'MN-N',  name: 'Northern Minnesota',       regionCode: 'MN' },
  { code: 'MN-C',  name: 'Central Minnesota',        regionCode: 'MN' },
  { code: 'MN-S',  name: 'Southern Minnesota',       regionCode: 'MN' },
  { code: 'MN-RV', name: 'Red River Valley',         regionCode: 'MN' },
  // North Dakota
  { code: 'ND-W',  name: 'Western North Dakota',     regionCode: 'ND' },
  { code: 'ND-C',  name: 'Central North Dakota',     regionCode: 'ND' },
  { code: 'ND-E',  name: 'Eastern North Dakota',     regionCode: 'ND' },
  { code: 'ND-RV', name: 'Red River Valley',         regionCode: 'ND' },
  // South Dakota
  { code: 'SD-N',  name: 'Northern South Dakota',    regionCode: 'SD' },
  { code: 'SD-C',  name: 'Central South Dakota',     regionCode: 'SD' },
  { code: 'SD-S',  name: 'Southern South Dakota',    regionCode: 'SD' },
  // Nebraska
  { code: 'NE-E',  name: 'Eastern Nebraska',         regionCode: 'NE' },
  { code: 'NE-C',  name: 'Central Nebraska',         regionCode: 'NE' },
  { code: 'NE-W',  name: 'Western Nebraska',         regionCode: 'NE' },
  // Kansas
  { code: 'KS-N',  name: 'Northern Kansas',          regionCode: 'KS' },
  { code: 'KS-C',  name: 'Central Kansas',           regionCode: 'KS' },
  { code: 'KS-S',  name: 'Southern Kansas',          regionCode: 'KS' },
  // Oklahoma
  { code: 'OK-N',  name: 'Northern Oklahoma',        regionCode: 'OK' },
  { code: 'OK-C',  name: 'Central Oklahoma',         regionCode: 'OK' },
  { code: 'OK-S',  name: 'Southern Oklahoma',        regionCode: 'OK' },
  // Texas
  { code: 'TX-PH', name: 'Texas Panhandle',          regionCode: 'TX' },
  { code: 'TX-N',  name: 'North Texas',              regionCode: 'TX' },
  { code: 'TX-C',  name: 'Central Texas',            regionCode: 'TX' },
  // Arkansas
  { code: 'AR-N',  name: 'Northern Arkansas',        regionCode: 'AR' },
  { code: 'AR-D',  name: 'Arkansas Delta',           regionCode: 'AR' },
  // Mississippi
  { code: 'MS-D',  name: 'Mississippi Delta',        regionCode: 'MS' },
  { code: 'MS-N',  name: 'Northern Mississippi',     regionCode: 'MS' },
  // Tennessee
  { code: 'TN-W',  name: 'Western Tennessee',        regionCode: 'TN' },
  { code: 'TN-C',  name: 'Middle Tennessee',         regionCode: 'TN' },
  // Kentucky
  { code: 'KY-W',  name: 'Western Kentucky',         regionCode: 'KY' },
  { code: 'KY-C',  name: 'Central Kentucky',         regionCode: 'KY' },
  // Montana
  { code: 'MT-N',  name: 'Northern Montana',         regionCode: 'MT' },
  { code: 'MT-C',  name: 'Central Montana',          regionCode: 'MT' },
  { code: 'MT-E',  name: 'Eastern Montana',          regionCode: 'MT' },
  // Colorado
  { code: 'CO-E',  name: 'Eastern Colorado',         regionCode: 'CO' },
  { code: 'CO-C',  name: 'Central Colorado',         regionCode: 'CO' },
  // Washington
  { code: 'WA-E',  name: 'Eastern Washington',       regionCode: 'WA' },
  { code: 'WA-C',  name: 'Central Washington',       regionCode: 'WA' },
  // Oregon
  { code: 'OR-WV', name: 'Willamette Valley',        regionCode: 'OR' },
  { code: 'OR-E',  name: 'Eastern Oregon',           regionCode: 'OR' },
  // Idaho
  { code: 'ID-N',  name: 'Northern Idaho',           regionCode: 'ID' },
  { code: 'ID-S',  name: 'Southern Idaho',           regionCode: 'ID' },
];

export const getRegionsByCountry = (country: 'CA' | 'US'): Region[] =>
  REGIONS.filter((r) => r.country === country);

export const getDistrictsByRegion = (regionCode: string): District[] =>
  DISTRICTS.filter((d) => d.regionCode === regionCode);
