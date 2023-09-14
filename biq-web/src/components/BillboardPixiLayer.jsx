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

function BillboardPixiLayer({ data, isVisible }) {
    
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
            //use svg icon as marker
            const marker = new PIXI.Sprite(markerTexture);
            marker.anchor.set(0.5, 1);

            //const marker = new PIXI.Graphics();
            // Define circle properties: color, line style, fill
            //marker.beginFill(0xFF0000);  // color in hex format, this is red
            //marker.drawCircle(0, 0, 2); // parameters are x, y, radius
            //marker.endFill();
            // Set anchor (for positioning)
            //marker.pivot.set(0.5, 0.5); 

            pixiContainer.addChild(marker);
        });

        let firstDraw = true;
        let prevZoom;

        const pixiOverlay = L.pixiOverlay((utils) => {
            const zoom = utils.getMap().getZoom();
            const container = utils.getContainer();
            const renderer = utils.getRenderer();
            const project = utils.latLngToLayerPoint;
            let scale = utils.getScale();
            
            //display current zoom and scale
            //console.log("zoom:");
            //console.log(zoom);
            //console.log("scale:");
            //console.log(scale);

            data.forEach((point, index) => {
                const marker = pixiContainer.children[index];
                if (firstDraw) {
                    const [longitude, latitude] = point.geometry.coordinates;
                    const markerCoords = project([latitude, longitude]); 
                    marker.x = markerCoords.x;
                    marker.y = markerCoords.y;
                }

                if (firstDraw || prevZoom !== zoom) {
                    if (scale < 0.5) {
                        scale = 0.5;
                    }
                    marker.scale.set(1 / scale);
                    //marker.scale.set(10 + zoom * 0.1);
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

        return () => {
            pixiOverlay.remove();
        };

      }, [map, data, isVisible]);

    return <></>;
}

export default BillboardPixiLayer;
