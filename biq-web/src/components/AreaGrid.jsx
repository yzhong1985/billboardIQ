import React, { useState, useEffect } from 'react';
import { GeoJSON, CircleMarker, LayerGroup  } from 'react-leaflet';
import * as turf from '@turf/turf';


function AreaGrid({ topLeft, bottomRight, cellSize }) {
  const [gridData, setGridData] = useState(null);
  const [centroids, setCentroids] = useState([]);

  useEffect(() => {

    //-----------------------------------------------------
    // use some sample data - delete after use
    topLeft = [33.677498072999754, -112.43616399547425];
    bottomRight = [33.21466779504097, -111.58826148075582];
    cellSize = 1.0;  // Example cell size in kilometers
    //-----------------------------------------------------

    const bbox = [topLeft[1], topLeft[0], bottomRight[1], bottomRight[0]];
    const grid = turf.squareGrid(bbox, cellSize);
    setGridData(grid);

    const calculatedCentroids = grid.features.map(feature => turf.centroid(feature));
    setCentroids(calculatedCentroids);

  }, [topLeft, bottomRight, cellSize]);

  const gridStyle = {
    color: '#000',
    weight: 0.1,
    opacity: 0.6,
    fillOpacity: 0.1
  };

  const centroidStyle = {
    radius: 2,
    fillColor: "red",
    fillOpacity: 1,
    stroke: false
  };

  return (<>
            {gridData && <GeoJSON data={gridData} style={gridStyle} />}
            <LayerGroup>
            {centroids.map((centroid, index) => (
              <CircleMarker key={index} center={[centroid.geometry.coordinates[1], centroid.geometry.coordinates[0]]} {...centroidStyle} />
            ))}
            </LayerGroup>
          </>
  );
}

export default AreaGrid;