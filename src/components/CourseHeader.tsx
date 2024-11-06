// CourseHeader.tsx
import React from 'react';
import { Typography, Box } from '@mui/material';

interface CourseHeaderProps {
  title: string;
  image: string;
}

const CourseHeader: React.FC<CourseHeaderProps> = ({ title, image }) => (
  <Box sx={{ alignItems: 'center', marginTop: '10px' }}>
    <div style={{ position: 'relative', textAlign: 'center', overflow: 'hidden' }}>
      <img
        src={`data:image/jpeg;base64,${image}`}
        alt={title}
        style={{
          width: '100%', height: '100%', maxHeight: '330px', minHeight: '330px',
          objectFit: 'cover', filter: 'brightness(0.7)', borderRadius: '12px'
        }}
      />
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', color: 'white',
      }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', textTransform: 'uppercase' }}>
          {title}
        </Typography>
      </div>
    </div>
  </Box>
);

export default CourseHeader;
