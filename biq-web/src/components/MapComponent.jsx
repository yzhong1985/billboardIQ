import React, { useEffect, useState, useRef, Fragment } from "react";
import { MapContainer, TileLayer, useMap, ZoomControl, useMapEvents } from "react-leaflet";
import L from "leaflet";
import appConfig from "../config.json";

//load heatmap and grid map
//import DemandHeatmap from "./DemandHeatmap";
//import AreaGrid from "./AreaGrid";
//import BillboardResultLayer from "../archives/BillboardResultLayer";

import Sidebar from "./Sidebar";
import BillboardLayer from "./BillboardLayer";
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
  
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [isCandidateBBShow, setIsCandidateBBShow] = useState(false);
  const [isCandidatesPixiBBShow, setIsCandidatesPixiBBShow] = useState(false);
  const [isBillboardVisible, setBillboardVisible] = useState(false);


  const [resultBillboardLayers, setResultBillboardLayers] = useState([]); // Optimal billboards result 

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
  const calBillboardLocations = async (params) => {
    console.log(params);

    const apiUrl = appConfig.SERVER_URL + "api/billboards"; // Replace with your Flask API URL if different
    const data = {
      username: "yzhong",
      radius: params.influentR,
      max_bb_num: params.nBillboards,
      bb_pricing_field: "pricingEstPerMo",
      max_total_cost: params.moBudget,
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

  useEffect(() => {
    loadWorkspaces();
  }, []);

  useEffect(() => {
    loadAvailableBillboards();
  }, []);

  return (
    <div className="biq-map-container">
      <Sidebar 
        onLogout={onLogout} 
        onCalBillboardLocations={calBillboardLocations} 
        onToggleBillboards={onToggleBillboards} 
        />

      <MapContainer className="biq-map" ref={mapRef} center={mapCenter} zoom={appConfig.DEF_ZOOM} 
                    maxZoom={appConfig.DEF_MAX_ZOOM} minZoom={appConfig.DEF_MIN_ZOOM} zoomControl={false} >
        <MapEvents />
        <ZoomControl position="topright" />
        
        {currentWorkspace && ( <TileLayer url={currentWorkspace.basemapUrl} attribution={currentWorkspace.basemapAttr} />)}
        
        <BillboardPixiLayer data={billboardData} isVisible={isBillboardVisible} />

        {resultBillboardLayers && resultBillboardLayers.map((layerData, index) => (
        <Fragment key={`bb-result-${index}`}>
          { <BillboardPixiResultLayer data={layerData} isVisible={true}/> }
        </Fragment>
        ))}

      </MapContainer>

    </div>
  );
}

export default MapComponent;

/** {resultBillboardLayer.map((layer, layerIdx) => (<BillboardResultLayer key={`l-${layerIdx}`} data={layer} />))} */
/** {resultBillboardLayer && (<BillboardResultLayer data={resultBillboardLayer} />)} */

/**
 *{isCandidateBBShow && billboardData && (<BillboardLayer layerName={"l-candidate"} data={billboardData} />)}
 */

/**
* <ChangeView center={mapCenter} />
*/

//*<DemandHeatmap data={null} />*/}
//{/*<AreaGrid topLeft={null} bottomRight={null} cellSize={null} />*/}

//{resultBillboardLayers.map((layer, layerIdx) => (<BillboardResultLayer key={`l-${layerIdx}`} data={layer} />))}

        