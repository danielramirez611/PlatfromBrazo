import React, { useEffect, useState } from 'react';
import { getEntregaArchivos, deleteEntregaArchivo, updateEntregaArchivo } from '../api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Grid, Button, Modal, TextField, Box, Typography, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';

const EntregasTabletPage = () => {
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEntrega, setSelectedEntrega] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entregaToDelete, setEntregaToDelete] = useState(null);

  useEffect(() => {
    const fetchEntregas = async () => {
      try {
        const data = await getEntregaArchivos();
        setEntregas(data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
        toast.error('Error fetching deliveries');
      }
    };

    fetchEntregas();
  }, []);

  const handleDownload = (fileContent, fileName) => {
    try {
        // Identifica el tipo de archivo basado en su extensión
        const extension = fileName.split('.').pop().toLowerCase();
        let mimeType = '';

        if (extension === 'pdf') {
            mimeType = 'application/pdf';
        } else if (extension === 'docx') {
            mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        } else if (extension === 'pptx') {
            mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        } else {
            mimeType = 'application/octet-stream';  // Tipo MIME genérico para otros archivos
        }

        // Decodifica el contenido del archivo desde Base64
        const byteCharacters = atob(fileContent.replace(/\s/g, ''));
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });

        // Crear un enlace de descarga
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName; // Asegura que se use el nombre y la extensión del archivo original
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('Archivo descargado correctamente.');
    } catch (error) {
        console.error('Error al descargar el archivo:', error);
        toast.error('Error al descargar el archivo.');
    }
};



  const handleOpenDeleteDialog = (entrega) => {
    setEntregaToDelete(entrega);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setEntregaToDelete(null);
  };

  const handleDelete = async () => {
    try {
      await deleteEntregaArchivo(entregaToDelete.id);
      setEntregas(entregas.filter(entrega => entrega.id !== entregaToDelete.id));
      toast.success('Entrega eliminada exitosamente');
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Error deleting file submission:', error);
      toast.error('Error deleting file submission');
    }
  };

  const handleOpenEditModal = (entrega) => {
    setSelectedEntrega(entrega);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedEntrega(null);
  };

  const handleEditSubmit = async () => {
    try {
      await updateEntregaArchivo(selectedEntrega.id, {
        archivo: selectedEntrega.archivo,
        descripcion: selectedEntrega.descripcion,
        comentarios: selectedEntrega.comentarios,
      });
      const updatedEntregas = entregas.map(entrega => 
        entrega.id === selectedEntrega.id ? selectedEntrega : entrega
      );
      setEntregas(updatedEntregas);
      handleCloseEditModal();
      toast.success('Entrega actualizada exitosamente');
    } catch (error) {
      console.error('Error updating file submission:', error);
      toast.error('Error updating file submission');
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedEntrega({
        ...selectedEntrega,
        archivo: reader.result.split(',')[1],
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <Grid container component="main" sx={{ height: '100vh', backgroundColor: '#0D1A2E', justifyContent: 'center', alignItems: 'center', padding: '2vw' }}>
      <Grid item xs={12} md={10} lg={8}>
        <Paper sx={{ padding: '2rem', borderRadius: '8px', boxShadow: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            Entregas de Archivos
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">Error: {error.message}</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Apellido</TableCell>
                    <TableCell>Correo</TableCell>
                    <TableCell>Archivo</TableCell>
                    <TableCell>Nombre del archivo</TableCell>
                    <TableCell>Comentarios</TableCell>
                    <TableCell>Fecha de Entrega</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entregas.map((entrega) => (
                    <TableRow key={entrega.id}>
                      <TableCell>{entrega.first_name}</TableCell>
                      <TableCell>{entrega.last_name}</TableCell>
                      <TableCell>{entrega.email}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleDownload(entrega.archivo, entrega.descripcion)}>
                          <DownloadIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell>{entrega.descripcion}</TableCell>
                      <TableCell>{entrega.comentarios}</TableCell>
                      <TableCell>{new Date(entrega.created_at).toLocaleString()}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleOpenEditModal(entrega)} color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleOpenDeleteDialog(entrega)} color="secondary">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Grid>
      <ToastContainer />
      <Modal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            outline: 'none',
            width: '80%',
            maxWidth: '500px',
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" gutterBottom>Editar Entrega</Typography>
          <TextField
            label="Nombre del archivo"
            fullWidth
            value={selectedEntrega?.descripcion || ''}
            onChange={(e) => setSelectedEntrega({ ...selectedEntrega, descripcion: e.target.value })}
            sx={{ marginBottom: '1rem' }}
          />
          <TextField
            label="Comentarios"
            fullWidth
            value={selectedEntrega?.comentarios || ''}
            onChange={(e) => setSelectedEntrega({ ...selectedEntrega, comentarios: e.target.value })}
            sx={{ marginBottom: '1rem' }}
          />
          <input
            type="file"
            accept=".docx"
            onChange={handleFileChange}
            style={{ marginBottom: '1rem' }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              onClick={handleEditSubmit}
              sx={{ color: 'white', backgroundColor: 'green' }}
            >
              Guardar
            </Button>
            <Button onClick={handleCloseEditModal} sx={{ color: 'white', backgroundColor: 'gray' }}>
              Cancelar
            </Button>
          </Box>
        </Box>
      </Modal>
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirmar Eliminación"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Estás seguro de que deseas eliminar esta entrega? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} sx={{ color: 'gray' }}>
            Cancelar
          </Button>
          <Button onClick={handleDelete} sx={{ color: 'red' }} autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
      
    </Grid>
  );
};

export default EntregasTabletPage;
