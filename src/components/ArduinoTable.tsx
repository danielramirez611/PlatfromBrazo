import React, { useState, useEffect } from 'react';
import { fetchZipFiles, uploadZipFile, arduinoDelete, fetchArduinoCodes, addArduinoCode, updateArduinoCode, deleteArduinoCode } from '../api';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Grid from '@mui/material/Grid';
import archivo from '../../public/img/archivo.png';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ArduinoTable: React.FC = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);

  // Estado para gestionar los códigos de Arduino
  const [codes, setCodes] = useState<any[]>([]);
  const [title, setTitle] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    // Obtener los archivos .zip
    fetchZipFiles()
      .then(data => setFiles(data))
      .catch(error => {
        console.error('Error fetching files:', error);
        setFiles([]);
      });

    // Obtener los códigos de Arduino
    fetchArduinoCodes()
      .then(data => setCodes(data))
      .catch(error => {
        console.error('Error fetching Arduino codes:', error);
        setCodes([]);
      });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await arduinoDelete(id);
      const updatedFiles = await fetchZipFiles();
      setFiles(updatedFiles);
      toast.success('Archivo eliminado correctamente.');
    } catch (error) {
      console.error('Error eliminando archivo:', error);
      toast.error('Error al eliminar el archivo.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', file.name);

    try {
      await uploadZipFile(formData);
      const updatedFiles = await fetchZipFiles();
      setFiles(updatedFiles);
      toast.success('Archivo subido correctamente.');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Error al subir el archivo.');
    }
  };

  const handleAddOrUpdateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !code) return;

    try {
      if (editingId) {
        // Actualizar código existente
        await updateArduinoCode(editingId, { title, code });
        toast.success('Código actualizado correctamente.');
      } else {
        // Agregar nuevo código
        await addArduinoCode({ title, code });
        toast.success('Código agregado correctamente.');
      }
      const updatedCodes = await fetchArduinoCodes();
      setCodes(updatedCodes);
      setEditingId(null);
      setTitle('');
      setCode('');
    } catch (error) {
      console.error('Error al agregar/actualizar el código:', error);
      toast.error('Error al agregar/actualizar el código.');
    }
  };

  const handleEditCode = (code: any) => {
    setEditingId(code.id);
    setTitle(code.title);
    setCode(code.code);
  };

  const handleDeleteCode = async (id: number) => {
    try {
      await deleteArduinoCode(id);
      const updatedCodes = await fetchArduinoCodes();
      setCodes(updatedCodes);
      toast.success('Código eliminado correctamente.');
    } catch (error) {
      console.error('Error eliminando código:', error);
      toast.error('Error al eliminar el código.');
    }
  };

  return (
    <Grid container component="main" sx={{ height: '100vh', backgroundColor: '#0D1A2E', color: 'white' }}>
      <Grid item xs={12} component={Paper} elevation={6} square sx={{ padding: { lg: '2rem', xs: '1rem' }, backgroundColor: '#0D1A2E', color: 'white', borderRadius: '10px' }}>
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
        <form onSubmit={handleSubmit} style={{ textAlign: 'center', marginBottom: '2rem', marginLeft:'8rem' }}>
          <Tooltip title="Selecciona un archivo .zip para subir" arrow>
            <TextField
              type="file"
              accept=".zip"
              onChange={handleFileChange}
              fullWidth
              sx={{
                backgroundColor: 'white',
                color: 'black',
                marginBottom: '1rem',
                '& .MuiInputBase-root': {
                  color: 'black',
                },
              }}
            />
          </Tooltip>
          <Button
            type="submit"
            sx={{
              backgroundColor: 'green',
              marginRight:'8rem',
              color: 'white',
              '&:hover': {
                backgroundColor: 'darkgreen',
                opacity: 0.8,
              },
              padding: '0.5rem 2rem',
              borderRadius: '5px'
            }}
          >
            Subir Archivo
          </Button>
        </form>

        <Box sx={{ marginTop: '2rem', overflowX: 'auto', maxHeight: '400px', borderRadius: '10px', padding: '1rem', backgroundColor: '#1A202C' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white', fontSize: '16px', textAlign: 'center',marginLeft:'2.5rem'  }}>
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
                    <Button
                      onClick={() => handleDelete(file.id)}
                      sx={{
                        backgroundColor: 'red',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'darkred',
                          opacity: 0.8,
                        },
                        padding: '0.5rem 1rem',
                        borderRadius: '5px',
                      }}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

        <Typography
          component="h2"
          variant="h6"
          align="center"
          sx={{
            marginTop: '3rem',
            marginBottom: '1.5rem',
            fontWeight: 'bold',
            color: 'white'
          }}
        >
          Códigos de Arduino
        </Typography>

        <form onSubmit={handleAddOrUpdateCode} style={{ textAlign: 'center', marginBottom: '2rem',marginLeft:'8rem' }}>
          <TextField
            label="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            sx={{
              backgroundColor: 'white',
              color: 'black',
              marginBottom: '1rem',
              '& .MuiInputBase-root': {
                color: 'black',
              },
            }}
          />
          <TextField
            label="Código de Arduino"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            fullWidth
            multiline
            rows={4}
            sx={{
              backgroundColor: 'white',
              color: 'black',
              marginBottom: '1rem',
              '& .MuiInputBase-root': {
                color: 'black',
              },
            }}
          />
          <Button
            type="submit"
            sx={{
              backgroundColor: editingId ? 'orange' : 'green',
              marginRight:'8rem',
              color: 'white',
              '&:hover': {
                backgroundColor: editingId ? 'darkorange' : 'darkgreen',
                opacity: 0.8,
              },
              padding: '0.5rem 2rem',
              borderRadius: '5px'
            }}
          >
            {editingId ? 'Actualizar Código' : 'Agregar Código'}
          </Button>
        </form>

        <Box sx={{ marginTop: '2rem', overflowX: 'auto', maxHeight: '400px', borderRadius: '10px', padding: '1rem', backgroundColor: '#1A202C' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white', fontSize: '16px', textAlign: 'center',marginLeft:'2.5rem' }}>
            <thead>
              <tr>
                <th style={{ padding: '10px 0' }}>Título del Código</th>
                <th style={{ padding: '10px 0' }}>Código</th>
                <th style={{ padding: '10px 0' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(codes) && codes.map(code => (
                <tr key={code.id} style={{ borderBottom: '1px solid #555' }}>
                  <td style={{ padding: '12px 8px' }}>{code.title}</td>
                  <td style={{ padding: '12px 8px', whiteSpace: 'pre-wrap' }}>
                    {code.code.split(' ').length > 12
                      ? code.code.split(' ').slice(0, 12).join(' ') + '...'
                      : code.code}
                  </td>
                  <td style={{ padding: '12px 8px', display: 'flex', justifyContent: 'center' }}>
                    <Button
                      onClick={() => handleEditCode(code)}
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
                      Editar
                    </Button>
                    <Button
                      onClick={() => handleDeleteCode(code.id)}
                      sx={{
                        backgroundColor: 'red',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'darkred',
                          opacity: 0.8,
                        },
                        padding: '0.5rem 1rem',
                        borderRadius: '5px',
                      }}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Grid>
      <ToastContainer />
    </Grid>
  );
};

export default ArduinoTable;
