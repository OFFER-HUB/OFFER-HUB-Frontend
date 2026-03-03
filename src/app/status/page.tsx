"use client";

import { useState } from "react";

export default function StatusPage() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/v1/health");
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setResult(`Error: ${err}`);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#1a1a1a", minHeight: "100vh", color: "white" }}>
      <h1>API Status</h1>
      <button
        onClick={checkHealth}
        disabled={loading}
        style={{ padding: "10px 20px", marginTop: "10px", cursor: "pointer" }}
      >
        {loading ? "Checking..." : "Check Health"}
      </button>
      <pre style={{ marginTop: "20px", whiteSpace: "pre-wrap" }}>{result}</pre>
    </div>
  );
}
