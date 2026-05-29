import React from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon asset paths in Vite
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface DistrictRisk {
  district_name: string;
  composite_score: number;
  risk_level: string;
  drought_score: number;
  flood_probability: number;
  latitude: number;
  longitude: number;
}

interface MapViewerProps {
  selectedDistrict: string;
  onSelectDistrict: (name: string) => void;
  districtsRisk: DistrictRisk[];
  geojsonData: any;
}

const MapViewer: React.FC<MapViewerProps> = ({
  selectedDistrict,
  onSelectDistrict,
  districtsRisk,
  geojsonData,
}) => {
  
  // Custom HSL hazard color scales
  const getRiskColor = (score: number) => {
    if (score >= 75) return '#ef4444'; // brand red (critical)
    if (score >= 55) return '#f59e0b'; // brand amber (high)
    if (score >= 30) return '#3b82f6'; // brand blue (medium)
    return '#10b981'; // brand green (low)
  };

  const styleFeature = (feature: any) => {
    const dName = feature.properties?.name || feature.id;
    const match = districtsRisk.find((d) => d.district_name === dName);
    const score = match ? match.composite_score : 20;

    return {
      fillColor: getRiskColor(score),
      weight: dName === selectedDistrict ? 3.5 : 1.5,
      opacity: 1,
      color: dName === selectedDistrict ? '#3b82f6' : 'rgba(255, 255, 255, 0.2)',
      fillOpacity: dName === selectedDistrict ? 0.8 : 0.55,
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    const dName = feature.properties?.name || feature.id;
    const match = districtsRisk.find((d) => d.district_name === dName);
    const score = match ? match.composite_score : 20;

    layer.bindTooltip(
      `<div style="font-family: 'Inter', sans-serif; font-size: 11px;">
        <strong>${dName}</strong><br/>
        Composite Risk: ${score.toFixed(1)} / 100
       </div>`,
      { sticky: true }
    );

    layer.on({
      click: () => {
        onSelectDistrict(dName);
      },
      mouseover: (e: any) => {
        const l = e.target;
        l.setStyle({
          fillOpacity: 0.85,
          color: '#ffffff',
          weight: 2.5,
        });
      },
      mouseout: (e: any) => {
        const l = e.target;
        l.setStyle(styleFeature(feature));
      },
    });
  };

  return (
    <div className="h-[480px] w-full rounded-2xl overflow-hidden border border-white/5 shadow-2xl relative z-10">
      <MapContainer
        center={[20.7, 78.6]}
        zoom={7}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {geojsonData && (
          <GeoJSON
            key={JSON.stringify(districtsRisk) + selectedDistrict} // Force re-render on active district change
            data={geojsonData}
            style={styleFeature}
            onEachFeature={onEachFeature}
          />
        )}

        {/* Dynamic coordinate marker tags with Popups */}
        {districtsRisk.map((dist) => (
          <Marker 
            key={dist.district_name} 
            position={[dist.latitude, dist.longitude]}
          >
            <Popup>
              <div className="text-slate-900 font-sans p-1">
                <h4 className="font-bold text-sm border-b pb-1 mb-1">{dist.district_name}</h4>
                <p className="text-xs m-0">Composite Score: <strong>{dist.composite_score.toFixed(1)}</strong></p>
                <p className="text-xs m-0">Drought Index: {dist.drought_score.toFixed(1)}</p>
                <p className="text-xs m-0">Flood Prob: {(dist.flood_probability * 100).toFixed(1)}%</p>
                <button
                  onClick={() => onSelectDistrict(dist.district_name)}
                  className="mt-2 text-[10px] w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-1 rounded"
                >
                  Inspect District
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapViewer;
