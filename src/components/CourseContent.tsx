// CourseContent.tsx
import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, Button, Divider, Modal, TextField, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { getCourseContent, getCourses, getUserEntregas, submitFile, updateEntregaArchivo, getEntregaStatus, toggleEntregaStatus, addCourseWeek, updateWeek, deleteWeek,toggleWeekStatus,
  deleteCourse,
  updateCourse,
  addCourse,
  getCourseWeeks,
  getWeekFiles,
  addWeekFile,
  deleteFile,
} from '../api';
import { toast } from 'react-toastify';
import JSZip from 'jszip';
import mammoth from 'mammoth';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { useNavigate } from 'react-router-dom';
import habilitar from '../../public/img/habilitar.png';
import desabilitar from '../../public/img/desabilitar.png';
import { MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import editar from '../../public/img/editar.png';
import basura from '../../public/img/bote-de-basura.png';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestoreIcon from '@mui/icons-material/Restore';
import EngineeringIcon from '@mui/icons-material/Engineering'; // Ícono para PDF/PPTX
import DescriptionIcon from '@mui/icons-material/Description'; // Ícono para DOC/Word
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'; // Ícono para PDF

interface Archivo {
  id: number;
  nombre_archivo: string;
  archivo: string;
}

interface Semana {
  id: number;
  semana: string;
  archivos: Archivo[];
  is_enabled: boolean;
}

interface CourseContentProps {
  courseContents: Semana[];
  userRole: string;
  courseId: string; // Agregar esta propiedad

}

const CourseContent: React.FC<CourseContentProps> = ({ courseContents, userRole, courseId  }) => {
  const [weekFiles, setWeekFiles] = useState<{ [key: number]: Archivo[] }>({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ fileName: string; fileContent: string } | null>(null);
  const [docxContent, setDocxContent] = useState<string>('');
  const [editWeekModalOpen, setEditWeekModalOpen] = useState(false);
  const [selectedWeekId, setSelectedWeekId] = useState<number | null>(null);
  const [newFileData, setNewFileData] = useState<{ nombre_archivo: string; archivo: string }>({ nombre_archivo: '', archivo: '' });
  const [weekName, setWeekName] = useState('');
  const navigate = useNavigate();
  const [courseState, setCourseState] = useState<Semana[]>(courseContents);
  const [addWeekModalOpen, setAddWeekModalOpen] = useState(false);
  const [newWeekData, setNewWeekData] = useState({ semana: '', role: 'user' });
  const [weekToEdit, setWeekToEdit] = useState<Semana | null>(null);
  const [updatedWeekData, setUpdatedWeekData] = useState('');
  const [addFileModalOpen, setAddFileModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1); // Nivel de zoom inicial (1 = tamaño original)
  const [filter, setFilter] = useState<string | null>(null); // Estado para el filtro de archivos

  // Función para filtrar archivos según el tipo seleccionado
  const getFilteredFiles = (files: Archivo[]) => {
    if (!filter) return files; // Mostrar todos si no hay filtro
    if (filter === 'pdf-pptx') {
      return files.filter(
        (file) => file.nombre_archivo.endsWith('.pdf') || file.nombre_archivo.endsWith('.pptx')
      );
    }
    if (filter === 'doc') {
      return files.filter(
        (file) => file.nombre_archivo.endsWith('.doc') || file.nombre_archivo.endsWith('.docx')
      );
    }
    return files;
  };
  
// Función para alternar pantalla completa
const handleFullscreenToggle = () => {
  const modalElement = document.getElementById('preview-modal');
  if (!isFullscreen && modalElement) {
    modalElement.requestFullscreen().catch((err) => {
      console.error('Error al activar pantalla completa:', err);
    });
  } else if (isFullscreen && document.fullscreenElement) {
    document.exitFullscreen().catch((err) => {
      console.error('Error al salir de pantalla completa:', err);
    });
  }
};

const MIN_ZOOM = 0.1; // Zoom mínimo 10%
const MAX_ZOOM = 3.0; // Zoom máximo 300%
const ZOOM_STEP = 0.1; // Incremento de zoom

const handleZoomIn = () => {
  setZoomLevel((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM)); // Aumenta hasta el máximo
};

const handleZoomOut = () => {
  setZoomLevel((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM)); // Reduce hasta el mínimo
};

const handleRestoreZoom = () => {
  setZoomLevel(1); // Restaurar al 100%
};
useEffect(() => {
  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement); // Actualiza el estado automáticamente
  };

  document.addEventListener('fullscreenchange', handleFullscreenChange);
  return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
}, []);



    const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewFileData({
          nombre_archivo: file.name,
          archivo: reader.result.split(',')[1]
        });
      };
      reader.readAsDataURL(file);
    }
  };
  const handleFileNameChange = (event) => {
    setNewFileData({
      ...newFileData,
      nombre_archivo: event.target.value
    });
  };

  const handleAddWeekWithReset = async () => {
    if (!newWeekData.semana) {
      toast.error('Por favor, llena todos los campos.');
      return;
    }
  
    try {
      const newWeek = await addCourseWeek(courseId, newWeekData); // Asegúrate de que `courseId` se pase correctamente
      setCourseState((prevState) => [...prevState, newWeek]); // Actualiza el estado con la nueva semana
      toast.success('Semana agregada correctamente.');
      setAddWeekModalOpen(false);
      setNewWeekData({ semana: '', role: 'user' }); // Resetea el formulario
    } catch (error) {
      console.error('Error al agregar semana:', error);
      toast.error('Error al agregar semana.');
    }
  };
  

  const handleDeleteWeek = async (weekId: number) => {
    const confirmDelete = window.confirm('¿Seguro que quieres eliminar esta semana?');
    if (!confirmDelete) return;
  
    try {
      await deleteWeek(weekId); // Llama al API para eliminar la semana
  
      // Actualiza el estado local filtrando la semana eliminada
      setCourseState((prevState) => prevState.filter((week) => week.id !== weekId));
  
      toast.success('Semana eliminada correctamente.');
    } catch (error) {
      console.error('Error al eliminar semana:', error);
      toast.error('Error al eliminar semana.');
    }
  };
  
  useEffect(() => {
    setCourseState(courseContents);
  }, [courseContents]);

  useEffect(() => {
    courseContents.forEach(async (week) => {
      const files = await getWeekFiles(week.id);
      setWeekFiles((prev) => ({ ...prev, [week.id]: files }));
    });
  }, [courseContents]);

  const handleDeleteFile = async (fileId: number, weekId: number) => {
    if (!fileId) {
      toast.error('No se puede eliminar este archivo');
      return;
    }

    const confirmDelete = window.confirm('¿Seguro que quieres eliminar este archivo?');
    if (!confirmDelete) return;

    try {
      await deleteFile(fileId);
      setCourseState(prevContents => prevContents.map(week => {
        if (week.id === weekId) {
          return {
            ...week,
            archivos: week.archivos.filter(file => file.id !== fileId),
          };
        }
        return week;
      }));
      toast.success('Archivo eliminado correctamente.');
    } catch (error) {
      console.error('Error eliminando el archivo:', error);
      toast.error('Error al eliminar el archivo.');
    }
  };

  const handlePreview = async (fileName: string, fileContent: string) => {
    if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      const arrayBuffer = Uint8Array.from(atob(fileContent), (c) => c.charCodeAt(0)).buffer;
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setDocxContent(result.value);
    } else if (fileName.endsWith('.pdf')) {
      setPreviewFile({ fileName, fileContent });
    } else if (fileName.endsWith('.pptx')) {
      const zip = new JSZip();
      const content = await zip.loadAsync(fileContent, { base64: true });
      const slides = [];
      content.forEach((relativePath, file) => {
        if (relativePath.startsWith('ppt/slides/slide')) {
          file.async('string').then((text) => slides.push(`<div>${text}</div>`));
        }
      });
      setDocxContent(slides.join('') || '<p>No se pudieron extraer las diapositivas.</p>');
    } else {
      setDocxContent('<p>Formato de archivo no soportado para vista previa.</p>');
    }
    setPreviewOpen(true);
  };

  const handleAddFileToWeek = async () => {
    if (!selectedWeekId || !newFileData) return toast.error('Selecciona una semana y un archivo');
    try {
      await addWeekFile(selectedWeekId, newFileData);
      const updatedFiles = await getWeekFiles(selectedWeekId);
      setWeekFiles((prev) => ({ ...prev, [selectedWeekId]: updatedFiles }));
      setNewFileData({ nombre_archivo: '', archivo: '' });
      toast.success('Archivo agregado correctamente.');
    } catch (error) {
      toast.error('Error al agregar el archivo.');
    }
  };

  const handleAddFileWithReset = async () => {
    try {
      if (!selectedWeekId || !newFileData) {
        toast.error('Selecciona una semana y un archivo');
        return;
      }
      await addWeekFile(selectedWeekId, newFileData);
      // Actualiza los archivos de la semana seleccionada después de subir el archivo
      const updatedFiles = await getWeekFiles(selectedWeekId);
      setCourseState((prevContents) =>
        prevContents.map((week) =>
          week.id === selectedWeekId ? { ...week, archivos: updatedFiles } : week
        )
      );
      setNewFileData({ nombre_archivo: '', archivo: '' });
      setAddFileModalOpen(false);
      toast.success('Archivo agregado correctamente.');
    } catch (error) {
      console.error('Error al agregar el archivo:', error);
      toast.error('Error al agregar el archivo.');
    }
  };

  const handleEditWeek = (week: Semana) => {
    setWeekToEdit(week);
    setUpdatedWeekData(week.semana);
    setEditWeekModalOpen(true);
  };


  const handleSaveEditWeek = async () => {
    if (!weekToEdit) return;
    try {
      await updateWeek(weekToEdit.id, { semana: updatedWeekData });
      const updatedContents = courseContents.map(week =>
        week.id === weekToEdit.id ? { ...week, semana: updatedWeekData } : week
      );
      setCourseState(updatedContents);
      setEditWeekModalOpen(false);
      toast.success('Semana actualizada correctamente.');
    } catch (error) {
      console.error('Error updating week:', error);
      toast.error('Error actualizando la semana.');
    }
  };

  const handleToggleWeekStatus = async (weekId: number, currentStatus: boolean) => {
    const confirmToggle = window.confirm(`¿Seguro que quieres ${currentStatus ? 'deshabilitar' : 'habilitar'} esta semana?`);
    if (!confirmToggle) {
      return;
    }
  
    try {
      await toggleWeekStatus(weekId, !currentStatus); // Llama al API para cambiar el estado de la semana
  
      // Actualiza el estado localmente después de la operación exitosa
      setCourseState((prevState) =>
        prevState.map((week) =>
          week.id === weekId
            ? { ...week, is_enabled: !currentStatus } // Cambia el estado de la semana habilitada/deshabilitada
            : week
        )
      );
  
      toast.success(`Semana ${currentStatus ? 'deshabilitada' : 'habilitada'} correctamente.`);
    } catch (error) {
      console.error(`Error al ${currentStatus ? 'deshabilitar' : 'habilitar'} la semana:`, error);
      toast.error(`Error al ${currentStatus ? 'deshabilitar' : 'habilitar'} la semana.`);
    }
  };
  
  const handleDownloadFile = (fileName: string, fileContent: string) => {
    const link = document.createElement('a');
    link.href = `data:application/octet-stream;base64,${fileContent}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ mt: 4, width: '100%', mb: 6, height:'100%', padding:'15px' }}>

      <Typography variant="h5" sx={{ mb: 2, color: 'white', fontSize: '1.5rem' }}>Contenido del curso</Typography>
      <Grid xs={12} lg={12} sx={{ display:'flex', justifyContent:'center', gap:2, marginBottom:'1rem',padding:{xs:'0% 8%',md:'0%'}}} >
        {userRole === "admin" && (
          <Button
            variant="contained"
            color="primary"
            sx={{
              backgroundColor: '#1976d2',
              color: '#fff',
              '&:hover': { backgroundColor: '#115293' },
              padding: '8px 16px',
              fontSize: '14px',
              textTransform: 'none',
              borderRadius: '8px',
            }}
            onClick={() => navigate('/course-tablet')}
          >
            Administrar Semanas
          </Button>  
        )}
        {userRole === "admin" && (
          <Button 
            variant="contained" 
            onClick={() => setAddWeekModalOpen(true)}
            sx={{
              backgroundColor: '#9c27b0',
              color: '#fff',
              '&:hover': { backgroundColor: '#6a1b9a' },
              padding: '8px 16px',
              fontSize: '14px',
              textTransform: 'none',
              borderRadius: '8px',
                
            }}
            >
              Agregar semana del curso
          </Button>
        )}
      </Grid>
      {courseState
      .filter((content) => userRole === 'admin' || content.is_enabled)
      .map((content) => (
      <Accordion key={content.id} sx={{ mb: 3 }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
        sx={{ backgroundColor: '#E93845', color: 'white',  }}
      > 
        <Grid sx={{width:'100%',display:'flex',justifyContent:'space-between',  }}>
          <Typography>{content.semana}</Typography>
          {userRole === 'admin' && (
            <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
              <Button
                            
                            onClick={() => handleEditWeek(content)} 
                              style={{
                                  backgroundColor: 'rgb(33, 150, 243, 0.5)',
                                  color: 'white',
                                  borderRadius: '10px',
                                  height: '2.5rem',
                                  width: '20%',
                                  marginBottom: '0.5rem',
                                  '&:hover': {
                                    backgroundColor: 'green',
                                    opacity: 0.5,
                                  },
                                  fontSize: { lg: '12px', sm: '12px', md: '12px', xs: '9px' }
                                  
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(33, 150, 243)'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(33, 150, 243, 0.5)'}
                          >
                              <img src={editar} alt="editar curso" style={{ height: '1.5rem', width: '1.5rem' }} />
              </Button>
              <Button
                            onClick={() => handleDeleteWeek(content.id)} 
                            style={{
                              backgroundColor: 'red',
                              color: 'white',
                              borderRadius: '10px',
                              height: '2.5rem',
                              width: '20%',
                              '&:hover': {
                                backgroundColor: 'red',
                                opacity: 0.5,
                              },
                              fontSize: { lg: '12px', sm: '12px', md: '12px', xs: '9px' }
                            }}
                            
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,0,0)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,0,0,0.5)'}
                        >
                            <img src={basura} alt="Eliminar curso" style={{ height: '1.5rem', width: '1.5rem' }} />
              </Button>
              <Button
                onClick={() => handleToggleWeekStatus(content.id, content.is_enabled)}
                sx={{ 
                  backgroundColor: content.is_enabled ? 'green' : 'gray',
                  color: 'white',
                  borderRadius: '10px',
                  height: '2.5rem',
                  width: '20%',
                  marginBottom: '0.5rem',
                  '&:hover': {
                    backgroundColor: content.is_enabled ? 'darkgreen' : 'darkgray',
                    opacity: 0.8,
                  }, 
                  fontSize: { lg: '12px', sm: '12px', md: '12px', xs: '9px' }
                }}
              >
                {content.is_enabled ? <img src={habilitar} alt="habilitar" style={{ height: '1.5rem', width: '1.5rem' }} /> : <img src={desabilitar} alt="desabilitar" style={{ height: '1.5rem', width: '1.5rem' }} />}
              </Button>
            </Box>
          )}
        </Grid>
      </AccordionSummary>
      <AccordionDetails sx={{ backgroundColor: '#f4f4f4', color: 'black' }}>
      {userRole === 'admin' && (
              <Button 
              variant="outlined" 
              onClick={() => {
                setSelectedWeekId(content.id);
                setAddFileModalOpen(true);
              }} 
              sx={{ mt: 2, color: 'black', borderColor: 'black' }}
            >
              Agregar Archivo a Semana
            </Button>
            )}
            {/* Barra de Íconos para Filtrar */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 2 }}>
              <IconButton
                onClick={() => setFilter(filter === 'pdf-pptx' ? null : 'pdf-pptx')}
                sx={{ color: filter === 'pdf-pptx' ? 'primary.main' : 'black' }}
              >
                <PictureAsPdfIcon />
              </IconButton>
              <IconButton
                onClick={() => setFilter(filter === 'doc' ? null : 'doc')}
                sx={{ color: filter === 'doc' ? 'primary.main' : 'black' }}
              >
                <DescriptionIcon />
              </IconButton>
              <IconButton
                onClick={() => setFilter(filter === 'mp4' ? null : 'mp4')}
                sx={{ color: filter === 'mp4' ? 'primary.main' : 'black' }}
              >
                <EngineeringIcon />
              </IconButton>
            </Box>

            {/* Lista de Archivos Filtrados */}
            {getFilteredFiles(weekFiles[content.id] || []).map((archivo) => (
              <React.Fragment key={archivo.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Button
                    onClick={() => handlePreview(archivo.nombre_archivo, archivo.archivo)}
                    sx={{ flex: 1, justifyContent: 'flex-start' }}
                  >
                    {archivo.nombre_archivo}
                  </Button>
                  <IconButton
                    onClick={() => handleDownloadFile(archivo.nombre_archivo, archivo.archivo)}
                    sx={{ ml: 1 }}
                  >
                    <FileDownloadIcon />
                  </IconButton>
                  {userRole === 'admin' && (
                    <Button onClick={() => handleDeleteFile(archivo.id, content.id)} sx={{ color: 'red' }}>
                      Eliminar
                    </Button>
                  )}
                </Box>
                <Divider sx={{ borderColor: 'black', my: 0.5 }} />
              </React.Fragment>
            ))}
      </AccordionDetails>
      </Accordion>
      ))}
      
      
      {/* Modal for previewing files */}
       {/* Modal for previewing files */}
       <Modal open={previewOpen} onClose={() => setPreviewOpen(false)}>
  <Box
    id="preview-modal"
    sx={{
      width: isFullscreen ? '100%' : '80%',
      height: isFullscreen ? '100%' : '80%',
      position: isFullscreen ? 'fixed' : 'relative',
      top: isFullscreen ? 0 : '50%',
      left: isFullscreen ? 0 : '50%',
      transform: isFullscreen ? 'none' : 'translate(-50%, -50%)',
      overflow: 'hidden',
      backgroundColor: 'white',
    }}
  >
    {/* Controles de pantalla completa y zoom */}
    <Box
      sx={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1000,
        display: 'flex',
        gap: 1,
      }}
    >
      <IconButton onClick={handleZoomIn} color="primary" disabled={zoomLevel >= MAX_ZOOM}>
        <ZoomInIcon />
      </IconButton>
      <IconButton onClick={handleRestoreZoom} color="primary">
        <RestoreIcon />
      </IconButton>
      <IconButton onClick={handleFullscreenToggle} color="primary">
        {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
      </IconButton>
    </Box>

    {/* Indicador de nivel de zoom */}
    <Box
      sx={{
        position: 'absolute',
        bottom: 10,
        left: 10,
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '5px',
      }}
    >
      <Typography variant="body2">{Math.round(zoomLevel * 100)}%</Typography>
    </Box>

    {/* Contenido del PDF */}
    <Worker workerUrl="/pdf.worker.min.js">
      <Viewer
        key={`${zoomLevel}-${isFullscreen}`} // Forzar re-renderizado
        fileUrl={`data:application/pdf;base64,${previewFile?.fileContent}`}
        scale={zoomLevel} // Escalado dinámico
      />
    </Worker>

    {/* Botón para cerrar */}
    <Button
      variant="contained"
      onClick={() => setPreviewOpen(false)}
      sx={{ position: 'absolute', bottom: 10, right: 10 }}
    >
      Cerrar Vista Previa
    </Button>
  </Box>
</Modal>

      {/* Modal for editing week name */}
      <Modal
        open={editWeekModalOpen}
        onClose={() => setEditWeekModalOpen(false)}
        aria-labelledby="edit-week-modal-title"
        aria-describedby="edit-week-modal-description"
      >
        <Box sx={{ ...modalStyle }}>
          <Typography id="edit-week-modal-title" variant="h6" component="h2">
            Editar Semana
          </Typography>
          <TextField
            fullWidth
            label="Semana"
            value={updatedWeekData}
            onChange={(e) => setUpdatedWeekData(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Button variant="contained" onClick={handleSaveEditWeek} sx={{ mt: 2 }}>Guardar Cambios</Button>
        </Box>
      </Modal>

      {/* Modal for adding file */}
      <Modal
        open={addFileModalOpen}
        onClose={() => setAddFileModalOpen(false)}
        aria-labelledby="add-file-modal-title"
        aria-describedby="add-file-modal-description"
      >
        <Box sx={{ ...modalStyle }}>
          <Typography id="add-file-modal-title" variant="h6" component="h2">
            Agregar Archivo a Semana
          </Typography>
          <TextField
            label="Nombre del Archivo"
            value={newFileData.nombre_archivo}
            onChange={handleFileNameChange}
            fullWidth
            margin="normal"
          />
          <input  
            type="file"
            accept=".docx,.pdf,.pptx"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button variant="contained" component="span" sx={{ mt: 2 }}>
              Seleccionar Archivo
            </Button>
          </label>
          {newFileData.nombre_archivo && (
            <Typography sx={{ mt: 2 }}>{newFileData.nombre_archivo}</Typography>
          )}
          <Button 
            variant="contained" 
            onClick={handleAddFileWithReset} 
            sx={{ mt: 2 }}
          >
            Subir Archivo
          </Button>
        </Box>
      </Modal>
      <Modal
  open={addWeekModalOpen}
  onClose={() => setAddWeekModalOpen(false)}
  aria-labelledby="add-week-modal-title"
  aria-describedby="add-week-modal-description"
>
  <Box sx={{ ...modalStyle }}>
    <Typography id="add-week-modal-title" variant="h6" component="h2">
      Agregar Semana del Curso
    </Typography>
    <TextField
      fullWidth
      label="Semana"
      value={newWeekData.semana}
      onChange={(e) => setNewWeekData({ ...newWeekData, semana: e.target.value })}
      sx={{ mt: 2 }}
    />
    <Select
      labelId="role-select-label"
      id="role-select"
      value={newWeekData.role}
      onChange={(e) => setNewWeekData({ ...newWeekData, role: e.target.value })}
      fullWidth
      sx={{ mt: 2 }}
    >
      <MenuItem value={'admin'}>Docente</MenuItem>
      <MenuItem value={'user'}>Estudiante</MenuItem>
    </Select>
    <Button variant="contained" onClick={handleAddWeekWithReset} sx={{ mt: 2 }}>
      Agregar
    </Button>
  </Box>
</Modal>

    </Box>
  );
};

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: '80%', md: '60%' },
  maxWidth: '600px',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: { xs: 2, sm: 3, md: 4 },
  maxHeight: '90vh',
  overflowY: 'auto',
};

export default CourseContent;
  
