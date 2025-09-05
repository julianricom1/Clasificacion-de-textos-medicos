import { useState } from "react";

function useClassification() {
  const [result, setResult] = useState(null);
  const [metrics, setMetrics] = useState([]);

  const classify = (text) => {
    // Mock classification logic
    setResult(Math.random() > 0.5 ? "<Tecnico>" : "<Plano>");
    setMetrics(["123456789", "123456789", "123456789"]);
  };

  const classifyFile = (file) => {
    // Mock file classification (in real app, read file content)
    const reader = new FileReader();
    reader.onload = (e) => classify(e.target.result);
    reader.readAsText(file);
  };

  return { classify, classifyFile, result, metrics };
}

export default useClassification;
