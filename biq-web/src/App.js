import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage';

function App() {

  const [user, setUser] = React.useState(JSON.parse(sessionStorage.getItem('user')) || null);

  const handleLogin = async (response) => {
    const id_token = response.credential;
    try {
      const result = await fetch('http://localhost:5000/tokensignin', {
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
      const user_email = data["email"];
      setUser(user_email);

    } catch (error) {
      console.error('Error posting data:', error);
    }

  };

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <Helmet>
      <title>Billboard IQ - find the right borads for you</title>
      </Helmet>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/main" /> : <LoginPage onLogin={handleLogin} />} />
        <Route path="/main" element={user ? <MainPage onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={user ? "/main" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
