import { DisasterReport, DisasterType, ReportStatus } from '../types';
import { NotificationService } from './notificationService';

const STORAGE_KEY = 'climate_guard_reports';

// Initial dummy data to populate the map
const INITIAL_DATA: DisasterReport[] = [
  {
    id: '1',
    type: DisasterType.FLOOD,
    description: 'Severe flooding in downtown area, roads blocked.',
    location: { lat: 28.6139, lng: 77.2090 }, // New Delhi
    timestamp: Date.now() - 1000000,
    reporterName: 'System Admin',
    contactNumber: '100',
    status: ReportStatus.ACTIVE,
    severity: 'High'
  },
  {
    id: '2',
    type: DisasterType.FIRE,
    description: 'Forest fire spotted near the ridge.',
    location: { lat: 19.0760, lng: 72.8777 }, // Mumbai
    timestamp: Date.now() - 500000,
    reporterName: 'Rahul K.',
    contactNumber: '9998887776',
    status: ReportStatus.ACTIVE,
    severity: 'Critical'
  },
  {
    id: '3',
    type: DisasterType.STORM,
    description: 'Cyclone warning, high winds.',
    location: { lat: 13.0827, lng: 80.2707 }, // Chennai
    timestamp: Date.now() - 200000,
    reporterName: 'Weather Station',
    contactNumber: 'N/A',
    status: ReportStatus.VERIFIED,
    severity: 'Medium'
  }
];

export const ReportService = {
  getAll: (): DisasterReport[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      return INITIAL_DATA;
    }
    return JSON.parse(stored);
  },

  addReport: (report: Omit<DisasterReport, 'id' | 'timestamp' | 'status'>): DisasterReport => {
    const reports = ReportService.getAll();
    const newReport: DisasterReport = {
      ...report,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      status: ReportStatus.ACTIVE,
    };
    const updated = [newReport, ...reports];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Trigger Notification System for High/Critical Severity
    NotificationService.broadcastAlert(newReport);

    return newReport;
  },

  updateStatus: (id: string, status: ReportStatus) => {
    const reports = ReportService.getAll();
    const updated = reports.map(r => r.id === id ? { ...r, status } : r);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  // Simulates fetching specific data or filtering
  getStats: () => {
    const reports = ReportService.getAll();
    return {
      total: reports.length,
      active: reports.filter(r => r.status === ReportStatus.ACTIVE).length,
      resolved: reports.filter(r => r.status === ReportStatus.RESOLVED).length,
    };
  }
};