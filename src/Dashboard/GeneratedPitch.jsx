import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";

import "./GeneratedPitch.css"; // Import CSS separately

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export default function GeneratedPitch() {
  const { pitchId } = useParams();
  const [pitch, setPitch] = useState(null);
  const [generated, setGenerated] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (pitchData = pitch) => {
    if (!pitchData) return;
    setLoading(true);

    try {
      const model = await genAI.getGenerativeModel({ model: "text-bison-001" });

      const prompt = `
      Generate a ${pitchData.detailLevel || "short"} startup pitch.
      Idea: ${pitchData.idea}
      Description: ${pitchData.description}
      Industry: ${pitchData.industry}
      Make it catchy, professional, and clear.
      `;

      const result = await model.generateContent(prompt);

      let text = "";
      if (result.response && result.response.text) {
        text = await result.response.text();
      } else if (result.output_text) {
        text = result.output_text;
      } else {
        text = "⚠️ AI returned no text.";
      }

      setGenerated(text);

      await updateDoc(doc(db, "pitches", pitchId), {
        generatedPitch: text,
        generatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("AI Error:", err);
      alert("❌ Error generating pitch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function fetchPitch() {
      const docRef = doc(db, "pitches", pitchId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const pitchData = { id: snap.id, ...snap.data() };
        setPitch(pitchData);

        if (snap.data().generatedPitch) {
          setGenerated(snap.data().generatedPitch);
        } else {
          try {
            await handleGenerate(pitchData);
          } catch (err) {
            console.error("AI generation failed:", err);
          }
        }
      }
    }

    fetchPitch();
  }, [pitchId]);

  return (
    <div className="report-container">
      {pitch && (
        <div className="report-card">
          <h2 className="report-title">Startup Pitch Report</h2>

          <div className="report-section pitch-details">
            <h3>Pitch Details</h3>
            <p><strong>Idea:</strong> {pitch.idea}</p>
            <p><strong>Description:</strong> {pitch.description}</p>
            <p><strong>Industry:</strong> {pitch.industry}</p>
            <p><strong>Detail Level:</strong> {pitch.detailLevel}</p>
          </div>

          <div className="report-section generated-pitch">
            <h3>✨ AI Generated Pitch</h3>
            {generated ? (
              <p>{generated}</p>
            ) : (
              <button onClick={() => handleGenerate()} disabled={loading}>
                {loading ? "Generating..." : "Generate Pitch with AI"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
