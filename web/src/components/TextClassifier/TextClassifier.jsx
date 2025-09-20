import { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, Card, CardContent, Grid } from '@mui/material';
import useClassification from '../../hooks/useClassification';

function TextClassifier() {
  const [inputText, setInputText] = useState([]);
  const [doCall, setDoCall] = useState(false);

  const { result, metadata } = useClassification({inputText,doCall});

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
          <Typography variant="h5"><strong>Clasificar Texto</strong></Typography>
        </Grid>
        <Grid size={1}>
          <Button className="clasifyer_button"  variant="contained" color="primary" onClick={handleClassify} sx={{ mt: 2 }}>
            Clasificar
          </Button>
        </Grid>

      </Grid>
      
      <TextField
        fullWidth
        multiline
        rows={6}
        placeholder="Escribe el texto a clasificar"
        value={inputText}
        onChange={(e) => setInputText([e.target.value])}
        sx={{ mt: 2, bgcolor: '#f3e5f5' }}
      />
      
      {result && (
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
            <Card sx={{ display: 'flex',justifyContent: 'center',minWidth: '100%' }} >
              <CardContent>
                <Typography variant="h6">El texto esta expresado en lenguaje <strong>{result}</strong></Typography>
              </CardContent>
            </Card>
          </Box>
          <br />
          <Typography >La version usada del modelo es <strong>{metadata.model_version}</strong></Typography>
          <Typography >Metricas del modelo</Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Card sx={{ minWidth: '18.8%' }}>
              <CardContent>
                <Typography variant="subtitle1">PR_AUC</Typography>
                <Typography variant="h5">{metadata.metrics.pr_auc}</Typography>
              </CardContent>
            </Card>
            <Card sx={{ minWidth: '18.8%' }}>
              <CardContent>
                <Typography variant="subtitle1">ROC_AUC</Typography>
                <Typography variant="h5">{metadata.metrics.roc_auc}</Typography>
              </CardContent>
            </Card>
            <Card sx={{ minWidth: '18.8%' }}>
              <CardContent>
                <Typography variant="subtitle1">F1</Typography>
                <Typography variant="h5">{metadata.metrics.f1_score}</Typography>
              </CardContent>
            </Card>
            <Card sx={{ minWidth: '18.8%' }}>
              <CardContent>
                <Typography variant="subtitle1">Recall</Typography>
                <Typography variant="h5">{metadata.metrics.recall}</Typography>
              </CardContent>
            </Card>
            <Card sx={{ minWidth: '18.8%' }}>
              <CardContent>
                <Typography variant="subtitle1">Accuracy</Typography>
                <Typography variant="h5">{metadata.metrics.accuracy}</Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default TextClassifier;