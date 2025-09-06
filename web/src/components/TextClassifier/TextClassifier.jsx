import { useState } from 'react';
import { TextField, Button, Box, Typography, Card, CardContent, Grid } from '@mui/material';
import useClassification from '../../hooks/useClassification';

function TextClassifier() {
  const [inputText, setInputText] = useState('');
  const { classify, result, metrics } = useClassification();

  const handleClassify = () => {
    classify(inputText);
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
        onChange={(e) => setInputText(e.target.value)}
        sx={{ mt: 2, bgcolor: '#f3e5f5' }}
      />
      
      {result && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">El texto esta expresado en lenguaje {result}</Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Card sx={{ minWidth: 150 }}>
              <CardContent>
                <Typography variant="subtitle1">PR_AUC</Typography>
                <Typography variant="h5">{metrics[0]}</Typography>
              </CardContent>
            </Card>
            <Card sx={{ minWidth: 150 }}>
              <CardContent>
                <Typography variant="subtitle1">ROC_AUC</Typography>
                <Typography variant="h5">{metrics[1]}</Typography>
              </CardContent>
            </Card>
            <Card sx={{ minWidth: 150 }}>
              <CardContent>
                <Typography variant="subtitle1">F1</Typography>
                <Typography variant="h5">{metrics[2]}</Typography>
              </CardContent>
            </Card>
            <Card sx={{ minWidth: 150 }}>
              <CardContent>
                <Typography variant="subtitle1">Recall</Typography>
                <Typography variant="h5">{metrics[3]}</Typography>
              </CardContent>
            </Card>
            <Card sx={{ minWidth: 150 }}>
              <CardContent>
                <Typography variant="subtitle1">Accuracy</Typography>
                <Typography variant="h5">{metrics[4]}</Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default TextClassifier;