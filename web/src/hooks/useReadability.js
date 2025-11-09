import { useState, useEffect } from 'react';
import axios from 'axios';

const DEFAULT_BASE_URL = `http://${window.location.hostname}:8001`;

function useMetrics({ text, doCall = false }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [readability, setReadability] = useState(null);

  useEffect(() => {
    // Example effect: fetch initial data or perform setup
    if (doCall) getReadability(text);
  }, [doCall]);

  // Helper function to ensure input is always an array
  const toArray = input => {
    if (Array.isArray(input)) return input;
    return [input];
  };

  // Helper function to make POST requests
  const makeRequest = async (endpoint, payload) => {
    const response = await axios.post(`${DEFAULT_BASE_URL}${endpoint}`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  };

  // Get all metrics at once
  const getReadability = async text => {
    try {
      setLoading(true);
      setError(false);

      const t = toArray(text);
      if (t.length === 0) {
        throw new Error('El texto no puede estar vacío');
      }

      // Execute all three requests in parallel
      const [readabilityResult] = await Promise.all([
        makeRequest('/metrics/readability', {
          texts: t
        })
      ]);

      const readabilityValue = readabilityResult.fkgl?.[0] || 0.0; // Using FKGL as the readability metric

      setReadability(readabilityValue);
    } catch (err) {
      setError(true);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    readability
  };
}

export default useMetrics;
