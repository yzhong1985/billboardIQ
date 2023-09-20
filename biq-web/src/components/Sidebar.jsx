import React, { useState, useEffect } from 'react';
import BillboardSettingsPanel from './BillboardSettingsPanel';
import BillboardLocationsPanel from './BillboardLocationsPanel';
import { googleLogout } from '@react-oauth/google';

import { AiOutlineMenu, AiFillDatabase, AiFillBulb, AiFillSignal, AiTwotoneSetting, AiOutlineCloseCircle } from 'react-icons/ai';
import { IoLayersSharp } from "react-icons/io5";
import "../styles/sidebar.css";

function Sidebar({ onLogout, onCalBillboardLocations, onToggleBillboards }) {
    
    const [activeItem, setActiveItem] = useState(null);
    const [showCaseItems, setShowCaseItems] = useState(null);

    useEffect(() => {
    }, []);

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
    };

    const handleMenuClose = () => {
        if (document.body.classList.contains("active-sidebar")) {
            document.body.classList.remove("active-sidebar");
        }
        setActiveItem(null);
    };

    const handleLogout = () => {
        handleMenuClose();
        googleLogout();
        onLogout();
    };

    const fetchData = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/geojson'); // Replace with your actual API endpoint
          const data = await response.json();
          console.log(data);
        
        } catch (error) {
          console.error('Error fetching data:', error);
        }
    };

    const postData = async () => {
        try {
          const response = await fetch('http://localhost:5000/posttest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify({ name: 'abc', email: 'abc@gmail.com' }),
          });
          const data = await response.json();
          console.log(data);
        } catch (error) {
          console.error('Error posting data:', error);
        }
    };

    const imgUrl1 = 'img/phoenix-bg-1-min.png'; // Replace with your image path
    const imgUrl2 = 'img/seattle-bg-1-min.png';

    const divStyle1 = {
        backgroundImage: `url(${imgUrl1})`,
        backgroundSize: 'cover',  // This will make sure the image covers the div
        backgroundRepeat: 'no-repeat'
    };

    const divStyle2 = {
        backgroundImage: `url(${imgUrl2})`,
        backgroundSize: 'cover',  // This will make sure the image covers the div
        backgroundRepeat: 'no-repeat'
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
                    <li className={`menu-item ${activeItem === 'business' ? 'active-item' : ''}`} onClick={() => handleItemClick('business')}>
                    <AiFillBulb />
                    </li>
                    <li className={`menu-item ${activeItem === 'billboards' ? 'active-item' : ''}`} onClick={() => handleItemClick('billboards')}>
                    <AiFillSignal />
                    </li>
                    <li className={`menu-item ${activeItem === 'params' ? 'active-item' : ''}`} onClick={() => handleItemClick('params')}>
                    <AiFillDatabase />
                    </li>
                    <li className={`menu-item ${activeItem === 'layers' ? 'active-item' : ''}`} onClick={() => handleItemClick('layers')}>
                    <IoLayersSharp />
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
                    <div className='workspace-wrapper' style={divStyle1}><div className='workspace-name'>Phoenix, AZ</div></div>
                    <div className='workspace-wrapper' style={divStyle2}><div className='workspace-name'>Seattle, WA</div></div>
                    </div>
                    <div className={`item-content ${activeItem === 'business' ? 'active' : ''}`} id="business">
                    <h2>Local Businesses</h2>
                    <div className="content">
                        Business options 
                        - show grid network
                        - can add some heatmaps for business
                        
                    </div>
                    </div>

                    <div className={`item-content ${activeItem === 'billboards' ? 'active' : ''}`} id="billboards">
                        <h2>Billboards</h2>
                        <BillboardLocationsPanel onToggleBillboards={onToggleBillboards} />
                    </div>

                    <div className={`item-content ${activeItem === 'params' ? 'active' : ''}`} id="params">
                        <h2>Optimal Advertising</h2>
                        <BillboardSettingsPanel onCalBillboardLocations={onCalBillboardLocations} />
                    </div>

                    <div className={`item-content ${activeItem === 'layers' ? 'active' : ''}`} id="layers">
                    <h2>Layers</h2>
                    <div className="content">
                        Layers
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