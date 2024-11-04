import axios from 'axios';

const fetchApiUrls = async () => {
  try {
    const response = await axios.get('/my-ips'); // Suponiendo que tu backend tiene la ruta /my-ips
    const ips = response.data.ips;

    if (!ips || ips.length === 0) {
      throw new Error('No IPs found');
    }

    // Genera las URLs basadas en las IPs recibidas
    return ips.map(ip => `http://${ip.address}:5000`);
  } catch (error) {
    console.error('Error fetching IPs:', error);
    return []; // Devuelve un array vacío si hay un error
  }
};

export default fetchApiUrls;
