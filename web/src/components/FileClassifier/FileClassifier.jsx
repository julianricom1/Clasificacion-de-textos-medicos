import { useState } from 'react';
import { Button, Box, Typography, Card, CardContent } from '@mui/material';
import useClassification from '../../hooks/useClassification';

function FileClassifier() {
  const [file, setFile] = useState(null);
  const { classifyFile, result, metrics } = useClassification();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleClassify = () => {
    if (file) {
      classifyFile(file);
    }
  };

  return (
    <Box>
      <Typography variant="h4">Clasificar Archivo</Typography>
      <input type="file" onChange={handleFileChange} />
      <Button variant="contained" color="primary" onClick={handleClassify} sx={{ mt: 2 }}>
        Clasificar
      </Button>
      {result && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">El archivo esta expresado en lenguaje {result}</Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            {metrics.map((metric, index) => (
              <Card key={index} sx={{ minWidth: 150 }}>
                <CardContent>
                  <Typography variant="subtitle1">Metrica {index + 1}</Typography>
                  <Typography variant="h5">{metric}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default FileClassifier;