import React, { useEffect, useState, useRef } from 'react';
import { useMap } from 'react-leaflet';

import * as PIXI from 'pixi.js';
import 'leaflet-pixi-overlay';
import L from 'leaflet';

import markerIconSVG from '../styles/marker_reg_pixi.svg';


async function loadSVGTexture(svgUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            resolve(PIXI.Texture.from(canvas));
        };
        img.onerror = reject;
        img.src = svgUrl;
    });
}

function BillboardPixiLayer({ data }) {
    
    const [markerTexture, setMarkerTexture] = useState(null);
    const map = useMap();

    useEffect(() => {
        (async () => {
            //const texture = await PIXI.Assets.load(markerIcon);
            const texture = await loadSVGTexture(markerIconSVG);
            setMarkerTexture(texture);
        })();
    }, []);

    useEffect(() => {

        if(!data) return;

        const pixiContainer = new PIXI.Container();
        data.forEach(point => {
            const marker = new PIXI.Sprite(markerTexture);
            marker.anchor.set(0.5, 1);
            pixiContainer.addChild(marker);
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
                const marker = pixiContainer.children[index];
                if (firstDraw) {
                    const [longitude, latitude] = point.geometry.coordinates;
                    const markerCoords = project([latitude, longitude]); 
                    marker.x = markerCoords.x;
                    marker.y = markerCoords.y;
                }

                if (firstDraw || prevZoom !== zoom) {
                    marker.scale.set(1 / scale);
                }
            });

            firstDraw = false;
            prevZoom = zoom;
            renderer.render(container);

        }, pixiContainer); 
    
        pixiOverlay.addTo(map);
      }, [map, data]);

    return <></>;
}

export default BillboardPixiLayer;
