import React, { useState, useEffect } from 'react';
import { DisasterType, ReportStatus, DisasterReport } from '../types';
import { ReportService } from '../services/store';
import { GeminiService } from '../services/geminiService';
import { Loader2, MapPin, Upload, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReportDisaster = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [locationError, setLocationError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    type: DisasterType.OTHER,
    description: '',
    severity: 'Medium' as 'Low' | 'Medium' | 'High' | 'Critical',
    lat: 0,
    lng: 0,
    imageUrl: ''
  });

  useEffect(() => {
    // Auto get location on mount
    getLocation();
  }, []);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData(prev => ({ ...prev, lat: pos.coords.latitude, lng: pos.coords.longitude }));
          setLocationError('');
        },
        (err) => {
          setLocationError('Unable to retrieve location. Please enable GPS.');
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
    }
  };

  const handleDescriptionChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const desc = e.target.value;
    setFormData(prev => ({ ...prev, description: desc }));

    // Debounced AI Analysis
    if (desc.length > 10 && !analyzing) {
        setAnalyzing(true);
        // Small delay to simulate "thinking" or debounce typing
        setTimeout(async () => {
            const analysis = await GeminiService.classifyReport(desc);
            setFormData(prev => ({ 
                ...prev, 
                type: analysis.type,
                severity: analysis.severity 
            }));
            setAnalyzing(false);
        }, 1000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const report = {
        type: formData.type,
        description: formData.description,
        location: { lat: formData.lat, lng: formData.lng },
        reporterName: formData.name,
        contactNumber: formData.phone,
        severity: formData.severity,
        reporterId: 'user-1'
    };

    ReportService.addReport(report);
    setLoading(false);
    setSuccess(true);
    
    setTimeout(() => {
        navigate('/map');
    }, 2000);
  };

  if (success) {
    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="glass-panel p-8 rounded-2xl text-center max-w-md w-full animate-fade-in-up">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-white mb-2">Report Submitted</h2>
                <p className="text-slate-400">Help is on the way. Authorities have been notified of your location.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 py-8">
      <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-white/5">
        <div className="bg-red-600/20 p-6 border-b border-red-500/20 flex items-center space-x-3">
            <AlertTriangle className="text-red-500 w-8 h-8" />
            <div>
                <h1 className="text-2xl font-bold text-white">Report a Disaster</h1>
                <p className="text-red-200 text-sm">Submit accurate details to help rescue teams.</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            
            {/* Location Status */}
            <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <div className="flex items-center space-x-3">
                    <div className="bg-blue-500/20 p-2 rounded-full text-blue-400">
                        <MapPin size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-300">GPS Location</p>
                        {formData.lat !== 0 ? (
                            <p className="text-xs text-green-400 font-mono">{formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}</p>
                        ) : (
                            <p className="text-xs text-red-400">{locationError || "Detecting..."}</p>
                        )}
                    </div>
                </div>
                <button type="button" onClick={getLocation} className="text-xs text-blue-400 hover:text-white underline">
                    Retry GPS
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Full Name</label>
                    <input 
                        required
                        type="text" 
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Phone Number</label>
                    <input 
                        required
                        type="tel" 
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 flex justify-between">
                    <span>Description of Incident</span>
                    {analyzing && <span className="text-blue-400 text-xs animate-pulse">AI Analyzing severity...</span>}
                </label>
                <textarea 
                    required
                    rows={4}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Describe what is happening..."
                    value={formData.description}
                    onChange={handleDescriptionChange}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Disaster Type (AI Suggested)</label>
                    <select 
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value as DisasterType})}
                    >
                        {Object.values(DisasterType).map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Severity Level</label>
                    <div className="flex space-x-2">
                        {['Low', 'Medium', 'High', 'Critical'].map((level) => (
                            <button
                                key={level}
                                type="button"
                                onClick={() => setFormData({...formData, severity: level as any})}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
                                    formData.severity === level 
                                        ? level === 'Critical' ? 'bg-red-600 border-red-600 text-white' : 'bg-blue-600 border-blue-600 text-white'
                                        : 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-500'
                                }`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* File Upload Mock */}
            <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center hover:border-blue-500/50 transition-colors cursor-pointer bg-slate-900/30">
                <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Tap to upload photos or videos (Optional)</p>
            </div>

            <button 
                type="submit" 
                disabled={loading || formData.lat === 0}
                className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-900/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
                {loading ? <Loader2 className="animate-spin" /> : <AlertTriangle />}
                <span>{loading ? 'Submitting Report...' : 'SUBMIT EMERGENCY REPORT'}</span>
            </button>
        </form>
      </div>
    </div>
  );
};

export default ReportDisaster;