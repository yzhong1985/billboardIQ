import React, { useState } from 'react';
import {  LayerGroup, Circle, Marker } from 'react-leaflet';

function BillboardLayer({layer}) {

    //const [latitude, setLatitude] = useState[point.lat];
    //const [longitude, setLongitude] = useState(point.long);
    //const [coverRadius, setCoverRadius] = useState(3000);

    const circleStyles = {
        weight: 0,
        fillColor: "blue",
        fillOpacity: 0.2
    };
    
    return (
        <LayerGroup>
            {layer.map((pt, ptIndex) => ( 
                <>
                    <Circle key={"c-" + ptIndex} center={[pt.lat, pt.long]} radius={3000} {...circleStyles} />
                    <Marker key={"m-" + ptIndex} position={[pt.lat, pt.long]} />
                </> 
            ))}
        </LayerGroup>
    );
}

export default BillboardLayer;