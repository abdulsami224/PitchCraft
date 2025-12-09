import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreatePitch.css";
import { db, auth } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { toast } from "react-toastify"; 

export default function CreatePitch() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    idea: "",
    description: "",
    industry: "",
    detailLevel: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
      toast.warn("⚠️ Please login first to save a pitch.");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "pitches"), {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email || "",
        userName: auth.currentUser.displayName || "",
        idea: data.idea,
        description: data.description,
        industry: data.industry,
        detailLevel: data.detailLevel,
        createdAt: serverTimestamp(),
      });

      toast.success("Pitch saved successfully!");
      setData({
        idea: "",
        description: "",
        industry: "",
        detailLevel: ""
      });

      navigate(`/GeneratedPitch/${docRef.id}`);
    } catch (err) {
      console.error("Error saving pitch:", err.message);
      toast.error("Error: " + err.message);
    }
  };

  return (
    <div className="createpitch-container">
      <div className="createpitch-card">
        <h2 className="createpitch-title">🚀 Create Your Startup Pitch</h2>
        <p className="createpitch-subtitle">
          Fill in the details below to generate your startup pitch idea.
        </p>

        <form onSubmit={handleSubmit} className="createpitch-form">
          <div className="form-group">
            <label htmlFor="idea">Startup Idea</label>
            <input
              id="idea"
              name="idea"
              type="text"
              value={data.idea}
              onChange={handleChange}
              placeholder="Enter your startup idea here"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Short Description</label>
            <textarea
              id="description"
              name="description"
              value={data.description}
              onChange={handleChange}
              placeholder="Write a short description of your idea"
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="industry">Industry</label>
            <select
              id="industry"
              name="industry"
              value={data.industry}
              onChange={handleChange}
              required
            >
              <option value="">Select Industry</option>
              <option value="Education">Education</option>
              <option value="Health">Health</option>
              <option value="Finance">Finance</option>
              <option value="E-commerce">E-commerce</option>
              <option value="Technology">Technology</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="length">Preferred Detail Level </label>
            <select
              id="detailLevel"
              name="detailLevel"
              value={data.detailLevel}
              onChange={handleChange}
              required
            >
              <option value="">Select Detail Level</option>
              <option value="short">Short (1-2 lines)</option>
              <option value="medium">Medium (1 paragraph)</option>
              <option value="long">Long (detailed)</option>
            </select>
          </div>

          <button type="submit" className="submit-btn">
            Generate Pitch
          </button>
        </form>
      </div>
    </div>
  );
}
