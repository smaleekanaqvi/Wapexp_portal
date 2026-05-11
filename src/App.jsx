import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import Login from './Login';
import Signup from './Signup';
import Dashboard from './Dashboard';
import ForgotPassword from './ForgotPassword'; // ForgotPassword ko import karein

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login');
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setView('login');
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  if (initializing) return (
    <div style={{background: '#003366', height: '100vh', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      Loading...
    </div>
  );

  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  // Yahan hum multiple views handle kar rahe hain
  return (
    <div className="App">
      {(() => {
        if (view === 'login') {
          return <Login onNavigate={setView} />;
        } else if (view === 'signup') {
          return <Signup onNavigate={setView} />;
        } else if (view === 'forgot-password') {
          return <ForgotPassword onNavigate={setView} />;
        }
      })()}
    </div>
  );
}

export default App;