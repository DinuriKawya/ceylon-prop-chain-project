import React from 'react';
import { Map, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import cityMapData from '../../data/city_map_data.json';
import './LocationMap.css';

const clusterColors = {
  "Expensive & Stable": "#5b6b9e",
  "Fast Growing": "#ff7a59",
  "Budget & Rising": "#2dd4bf"
};

const LocationMap = () => {
  const center = [6.93, 79.95];

  return (
    <div className="location-map-wrapper">
      <Map center={center} zoom={11} style={{ height: '500px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {cityMapData.map((city) => (
          <CircleMarker
            key={city.city}
            center={[city.lat, city.lng]}
            radius={8}
            color={clusterColors[city.cluster]}
            fillColor={clusterColors[city.cluster]}
            fillOpacity={0.7}
          >
            <Popup>
              <strong>{city.city}</strong><br />
              Cluster: {city.cluster}<br />
              Avg Price: Rs {city.avg_price_per_sqft.toLocaleString()}/sqft<br />
              Listings: {city.listing_count}
            </Popup>
          </CircleMarker>
        ))}
      </Map>
      <div className="map-legend">
        {Object.entries(clusterColors).map(([label, color]) => (
          <div key={label} className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: color }}></span>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocationMap;