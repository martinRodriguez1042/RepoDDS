import axios from 'axios';
import api from './api.js';

/*const api = axios.create({
    baseURL: 'http://localhost:3000/api'
});*/

export async function getActivos(){
    const token = localStorage.getItem('token');
    const res = await api.get('/activos', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
}

const activoService = {
    getActivos
};

export default activoService;