import { DisasterReport, Subscriber } from '../types';

const SUB_KEY = 'climate_guard_subscribers';

export const NotificationService = {
  requestPermission: async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notification');
      return false;
    }
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  addSubscriber: (subscriber: Omit<Subscriber, 'id'>) => {
    const subs = NotificationService.getSubscribers();
    // Simple de-dupe by email to prevent duplicate alerts
    if (subs.find(s => s.email === subscriber.email)) return;
    
    const newSub = { ...subscriber, id: Date.now().toString() };
    const updated = [...subs, newSub];
    localStorage.setItem(SUB_KEY, JSON.stringify(updated));
    
    // Send welcome notification
    if (Notification.permission === 'granted') {
       new Notification("Climate Guard Alerts Active", {
         body: "You are now subscribed to critical disaster alerts. You will be notified immediately of high-risk events."
       });
    }
    
    // Simulate Confirmation SMS
    console.log(`[SMS GATEWAY] Sending confirmation to ${newSub.phone}: You are subscribed to Climate Guard Alerts.`);
    
    return newSub;
  },

  getSubscribers: (): Subscriber[] => {
    const stored = localStorage.getItem(SUB_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  broadcastAlert: (report: DisasterReport) => {
    // Only broadcast for High or Critical severity
    if (report.severity !== 'High' && report.severity !== 'Critical') return;

    // Dispatch In-App Event for UI Overlay
    const event = new CustomEvent('climate-guard-alert', { detail: report });
    window.dispatchEvent(event);

    const subs = NotificationService.getSubscribers();
    
    const title = `🚨 EMERGENCY ALERT: ${report.type}`;
    const body = `CRITICAL WARNING: ${report.severity} severity ${report.type} reported. Location: ${report.location.lat.toFixed(4)}, ${report.location.lng.toFixed(4)}. Description: ${report.description}. Seek safety immediately.`;

    // 1. Browser Push Notification (Immediate UI Alert)
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        requireInteraction: true,
        tag: 'disaster-alert'
      });
    }

    // 2. Mock SMS & Email Dispatch
    if (subs.length > 0) {
      console.group('📢 BROADCASTING CRITICAL ALERT');
      subs.forEach(sub => {
         // Simulate SMS
         console.log(`%c[SMS SENT] %cTo: ${sub.phone} | MSG: ${title} - ${body}`, 'color: #22c55e; font-weight: bold;', 'color: #cbd5e1;');
         
         // Simulate Email
         console.log(`%c[EMAIL SENT] %cTo: ${sub.email} | SUBJ: URGENT DISASTER WARNING | BODY: ${body}`, 'color: #3b82f6; font-weight: bold;', 'color: #cbd5e1;');
      });
      console.groupEnd();
    }
  }
};