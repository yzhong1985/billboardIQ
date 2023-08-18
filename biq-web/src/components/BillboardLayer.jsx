import React, { useState, useEffect, useRef, Fragment  } from 'react';
import { LayerGroup, CircleMarker, Popup, Marker, Circle  } from 'react-leaflet';
import Cluster from 'react-leaflet-cluster'
import L from 'leaflet';
import BillboardInfoBox from './BillboardInfoBox';

/**
 * this component is to represent a layer of billboards, 
 * can display points, polygon, marker, symbol to represent billboard based on setting
 */
function BillboardLayer({layerName, data}) {

    const [billboards, setBillboards] = useState([]);
    const [selectBillboardIndex, setSelectedBillboardIndex] = useState(null);

    const [popupPosition, setPopupPosition] = useState(null);

    const bbPointConfig = {
        radius: 1000, //1000 meters
        fillColor: "#313866", 
        fillOpacity: 0.5, 
        stroke: false
    };

    const clusterConfig = {
        chunkedLoading: true,
        maxClusterRadius: 500,
        zoomToBoundsOnClick: false,
        showCoverageOnHover: false,
        spiderfyOnMaxZoom: false,
        animate:false,
        disableClusteringAtZoom: 15
    };

    const renderClusterIcon = (cluster) => {
        const count = cluster.getChildCount();
        const size = count < 10 ? 'small' : count < 100 ? 'medium' : 'large';
        const halfCount = Math.round(count / 2);
        
        return L.divIcon({
          html: `<div><span>${halfCount}</span></div>`,
          className: `marker-cluster marker-cluster-${size}`,
          iconSize: L.point(40, 40)
        });
    }

    const markerIconConfig = new L.Icon({
        iconUrl: require('../styles/marker.svg').default,
        iconSize: [16, 24],
        iconAnchor: [8, 24], 
        popupAnchor: [0, -24]
    });

    const onMarkerClick = (e, index) => {
        setSelectedBillboardIndex(index);
        setPopupPosition(e.latlng); 
    };

    const renderBillboardInfo = (billboardObj) => {
        console.log("below bb is selected:");
        console.log(billboardObj);
        return <div>YES</div>
    };

    useEffect(() => {
        setBillboards(data);
    }, [data]);

    return (
        <LayerGroup>
        <Cluster {...clusterConfig} iconCreateFunction={renderClusterIcon}>
        {billboards && billboards.map((bb, index) => (
            <Fragment key={`frag-${index}`}>
              <Marker key={`m-${index}`}
                position={[bb.geometry.coordinates[1], bb.geometry.coordinates[0]]} 
                icon={markerIconConfig} 
                eventHandlers={{ click: (e) => onMarkerClick(e, index) }}>
              </Marker>
              { (selectBillboardIndex === index) ? <Circle key={`r-${index}`} center={[bb.geometry.coordinates[1], bb.geometry.coordinates[0]]} {...bbPointConfig} ></Circle> : null}
            </Fragment>
        ))}
        {popupPosition && (
            <Popup position={popupPosition}>
                {/* Render content based on activeMarkerIndex */}
                Content for marker {selectBillboardIndex}
            </Popup>
        )}
        </Cluster>
        </LayerGroup>
    );
}

export default BillboardLayer;

