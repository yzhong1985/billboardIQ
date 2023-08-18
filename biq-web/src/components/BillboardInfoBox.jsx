import React, { useState, useEffect } from 'react';
import { Popup } from 'react-leaflet';

/**
 * this component is to represent a billboard's popup box
 */
function BillboardInfoBox({bbData}) {

    const [billboard, setBillboard] = useState(null);

    useEffect(() => {
        setBillboard(bbData);
        console.log("bbData data:");
        console.log(bbData.id);
    }, [bbData]);

    return (
        <Popup>{"show something"}</Popup>
    );
}

export default BillboardInfoBox;