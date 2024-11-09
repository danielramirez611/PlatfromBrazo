import React, { useEffect, useState } from 'react';
import { fetchZipFiles } from '../api';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import archivo from '../../public/img/archivo.png';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ArduinoFileTable: React.FC = () => {
  const [files, setFiles] = useState<any[]>([]);

  useEffect(() => {
    // Obtener los archivos .zip
    fetchZipFiles()
      .then(data => setFiles(data))
      .catch(error => {
        console.error('Error fetching files:', error);
        setFiles([]);
      });
  }, []);

  return (
    <Box sx={{ marginTop: '2rem', overflowX: 'auto', maxHeight: '400px', borderRadius: '10px', padding: '1rem', backgroundColor: '#1A202C', color: 'white' }}>
      <Typography
        component="h2"
        variant="h6"
        align="center"
        sx={{
          marginBottom: '1.5rem',
          fontWeight: 'bold',
          color: 'white'
        }}
      >
        Archivos de Arduino
      </Typography>
      <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white', fontSize: '16px', textAlign: 'center', marginLeft: '2.5rem' }}>
        <thead>
          <tr>
            <th style={{ padding: '10px 0' }}>Nombre del Archivo</th>
            <th style={{ padding: '10px 0' }}>Fecha de Subida</th>
            <th style={{ padding: '10px 0' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(files) && files.map(file => (
            <tr key={file.id} style={{ borderBottom: '1px solid #555' }}>
              <td style={{ padding: '12px 8px' }}>{file.filename}</td>
              <td style={{ padding: '12px 8px' }}>{new Date(file.upload_date).toLocaleString()}</td>
              <td style={{ padding: '12px 8px', display: 'flex', justifyContent: 'center' }}>
                <Button
                  href={`/api/arduino-files/${file.id}`}
                  download={file.filename}
                  sx={{
                    backgroundColor: 'blue',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'darkblue',
                      opacity: 0.8,
                    },
                    padding: '0.5rem 1rem',
                    borderRadius: '5px',
                    marginRight: '1rem'
                  }}
                >
                  <img src={archivo} alt="Descargar archivo" style={{ height: '1.5rem', width: '1.5rem' }} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ToastContainer />
    </Box>
  );
};

export default ArduinoFileTable;
