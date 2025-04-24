// App.jsx - Rally Route Mapper with Section Controls
import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const iconCategories = {
  Safety: [
    { name: 'Danger 1', src: '/icons/danger-1.svg' },
    { name: 'Danger 2', src: '/icons/danger-2.svg' },
    { name: 'Danger 3', src: '/icons/danger-3.svg' },
    { name: 'Stop', src: '/icons/stop.svg' },
    { name: 'Caution', src: '/icons/caution.svg' },
  ],
  'On Track': [
    { name: 'Bump', src: '/icons/bump.svg' },
    { name: 'Dip Hole', src: '/icons/dip-hole.svg' },
    { name: 'Ditch', src: '/icons/ditch.svg' },
    { name: 'Hole', src: '/icons/hole.svg' },
    { name: 'Summit', src: '/icons/summit.svg' },
    { name: 'Up hill', src: '/icons/uphill.svg' },
    { name: 'Down hill', src: '/icons/downhill.svg' },
    { name: 'Fence gate', src: '/icons/fence-gate.svg' },
    { name: 'Wading / water crossing', src: '/icons/wading.svg' },
  ],
  Symbols: [
    { name: 'Grid', src: '/icons/grid.svg' },
    { name: 'Fence', src: '/icons/fence.svg' },
    { name: 'Rail road', src: '/icons/railroad.svg' },
    { name: 'Twisty', src: '/icons/twisty.svg' },
    { name: 'Bumpy', src: '/icons/bumpy.svg' },
  ],
  Abbreviations: [
    { name: 'Left', src: '/icons/left.svg' },
    { name: 'Right', src: '/icons/right.svg' },
    { name: 'Left and Right', src: '/icons/left_and_right.svg' },
    { name: 'Keep to the left', src: '/icons/keep-left.svg' },
    { name: 'Keep to the right', src: '/icons/keep-right.svg' },
    { name: 'Keep straight', src: '/icons/keep-straight.svg' },
    { name: 'On Left', src: '/icons/on-left.svg' },
    { name: 'On Right', src: '/icons/on-right.svg' },
  ],
};

const allIcons = Object.values(iconCategories).flat();

function exportAsJSON(data, sectionName = 'rally-waypoints') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sectionName}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportAsGPX(data, sectionName = 'rally-waypoints') {
  const gpxHeader = `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="Rally Route Mapper" xmlns="http://www.topografix.com/GPX/1/1">\n`;
  const gpxFooter = `</gpx>`;
  const gpxBody = data.map(wp => `
    <wpt lat="${wp.lat}" lon="${wp.lon}">
      <name>${wp.name}</name>
      ${wp.poi ? `<desc>${wp.poi}</desc>` : ''}
    </wpt>`).join('');
  const gpxContent = `${gpxHeader}${gpxBody}\n${gpxFooter}`;

  const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sectionName}.gpx`;
  a.click();
  URL.revokeObjectURL(url);
}

function MapUpdater({ gps }) {
  const map = useMap();
  React.useEffect(() => {
    if (gps?.lat && gps?.lon) {
      map.setView([gps.lat, gps.lon], 14);
    }
  }, [gps, map]);
  return null;
}

export default function RallyLayout() {
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [poi, setPoi] = useState('');
  const [waypoints, setWaypoints] = useState([]);
  const [sections, setSections] = useState([]);
  const [sectionName, setSectionName] = useState('Section 1');
  const [activeCategory, setActiveCategory] = useState('Safety');
  const [startGPS, setStartGPS] = useState({ lat: -33.8688, lon: 151.2093 });
  const [showMap, setShowMap] = useState(true);

  const handleAddWaypoint = () => {
    if (!selectedIcon) return;
    const icon = allIcons.find(i => i.name === selectedIcon);
    const lat = startGPS.lat;
    const lon = startGPS.lon;
    const timestamp = new Date().toLocaleTimeString();
    const waypoint = { name: selectedIcon, iconSrc: icon?.src, lat, lon, timestamp, distance: '0.00', poi };
    setWaypoints([...waypoints, waypoint]);
    setPoi('');
  };

  const handleNewSection = () => {
    setSections([...sections, { name: sectionName, data: waypoints }]);
    setWaypoints([]);
    setSectionName(`Section ${sections.length + 2}`);
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="px-4 py-2 border-b border-gray-300 bg-white font-heading text-xl font-bold flex justify-between items-center">
        Rally Route Mapper
        <button
          onClick={() => setShowMap(prev => !prev)}
          className="text-sm px-3 py-1 bg-blue-600 text-white rounded"
        >
          {showMap ? 'Hide Map' : 'Show Map'}
        </button>
      </header>

      <div className={`flex flex-1 overflow-hidden ${showMap ? 'flex-col-reverse lg:flex-row' : 'flex-col'}`}>
        {showMap && (
          <div className="w-full lg:w-1/2 h-[50vh] lg:h-full min-h-[300px]">
            <MapContainer center={[startGPS.lat, startGPS.lon]} zoom={14} scrollWheelZoom className="h-full w-full">
              <MapUpdater gps={startGPS} />
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
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
                    {wp.poi && <span>POI: {wp.poi}</span>}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        <div className="w-full lg:w-1/2 h-full overflow-y-auto p-4 space-y-4 border-t lg:border-t-0 lg:border-l border-gray-300">
          <section>
            <h2 className="text-lg font-semibold">📝 Route Info</h2>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded mb-2"
              onClick={() => {
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setStartGPS({ lat: latitude, lon: longitude });
                    console.log("📍 GPS updated to:", latitude, longitude);
                  },
                  (err) => {
                    console.error("❌ Could not access GPS:", err.message);
                  },
                  { enableHighAccuracy: true }
                );
              }}
            >
              📍 Set Start Point
            </button>
            <input className="w-full p-2 rounded bg-gray-100" placeholder="Route Name" />
            <input className="w-full p-2 rounded bg-gray-100 mt-2" placeholder="Description" />
          </section>

          <section>
            <h2 className="text-lg font-semibold">📁 Section Controls</h2>
            <input
              className="w-full p-2 rounded bg-gray-100"
              value={sectionName}
              onChange={e => setSectionName(e.target.value)}
              placeholder="Section Name"
            />
            <button onClick={handleNewSection} className="bg-yellow-500 text-black px-4 py-2 rounded w-full mt-2">
              ➕ Start New Section
            </button>
            <div className="space-y-1 mt-2">
              {sections.map((section, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                  <span>{section.name}</span>
                  <div className="flex gap-2">
                    <button className="text-sm bg-gray-600 text-white px-2 py-1 rounded" onClick={() => exportAsJSON(section.data, section.name)}>
                      JSON
                    </button>
                    <button className="text-sm bg-gray-600 text-white px-2 py-1 rounded" onClick={() => exportAsGPX(section.data, section.name)}>
                      GPX
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold">📍 Select Waypoint Icon</h2>
            <div className="flex gap-2 flex-wrap mb-2">
              {Object.keys(iconCategories).map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3 py-1 rounded ${activeCategory === category ? 'bg-yellow-400 text-black' : 'bg-gray-300'}`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-8 gap-2">
              {iconCategories[activeCategory].map(icon => (
                <button
                  key={icon.name}
                  onClick={() => setSelectedIcon(icon.name)}
                  className={`p-2 rounded border-2 ${selectedIcon === icon.name ? 'border-yellow-400' : 'border-transparent'} bg-white`}
                >
                  <img src={icon.src} alt={icon.name} className="w-8 h-8 mx-auto" />
                  <p className="text-xs text-center mt-1">{icon.name}</p>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold">🗒️ Waypoint</h2>
            <textarea
              placeholder="Point of Interest"
              value={poi}
              onChange={(e) => setPoi(e.target.value)}
              className="w-full p-2 rounded bg-gray-100"
            />
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full mt-2"
              onClick={handleAddWaypoint}
              disabled={!selectedIcon}
            >
              Add Waypoint
            </button>
          </section>

          <section>
            <h2 className="text-lg font-semibold">🧭 Current Section Waypoints</h2>
            {waypoints.map((wp, idx) => (
              <div key={idx} className="bg-gray-100 p-3 rounded mb-2">
                <div className="flex items-center gap-2">
                  <img src={wp.iconSrc} className="w-6 h-6" alt={wp.name} />
                  <p className="font-semibold">{wp.name}</p>
                </div>
                <p className="text-sm text-gray-600">Time: {wp.timestamp}</p>
                <p className="text-sm text-gray-600">GPS: {wp.lat}, {wp.lon}</p>
                {wp.poi && <p className="text-sm text-gray-600">POI: {wp.poi}</p>}
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}

