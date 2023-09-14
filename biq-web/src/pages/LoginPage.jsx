import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';

import { TailSpin } from 'react-loading-icons';
import { RiRoadMapLine } from "react-icons/ri";

import '../styles/login.css';

function LoginPage({ onLogin, onDebugLogin }) {

  const [messageToDisplay, setMessageToDisplay] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const responseGoogle = async (response) => {
    setIsLoading(true);
    const res = await onLogin(response);
    setIsLoading(false);
    if(res) {
      setMessageToDisplay(res.error);
    }
  }

  const OnDisplayMsgClick = () => {
    setMessageToDisplay(null);
  }

  const OnDebugLogin = () => {
    onDebugLogin();
  }

  return (
    <div className="login-container">
      <div className="logo">
        <RiRoadMapLine />
      </div>
      <div className="logo">Billboard IQ</div>
      <div className="signup">
        <GoogleLogin
          clientId="273471213430-2vufnmj5gfuok2hseihdl0cjcf391ev5.apps.googleusercontent.com"
          buttonText="Login with Google"
          cookiePolicy={'single_host_origin'} 
          onSuccess={ response => { responseGoogle(response); }} 
          onError={() => { console.log('Google login failed'); }}
        />
      </div>
      { isLoading && <div className='display-loading'><TailSpin stroke='#2F4F4F' strokeWidth='2px'/></div> }
      { messageToDisplay && (<div className='display-msg' onClick={OnDisplayMsgClick}>{messageToDisplay}</div>)}
      <button className='debug-login-btn' onClick={()=>OnDebugLogin()}>DEBUG Login</button>
  </div>
  );
}

export default LoginPage;