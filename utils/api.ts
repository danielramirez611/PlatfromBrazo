// utils/api.ts
import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://jellyfish-app-olbh8.ondigitalocean.app/api/', // Reemplaza con la URL base de tu API
  timeout: 10000, // Tiempo de espera en milisegundos
  headers: {
    'Content-Type': 'application/json',
  },
});

export default instance;
