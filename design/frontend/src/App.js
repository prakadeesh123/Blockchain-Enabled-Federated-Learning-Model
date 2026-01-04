import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import axios from "axios";
import ResultDisplay from "./ResultDisplay";
import AuthPage from "./AuthPage";
import DecryptPage from "./DecryptPage";
import './Style.css';

function Home() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [normalCSV, setNormalCSV] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setNormalCSV(null);
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("Please select a CSV file!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://127.0.0.1:8000/predict_and_filter", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(response.data);

      if (response.data.normal_data && response.data.normal_data.length > 0) {
        const csvContent = [
          Object.keys(response.data.normal_data[0]).join(","),
          ...response.data.normal_data.map(row => Object.values(row).join(","))
        ].join("\n");

        setNormalCSV(csvContent);
      } else {
        setNormalCSV(null);
        alert("No normal data found to transmit.");
      }

    } catch (err) {
      if (err.response && err.response.status === 404) {
        alert("Endpoint not found (404). Please check if the backend is running and the route is correct.");
      } else {
        alert("Prediction failed: " + (err.message || "Unknown error"));
      }
      console.error("Submit error:", err);
    }
  };

  const handleDownload = () => {
    if (!normalCSV) {
      alert("No normal data available to download.");
      return;
    }

    const blob = new Blob([normalCSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "normal_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEncryptDownload = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:8000/encrypt_and_download", null, {
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "application/octet-stream" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "encrypted_data.csv.enc";
      link.click();
    } catch (error) {
      if (error.response && error.response.status === 404) {
        alert("Encryption endpoint not found (404). Is the backend running?");
      } else {
        alert("Encryption and download failed: " + (error.message || "Unknown error"));
      }
      console.error("Encryption error:", error);
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>🔐 A Blockchain-Enabled Federated Learning Model for Secure and
Efficient Data Transmission in IoT Networks Using Deep Neural Network</h1>
    
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => navigate("/auth")} style={{ marginRight: 10, backgroundColor: "#9333ea", color: "#fff", padding: "10px 15px", borderRadius: 6 }}>
          Go to Authentication
        </button>
        <button onClick={() => navigate("/decrypt")} style={{ backgroundColor: "#2563eb", color: "#fff", padding: "10px 15px", borderRadius: 6 }}>
          Go to Decryption
        </button>
      </div>

      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button onClick={handleSubmit} style={{ marginLeft: 10 }}>Predict</button>

      {result && (
        <div style={{ marginTop: 20 }}>
          <h3>Prediction Result:</h3>
          <p><strong>Total Rows:</strong> {result.total_rows}</p>
          <p><strong>Normal:</strong> {result.normal_count}</p>
          <p><strong>Attack:</strong> {result.attack_count}</p>

          <ResultDisplay
            confusionMatrix={result.confusion_matrix}
            report={result.classification_report}
          />

          <button onClick={handleDownload}>Transmit Normal Data</button>
          <button
            onClick={handleEncryptDownload}
            style={{ marginLeft: "10px", backgroundColor: "#9333ea", color: "white" }}
          >
            Encrypt & Transmit
          </button>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/decrypt" element={<DecryptPage />} />
      </Routes>
    </Router>
  );
}

export default App;
