import { useState, useEffect } from 'react';
import {TextField, Button, Box, Typography, Card, CardContent, Grid, CircularProgress, Backdrop, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import useGeneration from '../../hooks/useGeneration';
import useMetrics from '../../hooks/useMetrics';
import { SupportedModels } from '../../types/supportedModel';

function GeneratePage() {
   const [inputText, setInputText] = useState([]);
  const [doCall, setDoCall] = useState(false);
  const [doCallMetrics, setDoCallMetrics] = useState(false);
  const [selectedModel, setSelectedModel] = useState(SupportedModels.CLAUDE_SONNET_4);

  const { result: finned_tunned_result, loading: finned_tunned_loading } = useGeneration({inputText,doCall:false, modelName: 'ollama_finned_tunned' });
  const { result: comercial_result, loading: comercial_loading, error: comercial_error } = useGeneration({inputText,doCall, modelName: selectedModel });

  const { loading: loading_metrics, error: error_metrics, metrics } = useMetrics({ original: inputText, generated: finned_tunned_result?.generation, doCall: doCallMetrics });

  useEffect(() => {
    if (finned_tunned_result && comercial_result) {
      setDoCall(false); // Reset doCall after fetching both results
      setDoCallMetrics(true); // Trigger metrics calculation
    }
  }, [finned_tunned_result, comercial_result, doCall]);

  useEffect(() => {
    if (comercial_error) {
      setDoCall(false); // Reset doCall if there's an error
    }
  }, [comercial_error]);

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
  const isLoading = finned_tunned_loading || comercial_loading || loading_metrics;

  // Filter out OLLAMA_FINNED_TUNNED from the options
  const availableModels = Object.entries(SupportedModels).filter(
    ([key, value]) => key !== 'OLLAMA_FINNED_TUNNED'
  );

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
          {(finned_tunned_loading || comercial_loading) ? 'Generando texto...' : loading_metrics ? 'Calculando métricas...' : 'Cargando...'}
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
                  {key === 'CLAUDE_SONNET_4' ? 'Claude Sonnet 4' : 
                   key === 'CHATGPT_4' ? 'ChatGPT 4' : value}
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

      {/* Split Results Section */}
      {(finned_tunned_result || comercial_result) && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            <strong>Resultados de Generación</strong>
          </Typography>
          
          <Grid container spacing={3}>
            {/* Left Split - Fine-tuned Model */}
            <Grid size={6}>
              <Card sx={{ height: '100%', minHeight: 300 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
                    🤖 Ollama Fine-tuned Model
                  </Typography>
                  
                  {finned_tunned_loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                      <CircularProgress />
                    </Box>
                  ) : finned_tunned_result ? (
                    <Typography sx={{ lineHeight: 1.6 }}>
                      {finned_tunned_result.generation}
                    </Typography>
                  ) : (
                    <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      Esperando generación...
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Right Split - Commercial Model */}
            <Grid size={6}>
              <Card sx={{ height: '100%', minHeight: 300 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: 'secondary.main', fontWeight: 'bold' }}>
                    ✨ {selectedModel === SupportedModels.CLAUDE_SONNET_4 ? 'Claude Sonnet 4' : selectedModel === SupportedModels.CHATGPT_5 ? 'ChatGPT 5' : 'ChatGPT 4'}
                  </Typography>
                  
                  {comercial_loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                      <CircularProgress />
                    </Box>
                  ) : comercial_result ? (
                    <Typography sx={{ lineHeight: 1.6 }}>
                      {comercial_result.generation}
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

      {/* Metrics Section */}
      {!loading_metrics && !error_metrics && metrics?.relevance && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            <strong>Métricas del Modelo Fine-tuned</strong>
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