import { Crop } from '@/types';

export const CROPS: Crop[] = [
  { id: 'corn',       name: 'Corn',      unit: 'bu' },
  { id: 'soybeans',   name: 'Soybeans',  unit: 'bu' },
  { id: 'canola',     name: 'Canola',    unit: 'bu' },
  { id: 'oats',       name: 'Oats',      unit: 'bu' },
  { id: 'barley',     name: 'Barley',    unit: 'bu' },
  { id: 'peas',       name: 'Peas',      unit: 'bu' },
  { id: 'lentils',    name: 'Lentils',   unit: 'bu' },
  { id: 'wheat-hrw',  name: 'Hard Red Winter',  unit: 'bu' },
  { id: 'wheat-hrs',  name: 'Hard Red Spring',  unit: 'bu' },
  { id: 'wheat-srw',  name: 'Soft Red Winter',  unit: 'bu' },
  { id: 'wheat-durum',name: 'Durum',            unit: 'bu' },
  { id: 'wheat-hw',   name: 'Hard White',       unit: 'bu' },
  { id: 'wheat-sw',   name: 'Soft White',       unit: 'bu' },
];

export const WHEAT_CROPS     = CROPS.filter(c => c.id.startsWith('wheat-'));
export const NON_WHEAT_CROPS = CROPS.filter(c => !c.id.startsWith('wheat-'));

export const getCropById = (id: string): Crop | undefined =>
  CROPS.find((c) => c.id === id);
