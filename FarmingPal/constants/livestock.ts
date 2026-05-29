export interface LivestockType {
  id:    string;
  name:  string;
  group: string;
}

export const LIVESTOCK_TYPES: LivestockType[] = [
  { id: 'beef-fed',        name: 'Fed Cattle',         group: 'Beef' },
  { id: 'beef-feeder',     name: 'Feeder Cattle',      group: 'Beef' },
  { id: 'beef-cow-calf',   name: 'Cow & Calf',         group: 'Beef' },
  { id: 'hogs-market',     name: 'Market Hogs',        group: 'Hogs' },
  { id: 'hogs-feeder',     name: 'Feeder Pigs',        group: 'Hogs' },
  { id: 'sheep-market',    name: 'Market Lambs',       group: 'Sheep' },
  { id: 'sheep-cull',      name: 'Cull Ewes',          group: 'Sheep' },
  { id: 'dairy-cull',      name: 'Dairy Cull Cows',    group: 'Dairy' },
  { id: 'dairy-heifer',    name: 'Springing Heifers',  group: 'Dairy' },
  { id: 'poultry-broiler', name: 'Broilers',           group: 'Poultry' },
  { id: 'poultry-turkey',  name: 'Turkeys',            group: 'Poultry' },
  { id: 'other',           name: 'Other',              group: 'Other' },
];

export function getLivestockById(id: string): LivestockType | undefined {
  return LIVESTOCK_TYPES.find((t) => t.id === id);
}
