import { useState, useEffect } from 'react';
import {TextField, Button, Box, Typography, Card, CardContent, Grid, CircularProgress, Backdrop } from '@mui/material';
import useGeneration from '../../hooks/useGeneration';
import useMetrics from '../../hooks/useMetrics';

function GeneratePage() {
   const [inputText, setInputText] = useState([]);
  const [doCall, setDoCall] = useState(false);
  const [doCallMetrics, setDoCallMetrics] = useState(false);

  const { result, metadata, loading } = useGeneration({inputText,doCall});
   const { loading: loading_metrics, error: error_metrics, metrics } = useMetrics({ original: inputText, generated: result?.generation, doCall: doCallMetrics });

  useEffect(() => {
    if (result) {
      setDoCall(false); // Reset doCall after fetching result
      setDoCallMetrics(true); // Trigger metrics calculation
    }
  }, [result, doCall]);

  useEffect(() => {
    if (metrics || error_metrics) {
      setDoCallMetrics(false); // Reset doCallMetrics after fetching metrics
    }
  }, [metrics, error_metrics, doCallMetrics]);

  const handleClassify = () => {
    setDoCall(true);
  };

  // Show loading when either generation or metrics are loading
  const isLoading = loading || loading_metrics;

  return (
    <Box>
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
        open={isLoading}
      >
        <CircularProgress color="inherit" size={60} />
        <Typography color="inherit" variant="h6">
          {loading ? 'Generando texto...' : loading_metrics ? 'Calculando métricas...' : 'Cargando...'}
        </Typography>
      </Backdrop>

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
        </Box>
      )}
      {
        !loading_metrics && !error_metrics && metrics?.relevance && (
          <>
            <Typography >Metricas del modelo</Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Card sx={{ minWidth: '18.8%' }}>
                <CardContent>
                  <Typography variant="subtitle1">Relevancia</Typography>
                  <Typography variant="h5">{metrics.relevance.toFixed(4)}</Typography>
                </CardContent>
              </Card>
              <Card sx={{ minWidth: '18.8%' }}>
                <CardContent>
                  <Typography variant="subtitle1">Factualidad</Typography>
                  <Typography variant="h5">{metrics.factuality.toFixed(4)}</Typography>
                </CardContent>
              </Card>
              <Card sx={{ minWidth: '18.8%' }}>
                <CardContent>
                  <Typography variant="subtitle1">Legibilidad</Typography>
                  <Typography variant="h5">{metrics.readability.toFixed(4)}</Typography>
                </CardContent>
              </Card>
              
            </Box>
          </>
        )
      }
      
    </Box>
  );
}

export default GeneratePage;