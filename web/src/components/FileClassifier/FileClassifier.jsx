import { useState } from 'react';
import { Button, Box, Typography, Card, CardContent, Grid } from '@mui/material';
import useClassification from '../../hooks/useClassification';
import { DataGrid } from '@mui/x-data-grid';

const columns = [
  { field: 'id', headerName: 'ID', width: 90 },
  {
    field: 'texto',
    headerName: 'Texto',
    width: 150,
    editable: false,
  },
  {
    field: 'clasificacion',
    headerName: 'Clasificacion',
    width: 150,
    editable: false,
  },
  {
    field: 'pr_auc',
    headerName: 'PR_AUC',
    type: 'number',
    width: 110,
    editable: false,
  },
  {
    field: 'roc_auc',
    headerName: 'ROC_AUC',
    sortable: true,
    width: 160
  },
  {
    field: 'f1',
    headerName: 'F1',
    sortable: true,
    width: 160
  },
  {
    field: 'recall',
    headerName: 'Recall',
    sortable: true,
    width: 160
  },
  {
    field: 'accuracy',
    headerName: 'Accuracy',
    sortable: true,
    width: 160
  },
];

const rows = [
  { id: 1, texto: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Pariatur distinctio aspernatur quos excepturi maxime quaerat porro soluta reiciendis modi hic impedit,', clasificacion: 'Plano', pr_auc:0.99, roc_auc:0.99,f1:0.99,recall:0.99,accuracy: 0.97 },
  { id: 2, texto: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Pariatur distinctio aspernatur quos excepturi maxime quaerat porro soluta reiciendis modi hic impedit,', clasificacion: 'Plano', pr_auc:0.99, roc_auc:0.99,f1:0.99,recall:0.99,accuracy: 0.97 },
  { id: 3, texto: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Pariatur distinctio aspernatur quos excepturi maxime quaerat porro soluta reiciendis modi hic impedit,', clasificacion: 'Tecnico', pr_auc:0.99, roc_auc:0.99,f1:0.99,recall:0.99,accuracy: 0.97 },
  { id: 4, texto: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Pariatur distinctio aspernatur quos excepturi maxime quaerat porro soluta reiciendis modi hic impedit,', clasificacion: 'Plano', pr_auc:0.99, roc_auc:0.99,f1:0.99,recall:0.99,accuracy: 0.97 },
  { id: 5, texto: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Pariatur distinctio aspernatur quos excepturi maxime quaerat porro soluta reiciendis modi hic impedit,', clasificacion: 'Plano', pr_auc:0.99, roc_auc:0.99,f1:0.99,recall:0.99,accuracy: 0.97 },
  { id: 6, texto: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Pariatur distinctio aspernatur quos excepturi maxime quaerat porro soluta reiciendis modi hic impedit,', clasificacion: 'Tecnico', pr_auc:0.99, roc_auc:0.99,f1:0.99,recall:0.99,accuracy: 0.97 },
  { id: 7, texto: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Pariatur distinctio aspernatur quos excepturi maxime quaerat porro soluta reiciendis modi hic impedit,', clasificacion: 'Plano', pr_auc:0.99, roc_auc:0.99,f1:0.99,recall:0.99,accuracy: 0.97 },
  { id: 8, texto: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Pariatur distinctio aspernatur quos excepturi maxime quaerat porro soluta reiciendis modi hic impedit,', clasificacion: 'Tecnico', pr_auc:0.99, roc_auc:0.99,f1:0.99,recall:0.99,accuracy: 0.97 },
  { id: 9, texto: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Pariatur distinctio aspernatur quos excepturi maxime quaerat porro soluta reiciendis modi hic impedit,', clasificacion: 'Plano', pr_auc:0.99, roc_auc:0.99,f1:0.99,recall:0.99,accuracy: 0.97 },
];

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
      <input type="file" onChange={handleFileChange} />
      
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
        </Box>
      )}
    </Box>
  );
}

export default FileClassifier;