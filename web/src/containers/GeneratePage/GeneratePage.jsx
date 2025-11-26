import { useState, useEffect } from 'react';
import {TextField, Button, Box, Typography, Card, CardContent, Grid } from '@mui/material';
import ModelInfo from '../../components/ModelInfo/ModelInfo';

import useGeneration from '../../hooks/useGeneration';

function GeneratePage() {
   const [inputText, setInputText] = useState([]);
  const [doCall, setDoCall] = useState(false);

  const { result, metadata } = useGeneration({inputText,doCall});

  useEffect(() => {
    if (result) {
      setDoCall(false); // Reset doCall after fetching result
    }
  }, [result, doCall]);

  const handleClassify = () => {
    setDoCall(true);
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid size={9}>
          <Typography variant="h5"><strong>Generar Texto</strong></Typography>
        </Grid>
        <Grid size={1}>
          <Button className="clasifyer_button"  variant="contained" color="primary" onClick={handleClassify} sx={{ mt: 2 }}>
            Generar
          </Button>
        </Grid>

      </Grid>
      
      <TextField
        fullWidth
        multiline
        rows={6}
        placeholder="¿Que texto medico quieres generar?"
        value={inputText}
        onChange={(e) => setInputText([e.target.value])}
        sx={{ mt: 2, bgcolor: '#f3e5f5' }}
      />

      {result && (
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
            <Card sx={{ display: 'flex',justifyContent: 'center',minWidth: '100%' }} >
              <CardContent>
                <Typography >{result.generation}</Typography>
              </CardContent>
            </Card>
          </Box>
          <br />
          <ModelInfo metadata={metadata} />
        </Box>
      )}
      
    </Box>
  );
}

export default GeneratePage;