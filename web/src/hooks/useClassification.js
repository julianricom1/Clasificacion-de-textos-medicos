import { useState, useEffect } from "react";
import axios from "axios";

function useClassification(inputText, doCall = false) {
  const [result, setResult] = useState(null);
  const [metrics, setMetrics] = useState([]);
  useEffect(() => {
    // Example effect: fetch initial data or perform setup
    fetchPrediction(inputText);
  }, [doCall]);

  const API_DOMAIN = "http://localhost"; // Replace with your actual domain
  const PORT = "8001"; // Replace with your actual domain

  const fetchPrediction = async (text) => {
    try {
      if (doCall) {
        const response = await axios.post(
          `${API_DOMAIN}:${PORT}/api/v1/predict`,
          {
            inputs: [text],
          }
        );
        setResult(response.data.result);
        setMetrics(response.data.metrics);

        setResult(Math.random() > 0.5 ? "Tecnico" : "Plano");
        setMetrics(["0.99", "0.99", "0.99", "0.99", "0.99"]);
      }
    } catch (error) {
      console.error("Error fetching prediction:", error);
    }
  };
  const classify = (text) => {
    // Mock classification logic
    setResult(Math.random() > 0.5 ? "Tecnico" : "Plano");
    setMetrics(["0.99", "0.99", "0.99", "0.99", "0.99"]);
  };

  const classifyFile = (file) => {
    // Mock file classification (in real app, read file content)
    const reader = new FileReader();
    reader.onload = (e) => classify(e.target.result);
    reader.readAsText(file);
  };

  return { classifyFile, result, metrics };
}

export default useClassification;
