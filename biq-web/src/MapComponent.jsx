import React, { useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Sidebar from './Sidebar';

const ChangeView = ({ center }) => {
  const map = useMap();
  map.setView(center);
  return null;
}

const MapComponent = () => {
    const [center, setCenter] = useState([51.505, -0.09]);

    const recenterMap = (newCenter) => {
        setCenter(newCenter);
    }

    return (
        <div style={{ height: "100vh", width: "100%" }}>
            <Sidebar recenterMap={recenterMap} />
            <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
                <ChangeView center={center} />
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />
            </MapContainer>
        </div>
    );
}

export default MapComponent;