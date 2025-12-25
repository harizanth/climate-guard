import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Map, Phone, ArrowRight, Activity, Thermometer, Radar, Flame, Droplets, Wind, AlertOctagon, Loader2 } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { DisasterPrediction } from '../types';

const Home = () => {
  const [hotspots, setHotspots] = useState<DisasterPrediction[]>([]);
  const [loadingPred, setLoadingPred] = useState(true);

  useEffect(() => {
    const loadPredictions = async () => {
        const data = await GeminiService.predictHotspots();
        setHotspots(data);
        setLoadingPred(false);
    };
    loadPredictions();
  }, []);

  const getIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('fire')) return Flame;
    if (t.includes('flood') || t.includes('rain')) return Droplets;
    if (t.includes('storm') || t.includes('hurricane') || t.includes('wind')) return Wind;
    return AlertOctagon;
  };

  return (
    <div className="w-full flex flex-col items-center bg-water-theme min-h-screen relative">
      
      {/* Moving Clouds Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="cloud w-64 h-20 top-20 opacity-60" style={{ animationDuration: '35s', top: '10%' }}></div>
        <div className="cloud w-48 h-16 top-40 opacity-40" style={{ animationDuration: '45s', animationDelay: '5s', top: '25%' }}></div>
        <div className="cloud w-96 h-28 top-10 opacity-70" style={{ animationDuration: '60s', animationDelay: '-10s', top: '5%' }}></div>
        <div className="cloud w-72 h-24 top-60 opacity-50" style={{ animationDuration: '40s', animationDelay: '15s', top: '15%' }}></div>
        {/* Lower water mist/clouds */}
        <div className="cloud w-[500px] h-32 opacity-20" style={{ animationDuration: '55s', animationDelay: '2s', bottom: '10%', top: 'auto' }}></div>
      </div>

      {/* Hero Section */}
      <section className="w-full max-w-7xl px-4 py-20 md:py-32 flex flex-col items-center text-center relative z-10">
        <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-8 animate-pulse shadow-lg">
          <Activity size={16} />
          <span>Live Disaster Monitoring Active</span>
        </div>
        
        <h1 className="text-5xl md:text-8xl font-bold tracking-tight text-white mb-6 drop-shadow-lg">
          CLIMATE <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">GUARD</span>
        </h1>
        
        <p className="text-lg md:text-xl text-blue-50 max-w-2xl mb-10 leading-relaxed drop-shadow-md font-medium">
          An advanced AI-powered real-time disaster management system. 
          Predict weather, track incidents globally, and get instant emergency assistance.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-lg">
          <Link to="/report" className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-xl font-bold transition-all hover:scale-105 shadow-xl shadow-red-900/30 group border border-red-400/50">
            <AlertTriangle className="group-hover:rotate-12 transition-transform" />
            <span>Report Disaster</span>
          </Link>
          <Link to="/map" className="flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-xl font-bold transition-all hover:scale-105 border border-white/30 shadow-lg">
            <Map />
            <span>Live Map</span>
          </Link>
        </div>
      </section>

      {/* AI Prediction Section */}
      <section className="w-full max-w-7xl px-4 pb-12 relative z-10">
        <div className="glass-panel p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center space-x-3 mb-8">
                <div className="bg-blue-500/20 p-2.5 rounded-lg border border-blue-400/30">
                    <Radar className="text-blue-300 w-6 h-6 animate-pulse" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">AI-Powered Risk Forecast</h2>
                    <p className="text-blue-200/70 text-sm">Predictive analysis based on global climate patterns</p>
                </div>
            </div>

            {loadingPred ? (
                <div className="flex flex-col items-center justify-center h-48 space-y-4">
                    <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
                    <span className="text-blue-200 animate-pulse">Scanning global weather data...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {hotspots.map((spot, idx) => {
                        const Icon = getIcon(spot.type);
                        return (
                            <div key={idx} className="bg-slate-800/40 border border-white/5 p-5 rounded-2xl hover:border-blue-400/50 transition-colors group backdrop-blur-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-slate-700/50 p-2 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                                        <Icon className="text-slate-300 group-hover:text-blue-300 transition-colors" size={24} />
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                        spot.risk === 'Critical' ? 'bg-red-500/30 text-red-200 border border-red-500/30' : 'bg-orange-500/30 text-orange-200 border border-orange-500/30'
                                    }`}>
                                        {spot.risk} Risk
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1">{spot.region}</h3>
                                <p className="text-xs text-blue-300 font-mono mb-3 uppercase tracking-wider">{spot.type}</p>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    {spot.reason}
                                </p>
                            </div>
                        );
                    })}
                    {hotspots.length === 0 && (
                        <div className="col-span-3 text-center text-slate-400 py-8">
                            No immediate high-risk zones detected by AI analysis at this moment.
                        </div>
                    )}
                </div>
            )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full max-w-7xl px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {[
          { icon: Thermometer, color: "text-yellow-300", title: "AI Weather Analysis", desc: "Real-time weather predictions specifically tailored for your location using Gemini AI." },
          { icon: Map, color: "text-blue-300", title: "Interactive Tracking", desc: "Visual map interface showing live disaster reports with severity indicators." },
          { icon: Phone, color: "text-green-300", title: "Emergency Response", desc: "Instant access to survival guides and first aid tutorials powered by AI." }
        ].map((feature, idx) => (
          <div key={idx} className="glass-panel p-8 rounded-2xl hover:bg-white/5 transition-colors border border-white/10 bg-slate-900/40 backdrop-blur-md">
            <feature.icon className={`w-12 h-12 mb-4 ${feature.color} drop-shadow-md`} />
            <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
            <p className="text-blue-100/70">{feature.desc}</p>
          </div>
        ))}
      </section>

      {/* Call to Action */}
      <section className="w-full bg-gradient-to-t from-slate-900/80 to-transparent py-20 text-center relative z-10">
        <h2 className="text-3xl font-bold text-white mb-6 drop-shadow-lg">Ready to help your community?</h2>
        <Link to="/emergency" className="inline-flex items-center text-blue-200 hover:text-white font-semibold text-lg group bg-white/10 px-6 py-3 rounded-full hover:bg-white/20 transition-all">
          View Emergency Guidelines <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
      </section>

    </div>
  );
};

export default Home;