export type Country = 'CA' | 'US';

export interface Region {
  code: string;
  name: string;
  country: Country;
}

export interface District {
  code: string;
  name: string;
  regionCode: string;
}

export interface Crop {
  id: string;
  name: string;
  unit: string; // always 'bu'
}

export interface PriceSubmission {
  id: string;
  cropId: string;
  price: number;
  currency: 'USD' | 'CAD';
  elevatorName: string;
  districtCode: string;
  regionCode: string;
  country: Country;
  submittedAt: string; // ISO date string
}

export interface ServiceBooking {
  id: string;
  services: string[];
  acres: string;
  startDate: string;
  endDate: string;
  crop: string;
  terrain: string;
  notes: string;
  submittedAt: string;
}

export interface EquipmentDetail {
  year: string;
  make: string;
  model: string;
  size: string;
  engineHp: string;
}

export interface OperatorRegistration {
  id: string;
  businessName: string;
  service: string;
  equipment: EquipmentDetail;
  ratePerAcre: string;
  labourRate: string;
  serviceArea: string;
  startDate: string;
  endDate: string;
  notes: string;
  registeredAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  country: Country;
  regionCode: string;
  districtCode: string;
  contactName?: string;
  farmName?: string;
  ruralAddress?: string;
  city?: string;
  postalCode?: string;
  acres?: string;
  serviceBookings?: ServiceBooking[];
  operatorEquipment?: OperatorRegistration[];
}
