import React, { createContext, useState } from 'react';
import * as PIXI from 'pixi.js';

// 1. Context Creation
const UserBillboardContext = createContext();

// 2. Default Values (optional)
const defaultItems = [];

// 3. Utility function
const loadSVGTexture = async (svgUrl) => {
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

export { UserBillboardContext, loadSVGTexture };