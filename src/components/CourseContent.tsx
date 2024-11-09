// CourseContent.tsx
import React, { useState, useEffect } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, Button, Divider, Modal, TextField, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { getWeekFiles, deleteFile, addWeekFile, deleteWeek, updateWeek, toggleWeekStatus } from '../api';
import { toast } from 'react-toastify';
import JSZip from 'jszip';
import mammoth from 'mammoth';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { useNavigate } from 'react-router-dom';

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
}

const CourseContent: React.FC<CourseContentProps> = ({ courseContents, userRole }) => {
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
    if (!fileId) return toast.error('No se puede eliminar este archivo');
    try {
      await deleteFile(fileId);
      setWeekFiles((prev) => ({
        ...prev,
        [weekId]: prev[weekId].filter((file) => file.id !== fileId),
      }));
      toast.success('Archivo eliminado correctamente.');
    } catch (error) {
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewFileData({ nombre_archivo: file.name, archivo: reader.result?.toString().split(',')[1] || '' });
      reader.readAsDataURL(file);
    }
  };

  const handleEditWeek = (week: Semana) => {
    setSelectedWeekId(week.id);
    setWeekName(week.semana);
    setEditWeekModalOpen(true);
  };

  const handleSaveEditWeek = async () => {
    if (!selectedWeekId) return;
    try {
      await updateWeek(selectedWeekId, { semana: weekName });
      toast.success('Semana actualizada correctamente.');
      setEditWeekModalOpen(false);
    } catch (error) {
      toast.error('Error actualizando la semana.');
    }
  };

  const handleToggleWeekStatus = async (weekId: number, currentStatus: boolean) => {
    try {
      await toggleWeekStatus(weekId, !currentStatus);
      setCourseState((prev) =>
        prev.map((week) =>
          week.id === weekId ? { ...week, is_enabled: !currentStatus } : week
        )
      );
      toast.success(`Semana ${currentStatus ? 'deshabilitada' : 'habilitada'} correctamente.`);
    } catch (error) {
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
    <Box sx={{ mt: 4, width: '100%', mb: 6, height:'100%' }}>
      <Typography variant="h5" sx={{ mb: 2, color: 'white', fontSize: '1.5rem' }}>Contenido del curso</Typography>
      {userRole === "admin" && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/course-tablet')}
          sx={{ mb: 3 }}
        >
          Administrar Semanas
        </Button>
      )}
      {courseContents.map((content) => (
        <Accordion key={content.id} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />} sx={{ backgroundColor: '#E93845', color: 'white' }}>
            <Typography>{content.semana}</Typography>
            {userRole === 'admin' && (
              <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                <Button onClick={() => handleEditWeek(content)} sx={{ color: 'white' }}>Editar</Button>
                <Button onClick={() => handleToggleWeekStatus(content.id, content.is_enabled)} sx={{ color: 'white' }}>
                  {content.is_enabled ? 'Deshabilitar' : 'Habilitar'}
                </Button>
              </Box>
            )}
          </AccordionSummary>
          <AccordionDetails sx={{ backgroundColor: '#FFFFFF', color: 'black' }}>
            {userRole === 'admin' && (
              <Button onClick={() => setSelectedWeekId(content.id)} sx={{ mb: 2 }}>
                Agregar Archivo a Semana
              </Button>
            )}
            {weekFiles[content.id]?.map((archivo) => (
              <React.Fragment key={archivo.id}>
                <Button
                    onClick={() => handlePreview(archivo.nombre_archivo, archivo.archivo)}
                    sx={{ justifyContent: 'flex-start', flex: 1 }}
                  >
                    {archivo.nombre_archivo}
                  </Button>
                  <IconButton onClick={() => handleDownloadFile(archivo.nombre_archivo, archivo.archivo)} sx={{ ml: 1 }}>
                    <FileDownloadIcon />
                  </IconButton>
                {userRole === 'admin' && (
                  <Button onClick={() => handleDeleteFile(archivo.id, content.id)} sx={{ color: 'red' }}>
                    Eliminar
                  </Button>
                )}
                <Divider sx={{ borderColor: 'black', my: 0.5 }} />
              </React.Fragment>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
      
      {/* Modal for previewing files */}
      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)}>
        <Box sx={{ ...modalStyle, width: '80%', height: '80%' }}>
          {previewFile?.fileName.endsWith('.pdf') ? (
            <Worker workerUrl="/pdf.worker.min.js">
              <Viewer fileUrl={`data:application/pdf;base64,${previewFile?.fileContent}`} />
            </Worker>
          ) : (
            <Box dangerouslySetInnerHTML={{ __html: docxContent }} style={{ overflowY: 'auto', height: 'calc(100% - 50px)' }} />
          )}
          <Button variant="contained" onClick={() => setPreviewOpen(false)} sx={{ mt: 2 }}>Cerrar Vista Previa</Button>
        </Box>
      </Modal>
      
      {/* Modal for editing week name */}
      <Modal open={editWeekModalOpen} onClose={() => setEditWeekModalOpen(false)}>
        <Box sx={{ ...modalStyle }}>
          <Typography variant="h6" component="h2">Editar Semana</Typography>
          <TextField fullWidth label="Semana" value={weekName} onChange={(e) => setWeekName(e.target.value)} sx={{ mt: 2 }} />
          <Button variant="contained" onClick={handleSaveEditWeek} sx={{ mt: 2 }}>Guardar Cambios</Button>
        </Box>
      </Modal>

      {/* Modal for adding file */}
      <Modal open={Boolean(selectedWeekId)} onClose={() => setSelectedWeekId(null)}>
        <Box sx={{ ...modalStyle }}>
          <Typography variant="h6">Agregar Archivo a Semana</Typography>
          <TextField
            label="Nombre del Archivo"
            value={newFileData.nombre_archivo}
            onChange={(e) => setNewFileData({ ...newFileData, nombre_archivo: e.target.value })}
            fullWidth
            margin="normal"
          />
          <input type="file" accept=".docx,.pdf,.pptx" onChange={handleFileChange} style={{ display: 'none' }} id="file-upload" />
          <label htmlFor="file-upload">
            <Button variant="contained" component="span" sx={{ mt: 2 }}>Seleccionar Archivo</Button>
          </label>
          {newFileData.nombre_archivo && (
            <Typography sx={{ mt: 2 }}>{newFileData.nombre_archivo}</Typography>
          )}
          <Button variant="contained" onClick={handleAddFileToWeek} sx={{ mt: 2 }}>Subir Archivo</Button>
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
