import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { db , auth } from "../firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Copy, RefreshCw, FileDown } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";
import emailjs from "@emailjs/browser";
import "./GeneratedPitch.css";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const EMAIL_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAIL_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAIL_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export default function GeneratedPitch() {
  const { pitchId } = useParams();
  const [pitch, setPitch] = useState(null);
  const [generated, setGenerated] = useState("");
  const [loading, setLoading] = useState(false);
  const pitchRef = useRef(null);
  const hasRunRef = useRef(false);

  const formatText = (text) => {
    return text
      .replace(/### (.*?)(\n|$)/g, "<h3>$1</h3>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n\n/g, "<br /><br />");
  };

  const handleGenerate = async (pitchData = pitch) => {
    if (!pitchData) return;
    setLoading(true);

    const wasGeneratedBefore = !!pitchData.generatedPitch;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
        You are a friendly and skilled startup pitch writer.
        Write a ${pitchData.detailLevel || "short"} startup pitch using the details below:

        💡 Idea: ${pitchData.idea}
        📝 Description: ${pitchData.description}
        🏭 Industry: ${pitchData.industry}

        Format the pitch in clear sections using "###" for headings:
        - Problem
        - Solution
        - Unique Value
        - Market Impact
        - Call to Action

        Write in simple, everyday English so anyone can easily understand it.
        Avoid complex words or long sentences.
        Make it sound confident, inspiring, and easy to read.
        End with a short, motivating line that encourages action.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      setGenerated(text);

      await updateDoc(doc(db, "pitches", pitchId), {
        generatedPitch: text,
        generatedAt: serverTimestamp(),
      });

      if (!wasGeneratedBefore) {
        try {
          const summary = text.length > 150 ? text.slice(0, 150) + "..." : text;

          const userEmail = pitchData.userEmail || (auth.currentUser && auth.currentUser.email) || "";
          const userName = (auth.currentUser && auth.currentUser.displayName) || "User";

          const pitchLink = `${window.location.origin}/GeneratedPitch/${pitchId}`;
          const pitchLinkForEmail = `${window.location.origin}/view-pitch`;

          const templateParams = {
            user_name: userName,
            user_email: userEmail,
            pitch_title: pitchData.idea || "Your Pitch",
            pitch_summary: summary,
            pitch_link: pitchLink,
            pitch_link_email_view: pitchLinkForEmail,
            created_at: new Date().toLocaleString(),
          };

          await emailjs.send(
            EMAIL_SERVICE_ID,
            EMAIL_TEMPLATE_ID,
            templateParams,
            EMAIL_PUBLIC_KEY
          );

        } catch (emailErr) {
          console.error("EmailJS error:", emailErr);
        }
      }

      toast.success("Pitch generated successfully!");

    } catch (err) {
      console.error("AI Error:", err);
      toast.error("Error generating pitch!");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generated);
    toast.info("📋 Pitch copied to clipboard!");
  };

  const handleDownloadPDF = async () => {
    const element = pitchRef.current;
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save("StartupPitch.pdf");
    toast.success("📄 PDF downloaded successfully!");
  };

  useEffect(() => {
    if (hasRunRef.current) return; 
    hasRunRef.current = true;

    async function fetchPitch() {
      const docRef = doc(db, "pitches", pitchId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const pitchData = { id: snap.id, ...snap.data() };
        setPitch(pitchData);

        if (snap.data().generatedPitch) {
          setGenerated(snap.data().generatedPitch);
        } else {
          await handleGenerate(pitchData);
        }
      } else {
        toast.error("❌ Pitch not found!");
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
              <>
                <div
                  ref={pitchRef}
                  className="pitch-output"
                  dangerouslySetInnerHTML={{ __html: formatText(generated) }}
                />

                <div className="action-buttons">
                  <button onClick={handleCopy} className="copy-btn">
                    <Copy size={18} /> Copy
                  </button>
                  <button
                    onClick={() => handleGenerate()}
                    disabled={loading}
                    className="regen-btn"
                  >
                    <RefreshCw size={18} />{" "}
                    {loading ? "Regenerating..." : "Regenerate"}
                  </button>
                  <button onClick={handleDownloadPDF} className="pdf-btn">
                    <FileDown size={18} /> Download PDF
                  </button>
                </div>
              </>
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
