import { useState, useEffect } from 'react';
import {TextField, Button, Box, Typography, Card, CardContent, Grid, CircularProgress, Backdrop, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import useGeneration from '../../hooks/useGeneration';
import useMetrics from '../../hooks/useMetrics';
import useReadability from '../../hooks/useReadability';
import { SupportedModels } from '../../types/supportedModel';

function GeneratePage() {
   const [inputText, setInputText] = useState([]);
  const [doCall, setDoCall] = useState(false);
  const [doCallMetrics, setDoCallMetrics] = useState(false);
  const [selectedModel, setSelectedModel] = useState(SupportedModels.OLLAMA_FINNED_TUNNED);

 const { result: result, loading: loading, error: error } = useGeneration({inputText,doCall, modelName: selectedModel.name });

  const { loading: loading_metrics, error: error_metrics, metrics } = useMetrics({ original: inputText, generated: result?.generation, doCall: doCallMetrics });
  const { loading: loading_readability, error: error_readability, readability } = useReadability({ text: inputText, doCall });

  useEffect(() => {
    if (result) {
      setDoCall(false); // Reset doCall after fetching both results
      setDoCallMetrics(true); // Trigger metrics calculation
    }
  }, [result, doCall]);

  useEffect(() => {
    if (error) {
      setDoCall(false); // Reset doCall if there's an error
    }
  }, [error]);

  useEffect(() => {
    if (metrics || error_metrics) {
      setDoCallMetrics(false); // Reset doCallMetrics after fetching metrics
    }
  }, [metrics, error_metrics, doCallMetrics]);

  const handleClassify = () => {
    setDoCall(true);
  };

  const handleModelChange = (event) => {
    setSelectedModel(event.target.value);
  };

  // Show loading when either generation or metrics are loading
  const isLoading = loading || loading_metrics;

  const availableModels = Object.entries(SupportedModels)

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
          {(loading) ? 'Generando texto...' : loading_metrics ? 'Calculando métricas...' : 'Cargando...'}
        </Typography>
      </Backdrop>

      <Grid container spacing={2} alignItems="center">
        <Grid size={6}>
          <Typography variant="h5"><strong>Generar Texto</strong></Typography>
        </Grid>
        <Grid size={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Modelo</InputLabel>
            <Select
              value={selectedModel}
              label="Modelo"
              onChange={handleModelChange}
            >
              {availableModels.map(([key, value]) => (
                <MenuItem key={key} value={value}>
                  {value.displayName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={3}>
          <Button 
            className="clasifyer_button"  
            variant="contained" 
            color="primary" 
            onClick={handleClassify} 
            sx={{ mt: 2 }}
            fullWidth
          >
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

      {/* Readability Metrics Section */}
      {!loading_readability && !error_readability && readability && (
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={2}>
            <Grid size={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Legibilidad del Texto Original
                  </Typography>
                  <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                    {readability.toFixed(4)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Results Section */}
      {(result) && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            <strong>Resultados de Generación</strong>
          </Typography>
          
          <Grid container spacing={3}>

            {/* Right Split - Commercial Model */}
            <Grid size={12}>
              <Card sx={{ height: '100%', minHeight: 300 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: 'secondary.main', fontWeight: 'bold' }}>
                    ✨ {selectedModel.displayName}
                  </Typography>
                  
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                      <CircularProgress />
                    </Box>
                  ) : result ? (
                    <Typography sx={{ lineHeight: 1.6 }}>
                      {result.generation}
                    </Typography>
                  ) : (
                    <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      Esperando generación...
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Generated Metrics Section */}
      {!loading_metrics && !error_metrics && metrics?.relevance && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            <strong>Métricas del Texto Generado</strong>
          </Typography>
          <Grid container spacing={2}>
            <Grid size={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Relevancia
                  </Typography>
                  <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                    {metrics.relevance.toFixed(4)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Factualidad
                  </Typography>
                  <Typography variant="h4" color="secondary.main" sx={{ fontWeight: 'bold' }}>
                    {metrics.factuality.toFixed(4)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Legibilidad
                  </Typography>
                  <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                    {metrics.readability.toFixed(4)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
}

export default GeneratePage;