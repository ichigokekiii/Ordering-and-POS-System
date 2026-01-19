import { useEffect, useState } from "react";
import api from "../services/api";

function LandingPage() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    api.get("/landing")
      .then((res) => {
        setContent(res.data);
      })
      .catch(() => {
        console.error("Failed to load landing content");
      });
  }, []);

  if (!content) return <p>Loading...</p>;

  return (
    <div style={{ padding: "40px" }}>
      <h1>{content.title}</h1>
      <p>{content.subtitle}</p>
    </div>
  );
}

export default LandingPage;
