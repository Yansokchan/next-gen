import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CORRECT_PASSWORD = "Pa$$w0rd"; // You should change this to your desired password
const SESSION_TIMEOUT = 3 * 60 * 1000; // 3 minutes in milliseconds
const ACTIVITY_EVENTS = [
  "mousemove",
  "keydown",
  "click",
  "scroll",
  "touchstart",
  "focus",
  "blur",
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Check if there's a stored session
    const storedSession = localStorage.getItem("session");
    if (storedSession) {
      const { timestamp } = JSON.parse(storedSession);
      const now = Date.now();
      // If the stored session is still valid, restore it
      if (now - timestamp < SESSION_TIMEOUT) {
        return true;
      } else {
        localStorage.removeItem("session");
      }
    }
    return false;
  });
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  const updateSession = () => {
    const timestamp = Date.now();
    setLastActivity(timestamp);
    if (isAuthenticated) {
      localStorage.setItem("session", JSON.stringify({ timestamp }));
    }
  };

  const handleUserActivity = () => {
    if (isAuthenticated) {
      updateSession();
    }
  };

  const login = (password: string) => {
    const isValid = password === CORRECT_PASSWORD;
    if (isValid) {
      setIsAuthenticated(true);
      updateSession();
    }
    return isValid;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("session");
  };

  // Set up activity listeners
  useEffect(() => {
    if (isAuthenticated) {
      // Add event listeners for user activity
      ACTIVITY_EVENTS.forEach((event) => {
        window.addEventListener(event, handleUserActivity);
      });

      // Cleanup
      return () => {
        ACTIVITY_EVENTS.forEach((event) => {
          window.removeEventListener(event, handleUserActivity);
        });
      };
    }
  }, [isAuthenticated]);

  // Check session status periodically
  useEffect(() => {
    if (isAuthenticated) {
      const checkSession = () => {
        const now = Date.now();
        const timeSinceLastActivity = now - lastActivity;

        if (timeSinceLastActivity >= SESSION_TIMEOUT) {
          logout();
        }
      };

      // Initial check
      checkSession();

      // Set up periodic checks
      const intervalId = setInterval(checkSession, 1000);

      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, lastActivity]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
