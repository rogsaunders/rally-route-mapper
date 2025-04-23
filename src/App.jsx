import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const iconCategories = {
  Safety: [
    { name: 'Danger 1', src: '/icons/danger-1.svg' },
    { name: 'Danger 2', src: '/icons/danger-2.svg' },
    { name: 'Danger 3', src: '/icons/danger-3.svg' },
    { name: 'Stop', src: '/icons/stop.svg' },
    { name: 'Important', src: '/icons/important.svg' },
  ],
  'On Track': [
    { name: 'Bump', src: '/icons/bump.svg' },
    { name: 'Dip Hole', src: '/icons/dip-hole.svg' },
    { name: 'Ditch', src: '/icons/ditch.svg' },
    { name: 'Summit', src: '/icons/summit.svg' },
    { name: 'Up hill', src: '/icons/uphill.svg' },
    { name: 'Down hill', src: '/icons/downhill.svg' },
    { name: 'Fence gate', src: '/icons/fence-gate.svg' },
    { name: 'Fence gate with cattle grid', src: '/icons/fence-gate-grid.svg' },
    { name: 'Wading / water crossing', src: '/icons/wading.svg' },
  ],
  Symbols: [
    { name: 'Fence', src: '/icons/fence.svg' },
    { name: 'Rail road', src: '/icons/railroad.svg' },
    { name: 'Twisty', src: '/icons/twisty.svg' },
    { name: 'Bumpy', src: '/icons/bumpy.svg' },
  ],
  Abbreviations: [
    { name: 'On left', src: '/icons/on-left.svg' },
    { name: 'On right', src: '/icons/on-right.svg' },
    { name: 'Keep to the left', src: '/icons/keep-left.svg' },
    { name: 'Keep to the right', src: '/icons/keep-right.svg' },
    { name: 'Keep straight', src: '/icons/keep-straight.svg' },
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
  const [startGPS, setStartGPS] = useState({ lat: -33.8688, lon: 151.2093 });

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

      <div className="p-4">
        <button
          onClick={() => {
            console.log("📍 GPS Button Clicked");
            if (!navigator.geolocation) {
              console.error("Geolocation not supported");
              alert("This browser doesn't support GPS");
              return;
            }
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                console.log("✅ GPS Success:", pos.coords);
                setStartGPS({ lat: pos.coords.latitude, lon: pos.coords.longitude });
              },
              (err) => {
                console.error("❌ GPS Error:", err);
                alert("Could not access GPS — using fallback.");
              },
              { enableHighAccuracy: true, timeout: 10000 }
            );
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          📍 Set Start Point
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 h-64 lg:h-full sticky top-0 z-10">
          <MapContainer
            center={[startGPS.lat, startGPS.lon]}
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
        </div>

        <div className="w-full lg:w-1/2 h-full overflow-y-auto p-4 space-y-6 border-t lg:border-t-0 lg:border-l border-gray-300 dark:border-gray-700">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">📝 Route Info</h2>
            <input className="w-full max-w-md p-2 rounded bg-gray-100 dark:bg-gray-800" placeholder="Route Name" />
            <input className="w-full p-2 rounded bg-gray-100 dark:bg-gray-800" placeholder="Description" />
            <input className="w-full p-2 rounded bg-gray-100 dark:bg-gray-800" placeholder="Start Location" />
            <input className="w-full p-2 rounded bg-gray-100 dark:bg-gray-800" placeholder="Finish Location" />
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">📍 Select Waypoint Icon</h2>
            <div className="flex gap-2 flex-wrap">
              {Object.keys(iconCategories).map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3 py-1 rounded ${activeCategory === category ? 'bg-yellow-400 text-black' : 'bg-gray-300 dark:bg-gray-700'}`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-3">
              {iconCategories[activeCategory].map(icon => (
                <button
                  key={icon.name}
                  onClick={() => setSelectedIcon(icon.name)}
                  className={`p-2 rounded border-2 ${selectedIcon === icon.name ? 'border-yellow-400' : 'border-transparent'} bg-white dark:bg-gray-700`}
                >
                  <img src={icon.src} alt={icon.name} className="w-8 h-8 mx-auto" />
                  <p className="text-xs text-center mt-1">{icon.name}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">🗒️ Waypoint</h2>
            <textarea
              placeholder="Point of Interest"
              value={poi}
              onChange={(e) => setPoi(e.target.value)}
              className="w-full p-2 rounded bg-gray-100 dark:bg-gray-800"
            />
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full"
              onClick={handleAddWaypoint}
              disabled={!selectedIcon}
            >
              Add Waypoint
            </button>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">🧭 Waypoints</h2>
            {waypoints.map((wp, idx) => (
              <div key={idx} className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                <div className="flex items-center gap-2">
                  <img src={wp.iconSrc} className="w-6 h-6" alt={wp.name} />
                  <p className="font-semibold">{wp.name}</p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Time: {wp.timestamp}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">GPS: {wp.lat}, {wp.lon}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Distance: {wp.distance} km</p>
                {wp.poi && <p className="text-sm text-gray-600 dark:text-gray-300">POI: {wp.poi}</p>}
              </div>
            ))}
          </section>

          <section className="flex gap-2">
            <button className="bg-gray-700 text-white px-4 py-2 rounded">Export JSON</button>
            <button className="bg-gray-700 text-white px-4 py-2 rounded">Export GPX</button>
          </section>
        </div>
      </div>
    </div>
  );
}

