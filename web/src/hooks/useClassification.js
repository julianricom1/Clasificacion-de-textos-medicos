import { useState, useEffect } from "react";
import axios from "axios";

function useClassification({ inputText, doCall = false }) {
  const [result, setResult] = useState(null);
  const [metadata, setMetadata] = useState({});

  useEffect(() => {
    // Example effect: fetch initial data or perform setup
    if (doCall) fetchPrediction(inputText);
  }, [doCall]);

  const API_DOMAIN = "http://localhost"; // Replace with your actual domain
  const PORT = "8001"; // Replace with your actual domain

  const fetchPrediction = async (text) => {
    try {
      const response = await axios.post(
        `${API_DOMAIN}:${PORT}/api/v1/predict`,
        {
          inputs: text,
        }
      );
      setResult({
        predictions: response.data.predictions.map((clasification) =>
          clasification === 1 ? "Tecnico" : "Plano"
        ),
        scores: response.data.scores,
      });
      setMetadata(response.data.metadata);
    } catch (error) {
      console.error("Error fetching prediction:", error);
    }
  };

  return { result, metadata };
}

export default useClassification;
