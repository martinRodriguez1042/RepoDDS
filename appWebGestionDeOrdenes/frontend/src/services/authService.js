import axios from 'axios';
import api from './api.js';

/*const api = axios.create({
    baseURL: 'http://localhost:3000/api'
});*/

export async function login(email, password){
    const res = await api.post('/auth/login', { email, password });
    return res.data; //Devuelve el token
}


export async function register(values){
    const res = await api.post('/auth/register', values);
    return res.data
}