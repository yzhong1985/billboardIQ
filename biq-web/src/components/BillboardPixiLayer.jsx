import React, { useEffect, useState, useRef } from 'react';
import { useMap } from 'react-leaflet';

import * as PIXI from 'pixi.js';
import 'leaflet-pixi-overlay';
import L from 'leaflet';

import markerIconBlue from '../styles/markers/marker_blue.svg';
import markerIconGreen from '../styles/markers/marker_green.svg';
import markerIconRed from '../styles/markers/marker_red.svg';
import markerIconYellow from '../styles/markers/marker_yellow.svg';

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

function BillboardPixiLayer({ data, isVisible, onMarkerClick }) {

    const [markers, setMarkers] = useState([]);
    const map = useMap();

    const showMarkerPopup = (content) => {
        onMarkerClick(content);
        //console.log();
    }

    useEffect(() => {
        (async () => {
            //const texture = await PIXI.Assets.load(markerIcon);
            //const texture = await loadSVGTexture(markerIconSVG);
            //setMarkerTexture(texture);
            const iconBlue = await loadSVGTexture(markerIconBlue);
            const iconGreen = await loadSVGTexture(markerIconGreen);
            const iconRed = await loadSVGTexture(markerIconRed);
            const iconYellow = await loadSVGTexture(markerIconYellow);
            // 0: blue 1:green 2:red 3:yellow
            setMarkers([iconBlue, iconGreen, iconRed, iconYellow]);
        })();
    }, []);

    useEffect(() => {

        if(!data) return;

        const pixiContainer = new PIXI.Container();

        data.forEach(point => {
            const bbType = point.properties.productTyp;
            let markerIndex = 0;
            if (bbType === 'SHELTERS') { //green
                markerIndex = 1;
            } 
            else if (bbType === 'BULLETINS') { //red
                markerIndex = 2;
            }
            else if (bbType === 'Digital') { //yellow
                markerIndex = 3;
            } 
            else { //bbType === 'BENCHES' //blue
                markerIndex = 0;
            }

            //use svg icon as marker
            //const marker = new PIXI.Sprite(markerTexture);
            const marker = new PIXI.Sprite(markers[markerIndex]);
            marker.anchor.set(0.5, 1);
            
            marker.interactive = true;
            marker.buttonMode = true;
            marker.on('click', (event) => {
                const [longitude, latitude] = point.geometry.coordinates;
                showMarkerPopup(`Coordinates: [${latitude}, ${longitude}]`);
            });

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
