import React, { useState, useEffect, useRef, Fragment  } from 'react';
import { LayerGroup, CircleMarker, Popup, Marker, Circle  } from 'react-leaflet';
import Cluster from 'react-leaflet-cluster'
import L from 'leaflet';

/**
 * this component is to represent a layer of billboards, 
 * can display points, polygon, marker, symbol to represent billboard based on setting
 */
function BillboardLayer({layerName, data}) {

    const [billboards, setBillboards] = useState([]);
    const [selectedBillboard, setSelectedBillboard] = useState(null);
    const [selectedBillboardIndex, setSelectedBillboardIndex] = useState(null);
    const [selectedBillboardPos, setSelectedBillboardPos] = useState(null);
    const [showCoverageRadius, setShowCoverageRadius] = useState(false);

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
        animate:true,
        disableClusteringAtZoom: 15
    };

    const markerIcon = new L.Icon({
        iconUrl: require('../styles/marker_reg.svg').default,
        iconSize: [8, 12],
        iconAnchor: [4, 12], 
        popupAnchor: [0, -6]
    });

    const selectMarkerIcon = new L.Icon({
        iconUrl: require('../styles/marker_select.svg').default,
        iconSize: [16, 24],
        iconAnchor: [8, 24], 
        popupAnchor: [0, -12]
    });

    const onMarkerClick = (e, index, billboard) => {
        setSelectedBillboardIndex(index);
        setSelectedBillboardPos(e.latlng);
        setSelectedBillboard(billboard);
    };

    const renderBillboardInfo = (billboardObj) => {
        console.log("below bb is selected:");
        console.log(billboardObj);
        return <div>YES</div>
    };

    useEffect(() => {
        setBillboards(data);
        //console.log(data);
    }, [data]);

    return (
        <LayerGroup>
        <Cluster {...clusterConfig}>
        {billboards && billboards.map((bb, index) => (
            <Fragment key={`frag-${index}`}>
              <Marker key={`m-${index}`}
                position={[bb.geometry.coordinates[1], bb.geometry.coordinates[0]]} 
                icon={index === selectedBillboardIndex ? selectMarkerIcon : markerIcon}
                eventHandlers={{ click: (e) => onMarkerClick(e, index, bb) }}>
              </Marker>
            </Fragment>
        ))}
        {selectedBillboardPos && (
            <Popup position={selectedBillboardPos} offset={[0, -16]}>
                <div className='billboard-infobox'>
                    <div className='billboard-infobox-field'>Show:</div><div className='billboard-infobox-value'><input type="checkbox" checked={showCoverageRadius} onChange={e => setShowCoverageRadius(e.target.checked)}/></div> 
                    <div className='billboard-infobox-field'>Coverage:</div><div className='billboard-infobox-value'>{"500(m)"}</div>
                </div>
            </Popup>
        )}
        {/* Render coverage radius */}
        { showCoverageRadius && selectedBillboardPos && <Circle center={selectedBillboardPos} {...bbPointConfig} ></Circle> }
        </Cluster>
        </LayerGroup>
    );
}

export default BillboardLayer;

