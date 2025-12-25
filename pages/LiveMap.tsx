import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ReportService } from '../services/store';
import { DisasterReport } from '../types';
import { Loader2, RefreshCw } from 'lucide-react';

// Fix for default Leaflet markers in React
const iconPerson = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const iconSafe = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});


const LiveMap = () => {
  const [reports, setReports] = useState<DisasterReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);

  useEffect(() => {
    // Initial Load
    refreshData();
    
    // Get User Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
      });
    }

    // Polling for "Real-Time" updates
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, []);

  const refreshData = () => {
    const data = ReportService.getAll();
    setReports(data.filter(r => r.status === 'Active' || r.status === 'Verified'));
    setLoading(false);
  };

  const RecenterMap = ({ lat, lng }: { lat: number, lng: number }) => {
    const map = useMap();
    useEffect(() => {
      map.setView([lat, lng], map.getZoom());
    }, [lat, lng, map]);
    return null;
  };

  return (
    <div className="h-[calc(100vh-64px)] w-full relative">
      {loading && (
        <div className="absolute inset-0 z-[1000] bg-slate-900 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </div>
      )}

      {/* Floating Info Panel */}
      <div className="absolute top-4 left-4 z-[400] glass-panel p-4 rounded-xl max-w-xs hidden md:block">
        <h2 className="text-lg font-bold text-white mb-2">Live Activity</h2>
        <div className="flex items-center space-x-2 text-sm text-slate-300 mb-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
            <span>Active Disasters: {reports.length}</span>
        </div>
        <p className="text-xs text-slate-400">Map updates automatically every 5 seconds.</p>
      </div>

      <MapContainer 
        center={[20.5937, 78.9629]} // Center of India
        zoom={5} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%", background: "#0f172a" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        
        {/* User Marker */}
        {userPos && (
             <Marker position={userPos} icon={iconSafe}>
                <Popup>Your Location</Popup>
                <RecenterMap lat={userPos[0]} lng={userPos[1]} />
             </Marker>
        )}

        {/* Disaster Markers */}
        {reports.map((report) => (
          <Marker 
            key={report.id} 
            position={[report.location.lat, report.location.lng]}
            icon={iconPerson}
          >
            <Popup className="glass-popup">
              <div className="p-1 min-w-[200px]">
                <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-red-600 uppercase text-sm">{report.type}</span>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">{report.severity}</span>
                </div>
                <p className="text-sm text-slate-700 mb-2">{report.description}</p>
                <div className="text-xs text-slate-500 border-t pt-2 mt-2">
                    Reported by: {report.reporterName}<br/>
                    {new Date(report.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LiveMap;