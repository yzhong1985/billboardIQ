import React, { useEffect, useState, useRef } from 'react';
import { useMap } from 'react-leaflet';

import * as PIXI from 'pixi.js';
import 'leaflet-pixi-overlay';
import L from 'leaflet';

import { loadSVGTexture } from './UserBillboardContext';

import markerIconBlue from '../styles/markers/marker_blue.svg';
import markerIconGreen from '../styles/markers/marker_green.svg';
import markerIconRed from '../styles/markers/marker_red.svg';
import markerIconYellow from '../styles/markers/marker_yellow.svg';

function BillboardPixiLayer({ data, isVisible }) {

    const [markers, setMarkers] = useState([]);
    const map = useMap();

    const onMarkerClick = (point) => {
        //console.log(point);
        const bbId = point.id ? point.id: 0;
        const bbType = point.properties.productTyp ? point.properties.productTyp : "N/A";
        const estWeeklyImpression = point.properties.weeklyImpr ? point.properties.weeklyImpr : 0;
        const bbLocation = point.properties.hoverText ? point.properties.hoverText : "N/A";
        const bbHeading = point.properties.heading ? point.properties.heading : "N/A";
        const [longitude, latitude] = point.geometry.coordinates ? point.geometry.coordinates : [0, 0];
        const locDiv = document.getElementById('bb-popup-div-loc');
        locDiv.innerHTML = bbLocation;
        const coordsDiv = document.getElementById('bb-popup-div-coords');
        coordsDiv.innerHTML = `[${latitude}, ${longitude}]`;
        const typeDiv = document.getElementById('bb-popup-div-type');
        typeDiv.innerHTML = bbType;
        const typeImg = document.getElementById('bb-popup-img-type');
        let typeSrc = "";
        switch (bbType) 
        {
            case "SHELTERS":
                typeSrc = "../img/shelter_billboards.png";
                break;
            case "BENCHES":
                typeSrc = "../img/bench_billboards.png";
                break;
            case "BULLETINS":
                typeSrc = "../img/bulletin_billboards.png";
                break;
            case "Digital":
                typeSrc = "../img/digital_billboads.png";
                break;
            default:
                typeSrc = "../img/shelter_billboards.png";
        }
        typeImg.src = typeSrc;
        const idDiv = document.getElementById('bb-popup-div-id');
        idDiv.innerHTML = bbId;
        const headingDiv = document.getElementById('bb-popup-div-heading');
        headingDiv.innerHTML = bbHeading;
        const numImpressionDiv = document.getElementById('bb-popup-div-impr');
        numImpressionDiv.innerHTML = estWeeklyImpression;
        const overlayDiv = document.querySelector('.map-overlay');
        overlayDiv.style.display = 'block'; 
    }

    const getIconIndex = (bbType) => {
        if (bbType === 'SHELTERS') { //green
            return 1;
        } 
        else if (bbType === 'BULLETINS') { //red
            return 2;
        }
        else if (bbType === 'Digital') { //yellow
            return 3;
        } 
        else { //bbType === 'BENCHES' //blue
            return 0;
        }         
    }

    const closeFixedPopup = () => {
        const overlayDiv = document.querySelector('.map-overlay');
        overlayDiv.style.display = 'none'; // Hide the overlay (and the popup)
    }

    /** load marker icons for billboards */
    useEffect(() => {
        (async () => {
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
            const markerIndex = getIconIndex(bbType);
            //use svg icon as marker
            const marker = new PIXI.Sprite(markers[markerIndex]);
            marker.anchor.set(0.5, 1);
            marker.interactive = true;
            marker.buttonMode = true;
            marker.on('click', (event) => {
                const [longitude, latitude] = point.geometry.coordinates;
                //showMarkerPopup(`Coordinates: [${latitude}, ${longitude}]`);
                onMarkerClick(point);
            });

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

    return <>
            <div className="map-overlay">
                <div id="fixed-popup" className="fixed-popup">
                    <div className='bb-content-item'>
                        <img id="bb-popup-img-type" src="../img/shelter_billboards.png" alt="Shelter billboards" />
                    </div>
                    <div className='bb-content-item'>
                        <div className='bb-content-title'>Type:</div>
                        <div id="bb-popup-div-type" className='bb-content-txt'></div>
                    </div>
                    <div className='bb-content-item'>
                        <div className='bb-content-title'>Locate at:</div>
                        <div id="bb-popup-div-loc" className='bb-content-txt'></div>
                    </div>
                    <div className='bb-content-item'>
                        <div className='bb-content-title'>Coordinates:</div>
                        <div id="bb-popup-div-coords" className='bb-content-txt'></div>
                    </div>
                    <div className='bb-content-item'>
                        <div className='bb-content-title'>ID:</div>
                        <div id="bb-popup-div-id" className='bb-content-txt'></div>
                    </div>
                    <div className='bb-content-item'>
                        <div className='bb-content-title'>Heading:</div>
                        <div id="bb-popup-div-heading" className='bb-content-txt'></div>
                    </div>
                    <div className='bb-content-item'>
                        <div className='bb-content-title'>Impression Est.:</div>
                        <div id="bb-popup-div-impr" className='bb-content-txt'></div>
                    </div>
                    <div className='bb-content-item bb-content-btn'>
                        <button onClick={closeFixedPopup}>Close</button>
                    </div>
                </div>
            </div>
            </>;
}

export default BillboardPixiLayer;

/* Code for drawing circles - in  */
//const marker = new PIXI.Graphics();
// Define circle properties: color, line style, fill
//marker.beginFill(0xFF0000);  // color in hex format, this is red
//marker.drawCircle(0, 0, 2); // parameters are x, y, radius
//marker.endFill();
// Set anchor (for positioning)
//marker.pivot.set(0.5, 0.5); 