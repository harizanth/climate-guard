import React, { useEffect, useState } from 'react';
import { ReportService } from '../services/store';
import { DisasterReport, ReportStatus } from '../types';
import { CheckCircle, XCircle, Clock, Filter, Lock } from 'lucide-react';

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [reports, setReports] = useState<DisasterReport[]>([]);
  const [filter, setFilter] = useState<'All' | 'Active' | 'Resolved'>('All');
  
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      setIsAuthenticated(true);
      refreshData();
    } else {
      setError('Invalid credentials');
    }
  };

  const refreshData = () => {
    setReports(ReportService.getAll());
  };

  const handleStatusUpdate = (id: string, newStatus: ReportStatus) => {
    ReportService.updateStatus(id, newStatus);
    refreshData();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="glass-panel p-8 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl">
          <div className="text-center mb-8">
            <Lock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white">Admin Access</h2>
            <p className="text-slate-400 text-sm">Restricted Area for Officials</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="text" 
              placeholder="Username (admin)" 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input 
              type="password" 
              placeholder="Password (admin)" 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredReports = reports.filter(r => 
    filter === 'All' ? true : 
    filter === 'Active' ? r.status === ReportStatus.ACTIVE : 
    r.status === ReportStatus.RESOLVED
  );

  return (
    <div className="max-w-7xl mx-auto p-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Disaster Management Dashboard</h1>
        
        <div className="flex space-x-2 mt-4 md:mt-0 bg-slate-800 p-1 rounded-lg border border-slate-700">
          {['All', 'Active', 'Resolved'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === f ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredReports.map((report) => (
          <div key={report.id} className="glass-panel p-6 rounded-xl border-l-4 border-l-blue-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                  report.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                  report.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {report.severity}
                </span>
                <span className="text-slate-500 text-sm flex items-center">
                  <Clock size={14} className="mr-1" />
                  {new Date(report.timestamp).toLocaleString()}
                </span>
                <span className={`text-sm font-bold ${
                  report.status === ReportStatus.ACTIVE ? 'text-red-400 animate-pulse' : 'text-green-400'
                }`}>
                  • {report.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{report.type} - {report.location.lat.toFixed(2)}, {report.location.lng.toFixed(2)}</h3>
              <p className="text-slate-400 text-sm mb-2">{report.description}</p>
              <p className="text-slate-500 text-xs">Reporter: {report.reporterName} | Contact: {report.contactNumber}</p>
            </div>

            <div className="flex space-x-3">
               {report.status !== ReportStatus.RESOLVED && (
                 <button 
                  onClick={() => handleStatusUpdate(report.id, ReportStatus.RESOLVED)}
                  className="flex items-center space-x-2 bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white px-4 py-2 rounded-lg border border-green-600/50 transition-colors"
                 >
                   <CheckCircle size={18} />
                   <span>Resolve</span>
                 </button>
               )}
               {report.status === ReportStatus.RESOLVED && (
                 <button 
                  onClick={() => handleStatusUpdate(report.id, ReportStatus.ACTIVE)}
                  className="flex items-center space-x-2 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg border border-red-600/50 transition-colors"
                 >
                   <XCircle size={18} />
                   <span>Reopen</span>
                 </button>
               )}
            </div>
          </div>
        ))}

        {filteredReports.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            No reports found matching this filter.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;