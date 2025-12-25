import React, { useState, useEffect } from 'react';
import { Search, Thermometer, CloudRain, Info, BarChart2, PieChart } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { ClimateAnalytics } from '../types';
import { LineChart, BarChart } from '../components/Charts';

const ClimateAnalysis = () => {
  const [region, setRegion] = useState('');
  const [data, setData] = useState<ClimateAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  // Load default data on mount
  useEffect(() => {
    handleSearch('Global');
  }, []);

  const handleSearch = async (query: string) => {
    setLoading(true);
    const result = await GeminiService.getClimateAnalytics(query);
    setData(result);
    setLoading(false);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (region.trim()) handleSearch(region);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BarChart2 className="text-purple-400" size={32} />
            Climatic Analytics
          </h1>
          <p className="text-slate-400 mt-2">AI-driven insights on historical weather patterns and disaster risks.</p>
        </div>
        
        <form onSubmit={onSubmit} className="w-full md:w-96 relative">
          <input 
            type="text" 
            placeholder="Analyze a region (e.g. California, India)..." 
            className="w-full bg-slate-800/80 border border-slate-600 rounded-xl px-4 py-3 pl-11 text-white focus:outline-none focus:border-purple-500 transition-all shadow-lg"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          />
          <Search className="absolute left-3.5 top-3.5 text-slate-400" size={20} />
        </form>
      </div>

      {loading ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 animate-pulse">Gathering historical climate data...</p>
        </div>
      ) : data ? (
        <div className="space-y-6 animate-fade-in-up">
          
          {/* Summary Card */}
          <div className="glass-panel p-6 rounded-2xl border-l-4 border-purple-500">
            <h2 className="text-xl font-bold text-white mb-2">{data.region} Overview</h2>
            <p className="text-slate-300 leading-relaxed text-lg">{data.summary}</p>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Temp Chart */}
            <div className="glass-panel p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Thermometer className="text-orange-400" /> Temperature Trends
                </h3>
                <span className="text-xs text-slate-500 uppercase">Last 5 Years</span>
              </div>
              <div className="px-2">
                <LineChart 
                  data={data.yearlyData} 
                  xKey="year" 
                  yKey="avgTemp" 
                  color="#fb923c" 
                  height={220} 
                  unit="°C"
                />
              </div>
              <div className="mt-4 text-center text-xs text-slate-500">Average Annual Temperature (°C)</div>
            </div>

            {/* Rainfall Chart */}
            <div className="glass-panel p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CloudRain className="text-blue-400" /> Precipitation Levels
                </h3>
                <span className="text-xs text-slate-500 uppercase">Annual Rainfall</span>
              </div>
              <div className="px-2">
                <BarChart 
                  data={data.yearlyData} 
                  xKey="year" 
                  yKey="rainfall" 
                  color="#60a5fa" 
                  height={220} 
                  unit="mm"
                />
              </div>
              <div className="mt-4 text-center text-xs text-slate-500">Total Rainfall (mm)</div>
            </div>

            {/* Disaster Distribution */}
            <div className="glass-panel p-6 rounded-2xl lg:col-span-2">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <PieChart className="text-red-400" /> Disaster Risk Distribution
              </h3>
              <div className="space-y-6">
                {data.disasterDistribution.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-200">{item.type}</span>
                      <span className="text-slate-400">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                        style={{ width: `${item.percentage}%`, backgroundColor: ['#ef4444', '#f97316', '#3b82f6', '#8b5cf6'][idx % 4] }}
                      >
                         <div className="absolute inset-0 bg-white/20" style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ClimateAnalysis;