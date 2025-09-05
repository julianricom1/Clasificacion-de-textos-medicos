import { useState } from 'react';
import { TextField, Button, Box, Typography, Card, CardContent } from '@mui/material';
import useClassification from '../../hooks/useClassification';

function TextClassifier() {
  const [inputText, setInputText] = useState('');
  const { classify, result, metrics } = useClassification();

  const handleClassify = () => {
    classify(inputText);
  };

  return (
    <Box>
      <Typography variant="h4">Clasificar Texto</Typography>
      <TextField
        fullWidth
        multiline
        rows={6}
        placeholder="Escribe el texto a clasificar"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        sx={{ mt: 2, bgcolor: '#f3e5f5' }}
      />
      <Button variant="contained" color="primary" onClick={handleClassify} sx={{ mt: 2 }}>
        Clasificar
      </Button>
      {result && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">El texto esta expresado en lenguaje {result}</Typography>
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

export default TextClassifier;