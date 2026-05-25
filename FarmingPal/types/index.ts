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
  grade?: string;
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

export type JobStatus   = 'open' | 'filled' | 'closed';
export type QuoteStatus = 'pending' | 'accepted' | 'declined';

export interface JobPosting {
  id: string;
  farmerId: string;
  farmerName: string;
  services: string[];
  acres: string;
  startDate: string;
  endDate: string;
  crop: string;
  terrain: string;
  notes: string;
  districtCode: string;
  regionCode: string;
  country: Country;
  status: JobStatus;
  postedAt: string;
}

export interface JobQuote {
  id: string;
  jobId: string;
  operatorId: string;
  operatorName: string;
  businessName: string;
  ratePerAcre: string;
  message: string;
  status: QuoteStatus;
  submittedAt: string;
}

export interface JobMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  body: string;
  sentAt: string;
  readAt?: string;
}

export interface JobThread {
  id: string;
  jobId: string;
  jobTitle: string;
  farmerId: string;
  operatorId: string;
  operatorName: string;
  messages: JobMessage[];
  createdAt: string;
  lastMessageAt: string;
}

export interface EmailNotificationPrefs {
  customFarmingJobs: boolean;
  equipmentForSale: boolean;
  landForSale: boolean;
}

export type FarmhandJobType = 'Full-Time' | 'Part-Time' | 'Seasonal' | 'Casual / Day Labour';
export type FarmhandPayType = 'Hourly' | 'Salary' | 'Piece-Rate' | 'Negotiable';
export type FarmhandStatus  = 'open' | 'filled' | 'closed';
export type ApplicationStatus = 'pending' | 'reviewing' | 'accepted' | 'declined';

export interface FarmhandPosting {
  id: string;
  employerId: string;
  employerName: string;
  title: string;
  jobType: FarmhandJobType;
  description: string;
  requirements: string;
  payRate: string;
  payType: FarmhandPayType;
  housingProvided: boolean;
  mealsProvided: boolean;
  startDate: string;
  endDate: string;
  districtCode: string;
  regionCode: string;
  country: Country;
  status: FarmhandStatus;
  postedAt: string;
}

export interface FarmhandApplication {
  id: string;
  postingId: string;
  applicantId?: string;
  applicantName: string;
  email: string;
  phone: string;
  coverLetter: string;
  resumeUrl?: string;
  resumeName?: string;
  experience: string;
  status: ApplicationStatus;
  appliedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  country: Country;
  regionCode: string;
  districtCode: string;
  contactName?: string;
  phone?: string;
  farmName?: string;
  ruralAddress?: string;
  city?: string;
  postalCode?: string;
  acres?: string;
  serviceBookings?: ServiceBooking[];
  operatorEquipment?: OperatorRegistration[];
  emailNotifications?: EmailNotificationPrefs;
  farmhandBio?: string;
  farmhandResumeUrl?: string;
  farmhandResumeName?: string;
  farmhandExperience?: string;
  farmhandSkills?: string;
  farmhandSeeking?: boolean;
  farmhandJobPrefs?: string;
}
