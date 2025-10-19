import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { FaUserCircle } from "react-icons/fa";
import "./Dashboard.css";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  // Watch for login state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else navigate("/");
    });
    return () => unsubscribe();
  }, [navigate]);

  // Logout
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  // Navigate to dashboard
  const navigateValue = () => {
    navigate("/CreatePitch");
  };

  return (
    <div className="home-container">
      
      <nav className="navbar">
        <div className="logo-container">
          <h2>PitchCraft</h2>
        </div>

        <div className="profile-container">
          <div
            className="profile-btn"
            onClick={() => setShowMenu(!showMenu)}
          >
            <span className="profile-name">
              {user?.displayName || "User"}
            </span>
            <FaUserCircle size={28} color="#333" />
          </div>

          {showMenu && (
            <div className="dropdown-menu">
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="home-content">
        <h1>
          Welcome to <span className="highlight">PitchCraft</span> 👋
        </h1>
        <p className="welcome-text">
          Hello {user?.displayName?.split(" ")[0] || "User"}, glad to have you here!
        </p>
        <p className="bio">
          PitchCraft is your platform to create, share, and manage pitches with ease.  
          Build your ideas into reality and collaborate with others.
        </p>
      </div>

      {/* ===== BUTTON ===== */}
      <div className="PitchBtn">
        <button onClick={navigateValue}>Create New Pitch</button>
      </div>
    </div>
  );
}
