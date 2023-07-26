import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

import { RiRoadMapLine } from "react-icons/ri";


import '../styles/login.css';

function LoginPage({ onLogin }) {

  const responseGoogle = (response) => {
    onLogin(response);
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
          onError={() => { console.log('login failed'); }}
        />
      </div>
  </div>
  );
}

export default LoginPage;