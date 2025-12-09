import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import Login from "./AuthPage/login";
import Signup from "./AuthPage/signup";
import Dashboard from "./Dashboard/Dashboard";
import CreatePitch from "./Dashboard/CreatePitch";
import GeneratedPitch from "./Dashboard/GeneratedPitch";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/CreatePitch" element={<CreatePitch />} />
          <Route path="/GeneratedPitch/:pitchId" element={<GeneratedPitch />} />
        </Routes>
      </Router>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
