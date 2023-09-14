import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage';
import appConfig from "./config.json";

function App() {

  const [user, setUser] = React.useState(JSON.parse(sessionStorage.getItem('userdata')) || null);

  const onDebugLogin = () => {
      const debugUser = '{"userid":"64d305091373b1e917975134"}';
      sessionStorage.setItem('userdata', debugUser);
      setUser(debugUser);
  };

  const onLogin = async (response) => {
    const id_token = response.credential;
    try {
      const result = await fetch(appConfig.SERVER_URL + 'tokensignin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: id_token }),
      });

      if (!result.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await result.json();
      console.log("user data is:");
      console.log(JSON.stringify(data));
      sessionStorage.setItem('userdata', JSON.stringify(data));
      setUser(JSON.stringify(data));

    } catch (error) {
      console.error('Error posting data:', error);
      const textToDisplay = 'The BIQ server is currently unavailable; please try again later.';
      sessionStorage.removeItem('userdata');
      setUser(null);
      return { error: textToDisplay };
    }
  };

  const onLogout = () => {
    sessionStorage.removeItem('userdata');
    setUser(null);
  };

  return (
    <Router>
      <HelmetProvider>
        <Helmet>
        <title>Billboard IQ - find the right borads for you</title>
        </Helmet>
      </HelmetProvider>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/main" /> : <LoginPage onLogin={onLogin} onDebugLogin={onDebugLogin}/>} />
        <Route path="/main" element={user ? <MainPage onLogout={onLogout} /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={user ? "/main" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;

/**
 *       <Helmet>
      <title>Billboard IQ - find the right borads for you</title>
      </Helmet>
 */
