import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap, GeoJSON, ZoomControl } from 'react-leaflet';
import Sidebar from './Sidebar';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/main.css';

// for map's basic settings 
const ChangeView = ({ center }) => {
  const map = useMap();
  map.setView(center);
  return null;
}

// the main component for displaying and interacting with the leaflet map
function MapComponent({ onLogout }) {

    const lat = 33.486402;
    const lng = -112.099639;
    //const basemap_url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
    //const basemap_attr = "Tiles &copy; Esri &mdash; Esri"
    const zoom_level = 11

    /*
    const basemap_url = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    const basemap_attr = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributor'
    */

    // OpenStreetMap.HOT
    //const basemap_url = "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
    //const basemap_attr = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'

    // CartoDB.Positron
    const basemap_url = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
    const basemap_attr = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'

    const [center, setCenter] = useState([lat, lng]);
    const [billboardData, setBillboardData] = useState(null);

    useEffect(() => {
        const loadBillboardJsonData = async () => {
          try {
            const response = await fetch('/data/billboard_pts.geojson');
            const data = await response.json();
            setBillboardData(data);
            //setBillboardData(JSON.stringify(data, null, 2)); // Convert the JSON data to a formatted string
          } catch (error) {
            console.error('Error loading JSON:', error);
          }
        };
    
        loadBillboardJsonData();
      }, []); 

    const pointToLayer = (feature, latlng) => {
        return L.circleMarker(latlng, {
            radius: 2,
            fillColor: "#ff7800",
            color: "#ff7800",
            weight: 1,
            opacity: 1,
            fillOpacity: 1,
        });
    };

    const recenterMap = (newCenter) => {
        setCenter(newCenter);
    }

    return (
        <div style={{ height: "100vh", width: "100%" }}>
            <Sidebar onLogout={onLogout} />
            <MapContainer center={center} zoom={zoom_level} zoomControl={false} style={{ height: "100%", width: "100%" }}>
                <ZoomControl position='topright' />
                <ChangeView center={center} />
                <TileLayer
                    url={basemap_url}
                    attribution={basemap_attr}
                />
                {billboardData && <GeoJSON data={billboardData} pointToLayer={pointToLayer} />}
            </MapContainer>
        </div>
    );
}

export default MapComponent;