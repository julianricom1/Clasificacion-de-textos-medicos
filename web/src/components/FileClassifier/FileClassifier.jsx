import { useState, useEffect } from 'react';
import { Button, Box, Typography, Card, CardContent, Grid } from '@mui/material';
import useClassification from '../../hooks/useClassification';
import { DataGrid } from '@mui/x-data-grid';
import Papa from "papaparse";

const columns = [
  { field: 'id', headerName: 'ID', width: 90 },
  {
    field: 'texto',
    headerName: 'Texto',
    flex: 1, // Use flex for dynamic width
    minWidth: 200, // Minimum width for responsiveness
    editable: false,
  },
  {
    field: 'clasificacion',
    headerName: 'Clasificacion',
    flex: 0.5, // Use flex for dynamic width
    minWidth: 150, // Minimum width for responsiveness
    editable: false,
  }
];

function FileClassifier() {
  const [file, setFile] = useState(null);
  const [doCall, setDoCall] = useState(false);
  const [inputText, setInputText] = useState([]);

  const [rows, setRows] = useState([]);

  const { result, metadata } = useClassification({inputText, doCall});

  useEffect(() => {
    if (result) {
      const newRows = inputText.map((text, index) => ({
        id: index + 1,
        texto: text,
        clasificacion: result[index] || 'N/A',
      }));
      setRows(newRows);
      setDoCall(false); // Reset doCall after fetching result
    }
  }, [result, doCall]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleClassify = () => {
    if (file) {
      readFile(file);
    }
  };

  const readFile = (file) => {
    Papa.parse(file, {
      header: true, // Assumes the CSV has headers
      complete: function (results) {
        const textValues = results.data
          .filter((row) => row.text !== undefined) // Ensure "text" exists
          .map((row) => row.text);
        setInputText(textValues);
        setDoCall(true);
      },
      error: function (error) {
        console.error("Error parsing CSV:", error);
      },
    });
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid size={9}>
          <Typography variant="h5"><strong>Clasificar Archivo</strong></Typography>
        </Grid>
        <Grid size={1}>
          <Button className="clasifyer_button" variant="contained" color="primary" onClick={handleClassify} sx={{ mt: 2 }}>
            Clasificar
          </Button>
      </Grid>

      </Grid>
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
          <Card sx={{ display: 'flex',justifyContent: 'center',minWidth: '100%' }} >
            <CardContent>
              <input type="file" accept=".csv" onChange={handleFileChange} />
            </CardContent>
          </Card>
        </Box>
      </Box>
      
      {result && (
        <Box sx={{ mt: 4 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 5,
                },
              },
            }}
            pageSizeOptions={[5]}
            checkboxSelection
            disableRowSelectionOnClick
          />
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

export default FileClassifier;