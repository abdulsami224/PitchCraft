import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import Login from "./AuthPage/login";
import Signup from "./AuthPage/signup";
import Dashboard from "./Dashboard/Dashboard";
import CreatePitch from "./Dashboard/CreatePitch";
import GeneratedPitch from "./Dashboard/GeneratedPitch";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/CreatePitch" element={<CreatePitch />} />
        <Route path="/GeneratedPitch/:pitchId" element={<GeneratedPitch />} />
      </Routes>
    </Router>
  );
}

export default App;
