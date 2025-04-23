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

function exportAsJSON(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'rally-waypoints.json';
  a.click();
  URL.revokeObjectURL(url);
}

function exportAsGPX(data) {
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
  a.download = 'rally-waypoints.gpx';
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
      {/* ... (header and layout unchanged) */}
      <div className="flex gap-2">
        <button className="bg-gray-700 text-white px-4 py-2 rounded" onClick={() => exportAsJSON(waypoints)}>
          Export JSON
        </button>
        <button className="bg-gray-700 text-white px-4 py-2 rounded" onClick={() => exportAsGPX(waypoints)}>
          Export GPX
        </button>
      </div>
    </div>
  );
}
