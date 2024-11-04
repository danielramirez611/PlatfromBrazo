import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Accordion from '@mui/material/Accordion';
import { MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Divider from '@mui/material/Divider';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getCourseContent, getCourses, getUserEntregas, submitFile, updateEntregaArchivo, getEntregaStatus, toggleEntregaStatus, addCourseWeek, updateWeek, deleteWeek,toggleWeekStatus,
  deleteCourse,
  updateCourse,
  addCourse,
  getCourseWeeks,
  getWeekFiles,
  addWeekFile,
  deleteFile,
} from '../api';
import './../pages/Courses/Style.css';
import { useAuth } from '../pages/Auth/AuthContext';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import mammoth from 'mammoth';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';

import editar from '../../public/img/editar.png';
import basura from '../../public/img/bote-de-basura.png';
import habilitar from '../../public/img/habilitar.png';
import desabilitar from '../../public/img/desabilitar.png';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface CourseDetailParams {
  id: string;
}

interface Archivo {
  nombre_archivo: string;
  archivo: string;
}

interface Semana {
  id: number;
  semana: string;
  archivos: Archivo[];
  is_enabled: boolean;
}

interface Entrega {
  id: number;
  usuario_id: number;
  archivo: string;
  descripcion: string;
  comentarios: string;
  created_at: string;
}

const CourseDetail: React.FC = () => {
  const { id } = useParams<CourseDetailParams>();
  const location = useLocation<{ title: string, image: string }>();
  const { user } = useAuth();
  const theme = useTheme();

  const isSmallOrMediumScreen = useMediaQuery(theme.breakpoints.down('md'));

  const [courseContents, setCourseContents] = useState<Semana[]>([]);
  const [courseInfo, setCourseInfo] = useState<{ introduction: string, objetivos_especificos: string } | null>(null);
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [comments, setComments] = useState('');
  const [editEntrega, setEditEntrega] = useState<Entrega | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ fileName: string, fileContent: string } | null>(null);
  const [docxContent, setDocxContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const [introductionOpen, setIntroductionOpen] = useState(false);
  const [objectivesOpen, setObjectivesOpen] = useState(false);
  
  const [entregaHabilitada, setEntregaHabilitada] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [addWeekModalOpen, setAddWeekModalOpen] = useState(false);
  const [newWeekData, setNewWeekData] = useState({ semana: '', role: 'user' });
  const [weekToEdit, setWeekToEdit] = useState<Semana | null>(null);
  const [updatedWeekData, setUpdatedWeekData] = useState('');
  const [editWeekModalOpen, setEditWeekModalOpen] = useState(false);
  const [addFileModalOpen, setAddFileModalOpen] = useState(false);
  const [newFileData, setNewFileData] = useState({ nombre_archivo: '', archivo: '' });
  const [selectedWeekId, setSelectedWeekId] = useState(null);


  const formatTextWithLineBreaks = (text: string) => {
    return text.split('\n').map((str, index) => (
      <Typography key={index} variant="body1" sx={{ mb: 2, color: 'black', fontSize: '1.2rem' }}>
        {str}
      </Typography>
    ));
  };
  
  const handleDeleteFile = async (fileId: number, weekId: number) => {
    if (!fileId) {
      toast.error('No se puede eliminar este archivo');
      return;
    }

    const confirmDelete = window.confirm('¿Seguro que quieres eliminar este archivo?');
    if (!confirmDelete) return;

    try {
      await deleteFile(fileId);
      setCourseContents(prevContents => prevContents.map(week => {
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

  const fetchCourseContentsAndFiles = async () => {
    try {
      const courseContents = await getCourseContent(id, user?.role);
      setCourseContents(courseContents.filter((week) => week.is_enabled));

      const filesData = {};
      for (const week of courseContents) {
        const weekFiles = await getWeekFiles(week.id);
        filesData[week.id] = weekFiles;
      }
      setCourseContents(prev => prev.map(week => ({
        ...week,
        archivos: filesData[week.id] || []
      })));
    } catch (error) {
      console.error('Error fetching course contents and files:', error);
      toast.error('Error fetching course contents and files');
    } finally {
      setLoading(false);
    }
  };

  
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
  
  const handleAddFileWithReset = async () => {
    try {
      if (!selectedWeekId || !newFileData) {
        toast.error('Selecciona una semana y un archivo');
        return;
      }
      await addWeekFile(selectedWeekId, newFileData);
      // Actualiza los archivos de la semana seleccionada después de subir el archivo
      const updatedFiles = await getWeekFiles(selectedWeekId);
      setCourseContents((prevContents) =>
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

  const handleDeleteWeek = async (weekId: number) => {
    try {
      await deleteWeek(weekId);
      setCourseContents(courseContents.filter((week) => week.id !== weekId));
      toast.success('Semana eliminada correctamente.');
    } catch (error) {
      console.error('Error al eliminar semana:', error);
      toast.error('Error al eliminar semana.');
    }
  };
  const handleToggleWeek = async (weekId, currentStatus) => {
  const confirmToggle = window.confirm(`¿Seguro que quieres ${currentStatus ? 'deshabilitar' : 'habilitar'} esta semana?`);
  if (!confirmToggle) {
    return;
  }

  try {
    await toggleWeekStatus(weekId, !currentStatus);
    const updatedContents = courseContents.map(week =>
      week.id === weekId ? { ...week, is_enabled: !currentStatus } : week
    );
    
    // Filtrar semanas solo para usuarios normales
    if (user?.role !== 'admin') {
      setCourseContents(updatedContents.filter(week => week.is_enabled));
    } else {
      setCourseContents(updatedContents);
    }
    
    toast.success(`Semana ${currentStatus ? 'deshabilitada' : 'habilitada'} correctamente.`);
  } catch (error) {
    console.error(`Error al ${currentStatus ? 'deshabilitar' : 'habilitar'} la semana:`, error);
    toast.error(`Error al ${currentStatus ? 'deshabilitar' : 'habilitar'} la semana.`);
  }
};
  
  const handleAddWeekWithReset = async () => {
    if (!id || !newWeekData.semana || !newWeekData.role) {
      toast.error('Por favor, llena todos los campos.');
      return;
    }
    try {
      await addCourseWeek(id, newWeekData);
      toast.success('Semana agregada correctamente.');
      setAddWeekModalOpen(false);
      setNewWeekData({ semana: '', role: 'user' }); // Resetea el formulario
    } catch (error) {
      console.error('Error al agregar semana:', error);
      toast.error('Error al agregar semana.');
    }
  };

  const handleSaveEditWeek = async () => {
    if (!weekToEdit) return;
    try {
      await updateWeek(weekToEdit.id, { semana: updatedWeekData });
      const updatedContents = courseContents.map(week =>
        week.id === weekToEdit.id ? { ...week, semana: updatedWeekData } : week
      );
      setCourseContents(updatedContents);
      setEditWeekModalOpen(false);
      toast.success('Semana actualizada correctamente.');
    } catch (error) {
      console.error('Error updating week:', error);
      toast.error('Error actualizando la semana.');
    }
  };

  useEffect(() => {
    const fetchCourseContents = async () => {
      try {
        const response = await getCourseContent(id, user?.role);
        console.log("Course Contents:", response);
        
        // Mostrar todas las semanas si el usuario es administrador
        if (user?.role === 'admin') {
          setCourseContents(response);
        } else {
          // Filtrar semanas según su estado para usuarios normales
          setCourseContents(response.filter(week => week.is_enabled));
        }
      } catch (error) {
        console.error('Error fetching course contents:', error);
        toast.error('Error fetching course contents');
      } finally {
        setLoading(false);
      }
    };

    const fetchCourseInfo = async () => {
      try {
        const response = await getCourses();
        const course = response.find((course) => course.id.toString() === id);
        setCourseInfo(course ? { introduction: course.introduction, objetivos_especificos: course.objetivos_especificos } : null);
      } catch (error) {
        console.error('Error fetching course info:', error);
        toast.error('Error fetching course info');
      }
    };

    const fetchUserEntregas = async () => {
      if (user) {
        try {
          const response = await getUserEntregas(user.id);
          setEntregas(response);
        } catch (error) {
          console.error('Error fetching user deliveries:', error);
          toast.error('Error fetching user deliveries');
        }
      }
    };

    const fetchEntregaStatus = async () => {
      try {
        const response = await getEntregaStatus();
        setEntregaHabilitada(response.isEnabled);
        setStartTime(response.startTime || '');
        setEndTime(response.endTime || '');
      } catch (error) {
        console.error('Error fetching entrega status:', error);
        toast.error('Error fetching entrega status');
      }
    };
    fetchCourseContentsAndFiles();

    fetchCourseContents();
    fetchCourseInfo();
    fetchUserEntregas();
    fetchEntregaStatus();
  }, [id, user]);

  useEffect(() => {
    if (entregaHabilitada && endTime) {
      const now = new Date();
      const endDate = new Date(endTime);
      if (now >= endDate) {
        setEntregaHabilitada(false);
        toast.info('La habilitación de la entrega ha finalizado.');
      }
    }
  }, [endTime, entregaHabilitada]);

  const { title, image } = location.state || { title: 'Curso no encontrado', image: '' };


const handlePreview = async (fileName: string, fileContent: string) => {
    if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
        const arrayBuffer = Uint8Array.from(atob(fileContent), c => c.charCodeAt(0)).buffer;
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setDocxContent(result.value);
        setPreviewFile({ fileName, fileContent });
    } else if (fileName.endsWith('.pdf')) {
        setPreviewFile({ fileName, fileContent });
    } else if (fileName.endsWith('.pptx')) {
        const zip = new JSZip();
        try {
            const content = await zip.loadAsync(fileContent, { base64: true });

            const slides = [];
            const imagePromises = [];

            content.forEach((relativePath, file) => {
                if (relativePath.startsWith('ppt/slides/slide')) {
                    imagePromises.push(file.async('string').then((text) => {
                        slides.push(`<div>${text}</div>`);
                    }));
                }
            });

            await Promise.all(imagePromises);

            if (slides.length > 0) {
                setDocxContent(slides.join(''));
            } else {
                setDocxContent('<p>No se pudieron extraer las diapositivas.</p>');
            }

            setPreviewFile({ fileName, fileContent });
        } catch (error) {
            console.error("Error al procesar el archivo .pptx:", error);
            setDocxContent('<p>Error al intentar extraer las diapositivas.</p>');
            setPreviewFile({ fileName, fileContent });
        }
    } else {
        setDocxContent('<p>Formato de archivo no soportado para vista previa. Puedes descargar el archivo.</p>');
        setPreviewFile({ fileName, fileContent });
    }

    setPreviewOpen(true);
};


const handleDownload = (fileName: string, fileContent: string) => {
  let mimeType = '';
  if (fileName.endsWith('.pdf')) {
      mimeType = 'application/pdf';
  } else if (fileName.endsWith('.docx')) {
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  } else if (fileName.endsWith('.pptx')) {
      mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
  } else {
      mimeType = 'application/octet-stream';
  }

  const link = document.createElement('a');
  link.href = `data:${mimeType};base64,${fileContent}`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleEditOpen = (entrega: Entrega) => {
    setEditEntrega(entrega);
    setDescription(entrega.descripcion);
    setComments(entrega.comentarios);
    setEditOpen(true);
  };
  const handleEditClose = () => setEditOpen(false);

  const handleIntroductionOpen = () => setIntroductionOpen(true);
  const handleIntroductionClose = () => setIntroductionOpen(false);

  const handleObjectivesOpen = () => setObjectivesOpen(true);
  const handleObjectivesClose = () => setObjectivesOpen(false);

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    const fileReader = new FileReader();
    fileReader.onloadend = async () => {
      const base64File = fileReader.result?.toString().split(',')[1];

      if (base64File && user) {
        try {
          await submitFile({
            usuario_id: user.id,
            archivo: base64File,
            descripcion: description,
            comentarios: comments
          });
          toast.success('File submitted successfully');
          handleClose();
        } catch (error) {
          console.error('Error submitting file:', error);
          toast.error('Error submitting file');
        }
      }
    };

    fileReader.readAsDataURL(file);
  };

  const handleEditSubmit = async () => {
    if (!editEntrega) return;
    const fileReader = new FileReader();
    fileReader.onloadend = async () => {
      const base64File = fileReader.result?.toString().split(',')[1] || editEntrega.archivo;
      try {
        await updateEntregaArchivo(editEntrega.id, {
          archivo: base64File,
          descripcion: description,
          comentarios: comments
        });
        toast.success('File updated successfully');
        handleEditClose();
      } catch (error) {
        console.error('Error updating file:', error);
        toast.error('Error updating file');
      }
    };
    if (file) {
      fileReader.readAsDataURL(file);
    } else {
      fileReader.onloadend(null);
    }
  };

  const toggleEntrega = async () => {
    try {
      const newStatus = !entregaHabilitada;
      await toggleEntregaStatus(newStatus, startTime, endTime);
      setEntregaHabilitada(newStatus);
      toast.success(`Entrega ${newStatus ? 'habilitada' : 'deshabilitada'} exitosamente`);
    } catch (error) {
      console.error('Error updating entrega status:', error);
      toast.error('Error updating entrega status');
    }
  };

  return (
    <Container className='vv'>
      <Grid container spacing={4} alignItems="flex-start" sx={{width:{lg:'100%'}}} >
        {isSmallOrMediumScreen && (
          <>
            <Grid item xs={12}  className='detalleCurso'>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10px' }}>
                <div style={{ position: 'relative', textAlign: 'center', overflow: 'hidden', padding: '32px' }}>
                  <img 
                    src={`data:image/jpeg;base64,${location.state?.image}`} 
                    alt={location.state?.title} 
                    style={{
                            width: '100%', height: '100%', maxHeight: '330px',  minHeight: '330px', 
                            objectFit: 'cover', filter: 'brightness(0.7)', borderRadius: '12px' 
                          }} 
                  />
                  <div style={{position: 'absolute', top: 0, left: 0, width: '100%',height: '100%', 
                                display: 'flex', flexDirection: 'column', justifyContent: 'center', 
                                alignItems: 'center', color: 'white', 
                              }}>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontSize: {
                          xs: '1.2rem',    // smaller font on mobile
                          sm: '1.3rem',    // medium font on tablet
                          md: '1.5rem'     // larger font on desktop
                        },
                        mb: 2, 
                        color: 'white' 
                      }}
                    >
                      {location.state?.title}
                    </Typography>
                    
                  </div>
                </div>
              </Box>
              
            </Grid>
            <Grid item xs={12} className='Intro' sx={{display:{sm:'flex',}, justifyContent:{sm:'space-evenly'},width:'100%'}}>
              
                <Box sx={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', mt: 4 }}>
                    <Button variant="contained" onClick={handleIntroductionOpen} sx={{ mt: 2 }}>Ver Introducción</Button>
                  
                    <Modal
                      open={introductionOpen}
                      onClose={handleIntroductionClose}
                      aria-labelledby="introduction-modal-title"
                      aria-describedby="introduction-modal-description"
                    >
                      <Box sx={{ ...modalStyle }}>
                        <Typography variant="h5" sx={{ mb: 2, color: 'black', fontSize: '1.5rem' }} id="introduction-modal-title">
                          Introducción
                        </Typography>
                        <Box sx={{ maxHeight: '150px', overflowY: 'auto' }} id="introduction-modal-description">
                          <Typography variant="body1" sx={{ mb: 4, color: 'black', fontSize: '1.2rem', textAlign: 'left', overflowWrap: 'break-word' }}>
                            {courseInfo?.introduction}
                          </Typography>
                        </Box>
                        <Button variant="contained" onClick={handleIntroductionClose} sx={{ mt: 2 }}>Cerrar</Button>
                      </Box>
                    </Modal>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
                  <Button variant="contained" onClick={handleObjectivesOpen} sx={{ mt: 2 }}>Ver Objetivos Específicos</Button>
                  <Modal
                    open={objectivesOpen}
                    onClose={handleObjectivesClose}
                    aria-labelledby="objectives-modal-title"
                    aria-describedby="objectives-modal-description"
                  >
                    <Box sx={{ ...modalStyle }}>
                      <Typography variant="h5" sx={{ mb: 2, color: 'black', fontSize: '1.5rem' }} id="objectives-modal-title">
                        Objetivos Específicos
                      </Typography>
                      <Box sx={{ maxHeight: '150px', overflowY: 'auto' }} id="objectives-modal-description">
                        {courseInfo?.objetivos_especificos && formatTextWithLineBreaks(courseInfo.objetivos_especificos)}
                      </Box>
                      <Button variant="contained" onClick={handleObjectivesClose} sx={{ mt: 2 }}>Cerrar</Button>
                    </Box>
                  </Modal>


                  </Box>

            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mt: 4, width: '100%', mb: 6 }}>
                <Typography variant="h5" sx={{ mb: 2, color: 'white', fontSize: '1.5rem' }}>
                  Contenido del curso
                </Typography>
                {loading ? (
                <Typography variant="h6" sx={{ mt: 2, color: 'white' }}>
                  Cargando...
                </Typography>
        ) : (
          courseContents.length > 0 ? (
            courseContents.map((content, index) => (
              <Accordion key={content.id} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />} sx={{ backgroundColor: '#E93845', color: 'white' }}>
                  <Typography>{content.semana}</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                  {user?.role === 'admin' && (

                    <Button 
                        variant="outlined" 
                        onClick={() => handleEditWeek(content)} 
                        sx={{ color: 'white', borderColor: 'white' }}>
                        Editar Semana
                    </Button>
                  )}
                  {user?.role === 'admin' && (
                    <Button
                    onClick={() => handleDeleteWeek(content.id)} 
                    style={{
                        marginTop: '10px',
                        marginRight:'10px',
                        backgroundColor: 'rgb(255,0,0,0.5)',
                        color: 'white',
                        borderRadius: '10px',
                        padding: '8px 16px',
                        textDecoration: 'none',
                        fontSize: '13px',
                    }}
                    
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,0,0)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,0,0,0.5)'}
                >
                    <img src={basura} alt="eliminar semana" style={{ height: '1.5rem', width: '1.5rem' }} />
                </Button>
                  )}
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ backgroundColor: '#FFFFFF', color: 'black' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  {content.archivos.map((archivo) => (
                    <React.Fragment key={archivo.id}>
                      <Button startIcon={<FileDownloadIcon />} onClick={() => handlePreview(archivo.nombre_archivo, archivo.archivo)} sx={{ justifyContent: 'flex-start' }}>
                        {archivo.nombre_archivo}
                      </Button>
                      {user?.role === 'admin' && (
                        <Button 
                          onClick={() => handleDeleteFile(archivo.id, content.id)} 
                          sx={{ marginLeft: 2, color: 'red' }}
                        >
                          Eliminar
                        </Button>
                      )}
                      <Divider sx={{ borderColor: 'black', my: 0.5 }} />
                    </React.Fragment>
                  ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Typography variant="h6" sx={{ mt: 2, color: 'white' }}>
              No hay contenido disponible.
            </Typography>
          )
        )}
              </Box>
              {entregaHabilitada && (
                <Button variant="contained" onClick={handleOpen} sx={{ mt: 2 }}>Entregar Archivo</Button>
              )}
              
              <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
              >
                <Box sx={{ ...modalStyle }}>
                  <Typography id="modal-modal-title" variant="h6" component="h2">
                    Entregar Archivo
                  </Typography>
                  <input  
                    type="file"
                    accept=".docx,.pdf,.pptx"
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Nombre del archivo"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    sx={{ mt: 2 }}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Comentarios"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    sx={{ mt: 2 }}
                  />
                  <Button variant="contained" onClick={handleSubmit} sx={{ mt: 2 }}>Entregar</Button>
                </Box>
              </Modal>

            </Grid>
            <Grid item xs={12} className='Intro'>
              <Box sx={{ width: '100%', mt: 4, mb: 4 }}>
                <Typography variant="h5" sx={{ mb: 2, color: 'white', fontSize: '1.5rem' }}>
                  Entregas
                </Typography>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />} sx={{ backgroundColor: '#E93845', color: 'white' }}>
                    <Typography>Ver Entregas</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ backgroundColor: '#FFFFFF', color: 'black', maxHeight: 300, overflowY: 'auto' }}>
                    {entregas.length > 0 ? (
                      entregas.map((entrega) => (
                        <Box key={entrega.id} sx={{ backgroundColor: '#E93845', color: 'white', borderRadius: '8px', p: 2, mb: 2 }}>
                          <Typography variant="h6">¡Entregado!</Typography>
                          <Typography>Fecha de entrega: {new Date(entrega.created_at).toLocaleString()}</Typography>
                          <Button 
                            onClick={() => handleDownload(entrega.descripcion, entrega.archivo)} 
                            sx={{ color: 'white', textDecoration: 'underline', padding: 0, mb: 1 }}
                          >
                            Descargar {entrega.descripcion}
                          </Button>
                          <Typography variant="body1">Comentarios: {entrega.comentarios || 'No hay comentarios'}</Typography>
                          <Button variant="outlined" onClick={() => handleEditOpen(entrega)} sx={{ mt: 2, color: 'white', borderColor: 'white' }}>
                            Editar
                          </Button>
                        </Box>
                      ))
                    ) : (
                      <Typography>No hay entregas</Typography>
                    )}
                  </AccordionDetails>
                </Accordion>
              </Box>
            </Grid>
          </>
        )}
        {!isSmallOrMediumScreen && (
          <>
            <Grid item xs={12} md={12} className='detalleCurso'>
            <Box sx={{ alignItems: 'center', marginTop: '10px' }}>
                <div style={{ position: 'relative', textAlign: 'center', overflow: 'hidden', padding: '32px',marginLeft:'5%' }}>
                  <img 
                    src={`data:image/jpeg;base64,${location.state?.image}`} 
                    alt={location.state?.title} 
                    style={{
                            width: '100%', height: '100%', maxHeight: '330px',  minHeight: '330px', 
                            objectFit: 'cover', filter: 'brightness(0.7)', borderRadius: '12px' 
                          }} 
                  />
                  <div style={{position: 'absolute', top: 0, left: 0, width: '100%',height: '100%', 
                                display: 'flex', flexDirection: 'column', justifyContent: 'center', 
                                alignItems: 'center', color: 'white', 
                              }}>
                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', textTransform: 'uppercase' }}>
                      {location.state?.title}
                    </Typography>
                  </div>
                </div>
              </Box>
              
            </Grid>
            <Grid item xs={12} className='Intro' sx={{display:{sm:'flex',}, justifyContent:{sm:'space-evenly'},width:'100%'}}>
              
                <Box sx={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', mt: 4 }}>
                    <Button variant="contained" onClick={handleIntroductionOpen} sx={{ mt: 2 }}>Ver Introducción</Button>
                  
                    <Modal
                      open={introductionOpen}
                      onClose={handleIntroductionClose}
                      aria-labelledby="introduction-modal-title"
                      aria-describedby="introduction-modal-description"
                    >
                      <Box sx={{ ...modalStyle }}>
                        <Typography variant="h5" sx={{ mb: 2, color: 'black', fontSize: '1.5rem' }} id="introduction-modal-title">
                          Introducción
                        </Typography>
                        <Box sx={{ maxHeight: '150px', overflowY: 'auto' }} id="introduction-modal-description">
                          <Typography variant="body1" sx={{ mb: 4, color: 'black', fontSize: '1.2rem', textAlign: 'left', overflowWrap: 'break-word' }}>
                            {courseInfo?.introduction}
                          </Typography>
                        </Box>
                        <Button variant="contained" onClick={handleIntroductionClose} sx={{ mt: 2 }}>Cerrar</Button>
                      </Box>
                    </Modal>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
                  <Button variant="contained" onClick={handleObjectivesOpen} sx={{ mt: 2 }}>Ver Objetivos Específicos</Button>
                  <Modal
                    open={objectivesOpen}
                    onClose={handleObjectivesClose}
                    aria-labelledby="objectives-modal-title"
                    aria-describedby="objectives-modal-description"
                  >
                    <Box sx={{ ...modalStyle }}>
                      <Typography variant="h5" sx={{ mb: 2, color: 'black', fontSize: '1.5rem' }} id="objectives-modal-title">
                        Objetivos Específicos
                      </Typography>
                      <Box sx={{ maxHeight: '150px', overflowY: 'auto' }} id="objectives-modal-description">
                        {courseInfo?.objetivos_especificos && formatTextWithLineBreaks(courseInfo.objetivos_especificos)}
                      </Box>
                      <Button variant="contained" onClick={handleObjectivesClose} sx={{ mt: 2 }}>Cerrar</Button>
                    </Box>
                  </Modal>


                  </Box>

            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mt: 4, width: '100%', mb: 6 }}>
                <Typography variant="h5" sx={{ mb: 2, color: 'white', fontSize: '1.5rem' }}>
                  Contenido del curso
                </Typography>
                {loading ? (
                <Typography variant="h6" sx={{ mt: 2, color: 'white' }}>
                  Cargando...
                </Typography>
                ) : (
                  courseContents.map((content, index) => (
                    <Accordion key={content.id} sx={{ mb: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />} sx={{ backgroundColor: '#E93845', color: 'white' }}>
                        <Typography>{content.semana}</Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                        {user?.role === 'admin' && (
                          <Button
                          
                          onClick={() => handleEditWeek(content)} 
                            style={{
                                marginRight:'5px',
                                backgroundColor: 'rgb(33, 150, 243, 0.5)',
                                color: 'white',
                                borderRadius: '10px',
                                padding: '8px 16px',
                                textDecoration: 'none',
                                fontSize: '13px',
                                transition: 'background-color 0.3s ease',
                                
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(33, 150, 243)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(33, 150, 243, 0.5)'}
                        >
                            <img src={editar} alt="editar curso" style={{ height: '1.5rem', width: '1.5rem' }} />
                        </Button>
                        )}
                        {user?.role === 'admin' && (
                          <Button
                          onClick={() => handleDeleteWeek(content.id)} 
                          style={{
                              marginRight:'10px',
                              backgroundColor: 'rgb(255,0,0,0.5)',
                              color: 'white',
                              borderRadius: '10px',
                              padding: '8px 16px',
                              textDecoration: 'none',
                              fontSize: '13px',
                          }}
                          
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,0,0)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,0,0,0.5)'}
                      >
                          <img src={basura} alt="eliminar semana" style={{ height: '1.5rem', width: '1.5rem' }} />
                      </Button>
                        )}
                        {user?.role === 'admin' && (

                          <Button 
                            variant="outlined" 
                            onClick={() => handleToggleWeek(content.id, content.is_enabled)} 
                            sx={{ ml: 2, color: 'white', borderColor: 'rgb(0,0,0,0)',borderRadius: '10px',
                              height: '2.5rem',
                              width: '20%', }}>
                            {content.is_enabled ? <img src={habilitar} alt="habilitar" style={{ height: '100%', width: 'auto' }} /> : <img src={desabilitar} alt="Desabilitar" style={{ height: '100%', width: 'auto' }} />}
                          </Button>

                          
                        )}


                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ backgroundColor: '#FFFFFF', color: 'black' }}>
                      {user?.role === 'admin' && (
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
                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                            {content.archivos.map((archivo) => (
                              <React.Fragment key={archivo.id}>
                                <Button startIcon={<FileDownloadIcon />} onClick={() => handlePreview(archivo.nombre_archivo, archivo.archivo)} sx={{ justifyContent: 'flex-start' }}>
                                  {archivo.nombre_archivo}
                                </Button>
                                {user?.role === 'admin' && (

                                  <Button 
                                    onClick={() => handleDeleteFile(archivo.id, content.id)} 
                                    sx={{ marginLeft: 2, color: 'red' }}
                                  >
                                    Eliminar
                                  </Button>
                                  )}
                                <Divider sx={{ borderColor: 'black', my: 0.5 }} />
                              </React.Fragment>
                            ))}
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))
                )}
              </Box>
              {entregaHabilitada && (
                <Button variant="contained" onClick={handleOpen} sx={{ mt: 2 }}>Entregar Archivo</Button>
              )}
              
              <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
              >
                <Box sx={{ ...modalStyle }}>
                  <Typography id="modal-modal-title" variant="h6" component="h2">
                    Entregar Archivo
                  </Typography>
                  <input  
                    type="file"
                    accept=".docx,.pdf,.pptx"
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Nombre del archivo"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    sx={{ mt: 2 }}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Comentarios"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    sx={{ mt: 2 }}
                  />
                  <Button variant="contained" onClick={handleSubmit} sx={{ mt: 2 }}>Entregar</Button>
                </Box>
              </Modal>
            </Grid>
            <Grid item xs={12} md={5} className='Intro'>
              
              <Box sx={{ width: '100%', mt: 4, mb: 4 }}>
                <Typography variant="h5" sx={{ mb: 2, color: 'white', fontSize: '1.5rem' }}>
                  Entregas
                </Typography>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />} sx={{ backgroundColor: '#E93845', color: 'white' }}>
                    <Typography>Ver Entregas</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ backgroundColor: '#FFFFFF', color: 'black', maxHeight: 300, overflowY: 'auto' }}>
                    {entregas.length > 0 ? (
                      entregas.map((entrega) => (
                        <Box key={entrega.id} sx={{ backgroundColor: '#E93845', color: 'white', borderRadius: '8px', p: 2, mb: 2 }}>
                          <Typography variant="h6">¡Entregado!</Typography>
                          <Typography>Fecha de entrega: {new Date(entrega.created_at).toLocaleString()}</Typography>
                          <Button 
                            onClick={() => handleDownload(entrega.descripcion, entrega.archivo)} 
                            sx={{ color: 'white', textDecoration: 'underline', padding: 0, mb: 1 }}
                          >
                            Descargar {entrega.descripcion}
                          </Button>
                          <Typography variant="body1">Comentarios: {entrega.comentarios || 'No hay comentarios'}</Typography>
                          <Button variant="outlined" onClick={() => handleEditOpen(entrega)} sx={{ mt: 2, color: 'white', borderColor: 'white' }}>
                            Editar
                          </Button>
                        </Box>
                      ))
                    ) : (
                      <Typography>No hay entregas</Typography>
                    )}
                  </AccordionDetails>
                </Accordion>
              </Box>
                        
                        {user?.role === 'admin' && (

                        <Button variant="contained" onClick={() => setAddWeekModalOpen(true)} sx={{ mt: 2 }}>
                          Agregar semana del curso
                        </Button>
                        )}
      
            </Grid>
          </>
        )}
      </Grid>
      <ToastContainer />
      
      <Modal
        open={editOpen}
        onClose={handleEditClose}
        aria-labelledby="edit-modal-title"
        aria-describedby="edit-modal-description"
      >
        <Box sx={{ ...modalStyle }}>
          <Typography id="edit-modal-title" variant="h6" component="h2">
            Editar Entrega
          </Typography>
          <input 
            type="file"                   
            accept=".docx,.pdf,.pptx" 
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Nombre del archivo"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Comentarios"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Button variant="contained" onClick={handleEditSubmit} sx={{ mt: 2 }}>Guardar Cambios</Button>
        </Box>
      </Modal>
      <Modal
  open={previewOpen}
  onClose={() => setPreviewOpen(false)}
  aria-labelledby="preview-modal-title"
  aria-describedby="preview-modal-description"
>
  <Box sx={{ ...modalStyle, width: '80%', height: '80%' }}>
    
    {previewFile?.fileName.endsWith('.docx') ? (
      <Box dangerouslySetInnerHTML={{ __html: docxContent }} style={{ overflowY: 'auto', height: 'calc(100% - 50px)' }} />
    ) : previewFile?.fileName.endsWith('.pptx') ? (
      docxContent ? (
        <Box dangerouslySetInnerHTML={{ __html: docxContent }} style={{ overflowY: 'auto', height: 'calc(100% - 50px)' }} />
      ) : (
        <Typography variant="body1" sx={{ mb: 4 }}>
          No se pudieron extraer las diapositivas.
        </Typography>
      )
    ) : (
      <Worker workerUrl={pdfjsLib.GlobalWorkerOptions.workerSrc}>
        <Viewer
          fileUrl={`data:application/pdf;base64,${previewFile?.fileContent}`}
          style={{ width: '100%', height: 'calc(100% - 50px)' }}
        />
      </Worker>
    )}
    <Button variant="contained" onClick={() => handleDownload(previewFile!.fileName, previewFile!.fileContent)} sx={{ mt: 2 }}>
      Descargar
    </Button>
  
  </Box>
</Modal>
{/* Modales */}
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
        <Button variant="contained" onClick={handleAddWeekWithReset} sx={{ mt: 2 }}>Agregar</Button>

        </Box>
      </Modal>
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

      <Divider sx={{ borderColor: 'white', my: 2, mt:35 }} />
      <div style={{ textAlign: 'center', marginTop: '20px', marginBottom:'15px' }}>
        <p xmlns:cc="http://creativecommons.org/ns#" xmlns:dct="http://purl.org/dc/terms/" style={{ margin: 0, fontSize: '14px', color: '#555' }}>
          <a property="dct:title" rel="cc:attributionURL" href="https://github.com/danielramirez611/IMAYINER.git">IMAYINER-PROYECT-E-LEARNING</a> de 
          <a rel="cc:attributionURL dct:creator" property="cc:attributionName" href="mailto:imayinerproject@gmail.com"> Imayiner Project EIRL </a> tiene licencia <a></a> 
          <a href="https://creativecommons.org/licenses/by-nc/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style={{ marginLeft: '5px' }}>
            <img style={{ display: 'inline-block', width: '20px', height: '20px', marginRight: '5px' }} src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1" />
            <img style={{ display: 'inline-block', width: '20px', height: '20px', marginRight: '5px' }} src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1" />
            <img style={{ display: 'inline-block', width: '20px', height: '20px', marginRight: '5px' }} src="https://mirrors.creativecommons.org/presskit/icons/nc.svg?ref=chooser-v1" />
          </a> 
          <a href="https://creativecommons.org/licenses/by-nc/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style={{ color: 'white', textDecoration: 'none' }}>
            Reconocimiento-NoComercial 4.0 Internacional 
          </a>.
        </p>
      </div>
    </Container>
  );
};

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: {
    xs: '90%',    // 90% width on mobile
    sm: '80%',    // 80% width on tablet
    md: '60%',    // 60% width on desktop
  },
  maxWidth: '600px',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: {
    xs: 2,
    sm: 3,
    md: 4
  },
  maxHeight: '90vh',
  overflowY: 'auto'
};


export default CourseDetail;
