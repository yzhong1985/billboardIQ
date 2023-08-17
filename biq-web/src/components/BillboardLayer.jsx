import React, { useState, useEffect } from 'react';
import { LayerGroup, Marker, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';

import Cluster from 'react-leaflet-cluster'

/**
 * this component is to represent a layer of billboards, 
 * can display points, polygon, marker, symbol to represent billboard based on setting
 */
function BillboardLayer({data}) {

    const [billboards, setBillboards] = useState([]);

    const bbPointStyle = {
        radius: 2, fillColor: "#313866", fillOpacity: 1, stroke: false
    };

    const customIcon = new L.Icon({
        iconUrl: require('../styles/location.svg').default,
        iconSize: new L.Point(40, 47),
    });

    useEffect(() => {
        setBillboards(data);
    }, [data]);

    return (
        <LayerGroup>
        {/*<CircleMarker key={index} center={[bb.geometry.coordinates[1], bb.geometry.coordinates[0]]} {...bbPointStyle} />*/}
        {/**<Marker key={index} position={[bb.geometry.coordinates[1], bb.geometry.coordinates[0]]} title={index} icon={customIcon}></Marker> */}
        <Cluster>
        {billboards && billboards.map((bb, index) => (
            <Marker key={index} position={[bb.geometry.coordinates[1], bb.geometry.coordinates[0]]}>
                <Popup> I am a popup! </Popup>
            </Marker>
        ))}
        </Cluster>
        </LayerGroup>
    );
}

export default BillboardLayer;