// CourseIntroductionModal.tsx
import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

interface CourseIntroductionModalProps {
  open: boolean;
  onClose: () => void;
  introduction: string;
}

const CourseIntroductionModal: React.FC<CourseIntroductionModalProps> = ({ open, onClose, introduction }) => (
  <Modal open={open} onClose={onClose} aria-labelledby="introduction-modal-title">
    <Box sx={{ ...modalStyle }}>
      <Typography variant="h5" sx={{ mb: 2, color: 'black' }}>Introducción</Typography>
      <Typography variant="body1" sx={{ mb: 4, color: 'black', overflowY: 'auto', maxHeight: '150px' }}>
        {introduction}
      </Typography>
      <Button variant="contained" onClick={onClose}>Cerrar</Button>
    </Box>
  </Modal>
);

export default CourseIntroductionModal;

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
  