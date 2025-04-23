import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const iconCategories = {
  Safety: [
    { name: 'Danger 1', src: '/icons/danger-1.svg' },
    { name: 'Danger 2', src: '/icons/danger-2.svg' },
    { name: 'Danger 3', src: '/icons/danger-3.svg' },
    { name: 'Stop', src: '/icons/stop.svg' },
  ],
  'On Track': [
    { name: 'Bump', src: '/icons/bump.svg' },
    { name: 'Dip Hole', src: '/icons/dip-hole.svg' },
    { name: 'Ditch', src: '/icons/ditch.svg' },
    { name: 'Summit', src: '/icons/summit.svg' },
    { name: 'Up hill', src: '/icons/uphill.svg' },
    { name: 'Down hill', src: '/icons/downhill.svg' },
    { name: 'Fence gate', src: '/icons/fence-gate.svg' },
    { name: 'Fence gate w/ grid', src: '/icons/fence-gate-grid.svg' },
    { name: 'Wading', src: '/icons/wading.svg' },
  ],
  Symbols: [
    { name: 'Fence', src: '/icons/fence.svg' },
    { name: 'Railroad', src: '/icons/railroad.svg' },
    { name: 'Twisty', src: '/icons/twisty.svg' },
    { name: 'Bumpy', src: '/icons/bumpy.svg' },
  ],
  Abbreviations: [
    { name: 'On Left', src: '/icons/on-left.svg' },
    { name: 'On Right', src: '/icons/on-right.svg' },
    { name: 'Keep Left', src: '/icons/keep-left.svg' },
    { name: 'Keep Right', src: '/icons/keep-right.svg' },
    { name: 'Keep Straight', src: '/icons/keep-straight.svg' },
  ],
};

const allIcons = Object.values(iconCategories).flat();

function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function RallyLayout() {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [poi, setPoi] = useState('');
  const [waypoints, setWaypoints] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Safety');
  const [startTime, setStartTime] = useState(null);
  const [startGPS, setStartGPS] = useState(null);

  const handleAddWaypoint = () => {
    if (!selectedIcon || !startGPS) return;
    if (!startTime) setStartTime(new Date());
    const icon = allIcons.find(i => i.name === selectedIcon);
    const lat = startGPS.lat;
    const lon = startGPS.lon;
    const distance = calculateDistance(startGPS.lat, startGPS.lon, lat, lon).toFixed(2);
    const waypoint = {
      name: selectedIcon,
      iconSrc: icon?.src,
      lat,
      lon,
      poi,
      timestamp: new Date().toLocaleTimeString(),
      distance,
    };
    setWaypoints([...waypoints, waypoint]);
    setPoi('');
  };

  return (
    <div className={`flex flex-col h-screen font-heading ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-300 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <img src="/logo-ooo.png" alt="Oz Outback Odyssey" className="h-10 w-auto" />
          <h1 className="text-3xl font-heading">Rally Route Mapper</h1>
        </div>
        <button onClick={() => setDarkMode(!darkMode)} className="text-lg">
          {darkMode ? '🌞' : '🌙'}
        </button>
      </header>

      {/* Always-visible GPS trigger button */}
      <div className="p-4">
        <button
          onClick={() => {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                console.log('📍 GPS Triggered', pos.coords);
                setStartGPS({ lat: pos.coords.latitude, lon: pos.coords.longitude });
              },
              (err) => {
                console.error('⚠️ GPS Error', err);
                alert('Could not access location. Please check Safari permissions.');
              },
              { enableHighAccuracy: true }
            );
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          📍 Set Start Point
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 h-64 lg:h-full sticky top-0 z-10">
          {startGPS && (
            <MapContainer
                center={
                    startGPS
                        ? [startGPS.lat, startGPS.lon]
                        : [-33.8688, 151.2093] // fallback: Sydney
          }
          zoom={14}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              {waypoints.map((wp, idx) => (
                <Marker
                  key={idx}
                  position={[wp.lat, wp.lon]}
                  icon={L.icon({ iconUrl: wp.iconSrc, iconSize: [32, 32] })}
                >
                  <Popup>
                    <strong>{wp.name}</strong><br />
                    <span>Time: {wp.timestamp}</span><br />
                    <span>GPS: {wp.lat}, {wp.lon}</span><br />
                    <span>Dist: {wp.distance} km</span><br />
                    {wp.poi && <span>POI: {wp.poi}</span>}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>

        <div className="w-full lg:w-1/2 h-full overflow-y-auto p-4 space-y-6 border-t lg:border-t-0 lg:border-l border-gray-300 dark:border-gray-700">
          {/* Place for inputs, form, and export logic */}
          <p className="text-sm">(Form and export features go here)</p>
        </div>
      </div>
    </div>
  );
}

