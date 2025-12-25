export enum DisasterType {
  FLOOD = 'Flood',
  FIRE = 'Fire',
  EARTHQUAKE = 'Earthquake',
  STORM = 'Storm',
  LANDSLIDE = 'Landslide',
  OTHER = 'Other'
}

export enum ReportStatus {
  ACTIVE = 'Active',
  RESOLVED = 'Resolved',
  VERIFIED = 'Verified'
}

export interface GeoLocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface DisasterReport {
  id: string;
  type: DisasterType;
  description: string;
  location: GeoLocation;
  timestamp: number;
  reporterName: string;
  contactNumber: string;
  status: ReportStatus;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  imageUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface WeatherData {
  temp: string;
  condition: string;
  humidity: string;
  wind: string;
  location: string;
  alerts?: string[];
  sources?: { title: string; uri: string }[];
}

export interface Subscriber {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface DisasterPrediction {
  region: string;
  type: string;
  risk: 'High' | 'Critical';
  reason: string;
  coordinates: { lat: number; lng: number };
}

export interface ClimateAnalytics {
  region: string;
  summary: string;
  yearlyData: {
    year: number;
    avgTemp: number; // Celsius
    rainfall: number; // mm
  }[];
  disasterDistribution: {
    type: string;
    percentage: number;
  }[];
}