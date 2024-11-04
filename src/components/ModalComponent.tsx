import React from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import './ModalComponent.css'; // Hoja de estilos personalizada

interface ModalComponentProps {
    open: boolean;
    onClose: () => void;
    videos: string[]; // Array de rutas de videos
}

const ModalComponent: React.FC<ModalComponentProps> = ({ open, onClose, videos }) => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        fade: true,
        arrows: true,
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            PaperProps={{
                style: {
                    backgroundColor: 'rgba(0, 0, 0, 0.85)', // Fondo semi-transparente
                    boxShadow: 'none',
                    borderRadius: '12px',
                    overflow: 'hidden',
                },
            }}
            BackdropProps={{
                style: {
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo transparente para el backdrop
                },
            }}
        >
            <DialogTitle style={{ backgroundColor: 'white', color: 'white', position: 'relative' }}>
              
                <IconButton
                    edge="end"
                    color="black"
                    onClick={onClose}
                    aria-label="close"
                    style={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent
                style={{
                    backgroundColor: 'white',
                    padding: '0',
                    overflow: 'hidden', // Eliminar barras de desplazamiento
                }}
            >
                <Slider {...settings}>
                    {videos.map((video, index) => (
                        <div key={index} className="video-slide">
                            <video width="100%" controls preload="auto" playsInline style={{ borderRadius: '8px' }}>
    <source src={video} type="video/mp4" />
    Your browser does not support the video tag.
</video>

                        </div>
                    ))}
                </Slider>
            </DialogContent>
        </Dialog>
    );
};

export default ModalComponent;
