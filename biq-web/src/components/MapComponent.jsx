import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap, GeoJSON, ZoomControl, useMapEvents, Marker  } from 'react-leaflet';
import L from 'leaflet';

// load heatmap and grid map
import DemandHeatmap from './DemandHeatmap';
import AreaGrid from './AreaGrid';

import Sidebar from './Sidebar';
import BillboardLayer from './BillboardLayer';
import WorkspaceModel from '../models/workspace';

import 'leaflet/dist/leaflet.css';
import '../styles/main.css';


L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  iconSize: [16, 24],  
  iconAnchor: [8, 24], 
  popupAnchor: [0, -24]
});

// for map's basic settings 
const ChangeView = ({ center }) => {
  const map = useMap();
  map.setView(center);
  return null;
}

// the main component for displaying and interacting with the leaflet map
function MapComponent({ onLogout }) {

    const lat = 33.45496890;
    const lng = -112.18829470;
    const zoom_level = 11

    const [center, setCenter] = useState([lat, lng]);
    const [billboardData, setBillboardData] = useState(null);
    const [resultBillboardLayers, setResultBillboardLayers] = useState([]);
    const [currentWorkspace, setCurrentWorkspace] = useState(null);

    useEffect(() => {
        loadWorkspaces();
        loadAvailableBillboards();
    }, []); 

    const loadWorkspaces = async () => {
      try {
        const user = JSON.parse(sessionStorage.getItem('userdata'));
        const response = await fetch('http://localhost:5000/workspace/' + user.userid);
        const data = await response.json();
        //set default workspace as the first wp
        const defaultWorkspace = new WorkspaceModel(data[0]);
        setCurrentWorkspace(defaultWorkspace);
      } catch (error) {
        console.error('Error loading Workspaces:', error);
      }
    }

    const loadAvailableBillboards = async () => {
      try {
        const response = await fetch('/data/billboard_pts.geojson');
        const geoJsonData = await response.json();
        console.log("geoJsonData");
        console.log(geoJsonData);
        setBillboardData(geoJsonData.features);
      } catch (error) {
        console.error('Error loading JSON:', error);
      }
    };
    

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
    };

    /** 
     * request server to send billboards selection
     * based on given parameters from BillboardSettings 
    */
    const selectBillboards = (params)=> {
      console.log(params);
      
      const apiUrl = 'http://localhost:5000/api/billboards';  // Replace with your Flask API URL if different
      const data = {
        username: 'yzhong',
        radius: 3000,
        max_bb_num: 25,
        bb_pricing_field: 'pricingEstPerMo',
        max_total_cost: 40000,
        demand_field: 'at_revco',
        method: 'solver.sp_gurobi',
      };

      fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(parsedData  => {
        //console.log(parsedData); 
        const billboards = JSON.parse(parsedData.billbards);
        console.log(billboards);
        setResultBillboardLayers((prevLayers) => [...prevLayers, billboards]);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
    };

    const MapEvents = () => {
      const map = useMapEvents({
        click: (event) => {
          const { lat, lng } = event.latlng;
          console.log(`You clicked the map at latitude: ${lat} and longitude: ${lng}`);
        },
        // You can handle other events here as well if needed
      });
    
      return null; 
    };

    const handleMapClick = (event) => {
      console.log('called');
      const { lat, lng } = event.latlng;
      console.log(`You clicked the map at latitude: ${lat} and longitude: ${lng}`);
    };

    return (
        <div style={{ height: "100vh", width: "100%" }}>
            <Sidebar onLogout={onLogout} onSelectBillboards={selectBillboards} />
            <MapContainer center={center} zoom={zoom_level} zoomControl={false} maxZoom={18} onClick={handleMapClick} style={{ height: "100%", width: "100%" }}>
                {/*<DemandHeatmap data={null} />*/}
                {/*<AreaGrid topLeft={null} bottomRight={null} cellSize={null} />*/}
                <MapEvents />
                <ZoomControl position='topright' />
                <ChangeView center={center} />
                {currentWorkspace && <TileLayer url={currentWorkspace.basemapUrl} attribution={currentWorkspace.basemapAttr} />}
                {billboardData && <BillboardLayer data={billboardData} />}
                {resultBillboardLayers.map((layer, layerIdx) => (
                  <BillboardLayer key={layerIdx} layer={layer} />
                ))}
          
            </MapContainer>
        </div>
    );
}

export default MapComponent;