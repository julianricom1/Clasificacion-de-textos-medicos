import FileClassifier from '../../components/FileClassifier/FileClassifier.jsx';
import { Typography } from '@mui/material';

function FilePage() {
  return (
    <>
      <Typography variant="h3">Clasificacion de textos Medicos</Typography>
      <FileClassifier />
    </>
  );
}

export default FilePage;