'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const pinIcon = L.divIcon({
  html: '<div style="font-size:32px;line-height:1;transform:translate(-50%,-100%)">📍</div>',
  className: '',
  iconSize: [0, 0],
});

const DEFAULT_CENTER: [number, number] = [24.8607, 67.0011]; // Karachi

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationMapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onSelect: (lat: number, lng: number) => void;
}

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function RecenterOnChange({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom() < 14 ? 15 : map.getZoom());
  }, [position, map]);
  return null;
}

export default function LocationMapPicker({ initialLat, initialLng, onSelect }: LocationMapPickerProps) {
  const [position, setPosition] = useState<[number, number]>(
    initialLat != null && initialLng != null ? [initialLat, initialLng] : DEFAULT_CENTER,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePlace = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onSelect(lat, lng);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (value.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(value)}`,
        );
        const data = (await res.json()) as NominatimResult[];
        setSearchResults(data);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const handleSelectResult = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    handlePlace(lat, lng);
    setSearchQuery(result.display_name);
    setSearchResults([]);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search for an address or place..."
          className="input-field"
        />
        {isSearching && <p className="mt-1 text-xs text-text-light">Searching...</p>}
        {searchResults.length > 0 && (
          <div className="absolute z-[1000] mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-soft-lg">
            {searchResults.map((result, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectResult(result)}
                className="block w-full truncate px-3 py-2 text-left text-sm text-secondary hover:bg-gray-50"
              >
                {result.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        <MapContainer center={position} zoom={13} style={{ height: '300px', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onClick={handlePlace} />
          <RecenterOnChange position={position} />
          <Marker position={position} icon={pinIcon} />
        </MapContainer>
      </div>
      <p className="text-xs text-text-light">Search above or click anywhere on the map to drop the pin.</p>
    </div>
  );
}
