import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Shield, Map, AlertTriangle, Phone, Menu, X, LayoutDashboard, BarChart2 } from 'lucide-react';
import Home from './pages/Home';
import ReportDisaster from './pages/ReportDisaster';
import LiveMap from './pages/LiveMap';
import EmergencyHelp from './pages/EmergencyHelp';
import AdminDashboard from './pages/AdminDashboard';
import ClimateAnalysis from './pages/ClimateAnalysis';
import ChatBot from './components/ChatBot';
import GlobalAlert from './components/GlobalAlert';
import AlertSubscription from './components/AlertSubscription';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const links = [
    { path: '/', label: 'Home', icon: Shield },
    { path: '/map', label: 'Live Map', icon: Map },
    { path: '/analysis', label: 'Analytics', icon: BarChart2 },
    { path: '/report', label: 'Report', icon: AlertTriangle },
    { path: '/emergency', label: 'Help', icon: Phone },
    { path: '/admin', label: 'Admin', icon: LayoutDashboard },
  ];

  return (
    <nav className="glass-panel border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-blue-600 p-1.5 rounded-lg group-hover:bg-blue-500 transition-colors">
              <Shield className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-wider text-white brand-font">
              CLIMATE <span className="text-blue-500 group-hover:text-blue-400 transition-colors">GUARD</span>
            </span>
          </Link>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-2">
              {links.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <link.icon size={16} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-slate-900/95 border-b border-slate-700 backdrop-blur-xl">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-3 py-4 rounded-md text-base font-medium ${
                   location.pathname === link.path 
                     ? 'bg-blue-600/20 text-blue-400' 
                     : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <link.icon size={20} />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

const App = () => {
  return (
    <Router>
      <div className="min-h-screen text-slate-100 font-sans selection:bg-blue-500/30">
        <GlobalAlert />
        <Navbar />
        <main className="relative z-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<LiveMap />} />
            <Route path="/analysis" element={<ClimateAnalysis />} />
            <Route path="/report" element={<ReportDisaster />} />
            <Route path="/emergency" element={<EmergencyHelp />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
        <AlertSubscription />
        <ChatBot />
      </div>
    </Router>
  );
};

export default App;