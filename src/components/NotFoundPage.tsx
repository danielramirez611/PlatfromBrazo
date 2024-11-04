import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
    const navigate = useNavigate();

    React.useEffect(() => {
        // Redirigir a la página principal o a la URL actual
        navigate(-1); // Esto llevará al usuario a la página anterior
        // o puedes usar navigate('/home') para llevar al usuario a la página principal.
    }, [navigate]);

    return null;
};

export default NotFoundPage;
