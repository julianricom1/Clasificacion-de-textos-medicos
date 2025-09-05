import TextClassifier from '../../components/TextClassifier/TextClassifier.jsx';
import { Typography } from '@mui/material';

function TextPage() {
  return (
    <>
      <Typography variant="h3">Clasificacion de textos Medicos</Typography>
      <TextClassifier />
    </>
  );
}

export default TextPage;