import React, { useState } from 'react';
import { Circle } from 'react-leaflet';

function BillboardMarker({point, pointIndex}) {

    const [latitude, setLatitude] = useState[point.lat];
    const [longitude, setLongitude] = useState(point.long);
    const [coverRadius, setCoverRadius] = useState(3000);
    
    return (
        <>
            <Circle key={pointIndex} center={[latitude, longitude]} radius={coverRadius} />
        </>
    );
}

export default BillboardMarker;