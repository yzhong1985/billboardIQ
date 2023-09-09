import React, { useState, useEffect, Fragment } from 'react';
import { LayerGroup, CircleMarker, Popup, Marker, Circle  } from 'react-leaflet';
import L from 'leaflet';



function BillboardResultLayer({data}) {
    
    const [billboards, setBillboards] = useState(null);
    const [showCoverageRadius, setShowCoverageRadius] = useState(true);

    const coverageConfig = {
        fillColor: "#313866", 
        fillOpacity: 0.5, 
        stroke: false
    };

    const onMarkerClick = (e, index, billboard) => {
        console.log("billboard index:" + index + " is clicked!")
    };

    const resultMarkerIcon = new L.Icon({
        iconUrl: require('../styles/marker.svg').default,
        iconSize: [8, 12],
        iconAnchor: [4, 12], 
        popupAnchor: [0, -6]
    });

    useEffect(() => {
        setBillboards(data);
    }, [data]);

    /*
    useEffect(() => {
        console.log("billboards result layer data:");
        console.log(billboards);
    }, [billboards]);
*/

    return (
        <LayerGroup>
        {billboards && billboards.map((bb, index) => (
            <Fragment key={`frag-${index}`}>
              <Marker key={`m-${index}`}
                position={[bb.lat, bb.long]} 
                icon={resultMarkerIcon}
                eventHandlers={{ click: (e) => onMarkerClick(e, index, bb) }}>
              </Marker>
              { showCoverageRadius && <Circle center={[bb.lat, bb.long]} radius={bb.radius} {...coverageConfig} ></Circle> }
            </Fragment>
        ))}
        </LayerGroup>
    );
}

export default BillboardResultLayer;