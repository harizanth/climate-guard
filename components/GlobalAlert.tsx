import React, { useEffect, useState } from 'react';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { DisasterReport } from '../types';

const GlobalAlert = () => {
  const [alert, setAlert] = useState<DisasterReport | null>(null);

  useEffect(() => {
    const handleAlert = (event: Event) => {
      const customEvent = event as CustomEvent<DisasterReport>;
      setAlert(customEvent.detail);
      
      // Auto dismiss after 15 seconds if ignored
      const timer = setTimeout(() => {
        setAlert(null);
      }, 15000);
      
      return () => clearTimeout(timer);
    };

    window.addEventListener('climate-guard-alert', handleAlert);
    return () => window.removeEventListener('climate-guard-alert', handleAlert);
  }, []);

  if (!alert) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-[100] transition-transform duration-500 ease-in-out transform translate-y-0">
      <div className="bg-red-600 text-white px-4 py-4 md:py-3 shadow-2xl border-b-4 border-red-800 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-2 rounded-full animate-pulse">
                <ShieldAlert size={32} />
            </div>
            <div>
                <h3 className="font-bold text-lg uppercase tracking-wider flex items-center gap-2">
                    Emergency Alert: {alert.type}
                    <span className="bg-white text-red-600 text-xs px-2 py-0.5 rounded-full font-extrabold">{alert.severity}</span>
                </h3>
                <p className="text-red-100 text-sm md:text-base">{alert.description}</p>
                <p className="text-xs text-red-200 mt-1 font-mono">
                    Loc: {alert.location.lat.toFixed(4)}, {alert.location.lng.toFixed(4)}
                </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
             <button 
                onClick={() => setAlert(null)}
                className="flex-1 md:flex-none bg-white/20 hover:bg-white/30 px-6 py-2 rounded-lg font-semibold transition-colors text-sm uppercase"
             >
                Acknowledge
             </button>
             <button 
                onClick={() => setAlert(null)}
                className="p-2 hover:bg-white/10 rounded-full"
             >
                <X size={20} />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalAlert;