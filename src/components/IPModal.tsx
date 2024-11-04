import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import { fetchIpsVer, getIpsVerData } from '../api'; 
import axios from 'axios';

interface IPModalProps {
    open: boolean;
    onClose: () => void;
}

interface IP {
    baseAddress: string;  // La IP base sin el puerto y endpoint
    fullAddress: string;  // La URL completa para verificación
    networkName: string;  // Tipo de red: Ethernet o WiFi
    isCurrent: boolean;
    deviceName: string;
}

const IPModal: React.FC<IPModalProps> = ({ open, onClose }) => {
    const [ips, setIps] = useState<IP[]>([]);
    const [currentIp, setCurrentIp] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            fetchIpsVer()
                .then(() => {
                    const ipData = getIpsVerData();
                    console.log('IP data in IPModal:', ipData); 
                    setIps(ipData);

                    // Verifica cuál IP está en uso
                    ipData.forEach(ip => {
                        axios.get(`http://${ip.fullAddress}`)
                            .then(() => {
                                setCurrentIp(ip.baseAddress);  // Establece la IP en uso
                            })
                            .catch(() => {
                                // Si la IP no responde, no hacer nada
                            });
                    });
                })
                .catch(error => {
                    console.error('Error fetching IPs:', error);
                    setError('Error al obtener las IPs.');
                });
        }
    }, [open]);

    return (
        <Modal open={open} onClose={onClose}>
            <Box 
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 4,
                }}
            >
                <Typography variant="h6" component="h2" gutterBottom>
                    Mis IPs
                </Typography>
                <ul>
                    {error ? (
                        <li>{error}</li>
                    ) : ips.length > 0 ? (
                        ips.map((ip, index) => (
                            <li key={index}>
                                {ip.baseAddress} - {ip.networkName}  {/* Aquí se muestra Ethernet o WiFi */}
                                {currentIp === ip.baseAddress && (
                                    <strong> (Esta es la IP que se está usando - {ip.deviceName})</strong>
                                )}
                            </li>
                        ))
                    ) : (
                        <li>No se encontraron IPs.</li>
                    )}
                </ul>
                <Button variant="contained" onClick={onClose} sx={{ mt: 2 }}>
                    Cerrar
                </Button>
            </Box>
        </Modal>
    );
};

export default IPModal;
