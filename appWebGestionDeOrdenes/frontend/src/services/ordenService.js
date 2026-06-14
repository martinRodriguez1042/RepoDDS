import axios from 'axios';
import api from './api.js';

/*const api = axios.create({
    baseURL: 'http://localhost:3000/api'
});*/

export async function getOrdenes(filtros = {}){
    const token = localStorage.getItem('token');
    const res = await api.get('/ordenes', {
        headers: { Authorization: `Bearer ${token}` },
        params: filtros
    });
    return res.data;
}

export async function getOrdenById(id){
    const token = localStorage.getItem('token');
    const res = await api.get(`/ordenes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
}

export const getOrden = getOrdenById;

export async function crearOrden(values) {
    const token = localStorage.getItem('token');
    const res = await api.post('ordenes', values, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data
}

export async function editarOrden(id, values){
    const token = localStorage.getItem('token');
    const res = await api.put(`/ordenes/${id}`, values, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
}

export async function getResumen() {
    const token = localStorage.getItem('token');
    const res = await api.get('/ordenes/resumen', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
}

export async function getHistorialOrden(id){
    const token = localStorage.getItem('token');
    const res = await api.get(`/ordenes/${id}/historial`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
}

export async function cancelarOrden(id){
    const token = localStorage.getItem('token');
    const res = await api.patch(`/ordenes/${id}/cancelar`, { estado: 'cancelada' }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
}

export async function procesarOrden(id) {
    const token = localStorage.getItem('token');
    const res = await api.patch(`/ordenes/${id}/procesar`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
}

export async function asignarOrden(id, tecnicoId){
    const token = localStorage.getItem('token');
    const res = await api.patch(`/ordenes/${id}/asignar`, { tecnicoId: parseInt(tecnicoId), estado: 'asignada' }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
}

export async function resolverOrden(id){
    const token = localStorage.getItem('token');
    const res = await api.patch(`/ordenes/${id}/resolver`, { estado: 'resuelta' }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
}

const ordenService = {
    getOrdenes,
    getOrdenById,
    getOrden,
    crearOrden,
    editarOrden,
    getResumen,
    getHistorialOrden,
    cancelarOrden,
    procesarOrden,
    asignarOrden,
    resolverOrden
};

export default ordenService;
