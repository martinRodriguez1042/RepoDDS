import axios from 'axios';
import api from './api.js';

/*const api = axios.create({
    baseURL: 'http://localhost:3000/api'
});*/

export async function getTecnicos(){
    const token = localStorage.getItem('token');
    const res = await api.get('usuarios/tecnicos', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
}