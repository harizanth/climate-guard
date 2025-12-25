import React, { useEffect, useState } from 'react';
import { Phone, Heart, Wind, CloudRain, ShieldCheck, Thermometer, Info, Search, MapPin, ExternalLink, RefreshCw } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { WeatherData } from '../types';

const EmergencyHelp = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [locationQuery, setLocationQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    // Check location and fetch weather on mount
    fetchWeatherByGPS();
  }, []);

  const fetchWeatherByGPS = () => {
    setLoadingWeather(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const data = await GeminiService.getWeatherAnalysis({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setWeather(data);
        setLastUpdated(new Date());
        setLoadingWeather(false);
      }, (err) => {
        setLoadingWeather(false);
        // Fallback or error state
      });
    } else {
        setLoadingWeather(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!locationQuery.trim()) return;
      
      setLoadingWeather(true);
      const data = await GeminiService.getWeatherAnalysis(locationQuery);
      setWeather(data);
      setLastUpdated(new Date());
      setLoadingWeather(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8 pb-20">
      
      {/* Weather Widget */}
      <section className="glass-panel p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 relative z-10">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center">
                <CloudRain className="mr-3 text-blue-400" /> 
                Real-Time Local Analysis
              </h2>
              {lastUpdated && (
                <p className="text-xs text-slate-400 mt-1 flex items-center">
                  <RefreshCw size={10} className="mr-1" />
                  Last Updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
            
            <form onSubmit={handleSearch} className="flex w-full md:w-auto bg-slate-800/80 border border-slate-600 rounded-lg overflow-hidden focus-within:border-blue-500 transition-colors">
                <input 
                    type="text" 
                    placeholder="Search city (e.g. Tokyo)..." 
                    className="bg-transparent text-white px-4 py-2 focus:outline-none w-full md:w-64 placeholder-slate-500"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                />
                <button type="submit" className="bg-slate-700 px-4 hover:bg-blue-600 transition-colors text-white">
                    <Search size={18} />
                </button>
                <button type="button" onClick={fetchWeatherByGPS} className="bg-slate-700 border-l border-slate-600 px-3 hover:bg-blue-600 transition-colors text-white" title="Use GPS">
                    <MapPin size={18} />
                </button>
            </form>
        </div>

        {loadingWeather ? (
          <div className="h-40 flex items-center justify-center text-slate-400 animate-pulse bg-slate-800/30 rounded-xl">
            <div className="flex flex-col items-center space-y-3">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Scanning real-time satellite & ground data...</span>
            </div>
          </div>
        ) : weather ? (
          <div className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-sm mb-1">Location</p>
                <div className="flex items-center text-xl font-bold text-white truncate" title={weather.location}>
                  {weather.location || "Unknown"}
                </div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-sm mb-1">Temperature</p>
                <div className="flex items-center text-3xl font-bold text-white">
                  <Thermometer className="mr-2 text-yellow-500" size={24} />
                  {weather.temp}
                </div>
              </div>
               <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-sm mb-1">Wind & Condition</p>
                <div className="flex flex-col">
                    <span className="text-xl font-bold text-white">{weather.condition}</span>
                    <span className="text-sm text-slate-400">{weather.wind} | Hum: {weather.humidity}</span>
                </div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-sm mb-1">Active Alerts</p>
                <div className={`text-sm font-medium ${weather.alerts && weather.alerts.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {weather.alerts && weather.alerts.length > 0 ? weather.alerts[0] : "No Active Warnings"}
                </div>
              </div>
            </div>

            {/* Source Links */}
            {weather.sources && weather.sources.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-700/50">
                <span className="text-xs text-slate-500 font-medium">Data Sources:</span>
                {weather.sources.map((source, idx) => (
                   <a 
                    key={idx} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-xs text-blue-400 hover:text-blue-300 bg-blue-900/20 px-2 py-1 rounded transition-colors"
                   >
                     {source.title} <ExternalLink size={10} className="ml-1" />
                   </a>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-red-400 p-4 bg-red-500/10 rounded-xl border border-red-500/20">Could not load weather data. Please try again.</div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Emergency Numbers */}
        <section className="glass-panel p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <Phone className="mr-3 text-green-400" />
            Emergency Helplines
          </h3>
          <div className="space-y-4">
            {[
              { name: "National Emergency Number", number: "112" },
              { name: "Ambulance", number: "102" },
              { name: "Fire Service", number: "101" },
              { name: "Disaster Management Services", number: "108" },
              { name: "Women Helpline", number: "1091" },
            ].map((contact, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-slate-800/50 rounded-xl hover:bg-slate-700/50 transition-colors border border-slate-700">
                <span className="text-slate-300 font-medium">{contact.name}</span>
                <a href={`tel:${contact.number}`} className="bg-green-600/20 text-green-400 px-4 py-1 rounded-full font-bold hover:bg-green-600 hover:text-white transition-all">
                  {contact.number}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Guides */}
        <section className="glass-panel p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <ShieldCheck className="mr-3 text-blue-400" />
            Survival Guides
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {[
              { title: "Flood Safety", desc: "Move to higher ground. Disconnect electrical appliances. Do not walk through moving water." },
              { title: "Earthquake Protocol", desc: "Drop, Cover, and Hold On. Stay away from windows. If outside, find a clear spot." },
              { title: "Fire Evacuation", desc: "Stay low to the ground. Check doors for heat before opening. Use stairs, not elevators." },
              { title: "First Aid: CPR", desc: "Push hard and fast in the center of the chest. 100-120 compressions per minute." }
            ].map((guide, i) => (
              <div key={i} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <h4 className="font-bold text-white mb-1 flex items-center">
                   <Heart size={16} className="mr-2 text-red-500" /> {guide.title}
                </h4>
                <p className="text-sm text-slate-400">{guide.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default EmergencyHelp;