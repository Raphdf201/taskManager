import { useState, useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import {API_URL} from "@/lib/utils";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check if user is already logged in when app loads
  useEffect(() => {
    // Check if we just got redirected back from OAuth
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'success') {
      setIsAuthenticated(true);
      setIsCheckingAuth(false);

      return;
    }

    // Otherwise, check auth status normally
    fetch(API_URL + '/isLoggedIn', {
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => {
        if (res.ok) {
          setIsAuthenticated(true);
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
      })
      .finally(() => {
        setIsCheckingAuth(false);
      });
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    fetch(API_URL + '/logout')
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000000",
        color: "#ffffff",
      }}>
        Loading...
      </div>
    );
  }

  // Show LoginPage or HomePage based on authentication
  return isAuthenticated ? (
    <HomePage onLogout={handleLogout} />
  ) : (
    <LoginPage onLoginSuccess={handleLoginSuccess} />
  );
};

export default App;