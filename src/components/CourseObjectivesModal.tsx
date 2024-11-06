// CourseObjectivesModal.tsx
import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

interface CourseObjectivesModalProps {
  open: boolean;
  onClose: () => void;
  objectives: string;
}

const CourseObjectivesModal: React.FC<CourseObjectivesModalProps> = ({ open, onClose, objectives }) => (
  <Modal open={open} onClose={onClose} aria-labelledby="objectives-modal-title">
    <Box sx={{ ...modalStyle }}>
      <Typography variant="h5" sx={{ mb: 2, color: 'black' }}>Objetivos Específicos</Typography>
      <Typography variant="body1" sx={{ mb: 4, color: 'black', overflowY: 'auto', maxHeight: '150px' }}>
        {objectives}
      </Typography>
      <Button variant="contained" onClick={onClose}>Cerrar</Button>
    </Box>
  </Modal>
);

export default CourseObjectivesModal;

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '600px',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    maxHeight: '90vh',
    overflowY: 'auto',
  };
  