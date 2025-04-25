// App.jsx — Fixed version after Field Test #1 Feedback
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase } from './supabaseClient';

const iconCategories = {
  
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
    { name: 'Bumpy Broken', src: '/icons/bumpy_broken.svg' },
    { name: 'Tree', src: '/icons/tree_5.svg' },
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
  Controls: [
    { name: 'Stop for Restart', src: '/icons/stop_for_restart.svg' },
    { name: 'Arrive Selective Section', src: '/icons/arrive_selective_section_flag.svg' },
  ],
  Safety: [
    { name: 'Danger 1', src: '/icons/danger-1.svg' },
    { name: 'Danger 2', src: '/icons/danger-2.svg' },
    { name: 'Danger 3', src: '/icons/danger-3.svg' },
    { name: 'Stop', src: '/icons/stop.svg' },
    { name: 'Caution', src: '/icons/caution.svg' },
  ],
};

const allIcons = Object.values(iconCategories).flat();

function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = deg => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
}

export default function RallyLayout() {
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [poi, setPoi] = useState('');
  const [waypoints, setWaypoints] = useState([]);
  const [sections, setSections] = useState([]);
  const [sectionName, setSectionName] = useState('Section 1');
  const [activeCategory, setActiveCategory] = useState('Safety');
  const [startGPS, setStartGPS] = useState({ lat: -34.9285, lon: 138.6007 });
  const [currentGPS, setCurrentGPS] = useState(null);
  const [showMap, setShowMap] = useState(true);
  const [loadingSections, setLoadingSections] = useState(false);

  useEffect(() => {
    // Load saved sections and waypoints from Supabase
    const loadSections = async () => {
      setLoadingSections(true);
      const { data: sectionList, error: sectionError } = await supabase
        .from('sections')
        .select('id, name')
        .order('created_at', { ascending: true });

      if (sectionError) {
        console.error('❌ Failed to load sections:', sectionError);
        setLoadingSections(false);
        return;
      }

      const sectionsWithData = await Promise.all(
        sectionList.map(async (section) => {
          const { data: waypoints, error: wpError } = await supabase
            .from('waypoints')
            .select('*')
            .eq('section_id', section.id);

          if (wpError) {
            console.error(`⚠️ Failed to load waypoints for section ${section.name}`, wpError);
            return { ...section, data: [] };
          }

          return { ...section, data: waypoints };
        })
      );

      setSections(sectionsWithData);
      setLoadingSections(false);
    };

    loadSections();

    // Setup live GPS tracking
    const geo = navigator.geolocation;
    if (!geo) return;

    const watchId = geo.watchPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        setCurrentGPS({ lat: latitude, lon: longitude });
        setStartGPS({ lat: latitude, lon: longitude }); // optional if you want to reset start with GPS
      },
      err => console.warn('Live GPS error', err),
      { enableHighAccuracy: true }
    );

    // Cleanup watchPosition on unmount
    return () => geo.clearWatch(watchId);
  }, []);

  const handleAddWaypoint = () => {
    if (!selectedIcon || !currentGPS) return;
    const icon = allIcons.find(i => i.name === selectedIcon);
    const { lat, lon } = currentGPS;
    const distance = haversineDistance(startGPS.lat, startGPS.lon, lat, lon);
    const timestamp = new Date().toLocaleTimeString();
    const waypoint = {
      name: selectedIcon,
      iconSrc: icon?.src,
      lat: lat.toFixed(2),
      lon: lon.toFixed(2),
      timestamp,
      distance,
      poi
    };
    setWaypoints([...waypoints, waypoint]);
    setPoi('');
  };

  const handleNewSection = async () => {
    const { data: section, error: sectionError } = await supabase
      .from('sections')
      .insert([{ name: sectionName }])
      .select()
      .single();

    if (sectionError) {
      console.error('❌ Failed to create section:', sectionError);
      return;
    }

    const enrichedWaypoints = waypoints.map(wp => ({ ...wp, section_id: section.id }));

    const { error: wpError } = await supabase
      .from('waypoints')
      .insert(enrichedWaypoints);

    if (wpError) {
      console.error('❌ Failed to save waypoints:', wpError);
    } else {
      setSections([...sections, { name: sectionName, data: waypoints }]);
      setWaypoints([]);
      setSectionName(`Section ${sections.length + 2}`);
    }
  };

  const exportAsJSON = (data, name = 'section') => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsGPX = (data, name = 'section') => {
    const gpx = `<?xml version="1.0"?><gpx version="1.1" creator="Rally Mapper">
${data.map(wp => `<wpt lat="${wp.lat}" lon="${wp.lon}"><name>${wp.name}</name><desc>${wp.poi || ''}</desc></wpt>`).join('\n')}
</gpx>`;
    const blob = new Blob([gpx], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.gpx`;
    a.click();
    URL.revokeObjectURL(url);
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
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
              {waypoints.map((wp, idx) => (
                <Marker
                  key={idx}
                  position={[parseFloat(wp.lat), parseFloat(wp.lon)]}
                  icon={L.icon({ iconUrl: wp.iconSrc, iconSize: [32, 32] })}
                >
                  <Popup>
                    <strong>{wp.name}</strong><br />
                    Time: {wp.timestamp}<br />
                    GPS: {wp.lat}, {wp.lon}<br />
                    Dist: {wp.distance} km<br />
                    {wp.poi && <>POI: {wp.poi}</>}
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
                const geo = navigator.geolocation;
                if (!geo) return;

                const success = (pos) => {
                  const { latitude, longitude } = pos.coords;
                  setStartGPS({ lat: latitude, lon: longitude });
                  setCurrentGPS({ lat: latitude, lon: longitude });
                };

                const error = (err) => {
                  console.error("Could not access GPS", err);
                };

                geo.getCurrentPosition(success, error, {
                  enableHighAccuracy: true,
                  timeout: 10000,
                  maximumAge: 0,
                });
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
                <p className="text-sm text-gray-600">Distance: {wp.distance} km</p>
                {wp.poi && <p className="text-sm text-gray-600">POI: {wp.poi}</p>}
              </div>
            ))}
          </section>
        </div>
      </div>

      <footer className="p-4 border-t border-gray-300 flex gap-4 justify-center bg-gray-100">
        <button className="bg-gray-700 text-white px-4 py-2 rounded" onClick={() => exportAsJSON(waypoints, sectionName)}>
          Export JSON
        </button>
        <button className="bg-gray-700 text-white px-4 py-2 rounded" onClick={() => exportAsGPX(waypoints, sectionName)}>
          Export GPX
        </button>
      </footer>
    </div>
  );
}



