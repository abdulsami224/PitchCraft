import React , { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db } from "../firebase";
import { collection, query, where, getDocs , doc, deleteDoc } from "firebase/firestore";
import { auth } from "../firebase";
import { FaUserCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import { Trash2 , MoreVertical } from "lucide-react";
import Swal from "sweetalert2";
import "./Dashboard.css";


export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [myPitches, setMyPitches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else navigate("/");
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchPitches = async () => {
      const q = query(
        collection(db, "pitches"),
        where("userId", "==", user.uid)
      );

      const snapshot = await getDocs(q);

      const userPitches = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMyPitches(userPitches);
    };

    fetchPitches();
  }, [user]);


  // Logout
 const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully 👋");
      navigate("/");
    } catch (error) {
      toast.error("Error logging out: " + error.message);
    }
  };

  // Navigate to dashboard
  const navigateValue = () => {
    if (myPitches.length >= 3) {
      toast.error("You can create only 3 pitches.");
      return;
    }
    navigate("/CreatePitch");
  };

  const confirmDelete = (id, deletePitch) => {
    Swal.fire({
      title: "Delete Pitch?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,

      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",

      confirmButtonColor: "#0077b6",
      cancelButtonColor: "#808080",

      background: "#ffffff",
      color: "#0a2433",

      customClass: {
        popup: "delete-popup",
        confirmButton: "delete-confirm-btn",
        cancelButton: "delete-cancel-btn",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        deletePitch(id);
        Swal.fire({
          title: "Deleted!",
          text: "Your pitch has been removed.",
          icon: "success",
          confirmButtonColor: "#0077b6",
        });
      }
    });
  };


  const deletePitch = async (id) => {
   
    try {
      await deleteDoc(doc(db, "pitches", id));

      setMyPitches((prev) => prev.filter((item) => item.id !== id));

      toast.success("Pitch deleted successfully!");
    } catch (err) {
      toast.error("Error deleting pitch: " + err.message);
    }
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

      <div className="my-pitches-container pitches-header">
        <h2 className="my-pitches-title">My Pitches</h2>
        <p className="my-pitches-subtitle">Manage and access your created startup pitches</p>
       {myPitches.length === 0 ? (
          <p className="no-pitch">No pitches yet. Create one!</p>
        ) : (
          <div className="pitch-grid">
            {myPitches.map((pitch) => (
              <div key={pitch.id} className="pitch-card-new">
                <div className="pitch-card-header">
                  <h3 className="pitch-title">{pitch.idea}</h3>
                  <MoreVertical
                    size={22}
                    className="menu-icon"
                    onClick={() =>
                      setOpenMenuId(openMenuId === pitch.id ? null : pitch.id)
                    }
                  />

                  {openMenuId === pitch.id && (
                    <div className="pitch-dropdown">
                      <p className="dropdown-item" onClick={() => confirmDelete(pitch.id, deletePitch)}>
                         <Trash2
                          size={20}
                          className="delete-icon" /> 
                          Delete Pitch
                      </p>

                    </div>
                  )}
                </div>

                <span className="pitch-date">
                  {pitch.createdAt?.toDate().toLocaleDateString()}
                </span>

                <button
                  className="view-btn"
                  onClick={() => navigate(`/GeneratedPitch/${pitch.id}`)}
                >
                  View Pitch
                </button>
              </div>


            ))}
          </div>
        )}

      </div>

    </div>
  );
}
