import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  useMap,
  ZoomControl,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import appConfig from "../config.json";

//load heatmap and grid map
//import DemandHeatmap from "./DemandHeatmap";
//import AreaGrid from "./AreaGrid";

import Sidebar from "./Sidebar";
import BillboardLayer from "./BillboardLayer";
import BillboardResultLayer from "./BillboardResultLayer";
import WorkspaceModel from "../models/workspace";

import BillboardPixiLayer from "./BillboardPixiLayer";

import BillboardPixiResultLayer from "./BillboardPixiResultLayer";


import "leaflet/dist/leaflet.css";
import "../styles/main.css";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  iconSize: [16, 24],
  iconAnchor: [8, 24],
  popupAnchor: [0, -24],
});

// for map's basic settings
const ChangeView = ({ center }) => {
  const map = useMap();
  map.setView(center);
  return null;
};

// the main component for displaying and interacting with the leaflet map
function MapComponent({ onLogout }) {
  
  const mapRef = useRef(null);
  const [mapCenter, setMapCenter] = useState({ lat: appConfig.DEF_CENTER[0], lng: appConfig.DEF_CENTER[1] });
  const [billboardData, setBillboardData] = useState(null); // billboard candidate
  const [resultBillboardLayers, setResultBillboardLayers] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [isCandidateBBShow, setIsCandidateBBShow] = useState(false);
  const [isCandidatesPixiBBShow, setIsCandidatesPixiBBShow] = useState(false);
  const [isBillboardVisible, setBillboardVisible] = useState(false);

  const [isResultLayerVisible, setIsResultLayerVisible] = useState(false);

  /**
   * load workspace items
   */
  const loadWorkspaces = async () => {
    try {
      const user = JSON.parse(sessionStorage.getItem("userdata"));
      const response = await fetch(
        appConfig.SERVER_URL + "workspace/" + user.userid,
      );
      const workspaceItems = await response.json();
      // -- validate the workspace items here --

      const defaultWorkspace = new WorkspaceModel(workspaceItems[0]);
      setMapComponent(defaultWorkspace);

    } catch (error) {
      console.error("Error loading Workspaces:", error);
    }
  };

  /**
   * use current workspace to set map component
   */
  const setMapComponent = (wkspace) => {
    const wspId = wkspace.id;
    if (currentWorkspace && currentWorkspace.id === wspId ) return;

    setCurrentWorkspace(wkspace);
    const mapInstance = mapRef.current;
    //console.log(mapInstance);
    console.log(wkspace.displayName + " has been loaded.");
    // set bounds
    const boundsData = wkspace.mapBounds;
    const southWest = new L.LatLng(boundsData.southWest[0], boundsData.southWest[1]);
    const northEast = new L.LatLng(boundsData.northEast[0], boundsData.northEast[1]);
    const newBounds = new L.LatLngBounds(southWest, northEast);
    mapInstance.setMaxBounds(newBounds);
    // set min/max zoom/init zoom
    mapInstance.setMaxZoom(wkspace.maxZoom);
    mapInstance.setMinZoom(wkspace.minZoom);
    mapInstance.setZoom(wkspace.initZoom);

  };

  /**
   * load available billboard locations (right now they are generated into a pixi layer)
   */
  const loadAvailableBillboards = async () => {
    try {
      const response = await fetch("/data/billboard_pts.geojson");
      const geoJsonData = await response.json();
      setBillboardData(geoJsonData.features);
    } catch (error) {
      console.error("Error loading JSON:", error);
    }
  };

  /**
   * request server to send billboards selection
   * based on given parameters from BillboardSettings
   */
  const getOptimalBillboards = async (params) => {
    console.log(params);

    const apiUrl = appConfig.SERVER_URL + "api/billboards"; // Replace with your Flask API URL if different
    const data = {
      username: "yzhong",
      radius: 3000,
      max_bb_num: 25,
      bb_pricing_field: "pricingEstPerMo",
      max_total_cost: 40000,
      demand_field: "at_revco",
      method: "solver.sp_gurobi",
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const parsedData = await response.json();
    const billboards = JSON.parse(parsedData.billbards);

    //attach a radius attribute
    const billboardItems = billboards.map(item => ({
      ...item,
      radius: data.radius
    }));
    
    console.log("Optimal billboards retreived below:");
    console.log(billboardItems);

    setResultBillboardLayers((prevLayers) => [...prevLayers, billboardItems]);
    
  };

  const MapEvents = () => {
    const map = useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        console.log(
          `You clicked the map at latitude: ${lat} and longitude: ${lng}`,
        );
      },
      move: (e) => {
        //const newCenter = e.target.getCenter();
        //console.log(newCenter);
      }
    });

    return null;
  };

  const onToggleBillboards = () => {
    setBillboardVisible(prevState => !prevState);
  };

  const onBillboardMarkerClick = (content) => {
    const popupDiv = document.getElementById('popup-content');
    const overlayDiv = document.querySelector('.map-overlay');
    popupDiv.innerHTML = content;
    overlayDiv.style.display = 'block'; // Show the overlay (and thus the popup)
}

  const closeFixedPopup = () => {
    const overlayDiv = document.querySelector('.map-overlay');
    overlayDiv.style.display = 'none'; // Hide the overlay (and the popup)
  }

  const Debug_GET_15_Data = () => {
    let bb_sample_indexes = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 120, 131, 142, 153];
    if (billboardData && billboardData.length >=15 ){
      return bb_sample_indexes.map(index => billboardData[index]);
    } else {
      return [];
    }
  }

  const Debug_togglePixiResultLayer = () => {
    setIsResultLayerVisible(prevState => !prevState);
  };

  useEffect(() => {
    loadWorkspaces();
  }, []);

  useEffect(() => {
    loadAvailableBillboards();
  }, []);

  return (
    <div className="biq-map-container">
      <Sidebar onLogout={onLogout} onSelectBillboards={getOptimalBillboards} onToggleBillboards={onToggleBillboards} onDebugToggle={Debug_togglePixiResultLayer}/>
      <MapContainer className="biq-map" ref={mapRef} center={mapCenter} zoom={appConfig.DEF_ZOOM} 
                    maxZoom={appConfig.DEF_MAX_ZOOM} minZoom={appConfig.DEF_MIN_ZOOM} zoomControl={false} >
        <MapEvents />
        <ZoomControl position="topright" />
        {currentWorkspace && ( <TileLayer url={currentWorkspace.basemapUrl} attribution={currentWorkspace.basemapAttr} />)}
        {resultBillboardLayers.map((layer, layerIdx) => (<BillboardResultLayer key={`l-${layerIdx}`} data={layer} />))}
        <BillboardPixiLayer data={billboardData} isVisible={isBillboardVisible} onMarkerClick={onBillboardMarkerClick}/>

        <BillboardPixiResultLayer data={Debug_GET_15_Data()} isVisible={isResultLayerVisible} />

      </MapContainer>

      <div className="map-overlay">
        <div id="fixed-popup" className="fixed-popup">
            <div id="popup-content"></div>
            <button onClick={closeFixedPopup}>Close</button>
        </div>
    </div>

    </div>
  );
}

export default MapComponent;

/** {resultBillboardLayer.map((layer, layerIdx) => (<BillboardResultLayer key={`l-${layerIdx}`} data={layer} />))} */
/** {resultBillboardLayer && (
          <BillboardResultLayer data={resultBillboardLayer} />
        )} */

/**
 * {isCandidateBBShow && billboardData && (
            <BillboardLayer layerName={"l-candidate"} data={billboardData} />
        )}
 * 
 */
/**
* <ChangeView center={mapCenter} />
*/

///*<DemandHeatmap data={null} />*/}
//{/*<AreaGrid topLeft={null} bottomRight={null} cellSize={null} />*/}

        