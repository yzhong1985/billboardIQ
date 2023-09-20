import React, { useEffect, useState, useRef } from 'react';
import { useMap } from 'react-leaflet';

import * as PIXI from 'pixi.js';
import 'leaflet-pixi-overlay';
import L from 'leaflet';

import { loadSVGTexture } from './UserBillboardContext';
import markerIconBlue from '../styles/markers/marker_blue.svg';

function BillboardPixiResultLayer({ data, isVisible }) {

    const [markerIcon, setMarkerIcon] = useState(null);
    const map = useMap();

    function calNewLatitude(latitude, distanceInMeters) {
        const earthRadiusInMeters = 6371000;
        return latitude + (distanceInMeters / earthRadiusInMeters) * (180 / Math.PI);
    }

    useEffect(() => {
        (async () => {
            const iconBlue = await loadSVGTexture(markerIconBlue);
            // 0: blue 1:green 2:red 3:yellow
            setMarkerIcon(iconBlue);
        })();
    }, []);

    useEffect(() => {
        if(!data) return;

        const pixiContainer = new PIXI.Container();
        data.forEach(point => {     
            const marker = new PIXI.Sprite(markerIcon);
            marker.anchor.set(0.5, 1);
            marker.interactive = true;
            marker.buttonMode = true;
            marker.on('click', (event) => {
                const [longitude, latitude] = [point.long, point.lat];
                //showMarkerPopup(`Coordinates: [${latitude}, ${longitude}]`);
                console.log(`Coordinates: [${latitude}, ${longitude}]`);
            });
            pixiContainer.addChild(marker);
            const coverage = new PIXI.Graphics();
            pixiContainer.addChild(coverage);
        });
        let firstDraw = true;
        let prevZoom;
        const pixiOverlay = L.pixiOverlay((utils) => {
            const zoom = utils.getMap().getZoom();
            const container = utils.getContainer();
            const renderer = utils.getRenderer();
            const project = utils.latLngToLayerPoint;
            const scale = utils.getScale();
            data.forEach((point, index) => {
                const marker = pixiContainer.children[index*2];
                const coverage = pixiContainer.children[index*2 +1];
                const [longitude, latitude] = [point.long, point.lat];
                const markerCoords = project([latitude, longitude]); 
                coverage.x = markerCoords.x;
                coverage.y = markerCoords.y;
                marker.x = markerCoords.x;
                marker.y = markerCoords.y;
                if (firstDraw || prevZoom !== zoom) {
                    marker.scale.set(1.2 / scale);
                    const newLatitude = calNewLatitude(latitude, 3000);
                    const targetPixelCoords = project([newLatitude, longitude]);
                    const pixelRadius = Math.sqrt(Math.pow(coverage.x - targetPixelCoords.x, 2) + Math.pow(coverage.y - targetPixelCoords.y, 2));
                    coverage.clear();
                    coverage.alpha = 0.2; 
                    coverage.beginFill(0xFF0000);
                    coverage.drawCircle(0, 0, pixelRadius);
                    coverage.endFill();
                    coverage.pivot.set(0.5, 0.5);
                }
            });
            firstDraw = false;
            prevZoom = zoom;
            renderer.render(container);
        }, pixiContainer);

        if (isVisible) {
            pixiOverlay.addTo(map);
        } else {
            pixiOverlay.remove();
        }
        return () => { pixiOverlay.remove(); };
      }, [map, data, isVisible]);

    return <></>;
}

export default BillboardPixiResultLayer;
