import React, { useState } from 'react';
import { Bell, Mail, Phone, X, Check, AlertTriangle } from 'lucide-react';
import { NotificationService } from '../services/notificationService';

const AlertSubscription = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [status, setStatus] = useState<'idle' | 'subscribed'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const granted = await NotificationService.requestPermission();
    
    if (granted) {
      NotificationService.addSubscriber(formData);
      setStatus('subscribed');
      
      // Reset after success
      setTimeout(() => {
        setIsOpen(false);
        setStatus('idle');
        setFormData({ name: '', email: '', phone: '' });
      }, 3000);
    } else {
      alert("Permission denied. Please enable notifications in your browser settings to receive alerts.");
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 bg-red-600 hover:bg-red-500 text-white p-4 rounded-full shadow-lg shadow-red-900/50 border border-red-500 transition-all hover:scale-105 flex items-center gap-2 group"
      >
        <Bell className="text-white animate-pulse" fill="currentColor" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap font-bold">
          Get Alerts
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl w-full max-w-md relative shadow-2xl">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-6">
              <div className="bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-white">Critical Disaster Alerts</h2>
              <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                Enter your contact details to receive <strong>immediate</strong> SMS and Email notifications before disasters reach your area.
              </p>
            </div>

            {status === 'subscribed' ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-8 text-center animate-pulse">
                <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-400 mb-2">You are covered!</h3>
                <p className="text-sm text-green-300/70">
                  We have sent a confirmation to {formData.email}.<br/>
                  Stay safe.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Full Name</label>
                  <input
                    required
                    type="text"
                    placeholder="John Doe"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition-colors"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 text-slate-500 w-5 h-5" />
                    <input
                      required
                      type="email"
                      placeholder="john@example.com"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition-colors"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 text-slate-500 w-5 h-5" />
                    <input
                      required
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition-colors"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-900/40 transition-all transform active:scale-[0.98]"
                  >
                    Activate Alerts
                  </button>
                  <p className="text-xs text-center text-slate-500 mt-3">
                    By activating, you agree to receive automated emergency messages.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AlertSubscription;