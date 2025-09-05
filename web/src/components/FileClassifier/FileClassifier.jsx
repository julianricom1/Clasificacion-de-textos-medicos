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
    field: 'metrica1',
    headerName: 'Metrica 1',
    type: 'number',
    width: 110,
    editable: false,
  },
  {
    field: 'metrica2',
    headerName: 'Metrica 2',
    sortable: true,
    width: 160
  },
];

const rows = [
  { id: 1, texto: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Pariatur distinctio aspernatur quos excepturi maxime quaerat porro soluta reiciendis modi hic impedit,', clasificacion: 'Plano', metrica1: 14, metrica2: 14 },
  { id: 2, texto: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Pariatur distinctio aspernatur quos excepturi maxime quaerat porro soluta reiciendis modi hic impedit,', clasificacion: 'Plano', metrica1: 31, metrica2: 31 },
  { id: 3, texto: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Pariatur distinctio aspernatur quos excepturi maxime quaerat porro soluta reiciendis modi hic impedit,', clasificacion: 'Tecnico', metrica1: 31, metrica2: 31 },
  { id: 4, texto: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Pariatur distinctio aspernatur quos excepturi maxime quaerat porro soluta reiciendis modi hic impedit,', clasificacion: 'Plano', metrica1: 11, metrica2: 11 },
  { id: 5, texto: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Pariatur distinctio aspernatur quos excepturi maxime quaerat porro soluta reiciendis modi hic impedit,', clasificacion: 'Plano', metrica1: null, metrica2: null },
  { id: 6, texto: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Pariatur distinctio aspernatur quos excepturi maxime quaerat porro soluta reiciendis modi hic impedit,', clasificacion: 'Tecnico', metrica1: 150, metrica2: 150 },
  { id: 7, texto: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Pariatur distinctio aspernatur quos excepturi maxime quaerat porro soluta reiciendis modi hic impedit,', clasificacion: 'Plano', metrica1: 44, metrica2: 44 },
  { id: 8, texto: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Pariatur distinctio aspernatur quos excepturi maxime quaerat porro soluta reiciendis modi hic impedit,', clasificacion: 'Tecnico', metrica1: 36, metrica2: 36 },
  { id: 9, texto: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Pariatur distinctio aspernatur quos excepturi maxime quaerat porro soluta reiciendis modi hic impedit,', clasificacion: 'Plano', metrica1: 65, metrica2: 65 },
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