// App.jsx — Updated with Start Point Marker and Supabase Sync
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "@fontsource/bebas-neue";
import { supabase } from "./supabaseClient";

// Start Point Icon
const startIcon = L.icon({
  iconUrl: "/icons/start-flag.svg",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export default function RallyLayout() {
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [poi, setPoi] = useState("");
  const [waypoints, setWaypoints] = useState([]);
  const [sections, setSections] = useState([]);
  const [sectionName, setSectionName] = useState("Section 1");
  const [activeCategory, setActiveCategory] = useState("Safety");
  const [startGPS, setStartGPS] = useState({ lat: -34.9285, lon: 138.6007 });
  const [currentGPS, setCurrentGPS] = useState(null);
  const [showMap, setShowMap] = useState(true);

  useEffect(() => {
    const geo = navigator.geolocation;
    if (!geo) return;

    const watchId = geo.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentGPS({ lat: latitude, lon: longitude });
      },
      (err) => console.warn("Live GPS error", err),
      { enableHighAccuracy: true }
    );

    return () => geo.clearWatch(watchId);
  }, []);

  const handleAddWaypoint = () => {
    if (!selectedIcon || !currentGPS) return;
    const { lat, lon } = currentGPS;
    const timestamp = new Date().toLocaleTimeString();
    const waypoint = {
      name: selectedIcon,
      iconSrc: `/icons/${selectedIcon.toLowerCase().replace(/\s+/g, "-")}.svg`,
      lat,
      lon,
      timestamp,
      poi,
    };
    setWaypoints([...waypoints, waypoint]);
    setPoi("");
  };

  const exportAsJSON = (data, name = "section") => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="px-4 py-2 border-b border-gray-300 bg-white font-heading text-xl font-bold flex justify-between items-center">
        Rally Route Mapper
        <button
          onClick={() => setShowMap((prev) => !prev)}
          className="text-sm px-3 py-1 bg-blue-600 text-white rounded"
        >
          {showMap ? "Hide Map" : "Show Map"}
        </button>
      </header>

      <div
        className={`flex flex-1 overflow-hidden ${
          showMap ? "flex-col-reverse lg:flex-row" : "flex-col"
        }`}
      >
        {showMap && (
          <div className="w-full lg:w-1/2 h-[50vh] lg:h-full min-h-[300px]">
            <MapContainer
              center={[startGPS.lat, startGPS.lon]}
              zoom={14}
              scrollWheelZoom
              className="h-full w-full"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <Marker position={[startGPS.lat, startGPS.lon]} icon={startIcon}>
                <Popup>
                  <strong>Start Point</strong>
                  <br />
                  GPS: {startGPS.lat.toFixed(5)}, {startGPS.lon.toFixed(5)}
                </Popup>
              </Marker>
              {waypoints.map((wp, idx) => (
                <Marker
                  key={idx}
                  position={[wp.lat, wp.lon]}
                  icon={L.icon({ iconUrl: wp.iconSrc, iconSize: [32, 32] })}
                >
                  <Popup>
                    <strong>{wp.name}</strong>
                    <br />
                    Time: {wp.timestamp}
                    <br />
                    GPS: {wp.lat}, {wp.lon}
                    <br />
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
                geo.getCurrentPosition(
                  (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setStartGPS({ lat: latitude, lon: longitude });
                    setCurrentGPS({ lat: latitude, lon: longitude });
                  },
                  (err) => console.error("Could not access GPS", err),
                  { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
              }}
            >
              📍 Set Start Point
            </button>
            <input
              className="w-full p-2 rounded bg-gray-100"
              placeholder="Route Name"
            />
            <input
              className="w-full p-2 rounded bg-gray-100 mt-2"
              placeholder="Description"
            />
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
            <h2 className="text-lg font-semibold">🧭 Current Waypoints</h2>
            {waypoints.map((wp, idx) => (
              <div key={idx} className="bg-gray-100 p-3 rounded mb-2">
                <div className="flex items-center gap-2">
                  <img src={wp.iconSrc} className="w-6 h-6" alt={wp.name} />
                  <p className="font-semibold">{wp.name}</p>
                </div>
                <p className="text-sm text-gray-600">Time: {wp.timestamp}</p>
                <p className="text-sm text-gray-600">
                  GPS: {wp.lat}, {wp.lon}
                </p>
                {wp.poi && (
                  <p className="text-sm text-gray-600">POI: {wp.poi}</p>
                )}
              </div>
            ))}
          </section>

          <footer className="p-4 border-t border-gray-300 flex gap-4 justify-center bg-gray-100">
            <button
              className="bg-gray-700 text-white px-4 py-2 rounded"
              onClick={() => exportAsJSON(waypoints, sectionName)}
            >
              Export JSON
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}
