import React, { useEffect, useState } from 'react';
import { Button, Box, Typography, Divider } from '@mui/material';
import { getWeekFiles, addWeekFile, deleteFile } from '../api';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

interface WeekContentProps {
  weekId: number;
  userRole: string;
}

const WeekContent: React.FC<WeekContentProps> = ({ weekId, userRole }) => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const fetchWeekFiles = async () => {
      try {
        const files = await getWeekFiles(weekId);
        setFiles(files);
      } catch (error) {
        console.error('Error fetching week files:', error);
      }
    };
    fetchWeekFiles();
  }, [weekId]);

  const handleDeleteFile = async (fileId: number) => {
    try {
      await deleteFile(fileId);
      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  return (
    <Box>
      {files.map((file) => (
        <Box key={file.id}>
          <Button startIcon={<FileDownloadIcon />} onClick={() => /* función de descarga */ {}}>
            {file.nombre_archivo}
          </Button>
          {userRole === 'admin' && (
            <Button onClick={() => handleDeleteFile(file.id)} sx={{ color: 'red' }}>
              Eliminar
            </Button>
          )}
          <Divider />
        </Box>
      ))}
    </Box>
  );
};

export default WeekContent;
