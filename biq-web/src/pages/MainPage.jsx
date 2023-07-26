import React from 'react';
import MapComponent from '../components/MapComponent';
import { useNavigate } from 'react-router-dom';

function MainPage({ onLogout }) {

  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <>
      <MapComponent onLogout={handleLogout} />   
    </>
  );
}

export default MainPage;