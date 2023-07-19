import React from 'react';

const Sidebar = ({recenterMap}) => {
    const handleClick = () => {
        // Recenter the map to New York City when the button is clicked
        recenterMap([40.7128, -74.0060]);
    }

    return (
        <div style={{position: 'absolute', top: '10px', left: '10px', zIndex: 1000}}>
            <button onClick={handleClick}>
                Recenter to New York City
            </button>
        </div>
    )
}

export default Sidebar;