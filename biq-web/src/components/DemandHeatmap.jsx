import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet.heat';
import { useMap } from 'react-leaflet';

/**
 * generate testing data - delete after use
 */
const topLeft = [33.677498072999754, -112.43616399547425]; // Example values
const bottomRight = [33.21466779504097, -111.58826148075582];
const numPts = 1000;
  
function GetRandomSampleData(topLeft, bottomRight, numPoints) {
    const heatmapData = [];
    for (let i = 0; i < numPoints; i++) {
      const lat = Math.random() * (bottomRight[0] - topLeft[0]) + topLeft[0];
      const lng = Math.random() * (bottomRight[1] - topLeft[1]) + topLeft[1];
      const intensity = Math.random(); // you can customize intensity generation if needed
      heatmapData.push([lat, lng, intensity]);
    }
    return heatmapData;
}

function DemandHeatmap({ data }) {
  const map = useMap();
  useEffect(() => {
    
    //-----------------------------------------------------
    // use some sample data - delete after use
    if(!data){
        data = GetRandomSampleData(topLeft, bottomRight, numPts);
    }
    //-----------------------------------------------------

    L.heatLayer(data).addTo(map);
  }, [map, data]);

  return null;
}

export default DemandHeatmap;

  
  