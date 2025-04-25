// App.jsx — Updated with deleteSection functionality
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

    const geo = navigator.geolocation;
    if (!geo) return;

    const watchId = geo.watchPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        setCurrentGPS({ lat: latitude, lon: longitude });
        setStartGPS({ lat: latitude, lon: longitude });
      },
      err => console.warn('Live GPS error', err),
      { enableHighAccuracy: true }
    );

    return () => geo.clearWatch(watchId);
  }, []);

  const deleteSection = async (sectionId) => {
    const confirmed = window.confirm('Are you sure you want to delete this section and all its waypoints?');
    if (!confirmed) return;

    const { error: wpError } = await supabase.from('waypoints').delete().eq('section_id', sectionId);
    const { error: sectionError } = await supabase.from('sections').delete().eq('id', sectionId);

    if (wpError || sectionError) {
      console.error('❌ Error deleting section:', wpError || sectionError);
    } else {
      setSections(prev => prev.filter(s => s.id !== sectionId));
      alert('Section deleted successfully.');
    }
  };

  // ...rest of your component remains unchanged
}
