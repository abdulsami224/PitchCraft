import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

export default function ViewPitchRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    });

    return () => unsub();
  }, [navigate]);

  return <p>Redirecting...</p>;
}
