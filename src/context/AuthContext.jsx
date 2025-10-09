import { createContext, useState, useEffect } from "react";
import { setLogout } from "../services/api/axios/authBridge";
import { jwtDecode } from "jwt-decode";
import axiosClient from "../services/api/axios/axiosClient";

export const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const [name, setName] = useState(null);
  const [hospital, setHospital] = useState(null);
  const [location, setLocation] = useState(null);

  const Logout = () => {
    // Log logout event before clearing token
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      try {
        const decodedToken = jwtDecode(storedToken);

        // Log logout event (this will be sent to backend) and then clear token
        axiosClient
          .post("/log-activity", {
            action_type: "auth_event",
            action_details: "logout",
            status: "success",
          })
          .then((response) => {
            console.log("Logout activity logged successfully:", response);
            // Clear token after successful logging
            localStorage.removeItem("token");
            setToken(false);
            setIsLoggedIn(false);
            setRole(null);
          })
          .catch((err) => {
            console.log("Logout logging failed:", err);
            console.log("Error response:", err.response);
            // Still clear token even if logging fails
            localStorage.removeItem("token");
            setToken(false);
            setIsLoggedIn(false);
            setRole(null);
          });
      } catch (e) {
        console.log("Token decode failed during logout:", e);
        // Clear token even if decode fails
        localStorage.removeItem("token");
        setToken(false);
        setIsLoggedIn(false);
        setRole(null);
      }
    } else {
      // No token to log, just clear state
      localStorage.removeItem("token");
      setToken(false);
      setIsLoggedIn(false);
      setRole(null);
    }
  };

  const Login = (token) => {
    localStorage.setItem("token", token);
    const decodedToken = jwtDecode(token);
    setRole(decodedToken.role);
    setName(decodedToken.name);
    setHospital(decodedToken.hospital);
    setLocation(decodedToken.location);
    setIsLoggedIn(true);
    setToken(token);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      const decodedToken = jwtDecode(storedToken);
      setRole(decodedToken.role);
      setName(decodedToken.name);
      setHospital(decodedToken.hospital);
      setLocation(decodedToken.location);

      setToken(storedToken);
      GlobalStorage.setToken(storedToken);
      setIsLoggedIn(true);
    } else {
      setToken(false);
    }

    setLogout(Logout);
  }, []);

  if (token !== null) {
    return (
      <AuthContext.Provider
        value={{
          token,
          isLoggedIn,
          Login,
          Logout,
          role,
          name,
          hospital,
          location,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }
}

export default AuthProvider;

let token = null;
export const GlobalStorage = {
  setToken: (argtoken) => {
    token = argtoken;
  },
  getToken: () => token,
};
