import React, { useState } from 'react';
import BillboardSettings from './BillboardSettings';
import { googleLogout } from '@react-oauth/google';

import { AiOutlineMenu, AiFillDatabase, AiFillBulb, AiFillSignal, AiTwotoneSetting, AiOutlineCloseCircle } from 'react-icons/ai';
import { IoLayersSharp } from "react-icons/io5";

function Sidebar({ onLogout }) {
    
    const [activeItem, setActiveItem] = useState(null);

    const handleItemClick = (item) => {
        
        //clicked when nothing is highlighted
        if(activeItem == null && item!= null){
            if (!document.body.classList.contains("active-sidebar")) {
                document.body.classList.add("active-sidebar");
            }
            setActiveItem(item);
        } else if(activeItem !== null && activeItem !== item) {
            setActiveItem(item);
        } else if(activeItem === item) {
            if (document.body.classList.contains("active-sidebar")) {
                document.body.classList.remove("active-sidebar");
            }
            setActiveItem(null);
        }
        
    }

    const handleMenuClose = () => {
        if (document.body.classList.contains("active-sidebar")) {
            document.body.classList.remove("active-sidebar");
        }
        setActiveItem(null);
    }

    const handleLogout = () => {
        handleMenuClose();
        googleLogout();
        onLogout();
    }

    const fetchData = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/geojson'); // Replace with your actual API endpoint
          const data = await response.json();
          console.log(data);
        
        } catch (error) {
          console.error('Error fetching data:', error);
        }
    }

    const postData = async () => {
        try {
          const response = await fetch('http://localhost:5000/posttest', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: 'abc', email: 'abc@gmail.com' }),
          });
          const data = await response.json();
          console.log(data);
        } catch (error) {
          console.error('Error posting data:', error);
        }
      };


    return (
        <>
            <div className="sidebar">
                <button aria-label="close sidebar" type="button" className="close-button" onClick={() => handleMenuClose()}>
                    <AiOutlineCloseCircle />
                </button>

                <ul className="sidebar-menu">
                    <li className={`menu-item ${activeItem === 'menu' ? 'active-item' : ''}`} onClick={() => handleItemClick('menu')}>
                    <AiOutlineMenu /> 
                    </li>
                    <li className={`menu-item ${activeItem === 'params' ? 'active-item' : ''}`} onClick={() => handleItemClick('params')}>
                    <AiFillDatabase />
                    </li>
                    <li className={`menu-item ${activeItem === 'layers' ? 'active-item' : ''}`} onClick={() => handleItemClick('layers')}>
                    <IoLayersSharp />
                    </li>
                    <li className={`menu-item ${activeItem === 'email' ? 'active-item' : ''}`} onClick={() => handleItemClick('email')}>
                    <AiFillBulb />
                    </li>
                    <li className={`menu-item ${activeItem === 'locate' ? 'active-item' : ''}`} onClick={() => handleItemClick('locate')}>
                    <AiFillSignal />
                    </li>
                    <li className={`menu-item ${activeItem === 'settings' ? 'active-item' : ''}`} onClick={() => handleItemClick('settings')}>
                    <AiTwotoneSetting />
                    </li>
                </ul>

                <div className="sidebar-content">
                    <div className={`item-content ${activeItem === 'menu' ? 'active' : ''}`} id="menu">
                    <h2>BillboardIQ</h2>
                    <div className="content">
                        <p>Introducing BillboardIQ, the ultimate tool for selecting the best billboard locations. </p>
                        <p>Utilizing big data analysis, social media data, and other geodata from the area, our app provides optimal results for maximum coverage. With cutting-edge algorithms and data-driven decision-making, BillboardIQ takes the guesswork out of selecting the perfect location for your billboard advertising.</p>
                    </div>
                    </div>
                    <div className={`item-content ${activeItem === 'params' ? 'active' : ''}`} id="params">
                    <h2>Set Parameters</h2>
                    <div className="content">
                        <BillboardSettings />
                    </div>
                    </div>
                    <div className={`item-content ${activeItem === 'layers' ? 'active' : ''}`} id="layers">
                    <h2>Layers</h2>
                    <div className="content">
                        Layers
                    </div>
                    </div>
                    <div className={`item-content ${activeItem === 'email' ? 'active' : ''}`} id="email">
                    <h2>Email</h2>
                    <div className="content">
                        email - Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                        Nobis nostrum incidunt, ab explicabo expedita aliquam officiis vitae
                        quaerat magni dolores iure odit? Id labore eveniet eligendi
                        voluptatibus. Repellat, assumenda!!!
                    </div>
                    </div>
                    <div className={`item-content ${activeItem === 'locate' ? 'active' : ''}`} id="locate">
                    <h2>Locate Billboards</h2>
                    <div className="content">
                        email - Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                        Nobis nostrum incidunt, ab explicabo expedita aliquam officiis vitae
                        laborum dicta consectetur, animi cum, culpa quaerat nam? Porro

                        reprehenderit molestias qui doloribus quaerat consequuntur
                        voluptatibus! Quos impedit a non eligendi, dolor animi sapiente

                        quaerat magni dolores iure odit? Id labore eveniet eligendi
                        voluptatibus. Repellat, assumenda!!!

                    </div>
                    </div>
                    <div className={`item-content ${activeItem === 'settings' ? 'active' : ''}`} id="settings">
                    <h2>Settings</h2>
                    <div className="content">
                        <button onClick={handleLogout}>logout</button>

                        <button onClick={fetchData}>GET request</button>

                        <button onClick={postData}>Send User Data (POST)</button>
                    </div>
                        
                    </div>
                </div>
            </div>
        </>
    )
}

export default Sidebar;